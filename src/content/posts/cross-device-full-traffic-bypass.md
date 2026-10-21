---
author: Freddy
pubDatetime: 2026-05-25T10:00:00.000Z
modDatetime: 2026-10-21T00:00:00.000Z
title: "跨设备全流量穿透方案：任意系统借助已准入设备绕过企业网络限制"
tags:
  - "网络"
description: "一套通用且经过安全加固的企业内网全流量穿透方案：以已通过准入认证的设备作为出口，客户端用 TUN 接管全量流量；同时用 DNS 分流让内网域名走公司 DNS、公网域名走公网 DoH，并解决出口端开放代理、Cloudflare 地址超时等常见问题。"
---

这份教程专为企业内网环境定制。针对公司限制网络共享、移动热点被禁用、且有严格的网络准入认证（如 802.1X 认证、准入客户端等）的场景，该方案能够 100% 绕过限制，并完美解决开发软件（如终端、Git、数据库工具等）不走系统代理的痛点。

---

## 核心原理简介

* **出口端**：已通过企业准入认证的设备（通常是 Windows 台式机或笔记本），只充当一个合法的"流量出口"，本身不进行任何复杂的路由转发配置。
* **客户端**：你的主力开发设备（Mac / Windows / Linux），开启 Clash Verge 的 **TUN 模式**，在本地建立虚拟网卡，**强行拦截**系统 Layer 3（网络层）全量流量，打包发给出口端。
* **物理流向**：客户端上的所有软件流量被截获后，通过标准代理协议发给出口端。在公司网管看来，这只是出口端设备自身在进行正常的网络访问，100% 绿灯放行。

这里有一个容易被忽略的关键点：**客户端只负责"打包"，域名解析和真正建连都发生在出口端**。因此内网域名、公网域名各自该用哪个 DNS，应该在出口端统一分流，而不是靠客户端逐个列举内网域名。后面的配置都围绕这个前提展开。

---

## 第一阶段：出口端设置（作为"合法流量出口"）

出口端不需要开启任何系统级路由转发，只需要作为一个普通的"代理服务端"接应客户端。

### 1.1 获取出口端的局域网 IP 地址

* Windows：按下 `Win + R`，输入 `cmd` 回车，执行 `ipconfig`，找到当前连网网卡的 **IPv4 地址**（通常是 `10.x.x.x` 或 `192.168.x.x`），记录下来。
* Mac / Linux：执行 `ifconfig` 或 `ip addr`，找到对应网卡的 IP 地址。

### 1.2 开启局域网连接

打开出口端设备上的 Clash Verge：

1. 进入左侧的 **"设置 (Settings)"**。
2. 开启 **"允许局域网连接 (Allow LAN)"** 开关。
3. ❌ **关闭** "TUN 模式 (TUN Mode)" 开关。
4. ❌ **关闭** "系统代理 (System Proxy)" 开关。

> ⚠️ `allow-lan` 必须在**设置页**里打开，不要写在扩展配置里。Clash Verge 的应用设置优先级高于扩展配置，`allow-lan`、`mode`、`mixed-port`、`log-level` 等字段由应用接管，写进扩展配置会被丢弃，并在扩展卡片日志里提示。

### 1.3 安全加固：别让出口端变成全公司的开放代理

只开 Allow LAN 而不加任何限制，等于在公司局域网上架了一台**无认证明文代理**：任何同事、任何一台被控设备都能直接白嫖你的出口，企业安全扫描也很容易把开放 SOCKS/HTTP 代理端口标记出来。务必至少加上账号密码。

在 Clash Verge 中右键订阅卡片 → **编辑扩展配置**，粘贴以下内容（不要直接改订阅文件，否则更新订阅后会被覆盖）：

