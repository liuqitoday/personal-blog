---
author: Freddy
pubDatetime: 2019-06-16T08:26:50.000Z
modDatetime: 2019-12-26T08:14:45.000Z
title: "frp 内网穿透"
tags:
  - "网络"
description: "用 frp 做内网穿透：服务端与客户端的最小配置，以及 SSH、HTTP 的常见用法。"
---
<h2 id="frp-内网穿透"><a href="#frp-内网穿透" class="headerlink" title="frp 内网穿透"></a>frp 内网穿透</h2><h3 id="前言"><a href="#前言" class="headerlink" title="前言"></a>前言</h3><p>对于没有公网IP的用户来说，从公网中访问自己的私有设备是一件不太容易的事。</p>
<p>此时可能我们需要内网穿透，内网穿透的方案有很多，这次我们使用frp来实现。</p>
<h3 id="frp简介"><a href="#frp简介" class="headerlink" title="frp简介"></a>frp简介</h3><p>frp 是一个可用于内网穿透的高性能的反向代理应用，支持 tcp, udp 协议，为 http 和 https 应用协议提供了额外的能力，且尝试性支持了点对点穿透。</p>
<p>项目地址：<a href="https://github.com/fatedier/frp">https://github.com/fatedier/frp</a></p>
<h3 id="准备工作"><a href="#准备工作" class="headerlink" title="准备工作"></a>准备工作</h3><p>我们需要有一台具有公网IP的机器，正好我手头有一台腾讯云服务器。</p>
<p>网上也有些个人提供的免费的frp服务端服务，可以用来临时使用。</p>

<h3 id="安装"><a href="#安装" class="headerlink" title="安装"></a>安装</h3><p>安装非常简单，仅需简单的几个步骤就可以上手。</p>
<h4 id="服务端-frps"><a href="#服务端-frps" class="headerlink" title="服务端 - frps"></a>服务端 - frps</h4><figure class="highlight plaintext"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"># 下载 在github release页面下载适合自己系统的版本</span><br><span class="line">wget https://github.com/fatedier/frp/releases/download/v0.27.0/frp_0.27.0_linux_amd64.tar.gz</span><br><span class="line"># 解压</span><br><span class="line">tar -zxvf frp_0.27.0_linux_amd64.tar.gz</span><br></pre></td></tr></table></figure>

<p>此时就只剩下配置了，进入frp目录，打开修改 frps.ini 文件，根据自己的需求进行配置。</p>
<figure class="highlight plaintext"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br></pre></td><td class="code"><pre><span class="line">[common]</span><br><span class="line">bind_port = 7000</span><br><span class="line"># 客户端与服务端token一致才可连接成功</span><br><span class="line">token = 676767 </span><br><span class="line"># dashboard的端口、用户名、密码，启动后可以访问server_ip:port查看对一些信息的监控</span><br><span class="line">dashboard_port = 7500 </span><br><span class="line">dashboard_user = liuqitech</span><br><span class="line">dashboard_pwd = liuqitech</span><br></pre></td></tr></table></figure>

<p>启动</p>
<figure class="highlight plaintext"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">./frps -c frps.ini</span><br></pre></td></tr></table></figure>

<h4 id="客户端-frpc"><a href="#客户端-frpc" class="headerlink" title="客户端 - frpc"></a>客户端 - frpc</h4><p>同样下载frp的包进行解压，打开修改frpc.ini文件，根据自己的需求进行配置</p>
<figure class="highlight plaintext"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line">[common]</span><br><span class="line"># 服务端IP 端口</span><br><span class="line">server_addr = x.x.x.x</span><br><span class="line">server_port = 7000</span><br><span class="line"># token 服务端与客户端需一致</span><br><span class="line">token = 676767</span><br></pre></td></tr></table></figure>

<p>启动</p>
<figure class="highlight plaintext"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">./frpc.exe -c frpc.ini</span><br></pre></td></tr></table></figure>

<h3 id="使用实例"><a href="#使用实例" class="headerlink" title="使用实例"></a>使用实例</h3><p>以上仅仅是基本配置，还需要根据自己的需求进行不同的配置。</p>
<p>我本次的目的是实现Windows的远程桌面连接，所以下面的配置文件是按我的需求进行配置的。</p>
<p>更多不同的配置请参考官方文档<a href="https://github.com/fatedier/frp/blob/master/README_zh.md">https://github.com/fatedier/frp/blob/master/README_zh.md</a></p>
<p>客户端配置文件 frpc.ini 进行修改，添加以下配置</p>
<figure class="highlight plaintext"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line">[rdp]</span><br><span class="line">type = tcp</span><br><span class="line">local_ip = 127.0.0.1</span><br><span class="line"># 3389为默认的Windows远程桌面连接的端口</span><br><span class="line">local_port = 3389</span><br><span class="line"># 进行远程连接时的端口</span><br><span class="line">remote_port = 7001</span><br></pre></td></tr></table></figure>

<p>重启客户端使配置文件生效。此时该客户端已经实现了内网穿透。</p>
<p>当我在另一台Windows电脑进行远程桌面连接时，连接IP写frp服务端IP，端口写上面配置文件中配置的7001时即可连接成功。此时我便可以愉快的在家连接公司的电脑进行办公了。</p>
