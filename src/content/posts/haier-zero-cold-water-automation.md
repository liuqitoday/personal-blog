---
author: Freddy
pubDatetime: 2026-09-17T08:00:00.000Z
modDatetime: 2026-09-17T12:00:00.000Z
title: "把海尔热水器接入米家，用小爱打开零冷水"
tags:
  - "智能家居"
description: "用米家手动控制和小爱语音发出中枢虚拟事件，配合 banto6/haier 做零冷水单次循环：先重置状态，等火焰点燃后再播报完成。"
---

家里用的是海尔零冷水燃气热水器。零冷水这件事本身不复杂：让机器先把管道里的冷水循环加热，再出水就不会先凉一下。麻烦的是触发方式——我不想打开海尔 App，也不想走到机器前面按面板。门口按一下开关，或者对小爱说「打开零冷水」，然后听到音箱报「热水循环完毕」，这才是我想要的。

这条自动化跑在 Home Assistant 上，用了两个集成：

- [Xiaomi Home](https://github.com/XiaoMi/ha_xiaomi_home)：小米中枢的虚拟事件，以及小爱音箱播报
- [banto6/haier](https://github.com/banto6/haier)（当前是 v1.3.0）：把海尔热水器接到 HA 里

海尔这个集成是云端轮询，不是局域网直连。它不会写死「零冷水」这种能力，而是按设备上报的属性动态生成实体。热水器这边用到两个：

- `select.*_zerocoldwaterstatus`：零冷水状态，可选项里有「关闭」和「单次循环」
- `binary_sensor.*_flamestatus`：火焰是否点燃

触发则完全走小米。中枢网关有一个「虚拟服务」：动作是「产生虚拟事件」，事件是「虚拟事件发生」，参数都是字符串「事件名称」。米家这边不管是开关还是语音，最后都是让中枢发出 `haier_hot_water_turn_on`；HA 只监听这一下，再去驱动热水器。

## 这条自动化在做什么

流程可以压成六步：

1. 收到虚拟事件 `haier_hot_water_turn_on`
2. 先把零冷水打到「关闭」，再打到「单次循环」
3. 最多等 30 秒，看火焰传感器是否变成 `on`
4. 没点燃：手机通知 + 音箱报「火焰检测超时」，直接结束
5. 点燃了：音箱报「开始燃烧」，再等 35 秒
6. 报「热水循环完毕」，最后发一个 `["nop"]` 把虚拟事件置空

第 6 步不是业务逻辑。小米中枢在 HA 重连时会回放最后一次虚拟事件，不置空的话，重启 Home Assistant 就会再跑一遍热水循环。这件事我在[上一篇](/posts/home-assistant-automation-troubleshooting-guide/)写过，官方 issue 里也有人用「米家手动控制 + 小爱执行」复现过同样的回放。这里只保留最后那一下置空。

## 小爱怎么把「打开零冷水」变成虚拟事件

海尔热水器不在米家里，小爱没法直接对它发指令。能做的是：在米家做一个**手动控制**，动作是让中枢网关产生虚拟事件；小爱执行这个手动控制，HA 就能收到和按开关一样的那一下。

按我现在的设置，步骤是：

1. 米家 App → 智能 → 添加手动控制，名称写成 **打开零冷水**。这个名字就是小爱的口令，后面会说「小爱同学，打开零冷水」。
2. 执行动作选中枢网关的 **产生虚拟事件**，事件名称填 `haier_hot_water_turn_on`。这个字符串必须和 HA 自动化条件里的 `事件名称` 完全一致。
3. 保存。门口的蓝牙开关如果也要走同一条链路，让它触发的是同一个虚拟事件，不要另做一套 HA 自动化。

之后对家里任意一台小爱说「打开零冷水」，米家会跑这个手动控制，中枢发出虚拟事件，HA 那条自动化接手。HA 侧不用改 YAML——语音和开关共用同一个触发。

口令用手动控制的名称，不要额外再套一层「自定义说法」，除非你确实需要别名。小爱对手动控制的常规说法是「打开 + 名称」；名称里已经有「打开」时，有的固件会把「打开打开零冷水」识别得很怪，我家这边「打开零冷水」可以直接用。如果识别不稳，把手动控制改成更短的名字，或在手动控制详情里加一条自定义说法。

音箱播报走的是 HA 里小爱的「播放文本」，不是米家场景自带的「执行成功」。所以你会先听到小爱应答手动控制，过一会儿再听到 HA 报「开始燃烧」或「火焰检测超时」。两套语音叠在一起，听着有点碎，但失败路径能报出来，比米家只说「好的」有用。

## 为什么不是「选一次单次循环就结束」

最早我也是这么干的：收到事件，直接把零冷水设成「单次循环」，再死等 35 秒播报完成。用了几次就发现两个坑。

**已经在「单次循环」时，再选一次可能没反应。** HA 的 `select.select_option` 对「当前值等于目标值」并不保证会再下发一次。所以脚本里先切到「关闭」，等两秒，再切到「单次循环」，相当于强制重新发一次命令。

**35 秒是循环时间，不是点火时间。** 燃气热水器从接到指令到真正点着火，中间还有通信和点火。海尔集成又是云端轮询，火焰状态不会瞬间刷新。如果 Ignition 失败、断网、或者机器本来就没开，你只是干等 35 秒，音箱照样会报「循环完毕」——这是假完成。

所以现在改成：先确认 `flamestatus` 变成 `on`，再开始计那 35 秒。30 秒内点不着，就当失败，不要继续往下走。

30 秒和 35 秒都是按我家实测留的余量。管道更长、云端更慢，就往上加；别抄死这两个数字。

## 完整自动化

实体 ID 换成你自己的即可。音箱用的是小爱音箱的「播放文本」，没有音箱就把 `notify.send_message` 那几步删掉，留 `notify.notify` 也够用。

```yaml
alias: 燃气热水器零冷水开启
description: 虚拟事件触发后重置零冷水状态并执行单次循环；30秒内火焰未点燃判定超时并终止，点燃后等待35秒播报循环完毕。
mode: single
triggers:
  - trigger: state
    entity_id:
      - event.xiaomi_cn_1148896473_hub1_virtual_event_e_4_1
conditions:
  - condition: state
    entity_id: event.xiaomi_cn_1148896473_hub1_virtual_event_e_4_1
    attribute: 事件名称
    state: haier_hot_water_turn_on
actions:
  - variables:
      start_time: "{{ now().timestamp() }}"

  - action: select.select_option
    target:
      entity_id: select.145790acf35a_zerocoldwaterstatus
    data:
      option: 关闭
  - delay: "00:00:02"
  - action: select.select_option
    target:
      entity_id: select.145790acf35a_zerocoldwaterstatus
    data:
      option: 单次循环

  - repeat:
      while:
        - condition: template
          value_template: "{{ not is_state('binary_sensor.145790acf35a_flamestatus', 'on') }}"
        - condition: template
          value_template: "{{ (now().timestamp() - start_time) < 30 }}"
      sequence:
        - delay:
            milliseconds: 500

  - if:
      - condition: template
        value_template: "{{ not is_state('binary_sensor.145790acf35a_flamestatus', 'on') }}"
    then:
      - action: notify.notify
        data:
          message: 火焰检测超时，热水循环未完成
      - action: notify.send_message
        target:
          entity_id: notify.xiaomi_cn_566538160_lx06_play_text_a_5_1
        data:
          message: 火焰检测超时
      - stop: 超时终止自动化

  - action: notify.send_message
    target:
      entity_id: notify.xiaomi_cn_566538160_lx06_play_text_a_5_1
    data:
      message: 开始燃烧
  - delay: "00:00:35"
  - action: notify.notify
    data:
      message: 热水循环完毕
  - action: notify.send_message
    target:
      entity_id: notify.xiaomi_cn_566538160_lx06_play_text_a_5_1
    data:
      message: 热水循环完毕

  - delay: "00:00:05"
  - action: notify.send_message
    target:
      entity_id: notify.xiaomi_cn_1148896473_hub1_emit_virtual_event_a_4_1
    data:
      message: '["nop"]'
```

`mode: single` 是防止连按。零冷水循环正在跑的时候，再按一次开关不会另开一条。

循环里每 500ms 看一次火焰，不是去打海尔云——HA 只是在读本地实体。实体什么时候变，取决于 `banto6/haier` 那一轮轮询。所以超时要覆盖「命令发出 → 云端执行 → 点火 → 下一次轮询把火焰刷进来」整段时间，30 秒对我家刚好够，再短就容易误报超时。

## 几个容易忽略的点

虚拟事件的条件不要省。中枢那个 `event.*_virtual_event_*` 实体会被各种虚拟事件改写，触发器用 state、条件里再卡死 `事件名称 == haier_hot_water_turn_on`，避免别的事件误入这条自动化。

置空用的 notify 实体，名字里带 `emit_virtual_event`，和监听用的 `event.*` 不是同一个东西。前者是往中枢发事件，后者是收事件。上一篇示例里我写成了 `virtual_event_a_4_1`，实际启用的是 `emit_virtual_event_a_4_1`，以设备页里「发送虚拟事件」那个为准。

失败路径也要置空。现在超时分支走了 `stop`，`["nop"]` 就不会发。这意味着：如果某次点火失败，HA 再重启，中枢仍可能回放 `haier_hot_water_turn_on`，自动化会再试一次。对我来说这可以接受——失败本来就该再试。如果你不希望重启后自动重试，把置空那两步也放到超时分支里。

最后，这套东西依赖云。海尔账号掉线、小米中枢离线，开关按了也不会有热水。音箱报超时，至少比默默失败好找原因。

## 参考

- [banto6/haier](https://github.com/banto6/haier) v1.3.0，燃气热水器按 `outWaterTemp` / `targetTemp` / `totalUseGasL` 识别，零冷水和火焰是设备属性映射出来的 Select / Binary Sensor
- [XiaoMi/ha_xiaomi_home](https://github.com/XiaoMi/ha_xiaomi_home)
- [xiaomi.gateway.hub1 虚拟服务](https://home.miot-spec.com/spec/xiaomi.gateway.hub1)：siid 4，动作「产生虚拟事件」，事件「虚拟事件发生」
- [路由器重启之后中枢网关会重复产生上一次虚拟事件](https://github.com/XiaoMi/ha_xiaomi_home/issues/482)
- [Home Assistant 自动化避坑指南](/posts/home-assistant-automation-troubleshooting-guide/)
