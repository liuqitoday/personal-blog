---
author: Freddy
pubDatetime: 2019-07-02T09:58:00.000Z
modDatetime: 2019-07-02T10:17:09.000Z
title: "Redis基础笔记 - 数据类型&部署方式&项目配置"
tags:
  - "Java"
description: "Redis 常用数据类型、单机/主从/哨兵/集群部署，以及 Spring 项目中的配置要点。"
---
<h2 id="Redis基础笔记-数据类型-部署方式-项目配置"><a href="#Redis基础笔记-数据类型-部署方式-项目配置" class="headerlink" title="Redis基础笔记 - 数据类型&amp;部署方式&amp;项目配置"></a>Redis基础笔记 - 数据类型&amp;部署方式&amp;项目配置</h2><h3 id="Redis-数据类型"><a href="#Redis-数据类型" class="headerlink" title="Redis 数据类型"></a>Redis 数据类型</h3><p>Redis 常用的数据类型：strings（字符串）、Lists（列表）、Hashes（哈希）、Sets（集合）、Sorted sets（有序集合） 等。</p>
<p>官方文档对于数据类型说明 <a href="https://redis.io/topics/data-types-intro">https://redis.io/topics/data-types-intro</a></p>
<h4 id="Redis-Strings"><a href="#Redis-Strings" class="headerlink" title="Redis Strings"></a>Redis Strings</h4><p>Redis String 字符串类型，最简单的数据类型。</p>

```text
> set mykey somevalue
OK
> get mykey
"somevalue"
```

<h4 id="Redis-Lists"><a href="#Redis-Lists" class="headerlink" title="Redis Lists"></a>Redis Lists</h4><p>Redis Lists 存储的字符串类型的元素，是按插入顺序排序的列表。</p>

```text
> rpush mylist A
(integer) 1
> rpush mylist B
(integer) 2
> lpush mylist first
(integer) 3
> lrange mylist 0 -1
1) "first"
2) "A"
3) "B"
> lpop mylist
"first"
> rpop mylist
"B"
> lrange mylist 0 -1
1) "A"
```

<h4 id="Redis-Hashes"><a href="#Redis-Hashes" class="headerlink" title="Redis Hashes"></a>Redis Hashes</h4><p>Redis Hashes 是字符串类型的键值对。</p>

```text
> hset myhash name liuqi
(integer) 0
> hget myhash name
"liuqi"
> hmset myhash age 27 website liuqitech.com
OK
> hgetall myhash
1) "name"
2) "liuqi"
3) "age"
4) "27"
5) "website"
6) "liuqitech.com"
```

<h4 id="Redis-Sets"><a href="#Redis-Sets" class="headerlink" title="Redis Sets"></a>Redis Sets</h4><p>Redis Sets 是字符串类型的无序集合，不能有重复的元素。</p>

```text
> sadd myset 1 2 3
(integer) 3
> smembers myset
1) "1"
2) "2"
3) "3"
> sismember myset 1
(integer) 1
> sismember myset 10
(integer) 0
```

<h4 id="Redis-Sorted-sets"><a href="#Redis-Sorted-sets" class="headerlink" title="Redis Sorted sets"></a>Redis Sorted sets</h4><p>Redis Sorted sets 与 Redis Sets 不同的是，每一个元素都会关联一个浮点数类型的分数。</p>

```text
> zadd hackers 1940 "Alan Kay"
(integer) 1
> zadd hackers 1957 "Sophie Wilson"
(integer) 1
> zadd hackers 1953 "Richard Stallman"
(integer) 1
> zadd hackers 1949 "Anita Borg"
> zrange hackers 0 -1
1) "Alan Kay"
2) "Anita Borg"
3) "Richard Stallman"
4) "Sophie Wilson"
```

<h3 id="Redis-部署方式"><a href="#Redis-部署方式" class="headerlink" title="Redis 部署方式"></a>Redis 部署方式</h3><p>单机、主从、哨兵、集群</p>
<h4 id="单机"><a href="#单机" class="headerlink" title="单机"></a>单机</h4><p>单机方式没什么好说的，使用默认的配置文件启动即可。</p>

```bash
./redis-server redis.conf
```

<h4 id="主从复制-（replication）"><a href="#主从复制-（replication）" class="headerlink" title="主从复制 （replication）"></a>主从复制 （replication）</h4><p>配置主从复制方式非常简单，只需要在 slave 的配置文件中添加如下配置：</p>

```text
slaveof 192.168.1.1 6379
```

