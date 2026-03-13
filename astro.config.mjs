// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

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
		shikiConfig: {
			theme: 'github-light',
		},
	},
	integrations: [mdx(), sitemap()],
});
