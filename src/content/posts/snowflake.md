---
author: Freddy
pubDatetime: 2018-06-10T02:10:20.000Z
modDatetime: 2019-12-26T08:16:23.000Z
title: "Twitter的SnowFlake算法demo"
tags:
  - "Java"
description: "Twitter Snowflake 的位分配与一份 Java 实现：41 位时间戳、10 位机器、12 位序列。"
---
<h3 id="概述"><a href="#概述" class="headerlink" title="概述"></a>概述</h3><p><img src="https://i.loli.net/2018/07/23/5b559f07882b1.jpg" alt="image"></p>
<blockquote>
<p>41-bit的时间可以表示（1L&lt;&lt;41）&#x2F;(1000L<em>3600</em>24*365)&#x3D;69年的时间，10-bit机器可以分别表示1024台机器。如果我们对IDC划分有需求，还可以将10-bit分5-bit给IDC，分5-bit给工作机器。这样就可以表示32个IDC，每个IDC下可以有32台机器，可以根据自身需求定义。12个自增序列号可以表示2^12个ID，理论上snowflake方案的QPS约为409.6w&#x2F;s，这种分配方式可以保证在任何一个IDC的任何一台机器在任意毫秒内生成的ID都是不同的。</p>
</blockquote>

<h3 id="算法实现"><a href="#算法实现" class="headerlink" title="算法实现"></a>算法实现</h3>

```java
public class SnowFlakeService {

    private static final long TIMESTAMP_BIT_NUM = 41L;
    private static final long SEQUENCE_BIT_NUM = 12L;
    private static final long MACHINE_BIT_NUM = 5L;

    private static final long SEQUENCE_MAX_VALUE = -1L ^ (-1L << SEQUENCE_BIT_NUM);

    private long BEGIN_TIMESTAMP = 1262275200000L;

    private long lastTimeStamp = -1L;
    private long sequence = 0L;

    public Long getSnowFlake(Long machineId) {
        long currentTimeStamp = System.currentTimeMillis();
        if (currentTimeStamp < lastTimeStamp) {
            throw new RuntimeException("服务器时间异常！");
        }
        if (currentTimeStamp == lastTimeStamp) {
            sequence = (sequence + 1) & SEQUENCE_MAX_VALUE;
            if (sequence == 0) {
                currentTimeStamp = getNextTimeMillis();
            }
        } else {
            lastTimeStamp = currentTimeStamp;
            sequence = 0;
        }
        return (currentTimeStamp - BEGIN_TIMESTAMP) << (MACHINE_BIT_NUM + SEQUENCE_BIT_NUM)
                | machineId << SEQUENCE_BIT_NUM
                | sequence;
    }

    private long getNextTimeMillis() {
        long currentTimeMillis = 0L;
        do {
            currentTimeMillis = System.currentTimeMillis();
        } while (currentTimeMillis <= lastTimeStamp);
        return currentTimeMillis;
    }

    public static void main(String[] args) {
        long beginTime = System.currentTimeMillis();
        SnowFlakeService snowFlakeService = new SnowFlakeService();
        int count = 0;
        while ((System.currentTimeMillis() - beginTime) <= 1000) {
            Long snowFlake = snowFlakeService.getSnowFlake(1L);
            System.out.println(snowFlake);
            count++;
        }
        System.out.println("产生个数" + count);
    }
}
```

