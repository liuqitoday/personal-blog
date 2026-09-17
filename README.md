# Personal Blog

一个基于 `Astro + GitHub + Cloudflare Pages` 的个人博客项目。当前试用主题是 [AstroPaper](https://github.com/satnaing/astro-paper)。

纸感旧主题保存在 tag `theme/paper-cream`。切回：

```sh
git checkout main
git reset --hard theme/paper-cream
```

更稳妥的线上回退是 `git revert`，不要轻易 force push。

## 本地开发

```sh
npm install
npm run dev
```

常用命令：

- `npm run dev`：启动本地开发服务器
- `npm run build`：构建生产环境静态文件并生成 Pagefind 索引
- `npm run preview`：预览构建结果
- `npm run check`：运行 Astro 类型检查

## 你最先要改的地方

1. `astro-paper.config.ts`
2. `src/content/posts/`
3. `src/content/pages/about.md`

## Cloudflare Pages

构建参数：

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`

环境变量：

- `SITE_URL=https://blog.100067.xyz`
