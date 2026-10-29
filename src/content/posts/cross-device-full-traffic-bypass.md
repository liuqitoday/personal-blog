---
author: Freddy
pubDatetime: 2026-05-25T10:00:00.000Z
modDatetime: 2026-10-29T00:00:00.000Z
title: "跨设备全流量穿透方案：任意系统借助已准入设备绕过企业网络限制"
tags:
  - "网络"
description: "一套经过安全加固的企业内网全流量穿透方案：用已通过准入认证的设备做出口，客户端以 TUN 接管全量流量；讲清 DNS 该怎么配、出口端如何避免变成开放代理，以及常见故障排查。"
---

公司禁用网络共享和移动热点、又强制准入认证（802.1X、准入客户端）时，可以借一台已认证的设备做流量出口，主力设备通过 TUN 接管全量流量。终端、Git、数据库工具这类不认系统代理的软件，也能直接联网。

---

## 原理

- **出口端**：已通过企业准入认证的设备（通常是 Windows 台式机或笔记本），只作为代理服务端，不做路由转发。
- **客户端**：主力设备（Mac / Windows / Linux）开启 Clash Verge 的 **TUN 模式**，虚拟网卡在 Layer 3 拦截全部流量，打包后发给出口端。
- **效果**：在网管看来，所有流量都来自出口端这台已认证设备本身。

关键前提：**客户端只负责打包，域名解析和建连都发生在出口端**。因此 DNS 主要在出口端配置；客户端的 DNS 只在 `fake-ip-filter` 让内网域名返回真实 IP 时参与解析。

---

## 一、出口端

### 1.1 基础设置

1. 记下出口端的局域网 IP：Windows 用 `ipconfig` 查 IPv4 地址；Mac / Linux 用 `ifconfig` 或 `ip addr`。
2. 打开 Clash Verge → 设置，开启 **允许局域网连接 (Allow LAN)**，关闭 **TUN 模式** 和 **系统代理**。

> `allow-lan` 必须在设置页打开。`allow-lan`、`mode`、`mixed-port`、`log-level`、`external-controller` 等字段由 Clash Verge 应用接管，写进扩展配置会被丢弃。

### 1.2 安全加固

只开 Allow LAN，等于在局域网里放了一台无认证的开放代理：同事能白嫖，安全扫描也会标记开放端口。至少要加账号密码。

右键订阅卡片 → **编辑扩展配置**（不要改订阅文件，否则更新订阅后会被覆盖）：

```yaml
# 出口端扩展配置
authentication:
  - "user:strong-pass" # 用户名:强密码

# 本机程序跳过认证
skip-auth-prefixes:
  - 127.0.0.1/8
  - ::1/128

# 只允许客户端 IP 访问；黑名单优先，未列出的直接拒绝
lan-allowed-ips:
  - 192.168.1.50/32 # 客户端实际 IP

# 对解析出的所有 IP 并发拨号，任一成功即使用
tcp-concurrent: true
```

> `authentication` 和 `lan-allowed-ips` 可以同时开。客户端 IP 由 DHCP 动态分配时，优先保证认证，白名单作为额外一层；更稳妥的是在路由器上给出口端做 DHCP 绑定。

#### 扩展配置的合并规则

- **列表和普通值整体替换**：`rules`、`dns.nameserver`、`tcp-concurrent` 写什么是什么，不与订阅原文合并。
- **嵌套对象逐项合并**：`tun`、`sniffer` 只替换写出的子字段。
- **`dns` 下的字段整体替换**：`nameserver-policy` 也一样。扩展里已有 `dns:` 段时，新字段必须合进同一个块。
- **应用接管字段以设置页为准**：`allow-lan`、`mode`、`mixed-port`、`log-level`、`external-controller`、`ipv6`，以及 GUI 里保存过的 TUN 选项，写进扩展配置会被丢弃。

> 全局扩展对多数订阅生效，订阅扩展只对单个订阅生效，且会覆盖同名 `dns` 字段。被覆盖时，把策略写进订阅扩展，或用扩展脚本追加。

### 1.3 DNS：默认保持公司 DNS

出口端是链路终点，必须拿到真实 IP，**不能使用 fake-ip**。

先确认一件事：**公司 DNS 能否同时解析内网和公网域名？** 绝大多数企业网络可以——公司 DNS 会把公网查询递归转发出去。这种情况下保持系统 DNS 不动就是最优解；只有公司 DNS 对某些公网域名返回污染结果或超时，或者明显慢且你想用加密 DoH 时，才值得改。

#### 关键陷阱：公网域名可能有内网解析

