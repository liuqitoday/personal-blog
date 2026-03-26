// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkMermaid from './src/plugins/remark-mermaid.js';

/** @param {string | undefined} url */
function normalizeSite(url) {
	if (!url) {
		return undefined;
	}

	return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}

const site = normalizeSite(process.env.SITE_URL) ??
	normalizeSite(process.env.CF_PAGES_URL) ??
	'https://personal-blog.pages.dev';

export default defineConfig({
	site,
	markdown: {
		remarkPlugins: [remarkMermaid],
		shikiConfig: {
			theme: 'github-light',
		},
	},
	integrations: [mdx(), sitemap()],
});
