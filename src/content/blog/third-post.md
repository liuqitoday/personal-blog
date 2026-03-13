---
title: '上线前的最小检查清单'
description: '在把博客接到 Cloudflare Pages 之前，建议先完成这几个最小检查。'
pubDate: '2026-03-08'
tags:
  - Deployment
  - Checklist
  - Cloudflare
heroImage: '../../assets/blog-placeholder-2.jpg'
heroAlt: 'Checklist and a phone on a warm desk'
---

静态博客的部署过程其实很短，但有几个地方最容易在第一次上线时遗漏。

## 本地先确认这些

1. `npm run build` 可以通过。
2. 文章 frontmatter 都合法，日期和标签格式一致。
3. `astro.config.mjs` 里的站点地址有默认值，并且可被环境变量覆盖。

## Cloudflare Pages 的关键设置

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable: `SITE_URL`

如果你后面接了自定义域名，`SITE_URL` 也要同步改成正式域名，否则 RSS、sitemap 和 canonical URL 仍然会指向 `.pages.dev` 地址。

## 最后再做一件事

不要先用 `wrangler pages deploy` 去做直传，如果你希望保留 GitHub 自动部署。先把仓库接到 Pages，后续每次 push 都会自动构建，流程会简单很多。
