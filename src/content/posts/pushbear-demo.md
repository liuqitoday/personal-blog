---
author: Freddy
pubDatetime: 2019-06-14T08:21:50.000Z
modDatetime: 2019-06-17T02:34:32.000Z
title: "PushBear试用 - 喝水提醒小助手"
tags:
  - "网络"
description: "用 PushBear 做微信模板一对多推送，附一份喝水提醒的 Python 定时脚本。"
---
<h2 id="PushBear试用-喝水提醒小助手"><a href="#PushBear试用-喝水提醒小助手" class="headerlink" title="PushBear试用 - 喝水提醒小助手"></a>PushBear试用 - 喝水提醒小助手</h2><h3 id="PushBear简介"><a href="#PushBear简介" class="headerlink" title="PushBear简介"></a>PushBear简介</h3><p>基于微信模板的一对多消息送达服务</p>
<h3 id="接入说明"><a href="#接入说明" class="headerlink" title="接入说明"></a>接入说明</h3><p>详见官网 <a href="http://pushbear.ftqq.com/">http://pushbear.ftqq.com</a></p>

<h3 id="DEMO"><a href="#DEMO" class="headerlink" title="DEMO"></a>DEMO</h3><p>废话不多说，直接贴代码</p>

```python
import requests
import datetime
from apscheduler.schedulers.blocking import BlockingScheduler

global times
times = 1

def remind():
    global times
    sendkey = '此处换成自己的'
    text = '提醒喝水小助手'
    desp = '这是今天第' + str(times) + '次提醒你喝水啦'
    payload = {'sendkey': sendkey, 'text': text, 'desp': desp}
    requests.post("https://pushbear.ftqq.com/sub", data=payload)
    times  = times + 1
    now_hour = datetime.datetime.now().hour
    if now_hour >= 21:
        times = 1

if __name__ == "__main__":
    sched = BlockingScheduler()
    sched.add_job(remind, 'cron', hour='10,11,14,15,16,17,18,21', minute=6)
    sched.start()
```

