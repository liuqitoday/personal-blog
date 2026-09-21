import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /
Disallow: /search/
Disallow: /tags/
Disallow: /posts/2/
Disallow: /posts/3/
Disallow: /posts/4/

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};