```yaml
# ==========================================
# 出口端扩展配置
# ==========================================

# 1. 代理端口认证：客户端必须带账号密码
authentication:
  - "user:strong-pass"      # ⚠️ 换成你自己的用户名:强密码

# 本机程序（127.0.0.1）跳过认证，避免出口端自己用的时候还要输密码
skip-auth-prefixes:
  - 127.0.0.1/8
  - ::1/128

# 2. IP 白名单：只允许你的客户端访问
#    黑名单优先级高于白名单，未列出的地址直接拒绝
lan-allowed-ips:
  - 192.168.1.50/32        # ⚠️ 换成客户端实际 IP

# 3. 并发拨号：DNS 解析出的所有 IP 同时尝试，第一个成功即使用
#    对"一个 IP 通、另一个 IP 超时"的场景非常有效
tcp-concurrent: true
```

> **`lan-allowed-ips` 与认证怎么选？**
> 两者可以同时开。但如果客户端 IP 是 DHCP 动态分配的，IP 变了就会直接连不上——这种情况优先保证 `authentication`，`lan-allowed-ips` 作为额外一层。最稳妥的做法是在路由器上给出口端做 DHCP 地址绑定（见痛点二）。

#### 1.3.1 Clash Verge 扩展配置的合并规则（很重要）

Clash Verge 的“扩展配置”（旧版本叫 Merge / 合并）不是简单的文本拼接，理解规则能省掉大量“明明写了却不生效”的排查：

* **列表和普通值整体替换**：`rules`、`dns.nameserver`、`tcp-concurrent` 这类字段，写什么就是什么，不会和订阅原文逐条合并。
* **嵌套对象逐项合并**：`tun`、`sniffer` 这类对象只替换写出的子字段，没写的保留。
* **`dns` 下的字段整体替换**：`dns` 里写出的字段和顶层 `hosts` 会整体替换，`nameserver-policy` 这种表也不例外。**所以如果你原来在扩展里已经有 `dns: use-system-hosts: false`，新增 DNS 配置时必须把它一起写进同一个 `dns:` 块。**

还有一类字段由**应用设置接管**，写进扩展配置会在末尾被丢弃：

| 类别 | 字段 |
|---|---|
| 顶层字段 | `external-controller`、`secret`、`mixed-port`、`socks-port`、`port`、`redir-port`、`tproxy-port`、`mode`、`allow-lan`、`log-level`、`ipv6`、`unified-delay` |
| TUN 相关 | `tun.enable`；以及在 TUN 设置对话框里保存过的 `stack`、`device`、`auto-route`、`route-exclude-address`、`auto-redirect`、`auto-detect-interface`、`dns-hijack`、`strict-route`、`mtu` |
| DNS 相关 | `dns.ipv6`（仅当“DNS 覆写”开启且覆写页面启用 IPv6 时接管） |

实践中的结论：

* `allow-lan`、`mode`、`mixed-port`、`log-level` 去**设置页**改。
* 如果你在 Clash Verge 的 TUN 设置对话框里点过保存，`tun.stack`、`tun.dns-hijack` 等以对话框为准，配置文件里写的会被覆盖。
* 扩展配置卡片会显示应用接管字段的提示日志，看到提示就去设置页改，不要在 YAML 里反复试。

> **全局扩展配置 vs 订阅扩展配置**
> 全局扩展对多数订阅生效，适合放通用的 DNS、认证、并发设置；订阅扩展只对单个订阅生效。两者都写时会依次执行，后者会整体覆盖前者的同名 `dns` 字段。如果发现全局配置里的 `nameserver-policy` 被订阅扩展覆盖了，把内网策略也写进订阅扩展，或用扩展脚本逐条追加（脚本最后执行）。

### 1.4 DNS 分流：内网域名走公司 DNS，公网域名走公网 DNS

出口端是整个链路的终点，它必须拿到**真实 IP** 才能建连，因此这里**不能使用 fake-ip 模式**。用 `nameserver-policy` 按域名后缀分流即可，不需要把内网域名一个个列出来：

