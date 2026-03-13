export const SITE_TITLE = 'Liuqi Blog';
export const SITE_DESCRIPTION =
	'用 Astro 构建、以 GitHub 管理并部署到 Cloudflare Pages 的个人博客骨架。';
export const SITE_AUTHOR = 'Liuqi';
export const SITE_TAGLINE = '把想法写成长期资产。';
export const SITE_INTRO =
	'这是一个已经接好内容系统、RSS、sitemap 和部署说明的个人博客模板。你只需要替换站点信息和文章内容，就可以直接上线。';
export const SITE_REPOSITORY_URL = 'https://github.com/liuqitoday/personal-blog';

export const NAV_LINKS = [
	{ href: '/', label: '首页' },
	{ href: '/blog', label: '文章' },
	{ href: '/tags', label: '标签' },
	{ href: '/about', label: '关于' },
];

export const EXTERNAL_LINKS = [
	{ href: SITE_REPOSITORY_URL, label: 'GitHub' },
	{ href: '/rss.xml', label: 'RSS' },
];

export const TECH_STACK = ['Astro 6', 'Markdown / MDX', 'GitHub', 'Cloudflare Pages'];
