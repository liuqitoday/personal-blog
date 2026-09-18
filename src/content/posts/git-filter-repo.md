---
author: Freddy
pubDatetime: 2023-03-19T16:00:00.000Z
modDatetime: 2023-03-30T02:21:15.125Z
title: "git filter-repo 简介"
tags:
  - "Git"
description: "简介 git filter-repo 是一个快速而灵活的工具，用于修改 Git 仓库的历史记录。 它可以用于许多任务，例如： 重写提交历史记录 清理旧的大型文件 将仓库拆分成几个小仓库 将多个仓库合并成一个 移除密码和其他敏感数据 Git-Filter-Repo的一些特性是： 处理速度快 灵活，可配置性高 保留提交的作"
---
<h2 id="简介">简介</h2><p>git filter-repo 是一个快速而灵活的工具，用于修改 Git 仓库的历史记录。</p><p>它可以用于许多任务，例如：</p><ul><li>重写提交历史记录</li><li>清理旧的大型文件</li><li>将仓库拆分成几个小仓库</li><li>将多个仓库合并成一个</li><li>移除密码和其他敏感数据</li></ul><p>Git-Filter-Repo的一些特性是：</p><ul><li>处理速度快</li><li>灵活，可配置性高</li><li>保留提交的作者和时间戳信息</li><li>可以对文件进行重命名和重构</li><li>可以对提交信息进行修改和删除</li><li>可以对提交信息进行搜索和替换</li><li>可以使用Python脚本进行自定义修改</li></ul><h2 id="安装">安装</h2><p>MacOS 使用 homebrew 包管理工具进行安装，命令如下，其他方式参考官方文档</p>

```bash
brew install git-filter-repo
```

<h2 id="使用示例">使用示例</h2><h3 id="移除文件">移除文件</h3><p>假设我们有一个包含敏感文件的 Git 仓库，需要将这些文件从提交记录中移除。</p>

```bash
git filter-repo --path sensitive.txt --invert-paths
```

<p>这个命令会将所有包含 sensitive.txt 文件的提交从历史记录中移除。</p><h3 id="修改提交信息">修改提交信息</h3><p>修改指定 commit 的 message 信息</p>

```bash
git-filter-repo --message-callback 'return message.replace(b"old commit message", b"new commit message")'
```

<p>其中，<code>new commit message</code> 是你想要修改的新 commit message，<code>old commit message</code> 是你想要修改的旧 commit message。</p><h3 id="替换指定的字符串">替换指定的字符串</h3><p>例如我们的项目中，存在密码等敏感信息，我们希望将敏感信息删除。</p><p>首先我们需要创建文件，按照如下格式将替换文本的相关内容填写其中，如文件名为 expressions</p>

```text
password123==>******
```

<p>以上内容表示，将 <code>password123</code>替换为 <code>******</code>，执行下面的命令进行替换</p>

```bash
git filter-repo --replace-text ../expressions
```

<h3 id="修改-commit-信息中的-user-与-mail">修改 commit 信息中的 user 与 mail</h3><p>新建 mailmap 文件，如文件名为 my-mailmap，文件内容格式如下：</p>

```bash
liuqitoday <liuqitoday@163.com> liuqitech <liuqitech@email.com>
```

<p>执行下面的命令便会帮我们批量将commit 历史中的作者信息 <code>liuqitech &lt;liuqitech@email.com</code>&gt;  替换为 <code> liuqitech &lt;liuqitech@email.com&gt;</code></p>

```bash
git filter-repo --mailmap ../my-mailmap
```

<h3 id="重命名文件">重命名文件</h3><p>如将 README.md 重命名为 README_1.md</p>

```bash
git filter-repo --path-rename README.md:README_1.md
```

<h3 id="提取子目录">提取子目录</h3><p>有时候，我们只需要一个 Git 仓库中的某个子目录。</p>

```bash
git filter-repo --path path/to/subdir
```

<p>这个命令将会把 <code>path/to/subdir</code> 目录提取出来，形成一个新的 Git 仓库。</p><h3 id="提取子目录下的所有文件">提取子目录下的所有文件</h3><p>如将 <code>path/to/subdir</code> 目录下的所有文件调整到根目录下</p>

```bash
git filter-repo --subdirectory-filter path/to/subdir
```