```yaml
# 追加到出口端的扩展配置中
# 注意：dns 下的字段是整体替换语义，如果你的扩展里已有 dns 段，
#       请把 use-system-hosts 等原有字段合并进同一个 dns: 块
dns:
  enable: true
  use-system-hosts: false     # 如果原来就有这一行，必须保留
  enhanced-mode: redir-host   # 出口端是链路终点，必须拿真实 IP
  # ipv6: false               # 该字段可能被 Clash Verge 的“DNS 覆写”接管，优先在设置页关闭

  # 用于解析下面 DoH 服务器的域名，必须是 IP
  default-nameserver:
    - 10.0.0.53               # ⚠️ 换成公司内网 DNS
    - 10.0.0.54

  # 关键：公司 DNS 与公网 DoH 放在同一个列表里
  # mihomo 的语义是并发查询、最快者胜（dns/util.go 的 batchExchange）
  # 内网域名由公司 DNS 快速答出，公网域名由 DoH 答出
  nameserver:
    - 10.0.0.53               # ⚠️ 换成公司内网 DNS
    - 10.0.0.54
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query

  # 可选：仅当某个内网域名与公网域名同名、必须强制走公司 DNS 时才写
  # '+.' 表示"该域名本身及其所有子域"，不需要列出具体主机名
  nameserver-policy:
    '+.corp.example.com':     # ⚠️ 换成公司内网域名后缀
      - 10.0.0.53
      - 10.0.0.54
```

几个要点：

* **`+.corp.example.com` 一行覆盖该域名及其所有子域**：`corp.example.com`、`wiki.corp.example.com`、`git.corp.example.com`、`a.b.corp.example.com` 全部命中，**不需要知道内网到底有多少个服务**。
* **为什么把公司 DNS 也放进 `nameserver`**：`nameserver-policy` 命中后不会再问默认 `nameserver`，所以**未列出的内网域名不会自动回退到公司 DNS**。把公司 DNS 作为 `nameserver` 的成员，可以让所有未知内网域名也得到正确解析。源码里同一 `nameserver` 列表是并发查询、最快响应胜出（`dns/util.go` 的 `batchExchange`），内网域名由公司 DNS 先答，公网域名由 DoH 答，两者互不阻塞。
* **副作用**：公网域名也会同时发给公司 DNS。如果公司 DNS 对某些域名返回污染结果或抢答，用 `nameserver-policy` 把这些公网域名显式指向 DoH 即可。注意列表是并发而非顺序，把公司 DNS 放到后面并不会降低它的优先级。
* 如果你不确定内网后缀，可以在出口端执行 `ipconfig /all`，查看 `Connection-specific DNS Suffix`，那通常就是主内网域。
* 如果公司网络封了 DoH（HTTPS 出站），把其中的 DoH 换成 `223.5.5.5`、`119.29.29.29` 这类明文 DNS 即可。
* **换公网 DNS 并不能解决"某个公网 IP 连不上"的问题**：对未接入 Cloudflare 中国网络的站点，任何递归 DNS 返回的都是同一组 anycast IP。DNS 分流解决的是"解析准确、互不干扰"，连通性问题要靠 `tcp-concurrent` 或对外节点（见痛点五）。

### 1.5 防火墙放行 TCP 和 UDP

进入"控制面板 → 系统和安全 → Windows Defender 防火墙 → 高级设置"，在 **入站规则** 中为 Clash / Mihomo 内核放行代理端口（默认 `7897`），**TCP 和 UDP 都要放行**。只放 TCP 的话，客户端配置里的 `udp: true` 等于没开，游戏、语音、QUIC 类流量都会失败。

临时验证方法：先关闭 Windows 的专用和公用网络防火墙，若客户端立刻恢复，说明就是防火墙拦截。

### 1.6 保持出口端清醒与 IP 稳定

* **Windows**：进入系统设置 → 电源与睡眠，将 **"使计算机进入睡眠状态" 改为 "从不"**。
* **Mac**：系统设置 → 电池 → 电源适配器，关闭"在此时间段后关闭显示器"的自动休眠。
* 在路由器上为出口端配置 **DHCP 地址绑定（静态 DHCP）**，避免重启后 IP 变动导致客户端断网。

---

## 第二阶段：客户端设置（作为"全量流量强盗"）

在客户端上通过本地 TUN 虚拟网卡接管全量网络，并把数据无条件发送给出口端。

### 2.1 编写客户端专属配置文件

