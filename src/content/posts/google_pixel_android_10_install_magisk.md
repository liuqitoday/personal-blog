---
author: Freddy
pubDatetime: 2021-08-21T16:20:00.000Z
modDatetime: 2021-08-22T05:30:24.000Z
title: "Google Pixel (Android 10) 安装 Magisk 过程记录"
tags:
  - "Android"
description: "在 macOS 上通过 adb 和 fastboot，为 Google Pixel（Android 10）解锁 bootloader、提取并修补 boot.img，完成 Magisk 安装的完整步骤记录。"
---
<h3 id="Mac-安装-android-platform-tools">Mac 安装 android-platform-tools</h3>

```bash
brew install --cask android-platform-tools
```

<h3 id="解锁-bootloader">解锁 bootloader</h3><p>手机进入开发者模式 打开 USB调试模式，并勾选 ”OEM解锁“</p>

```bash
adb reboot bootloader
```

```bash
fastboot flashing unlock
```

<h3 id="提取原版-boot-img">提取原版 boot.img</h3><p>下载<a href="https://developers.google.com/android/images#flashtool">原版刷机包</a>并提取 boot.img 文件</p><h3 id="制作-Magisk-patch">制作 Magisk patch</h3><p>下载 <a href="https://github.com/topjohnwu/Magisk/releases">Magisk</a> 安装文件，把 Magisk安装文件以及上一步中提取的 boot.img 传入手机中 </p>

```bash
adb push Magisk-v23.0.apk /sdcard/
```

```bash
adb push boot.img /sdcard/
```

<p>手机端安装并打开 Magisk 应用，Magisk - 安装 - 选择并修补一个文件，选择 boot.img 文件，点开始按钮开始制作补丁，制作完毕后查看日志中生成的 magisk_patched.img 文件路径，将文件拷贝到电脑中</p>

```bash
adb pull /sdcard/Download/magisk_patched.img ~/Downloads/
```

<h3 id="刷写-magisk-patched-img">刷写 magisk_patched.img</h3>

```bash
adb reboot fastboot
```

```bash
fastboot flash boot magisk_patched.img
```

<h3 id="重启并验证">重启并验证</h3>

```bash
fastboot reboot
```

<p>打开 Magisk APP 显示各种状态均正常，成功！</p>
