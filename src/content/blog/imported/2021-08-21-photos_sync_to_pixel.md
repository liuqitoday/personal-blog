---
title: "iPhone 照片同步至 Pixel"
description: "安装 Synology Photos 群晖安装<c"
pubDate: "2021-08-21T07:00:00.000Z"
updatedDate: "2022-05-02T10:24:59.359Z"
permalink: "2021/08/21/photos_sync_to_pixel"
category: "Synology"
tags:
  - "Android"
  - "DSM"
  - "Synology"
  - "群晖"
  - "Pixel"
  - "iPhone"
---
<h2 id="安装-Synology-Photos">安装 Synology Photos</h2><p>群晖安装<code> Synology Photos</code> 套件，iPhone 手机端安装 <code>Photos Mobile</code> APP，使用该 APP 对手机照片进行备份。</p><h2 id="安装-Syncthing">安装 Syncthing</h2><p>群晖添加社区套件源 <code>https://packages.synocommunity.com/ </code>，并安装 <code>Syncthing</code>  套件。Pixel 手机端安装 <code>Syncthing</code>  APP。</p><h2 id="配置-Syncthing">配置 Syncthing</h2><ol><li>照片目录权限配置。群晖端使用 File Station，将照片所在目录（例如 homes&#x2F;liuqi&#x2F;Photos&#x2F;MobileBackup）的读写权限设置给 sc-syncthing 用户。</li><li>添加设备。群晖端 Syncthing 显示设备二维码（操作 - 显示ID），手机端操作“添加设备”并扫描该二维码完成添加，此时在群晖的端 Syncthing 页面同意添加进来的设备。</li><li>群晖端 Syncthing 配置同步文件夹。群晖端 Syncthing 添加文件夹，常规标签页面下，填写文件夹标签（例如 tag_dsm_photos_lq）、文件夹ID（例如 id_dsm_photos_lq）、文件夹路径（例如 &#x2F;var&#x2F;services&#x2F;homes&#x2F;liuqi&#x2F;Photos&#x2F;MobileBackup）等信息。共享标签页面下勾选上一步添加的 Pixel 手机。忽略模式标签页面下添加@eaDir。高级标签页面下文件夹类型修改为仅发送，勾选忽略文件权限。进行保存。</li><li>Pixel 手机端 Syncthing 配置同步文件夹。此时打开 Pixel 手机端 Syncthing APP，同意提示添加的同步文件夹信息，并配置手机端的文件夹目录，目录种类修改为仅接收。 </li><li>查看两端的 Syncthing 显示的同步进度是否正常，完成。</li></ol>