<p>其中 192.168.1.1 6379 为 master 的IP和端口</p>
<p>官方文档 <a href="https://redis.io/topics/replication">https://redis.io/topics/replication</a></p>
<h4 id="哨兵（Sentinel）"><a href="#哨兵（Sentinel）" class="headerlink" title="哨兵（Sentinel）"></a>哨兵（Sentinel）</h4><p>哨兵是在主从复制的基础上进行的增强方案。原主从复制的方式中，若master宕机，无法进行主从切，所以会引发一些故障。哨兵可以监控多个，master-slave集群，若发现其中的master宕机时，会把该master下的slave转换为master，同时原master下的slave也会slaveof为新的master。</p>
<p>哨兵启动的方式有以下两种，sentinel的默认端口为26379。</p>

```text
redis-sentinel /path/to/sentinel.conf
```

```text
redis-server /path/to/sentinel.conf --sentinel
```

<p>我们需要配置监听的master，slave无需手动配置。</p>

```text
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 60000
sentinel failover-timeout mymaster 180000
sentinel parallel-syncs mymaster 1

sentinel monitor resque 192.168.1.3 6380 4
sentinel down-after-milliseconds resque 10000
sentinel failover-timeout resque 180000
sentinel parallel-syncs resque 5
```

<p>以上为监听两个master的例子。sentinel monitor 语句参数的含义如下：</p>

```text
sentinel monitor <master-group-name> <ip> <port> <quorum>
```

<p>其中quorum的意义为，当sentinel为集群时，若quorum为2，此时其中监听的一个master发生了宕机，当有2个sentinel认为它为不可用状态的时候才会真正判定该master已经为不可用状态。</p>
<p>官方文档 <a href="https://redis.io/topics/sentinel">https://redis.io/topics/sentinel</a></p>
<h4 id="集群-（cluster）"><a href="#集群-（cluster）" class="headerlink" title="集群 （cluster）"></a>集群 （cluster）</h4><p>按照文档做个简单的搭建，复制6份redis到文件夹（如 7000 7001 7002 7003 7004 7005），7000到7005的redis.conf分别按以下模板进行配置</p>

```text
port 7000
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
```

<p>分别启动这6个reids实例，然后redis-cli创建集群（5以上版本）</p>

```bash
./redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 --cluster-replicas 1
```

<p>官方文档 <a href="https://redis.io/topics/cluster-tutorial">https://redis.io/topics/cluster-tutorial</a></p>
<h3 id="Spring-Boot-配置"><a href="#Spring-Boot-配置" class="headerlink" title="Spring Boot 配置"></a>Spring Boot 配置</h3><p>我demo中使用的 Spring Boot 版本为 <code>2.1.6.RELEASE</code></p>
<p>添加依赖</p>

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

<p>查看依赖可知现在版本的使用的默认的reids客户端为 <code>Lettuce</code></p>
<p>通过查看<code>LettuceConnectionConfiguration</code> 可发现，它可以为我们初始化一个 <code>RedisTemplate&lt;Object, Object&gt;</code> 类型的 redisTemplate，和一个 <code>RedisTemplate&lt;String, String&gt;</code> 类型的 stringRedisTemplate。</p>

```java
@Configuration
@ConditionalOnClass(RedisOperations.class)
@EnableConfigurationProperties(RedisProperties.class)
@Import({ LettuceConnectionConfiguration.class, JedisConnectionConfiguration.class })
public class RedisAutoConfiguration {

	@Bean
	@ConditionalOnMissingBean(name = "redisTemplate")
	public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory)
			throws UnknownHostException {
		RedisTemplate<Object, Object> template = new RedisTemplate<>();
		template.setConnectionFactory(redisConnectionFactory);
		return template;
	}

	@Bean
	@ConditionalOnMissingBean
	public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory redisConnectionFactory)
			throws UnknownHostException {
		StringRedisTemplate template = new StringRedisTemplate();
		template.setConnectionFactory(redisConnectionFactory);
		return template;
	}

}
```

<p>后面的例子中为了方便测试，直接注入<code>stringRedisTemplate</code> 来使用，当然你也可以自定义自己需要类型的 RedisTemplate。针对不同的部署方式，修改application.yml 配置文件如下：</p>
<h4 id="单机-1"><a href="#单机-1" class="headerlink" title="单机"></a>单机</h4>

```text
spring:
  redis:
    host: 127.0.0.1
    port: 6379
```

<h4 id="哨兵"><a href="#哨兵" class="headerlink" title="哨兵"></a>哨兵</h4>

```text
spring:
  redis:
    sentinel:
	  master: mymaster
	  nodes: 127.0.0.1:26379, 127.0.0.1:26380
```

<h4 id="集群"><a href="#集群" class="headerlink" title="集群"></a>集群</h4>

```text
spring:
  redis:
    cluster:
	  nodes: 127.0.0.1:7000, 127.0.0.1:7001, 127.0.0.1:7002, 127.0.0.1:7003, 127.0.0.1:7004, 127.0.0.1:7005
```

