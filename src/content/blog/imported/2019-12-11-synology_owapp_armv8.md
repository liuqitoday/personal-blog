---
title: "玩物下载 群晖ARM版 安装方法"
description: "玩物下载 群晖ARM版 安装方法 玩物下载简介 玩物下载是一款超轻快且功能强大的下载工具，其下载加速由迅雷提供技术支持。已支持http、BT、电驴、磁力链、迅雷等目前所有主流的下载格式。欢迎您使用玩物下载，希望通过我们的下载技术，能帮助您节约下载时间、减少等待。产品特点：随时随地，想下就下。 前言 本人前些日子入手了猫"
pubDate: "2019-12-11T04:00:00.000Z"
updatedDate: "2022-05-02T09:21:18.334Z"
permalink: "2019/12/11/synology_owapp_armv8"
category: "Synology"
tags:
  - "Synology"
  - "群晖"
  - "owapp"
  - "玩物下载"
---
<h2 id="玩物下载-群晖ARM版-安装方法">玩物下载 群晖ARM版 安装方法</h2><h3 id="玩物下载简介">玩物下载简介</h3><p>玩物下载是一款超轻快且功能强大的下载工具，其下载加速由迅雷提供技术支持。已支持http、BT、电驴、磁力链、迅雷等目前所有主流的下载格式。欢迎您使用玩物下载，希望通过我们的下载技术，能帮助您节约下载时间、减少等待。产品特点：随时随地，想下就下。</p><h3 id="前言">前言</h3><p>本人前些日子入手了猫盘，刷了黑群晖，目前一直稳定使用。可惜猫盘群晖属于ARM平台，比x86平台的群晖少了很多可玩性。看到x86平台上有玩物下载，遂想找下官方有没有提供群晖ARM版本。</p><p>先到<a href="http://www.ionewu.com/pro_wwxz.html">玩物下载官网</a>看了看，只在帮助中心发现了x86平台spk安装包的下载地址，并没有发现ARM版。</p><p>随后通过Google的帮助，找到了群晖官方spk安装包的下载地址<a href="https://archive.synology.com/download/Package/spk/">https://archive.synology.com/download/Package/spk/</a>，其中owapp即为玩物下载的文件夹，于是发现官方其实是提供了armv8的spk安装包。</p><p>下载下来发现并不能安装成功，通过7-zip打开安装包看了看，对比了下其他官方套件的安装包，发现INFO文件中的arch的值的问题。群晖官方提供的armv8版套件的安装包中arch的值为<code>armv8</code>，而玩物下载中的值为<code>rtd1296</code>，通过修改后成功安装，于是有了下面的安装方法。</p><p>此文仅仅是记录，无任何技术含量，本首发在了矿渣论坛，后发现被各种博客转载且未注明出处，还不如也在自己博客上发下。</p><h3 id="安装方法">安装方法</h3><h4 id="下载安装包">下载安装包</h4><p><a href="https://archive.synology.com/download/Package/spk/owapp/">https://archive.synology.com/download/Package/spk/owapp/</a></p><p>当前最新版为2.2.12，进入该目录，下载<a href="https://archive.synology.com/download/Package/spk/owapp/2.2.12/owapp-armv8-2.2.12.spk"> owapp-armv8-2.2.12.spk</a></p><p><img src="https://raw.githubusercontent.com/liuqitoday/image/main/owapp_armv8_1.png" alt="image"></p><h4 id="提取其中的INFO文件">提取其中的INFO文件</h4><p>使用7-zip打开spk安装包，提取其中的INFO文件</p><p><img src="https://raw.githubusercontent.com/liuqitoday/image/main/owapp_armv8_2.png" alt="image"></p><h4 id="修改arch值">修改arch值</h4><p>将arch的值修改为<code>armv8</code></p><p><img src="https://raw.githubusercontent.com/liuqitoday/image/main/owapp_armv8_3.png" alt="image"></p><h4 id="将修改后的INFO文件替换回安装包中">将修改后的INFO文件替换回安装包中</h4><h4 id="群晖套件中心手动安装">群晖套件中心手动安装</h4><p><img src="https://raw.githubusercontent.com/liuqitoday/image/main/owapp_armv8_4.png" alt="image"></p><h3 id="结束语">结束语</h3><p>此时玩物下载就安装完成了。如果你懒得自己动手修改的话，我提供下我修改好的安装包供下载。</p><p>2019&#x2F;12&#x2F;24：针对<a href="http://www.ionewu.com/pro_wwxz_notice_20191222.html">卸载问题</a>更新了2.2.13版本的安装包。<a href="https://72k.us/dir/22553047-36210073-05502f">https://72k.us/dir/22553047-36210073-05502f</a> 提取码：156276</p>
