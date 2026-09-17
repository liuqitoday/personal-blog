// @ts-check

import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
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
		processor: unified({
			remarkPlugins: [remarkMermaid],
		}),
		shikiConfig: {
			theme: 'github-light',
		},
	},
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
