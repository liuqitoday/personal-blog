---
author: Freddy
pubDatetime: 2020-02-27T08:00:00.000Z
modDatetime: 2020-03-07T10:43:05.000Z
title: "MySQL Replication 主从复制 配置"
tags:
  - "MySQL"
description: "介绍 Replication 可以使数据从一个MySQL数据库(master)复制到一个或多个MySQL数据库(slave)中，默认情况下该复制过程是异步的。我们可以通过配置来实现复制所有的 database 或者指定的 database 。 MySQL Replication 的优点如下： 横向扩展：可以将负载分布在"
---
<h4 id="介绍">介绍</h4><p><em>Replication</em> 可以使数据从一个MySQL数据库(master)复制到一个或多个MySQL数据库(slave)中，默认情况下该复制过程是异步的。我们可以通过配置来实现复制所有的<em>database</em>或者指定的<em>database</em>。</p><p>MySQL Replication 的优点如下：</p><ul><li>横向扩展：可以将负载分布在多个slave上以提高性能。所有的写操作都必须在master上进行，但是读操作可以分布在一个或多个slave上。这样的模型可以提高写入性能，因为master专注于数据更新，同时多个slave可以显著的提高读取速度。</li><li>数据安全：定期备份是保护数据的重要手段之一，若在master上进行数据备份则需要使master处于readonly状态，这将影响写操作 。而salve可以暂停复制的过程，所以slave上进行数据备份而不会影响到master。</li><li>分析：数据是从master上实时写入的，数据分析可以在slave上进行而不影响master的性能。</li><li>远程数据分发：如果master的物理位置距离较远，我们可以在临近的地方创建slave，方便使用数据使用，而不需要总是访问远端的master。</li></ul><h4 id="原理">原理</h4><p>作为master 的MySQL实例将数据的变更操作作为”事件”记录到<code>binary log</code>中，slave 的MySQL实例被被指为读取master的<code>binary log</code>，slave将读取到的<code>binary log</code>写入自己的中继日志中，然后slave回把相关的事件进行执行。slave具体执行哪些事件由slave决定。</p><h4 id="配置">配置</h4><h5 id="创建用于复制的账号">创建用于复制的账号</h5><p>进入master的MySQL实例，执行以下操作：</p><p>执行以下命令创建账号，其中<code>172.20.254.176</code>为slave的MySQL的ip，<code>liuqitech@2020</code>为密码。</p>

```text
CREATE USER 'slave'@'172.20.254.176' IDENTIFIED BY 'liuqitech@2020';
```

<p>分配权限，其中<code>replication slave</code> 表示 主从复制权限</p>

```text
GRANT REPLICATION SLAVE ON *.* TO 'slave'@'172.20.254.176';
```

<p>刷新权限</p>

```text
flush privileges;
```

<h5 id="master配置">master配置</h5><p>开启二进制日志并设置唯一的server-id。修改<code>my.cnf</code>，添加如下配置</p>

```text
[mysqld]
log-bin=mysql-bin #表示开启binlog，并且指定二进制日志文件名为mysql-bin
server-id=1 #唯一的服务ID
```

<p>重启MySQL使之生效</p><h5 id="slave配置">slave配置</h5><p>被指唯一的server-id。修改<code>my.cnf</code>，添加如下配置</p>

```text
[mysqld]
server-id=2
```

<p>重启MySQL使之生效</p><h5 id="获取master的二进制日志文件坐标">获取master的二进制日志文件坐标</h5><p>master上执行以下操作</p>

```text
mysql > SHOW MASTER STATUS;
+------------------+----------+--------------+------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+----------+--------------+------------------+
| mysql-bin.000001 | 67       |              |                  |
+------------------+----------+--------------+------------------+
```

<p>记录File、Position的值</p><h5 id="连接slave到master">连接slave到master</h5><p>slave上执行以下操作</p>

```text
mysql> CHANGE MASTER TO
         MASTER_HOST='172.20.254.175',
         MASTER_USER='slave',
         MASTER_PASSWORD='liuqitech@2020',
         MASTER_LOG_FILE='mysql-bin.000001',
         MASTER_LOG_POS=67;
```

```text
mysql> start slave;
```

<h5 id="查看状态">查看状态</h5><p>slave 中执行 查看状态</p>

```text
mysql> SHOW SLAVE STATUS \G
```

<p>观察是否正常运行中</p>

```text
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```

