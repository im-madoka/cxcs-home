import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const paths = ['/', '/about', '/articles', '/articles/news', '/articles/blog', '/join'];
  paths.push(...articles.map((item) => '/articles/' + item.id));
  const base = site?.toString().replace(/\/$/, '') || 'https://cxcs.dev';
  const body = paths.map((path) => '<url><loc>' + base + path + '</loc></url>').join('');
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      body +
      '</urlset>',
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
