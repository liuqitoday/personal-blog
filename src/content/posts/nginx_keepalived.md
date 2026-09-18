---
author: Freddy
pubDatetime: 2020-02-28T10:00:00.000Z
modDatetime: 2020-03-17T10:26:37.000Z
title: "使用Keepalived实现简单的Nginx高可用"
tags:
  - "网络"
description: "环境说明 Nginx Master : 192.168.123.101 Nginx Backup : 192.168.123.102 VIP : 192.168.123.103 安装Keepalived 以上两台Nginx所在的机器分别安装Keepalived 1 sudo yum install keepalived"
---
<h4 id="环境说明">环境说明</h4><p>Nginx Master : 192.168.123.101</p><p>Nginx Backup : 192.168.123.102</p><p>VIP : 192.168.123.103</p><h4 id="安装Keepalived">安装Keepalived</h4><p>以上两台Nginx所在的机器分别安装Keepalived</p>

```bash
sudo yum install keepalived
```

<h4 id="配置Keepalived">配置Keepalived</h4><p>修改 nginx master 所在机器的keepalived 的配置文件</p>

```text
vi /etc/keepalived/keepalived.conf
```

```nginx
! Configuration File for keepalived

global_defs {
   notification_email {
       admin@liuqitech.com.com     #设置报警邮件地址，可以设置多个，每行一个。 需开启本机的sendmail服务
   }
   notification_email_from no-reply@liuqitech.com  #设置邮件的发送地址
   smtp_server 127.0.0.1      #设置smtp server地址
   smtp_connect_timeout 30    #设置连接smtp server的超时时间
   router_id LVS_DEVEL_1              #表示运行keepalived服务器的一个标识。
}

vrrp_script chk_nginx {
    script "/usr/local/keepalived/sbin/check_nginx.sh"   #该脚本检测ngnix的运行状态，并在nginx进程不存在时尝 试重新启动ngnix，如果启动失败则停止keepalived，准备让其它机器接管。
    interval 2              #每2s检测一次
    weight -20               #检测失败则优先级-20
}

vrrp_instance VI_1 {
    state MASTER              #指定keepalived的角色，MASTER表示此主机是主服务器，BACKUP表示此主机是备用服务器
    interface eth0              #指定HA监测网络的接口 可通过ifconfig查看
    virtual_router_id 55    #虚拟路由标识，这个标识是一个数字，同一个vrrp实例使用唯一的标识。即同一vrrp_instance下，MASTER和BACKUP必须是一致的
    priority 100                  #定义优先级，数字越大，优先级越高，在同一个vrrp_instance下，MASTER的优先级必须大于BACKUP的优先级
    advert_int 1            #设定MASTER与BACKUP负载均衡器之间同步检查的时间间隔，单位是秒
    authentication {        #设置验证类型和密码
        auth_type PASS      #设置验证类型，主要有PASS和AH两种
        auth_pass liuqitech  #设置验证密码，在同一个vrrp_instance下，MASTER与BACKUP必须使用相同的密码才能正常通信
    }
    virtual_ipaddress {     #设置虚拟IP地址，可以设置多个虚拟IP地址，每行一个
        192.168.123.103
    }
    track_script {
        chk_nginx           #引用VRRP脚本，即在 vrrp_script 部分指定的名字。定期运行它们来改变优先级，并最终引发主备切换。
    }
}
```

<p>修改 nginx backup 所在机器的keepalived的配置文件</p>

```nginx
! Configuration File for keepalived

global_defs {
   notification_email {
       admin@liuqitech.com     #设置报警邮件地址，可以设置多个，每行一个。 需开启本机的sendmail服务
   }
   notification_email_from no-reply@liuqitech.com  #设置邮件的发送地址
   smtp_server 127.0.0.1      #设置smtp server地址
   smtp_connect_timeout 30    #设置连接smtp server的超时时间
   router_id LVS_DEVEL_2        #表示运行keepalived服务器的一个标识。发邮件时显示在邮件主题的信息
}

vrrp_script chk_nginx {
    script "/usr /local/keepalived/sbin/check_nginx.sh"   #该脚本检测ngnix的运行状态，并在nginx进程不存在时尝 试重新启动ngnix，如果启动失败则停止keepalived，准备让其它机器接管。
    interval 2              #每2s检测一次
    weight -20                #检测失败则优先级-20
}

vrrp_instance VI_1 {
    state BACKUP            #指定keepalived的角色，MASTER表示此主机是主服务器，BACKUP表示此主机是备用服务器
    interface eth0          #指定HA监测网络的接口
    virtual_router_id 55    #虚拟路由标识，这个标识是一个数字，同一个vrrp实例使用唯一的标识。即同一vrrp_instance下，MASTER和BACKUP必须是一致的
    priority 50             #定义优先级，数字越大，优先级越高，在同一个vrrp_instance下，MASTER的优先级必须大于BACKUP的优先级
    advert_int 1            #设定MASTER与BACKUP负载均衡器之间同步检查的时间间隔，单位是秒
    nopreempt               #设置nopreempt防止抢占资源，只生效BACKUP节点
    authentication {        #设置验证类型和密码
        auth_type PASS      #设置验证类型，主要有PASS和AH两种
        auth_pass liuqitech  #设置验证密码，在同一个vrrp_instance下，MASTER与BACKUP必须使用相同的密码才能正常通信
    }
    virtual_ipaddress {     #设置虚拟IP地址，可以设置多个虚拟IP地址，每行一个
        192.168.123.103
    }
    track_script {
        chk_nginx           #引用VRRP脚本，即在 vrrp_script 部分指定的名字。定期运行它们来改变优先级，并最终引发主备切换。
    }
}
```

<p>检测脚本，vi &#x2F;usr&#x2F;local&#x2F;keepalived&#x2F;sbin&#x2F;check_nginx.sh</p>

```text
#!/bin/bash
A=`ps -C nginx --no-header |wc -l`
if [ $A -eq 0 ];then
    sleep 2
    /user/local/nginx/sbin/nginx
    if [ `ps -C nginx --no-header |wc -l` -eq 0 ];then
        killall keepalived
    fi
fi
```

<p>脚本说明：此方法比较暴力，若没有到nginx进程并且重启后仍检测不到，则kill掉keepalived</p><p>脚本加上可执行权限</p>

```text
chmod +x /usr/local/keepalived/sbin/check_nginx.sh
```

```text
                                                                 
                                      +----------+               
                  +----------+        |  Tomcat  |               
                  |  Nginx   |        +----------+               
                  +----------+                                   
+----------+                          +----------+               
|  虚拟IP   |                          |  Tomcat  |               
+----------+                          +----------+               
                  +----------+                                   
                  |  Nginx   |        +----------+               
                  +----------+        |  Tomcat  |               
                                      +----------+               
                                                          
```

<h4 id="参考文档">参考文档</h4><p><a href="https://www.linuxprobe.com/keepalived-nginx.html">https://www.linuxprobe.com/keepalived-nginx.html</a></p><p><a href="https://www.centos.bz/2017/09/nginx-keepalived-%E9%AB%98%E5%8F%AF%E7%94%A8/">https://www.centos.bz/2017/09/nginx-keepalived-%E9%AB%98%E5%8F%AF%E7%94%A8/</a></p>
