---
author: Freddy
pubDatetime: 2016-03-15T09:48:30.000Z
modDatetime: 2022-02-08T10:29:35.313Z
title: "Windows + Ubuntu双系统删除Ubuntu"
tags:
  - "网络"
description: "在 Windows + Ubuntu 双系统中卸载 Ubuntu：先确认 UEFI 或 Legacy，再清理引导项与分区。"
---
<h3 id="确定启动方式-UEFI、Legacy"><a href="#确定启动方式-UEFI、Legacy" class="headerlink" title="确定启动方式(UEFI、Legacy)"></a>确定启动方式(UEFI、Legacy)</h3><p>按 WIN+R 快捷键打开“运行”，输入 msinfo32 确定打开“系统信息”，在系统摘要中即可看到BIOS模式。<br><img src="https://raw.githubusercontent.com/liuqitoday/image/main/EasyUEFI.png" alt="image"></p>

<h3 id="UEFI-方式的操作"><a href="#UEFI-方式的操作" class="headerlink" title="UEFI 方式的操作"></a>UEFI 方式的操作</h3><p>借助<a href="https://www.easyuefi.com/index-us.html">EasyUEFI</a>来实现，下载安装运行软件，点击“管理EFI”启动项，删除Ubuntu项即可。<br><img src="http://image.liuqitech.com/blog/EasyUEFI.png" alt="image"></p>
<h3 id="删除分区"><a href="#删除分区" class="headerlink" title="删除分区"></a>删除分区</h3><p>管理计算机-磁盘管理<br>找到Ubuntu对应的分区，删除卷即可。</p>