1. 打开客户端上的 Clash Verge，点击左侧的 **"配置 (Profiles)"**。
2. 点击右上角的 **"新建 (New)"** → 类型选择 **"Local"**，名称任意（如：*公司直连网关*）。
3. 右键点击这个新建的配置，选择 **"编辑 (Edit)"**，将里面的内容全部清空，然后**完整粘贴**以下 YAML 代码：

```yaml
# ==========================================
# 客户端专用：接管所有软件流量并转发给出口端
# ==========================================
mixed-port: 7890
allow-lan: false
mode: rule
log-level: info

# 1. 开启 TUN 虚拟网卡，吞掉本机 Layer 3 全量流量
tun:
  enable: true
  stack: system
  auto-route: true
  auto-detect-interface: true
  # 显式劫持 DNS。注意：这是列表，不是布尔值 true
  dns-hijack:
    - any:53
    - tcp://any:53

# 2. 显式接管 DNS
dns:
  enable: true
  listen: 127.0.0.1:53        # 只监听本机，不要写成 0.0.0.0:53
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  ipv6: false

  # 用于解析 DoH 域名，必须是 IP
  default-nameserver:
    - 10.0.0.53               # ⚠️ 换成公司内网 DNS
    - 10.0.0.54
    - 223.5.5.5

  # 默认解析器：公网 DoH + 公司 DNS 同列表
  # 并发查询、最快者胜，内网域名由公司 DNS 答，公网域名由 DoH 答
  nameserver:
    - 10.0.0.53               # ⚠️ 换成公司内网 DNS
    - 10.0.0.54
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query

  # 可选：仅当内网域名与公网域名同名、必须强制走公司 DNS 时才写
  # '+.' 覆盖该域及其所有子域，无需列出具体主机名
  nameserver-policy:
    '+.corp.example.com':     # ⚠️ 换成公司内网域名后缀
      - 10.0.0.53
      - 10.0.0.54

  # 内网域名不分配 fake-ip，返回真实 IP
  # 这样 ping、按 IP 直连的数据库工具、RDP 等都正常
  fake-ip-filter:
    - '+.corp.example.com'
    - '*.lan'

# 3. 将出口端配置为"唯一出口节点"
proxies:
  - name: "公司出口网关"
    type: socks5
    server: 192.168.1.100     # ⚠️ 换成出口端实际局域网 IP
    port: 7897                # 与出口端 mixed-port 一致
    udp: true
    username: user            # 与出口端 authentication 保持一致
    password: strong-pass

# 4. 核心规则：本机所有流量，无条件全部打包扔给出口端
rules:
  - MATCH,公司出口网关
```

4. 点击右下角的 **"保存 (Save)"**，并单选激活该配置（使其变成蓝色或高亮状态）。

> **为什么客户端也要把公司 DNS 放进 `nameserver`？**
> 因为 `fake-ip-filter` 让内网域名拿真实 IP，而真实 IP 必须由某个 DNS 解析出来。如果 `nameserver` 里只有公网 DoH，公网 DNS 不认识内网域名，解析就会失败。
> 把公司 DNS 和 DoH 放在同一个 `nameserver` 列表里，mihomo 会并发查询、取最快响应（`dns/util.go` 的 `batchExchange`）：内网域名由公司 DNS 答出，公网域名由 DoH 答出。`nameserver-policy` 只在需要强制某个域名走公司 DNS 时才用，**不是**用来列举内网域名的——没列出的内网域名照样能被公司 DNS 解析。

### 2.2 激活系统级拦截

#### Mac 端

1. 进入 Clash Verge 左侧的 **"设置 (Settings)"**。
2. 找到 **"TUN 模式 (TUN Mode)"** 开关，将其**打开**。
3. 系统会弹出权限提示，要求输入 Mac 的开机密码，同意即可。
4. ❌ **"系统代理 (System Proxy)"** 保持**关闭**（TUN 网卡优先级更高，已彻底接管网络）。

#### Windows 端

