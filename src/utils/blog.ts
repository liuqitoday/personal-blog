import { type CollectionEntry, getCollection } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

export async function getPublishedPosts() {
	const posts = await getCollection('blog');

	return posts
		.filter((post) => import.meta.env.DEV || !post.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function slugifyTag(tag: string) {
	return tag
		.toLowerCase()
		.trim()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function getAllTags(posts: BlogEntry[]) {
	const counts = new Map<string, number>();

	for (const post of posts) {
		for (const tag of post.data.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}

	return [...counts.entries()]
		.sort((a, b) => {
			if (b[1] !== a[1]) {
				return b[1] - a[1];
			}

			return a[0].localeCompare(b[0]);
		})
		.map(([tag, count]) => ({
			tag,
			slug: slugifyTag(tag),
			count,
		}));
}

export function getPostsByTag(posts: BlogEntry[], tagSlug: string) {
	return posts.filter((post) => post.data.tags.some((tag) => slugifyTag(tag) === tagSlug));
}