有些内网服务使用公网域名，但公司 DNS 会把它解析到内网 IP。例如 `gitlab.company.com` 从公网看是普通站点，内网却解析到 `10.x`。

如果把公司 DNS 和公网 DoH 放进同一个 `nameserver` 列表，mihomo 会并发查询、取第一个成功结果，而且只把 SERVFAIL / REFUSED 视为失败——**NXDOMAIN 也算成功**。公网 DoH 可能抢先返回公网 IP 或 NXDOMAIN，两种结果都是内网站点打不开。

> 公司 DNS 能递归解析公网域名时，就让它单独作为 `nameserver`，不要和公网 DNS 并列。

```yaml
dns:
  enable: true
  use-system-hosts: false # 原有字段要保留在同一个 dns: 块里
  enhanced-mode: redir-host # 出口端必须拿真实 IP
  default-nameserver: # 用于解析 DoH 域名，必须是 IP
    - 10.0.0.53 # 公司内网 DNS
    - 10.0.0.54
  nameserver: # 主力：公司 DNS
    - 10.0.0.53
    - 10.0.0.54
  # 仅把需要绕开公司 DNS 的公网域名指到 DoH
  # nameserver-policy:
  #   '+.github.com':
  #     - https://dns.alidns.com/dns-query
```

只有公司 DNS 不递归、或公网解析很差时，才用 `nameserver-policy` 做内网后缀分流：

```yaml
dns:
  enable: true
  enhanced-mode: redir-host
  default-nameserver:
    - 10.0.0.53
    - 10.0.0.54
  nameserver: # 默认走公网
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  nameserver-policy: # 内网后缀强制走公司 DNS
    "+.corp.example.com":
      - 10.0.0.53
      - 10.0.0.54
```

风险：命中 `nameserver-policy` 后不会再问默认 `nameserver`，未列出的内网域名会走公网 DoH，同样可能打不开。

补充：

- `+.corp.example.com` 覆盖该域及所有子域，无需逐个列服务。
- 内网后缀看 `ipconfig /all` 的 `Connection-specific DNS Suffix`；但内网服务不一定都用内网后缀。
- 换 DNS 解决不了“某个公网 IP 连不上”：未接入 Cloudflare 中国网络的站点，各递归 DNS 返回的都是同一组 anycast IP。

### 1.4 防火墙放行

Windows Defender 防火墙 → 高级设置 → 入站规则，为 Clash / Mihomo 放行代理端口（默认 `7897`），**TCP 和 UDP 都要放行**。只放 TCP 时，客户端的 `udp: true` 等于没开，游戏、语音、QUIC 流量都会失败。

临时验证：关闭专用和公用网络防火墙后客户端立刻恢复，就是防火墙拦截。

### 1.5 保持在线与 IP 稳定

- 关闭出口端自动睡眠：Windows 在“电源与睡眠”里设为“从不”；Mac 在“电池 → 电源适配器”里关闭自动休眠。
- 在路由器上给出口端做 DHCP 地址绑定，避免重启后 IP 变化导致客户端断网。

---

## 二、客户端

### 2.1 配置文件

Clash Verge → 配置 → 新建 → 类型选 **Local** → 编辑，清空后粘贴：

```yaml
# 客户端专用：接管所有软件流量并转发给出口端
mixed-port: 7890
allow-lan: false
mode: rule
log-level: info

# 开启 TUN 虚拟网卡，吞掉本机 Layer 3 全量流量
tun:
  enable: true
  stack: system
  auto-route: true
  auto-detect-interface: true
  # 显式劫持 DNS；这是列表，不是布尔值 true
  dns-hijack:
    - any:53
    - tcp://any:53

dns:
  enable: true
  listen: 127.0.0.1:53 # 只监听本机
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  ipv6: false

  default-nameserver: # 用于解析 DoH 域名，必须是 IP
    - 10.0.0.53 # 公司内网 DNS
    - 10.0.0.54

  # 公司 DNS 为主；不要和公网 DoH 并列（原因见 1.3）
  nameserver:
    - 10.0.0.53
    - 10.0.0.54

  # 内网域名不分配 fake-ip，返回真实 IP
  # 这样 ping、按 IP 直连的数据库工具、RDP 等都正常
  fake-ip-filter:
    - "+.corp.example.com"
    - "*.lan"

# 唯一出口节点
proxies:
  - name: "公司出口网关"
    type: socks5
    server: 192.168.1.100 # 出口端实际局域网 IP
    port: 7897 # 与出口端 mixed-port 一致
    udp: true
    username: user # 与出口端 authentication 一致
    password: strong-pass

# 本机所有流量无条件交给出口端
rules:
  - MATCH,公司出口网关
```