1. 进入 Clash Verge 左侧的 **"设置 (Settings)"**。
2. 找到 **"TUN 模式 (TUN Mode)"** 开关，将其**打开**。
3. 首次开启时，Clash Verge 会自动安装 TUN 虚拟网卡驱动（可能需要管理员权限弹窗确认）。
4. 如果安装驱动后仍然无法正常工作，进入 Settings → TUN Stack，尝试切换为 `gVisor`、`mixed` 或 `mips` 模式。
5. ❌ **"系统代理 (System Proxy)"** 保持**关闭**即可。

> **为什么 Windows 客户端不需要开系统代理？**
> 因为在 Clash 的架构中，TUN 模式工作在网络层（Layer 3），优先级高于应用层的系统代理设置。开启 TUN 后，所有流量都会被虚拟网卡截获，无需依赖系统代理。两者同时开启反而可能产生冲突。

#### Linux 端

Linux 上使用 Clash Verge（或命令行版的 clash-meta/mihomo）同样支持 TUN 模式：

1. 确保内核支持 TUN（`ls /dev/net/tun`），且用户有 `root` 或 `sudo` 权限。
2. 使用相同配置文件，将 `tun.stack` 调整为 `gVisor`、`mixed` 或 `system` 视内核版本而定。
3. CLI 用户可以直接使用 `mihomo`（原 Clash Meta）配合该配置文件启动。

### 2.3 进阶：把明文 SOCKS5 换成加密入站

如果出口端和客户端之间的链路也要防嗅探，可以把出口端暴露的 SOCKS5 端口换成 Shadowsocks 加密入站。在出口端的扩展配置中加入：

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

客户端对应改为：

```yaml
proxies:
  - name: "公司出口网关"
    type: ss
    server: 192.168.1.100
    port: 7898
    cipher: 2022-blake3-aes-256-gcm
    password: "与出口端相同的密钥"
    udp: true
```

优点有两个：链路上不再有明文代理流量，端口也不再是扫描器一眼能识别的开放 SOCKS 代理。注意 Shadowsocks 入站使用自己的密码认证，`authentication` 那套只作用于 HTTP/SOCKS/Mixed 代理端口。

---

## 第三阶段：联调与验证

配置完成后，不需要在客户端设置任何代理或静态 IP，直接进行以下测试：

### 3.1 内网域名解析

```bash
nslookup wiki.corp.example.com 127.0.0.1
```

应返回真实的 `10.x.x.x` 地址，而不是 `198.18.x.x` 的 fake-ip。

### 3.2 内网服务访问

```bash
curl -v http://内网服务地址
git clone <公司内网的代码仓库地址>
```

### 3.3 外网访问

```bash
curl -I https://www.baidu.com
curl -I https://www.google.com
```

能打开，说明出口端的代理与连通性正常。

> **不要用 `ping 内网域名` 验证**
> fake-ip 模式下，即使配了 `fake-ip-filter`，未命中的域名 ping 到的仍是 `198.18.x.x` 虚拟地址，这个 ping 只能证明本机 TUN 栈在工作，证明不了链路是否通。请用 `curl` / `git clone` 这类真实流量测试。
> 顺带一提，`ping` 走 ICMP，而大多数代理协议只转发 TCP/UDP，所以它从来都不是可靠的代理连通性测试。

---

## 常见踩坑与排错说明

> **痛点一：配置完后客户端依然打不开网页，提示网络不可达？**
>
> **原因**：90% 是 **出口端的防火墙** 把局域网内客户端发来的请求给拦截了。
>
> **解决办法**：
> - **Windows 出口端**：进入"控制面板 → 系统和安全 → Windows Defender 防火墙 → 高级设置"，检查 **入站规则** 中是否有针对 `Clash` 或 `Mihomo` 内核的拦截。最粗暴有效的验证方法是：临时关闭 Windows 的专用和公用网络防火墙，若关闭后客户端能上网，说明就是防火墙的锅，去入站规则里为 Clash 开放 `7897` 端口——**TCP 和 UDP 都要开**。
> - **Mac / Linux 出口端**：检查系统防火墙或 `iptables` / `nftables` 规则，确保 `7890` 端口未被拦截。

