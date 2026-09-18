---
author: Freddy
pubDatetime: 2019-02-18T04:26:50.000Z
modDatetime: 2019-12-26T08:15:30.000Z
title: "jmeter-plugins-dubbo简单试用"
tags:
  - "Java"
description: "用 jmeter-plugins-dubbo 对 Dubbo 接口做压测：下载带依赖的 jar、放到 lib/ext 后重启 JMeter。"
---
<h2 id="jmeter-plugins-dubbo简单试用"><a href="#jmeter-plugins-dubbo简单试用" class="headerlink" title="jmeter-plugins-dubbo简单试用"></a>jmeter-plugins-dubbo简单试用</h2><h3 id="项目地址"><a href="#项目地址" class="headerlink" title="项目地址"></a>项目地址</h3><p><a href="https://github.com/dubbo/jmeter-plugins-dubbo">https://github.com/dubbo/jmeter-plugins-dubbo</a></p>
<h3 id="下载"><a href="#下载" class="headerlink" title="下载"></a>下载</h3><p>下载dist目录下的jar包<br>推荐使用 jmeter-plugins-dubbo-${version}-jar-with-dependencies.jar，包含必要的依赖。</p>
<h3 id="安装"><a href="#安装" class="headerlink" title="安装"></a>安装</h3><p>将插件的jar包放入 ${JMETER_HOME}\lib\ext</p>

<h3 id="使用"><a href="#使用" class="headerlink" title="使用"></a>使用</h3><ul>
<li><p>add -&gt; Sampler -&gt; dubbo sample</p>
</li>
<li><p>选择注册中心类型（以zookeeper注册中心为例）</p>
<p>Protocol -&gt; zookeeper</p>
</li>
<li><p>填写注册中心地址</p>
<p>Address</p>
</li>
<li><p>填写Interface与Method</p>
</li>
<li><p>填写接口相关参数</p>
</li>
</ul>
<p><img src="http://image.liuqitech.com/blog/jmeter-plugins-dubbo_1.jpg"><br><img src="http://image.liuqitech.com/blog/jmeter-plugins-dubbo_2.jpg"></p>
<h3 id="官方文档"><a href="#官方文档" class="headerlink" title="官方文档"></a>官方文档</h3><p><a href="https://github.com/dubbo/jmeter-plugins-dubbo/wiki/%E7%94%A8%E6%88%B7%E6%8C%87%E5%8D%97">https://github.com/dubbo/jmeter-plugins-dubbo/wiki/%E7%94%A8%E6%88%B7%E6%8C%87%E5%8D%97</a></p>
<p><a href="https://github.com/dubbo/jmeter-plugins-dubbo/wiki/FAQ">https://github.com/dubbo/jmeter-plugins-dubbo/wiki/FAQ</a></p>
