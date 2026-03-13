# Personal Blog

一个基于 `Astro + GitHub + Cloudflare Pages` 的个人博客项目。

## 已完成的能力

- Markdown / MDX 内容系统
- 博客列表页、文章详情页、标签页、关于页、404
- RSS 和 sitemap
- 面向 Cloudflare Pages 的静态构建
- GitHub 仓库工作流

## 本地开发

```sh
npm install
npm run dev
```

常用命令：

- `npm run dev`：启动本地开发服务器
- `npm run build`：构建生产环境静态文件
- `npm run preview`：预览构建结果
- `npm run check`：运行 Astro 类型检查

## 你最先要改的地方

1. `src/consts.ts`
2. `src/content/blog/`
3. `src/pages/about.astro`

## 项目结构

```text
src/
  components/     可复用组件
  content/blog/   博客文章
  layouts/        页面布局
  pages/          路由页面
  styles/         全局样式
  utils/          博客数据辅助函数
```

## GitHub

推荐仓库名：`personal-blog`

如果你还没有把项目推到 GitHub，可以执行：

```sh
gh repo create personal-blog --public --source=. --remote=origin --push
```

## Cloudflare Pages

如果你希望保留 `GitHub -> Cloudflare Pages` 自动部署，不要先用 `wrangler pages deploy` 直传。

推荐做法：

1. 在 Cloudflare Pages 里选择 `Connect to Git`。
2. 选择 GitHub 仓库 `liuqitoday/personal-blog`。
3. 构建参数使用：
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 设置环境变量：
   - `SITE_URL=https://<your-project>.pages.dev`
5. 如果后续绑定自定义域名，把 `SITE_URL` 改成正式域名。

## 说明

`astro.config.mjs` 已支持以下优先级：

1. `SITE_URL`
2. `CF_PAGES_URL`
3. `https://personal-blog.pages.dev`

这可以保证 RSS、sitemap 和 canonical URL 在 Pages 上有稳定输出。