> **痛点二：出口端重启后，客户端突然断网了？**
>
> **原因**：公司路由器通过 DHCP 分配的 IP 是动态的。出口端重启后，IP 地址可能发生了变动。
>
> **解决办法**：每次出口端重启后，确认一下它的新 IP 地址。如果变了，客户端只需要右键编辑配置文件，把 `server:` 后面的 IP 改成新的，保存刷新即可。更彻底的方案是为出口端在路由器上配置 DHCP 地址绑定（静态 DHCP），使其永远获取固定 IP。

> **痛点三：Windows 客户端开启 TUN 模式后蓝屏或断网？**
>
> **原因**：Clash Verge 的 TUN 驱动与某些 VPN 客户端或安全软件冲突。
>
> **解决办法**：在 Settings 中切换 TUN Stack 模式（`system` → `gVisor` → `mixed` → `mips`），找到一个能稳定运行的组合。官方目前默认并推荐 `mips` 栈。注意：旧版本教程里的 `LWIP` 栈在新版 mihomo 中已经不存在了。如果依然不行，检查是否安装了其他虚拟网卡驱动（如公司的 VPN 客户端），尝试暂时禁用。

> **痛点四：部分流量仍然没有走代理？**
>
> **原因**：某些软件使用了非标准的网络协议（如原始 UDP 套接字），或配置了独立的网络命名空间。
>
> **解决办法**：在客户端的 TUN 配置中显式加入 DNS 劫持：
>
> ```yaml
> tun:
>   dns-hijack:
>     - any:53
>     - tcp://any:53
> ```
>
> 注意 `dns-hijack` 的官方语法是**列表**，网上不少教程写成 `dns-hijack: true`，那是错误类型，不会生效。如果问题依旧，可以尝试显式指定 `tun.device` 而不是依赖自动检测。
>
> 另外，Clash Verge 的 TUN 设置对话框里的值优先级高于配置文件：如果你在 GUI 里点开过 TUN 设置并保存，`tun.dns-hijack` 以对话框为准，写进扩展配置的会被覆盖。

> **痛点五：某些公网域名（尤其是 Cloudflare 站点）时通时不通？**
>
> **典型日志**：`dial tcp 104.x.x.x:443: i/o timeout`，一个域名解析出的多个 IP 全部超时。
>
> **原因**：这通常不是 DNS 解析错误。对没有接入 Cloudflare 中国网络的站点，公司 DNS、`223.5.5.5`、`8.8.8.8` 返回的都是同一组 anycast IP——**换 DNS 不会改变 IP，也解决不了连通性**。企业出口到 Cloudflare 的国际线路本身就可能时好时坏。
>
> **解决办法**：
> 1. 在出口端开启 `tcp-concurrent: true`，让 mihomo 对解析出的所有 IP 并发拨号，只要有一个通就能连上。这能解决"一个 IP 通、另一个不通"的情况。
> 2. 如果并发后仍然全部超时，说明公司出口到该 IP 段整体不可达。此时只能在出口端再加一个真正的对外代理节点，并把规则改成"内网与国内直连、其余走节点"。DNS 层面无解。

> **痛点六：出口端暴露在局域网，被别人扫到或白嫖？**
>
> **原因**：`allow-lan: true` 会监听所有网卡，未启用 TLS 的 HTTP/SOCKS/Mixed 端口不应直接暴露。
>
> **解决办法**：按 1.3 节配置 `authentication` 和 `lan-allowed-ips`；需要更强隔离时，按 2.3 节改用 Shadowsocks 等加密入站。另外保持 Clash 的 `external-controller` 只监听 `127.0.0.1`，不要为了"远程管理"改成 `0.0.0.0`。注意 `external-controller` 属于应用接管字段，要在 Clash Verge 设置页里改，写进扩展配置会被丢弃。

---

## 安全与合规提醒

* 本方案的本质是借用一台**已获授权**的设备作为出口，不涉及破解或伪造企业认证。请在使用前确认公司网络管理规定，自行评估合规风险。
* 出口端的账号密码、代理密钥不要提交到公开仓库或写进截图。
* 不要把出口端的代理端口暴露到公网，也不要随意分享给同事使用——一旦被滥用，流量归属会指向你这台设备。
* 定期检查出口端的连接日志，确认只有自己的客户端在使用。
