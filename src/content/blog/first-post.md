---
title: '用 Astro、GitHub 和 Cloudflare Pages 搭个人博客'
description: '为什么这套组合适合个人博客，以及这个项目默认已经接好了哪些能力。'
pubDate: '2026-03-13'
updatedDate: '2026-03-13'
tags:
  - Astro
  - GitHub
  - Cloudflare
heroImage: '../../assets/blog-placeholder-3.jpg'
heroAlt: 'A tidy desk with a notebook and coffee'
featured: true
---

这套技术栈很适合个人博客，因为它把内容、版本管理和部署职责切得很清楚：

- `Astro` 负责页面生成、内容系统和站点结构。
- `GitHub` 负责版本历史、协作和仓库托管。
- `Cloudflare Pages` 负责自动构建、预览部署和全球 CDN。

## 这份博客骨架已经准备了什么

- 内容目录已经接好 `src/content/blog/`，支持 Markdown 和 MDX。
- 文章列表、单篇文章页、标签页、RSS 和 sitemap 都已经启用。
- 站点可以直接连接 GitHub 仓库，并由 Cloudflare Pages 自动构建静态文件。

## 个人博客真正值得写的内容

个人博客不一定要追求高频更新。更有价值的通常是：

- 项目复盘
- 工具链配置
- 系统维护经验
- 长期主题的学习笔记

这些内容天然适合放进 Git 仓库，因为它们会不断迭代，你也会想保留修改记录。

## 上线前建议先改三处

1. 修改 `src/consts.ts` 中的站点标题、作者和仓库地址。
2. 替换 `src/content/blog/` 里的示例文章。
3. 在 Cloudflare Pages 中设置正确的 `SITE_URL` 环境变量。