> **客户端为什么也配公司 DNS？** `fake-ip-filter` 让内网域名返回真实 IP，而真实 IP 必须由某个 DNS 解析出来；`nameserver` 里只有公网 DoH 时，内网域名会解析失败。同时不要和公网 DoH 并列，原因同 1.3 的陷阱。

### 2.2 打开 TUN

- **Mac**：设置 → 打开 **TUN 模式**，输入开机密码；系统代理保持关闭。
- **Windows**：设置 → 打开 **TUN 模式**，首次会安装虚拟网卡驱动；系统代理保持关闭。若工作不正常，在 Settings → TUN Stack 切换 `gVisor` / `mixed` / `mips`（新版默认 `mips`，旧的 `LWIP` 已不存在）。
- **Linux**：确认 `/dev/net/tun` 可用且有 root 权限，`tun.stack` 按内核选 `gVisor` / `mixed` / `system`；CLI 用户可直接用 mihomo 加载该配置。

TUN 工作在网络层，优先级高于系统代理；两者同时开启反而会冲突，所以只开 TUN。

### 2.3 可选：加密链路

需要防嗅探时，把出口端的 SOCKS5 换成 Shadowsocks 入站：

```yaml
listeners:
  - name: ss-in
    type: shadowsocks
    port: 7898
    listen: 0.0.0.0
    cipher: 2022-blake3-aes-256-gcm
    password: "用 openssl rand -base64 32 生成的密钥"
    udp: true
```

客户端对应改为 `type: ss`、端口 `7898`、相同的 cipher 和 password。Shadowsocks 使用自己的密码认证，`authentication` 只作用于 HTTP / SOCKS / Mixed 端口。

---

## 三、验证

不需要在客户端设置代理或静态 IP，直接测试：

```bash
# 内网域名应返回真实 10.x 地址，而不是 198.18.x.x 的 fake-ip
nslookup wiki.corp.example.com 127.0.0.1

# 真实流量测试
curl -v http://内网服务地址
git clone <公司内网仓库地址>
curl -I https://www.baidu.com
curl -I https://www.google.com
```

某个内网站点打不开时，先对比 DNS：

```bash
nslookup gitlab.company.com 公司DNS_IP
nslookup gitlab.company.com 223.5.5.5
```

结果相同 → 问题不在 DNS，去查路由、防火墙或出口端连通性；结果不同（公司 DNS 返回 `10.x`、公网返回公网 IP）→ 就是“公网域名有内网解析”，必须让公司 DNS 优先。

> 不要用 `ping 内网域名` 验证。fake-ip 未命中的域名 ping 到的是 `198.18.x.x` 虚拟地址；而且 ping 走 ICMP，多数代理只转发 TCP / UDP。

---

## 四、常见问题

**客户端完全上不了网**：先查出口端防火墙，见 1.4。Mac / Linux 出口端检查 `iptables` / `nftables` 是否拦截端口。

**出口端重启后断网**：DHCP 换了 IP。改客户端配置里的 `server:`，或按 1.5 做静态绑定。

**Windows 开 TUN 后蓝屏或断网**：TUN 驱动与 VPN / 安全软件冲突。切换 TUN Stack（`system` → `gVisor` → `mixed` → `mips`），必要时禁用其他虚拟网卡。

**部分流量没走代理**：确认 `tun.dns-hijack` 写成列表，而不是 `dns-hijack: true`；GUI 里保存过 TUN 设置时以对话框为准。仍不行可显式指定 `tun.device`。

**Cloudflare 站点时通时不通**：日志常见 `dial tcp 104.x.x.x:443: i/o timeout`，一个域名的多个 IP 全部超时。这不是 DNS 问题——未接入 Cloudflare 中国网络的站点，各 DNS 返回的都是同一组 anycast IP。在出口端开启 `tcp-concurrent: true`，让 mihomo 对所有 IP 并发拨号，任一成功即立即返回；代价是每次连接多几条 TCP 握手、短时间连接数上升。如果全部超时，说明公司出口到该网段不可达，只能在出口端再加一个对外代理节点。

**出口端被扫到或白嫖**：按 1.2 配置认证和 IP 白名单；需要更强隔离时用 2.3 的 Shadowsocks。`external-controller` 保持只监听 `127.0.0.1`，并且要在设置页改。

---

## 安全与合规

- 方案本质是借用一台已授权设备作为出口，不涉及破解或伪造企业认证；使用前请确认公司网络管理规定。
- 账号密码、代理密钥不要提交到公开仓库或写进截图。
- 不要把代理端口暴露到公网，也不要随意分享给同事；一旦被滥用，流量归属会指向出口端设备。
- 定期检查出口端连接日志，确认只有自己的客户端在使用。
