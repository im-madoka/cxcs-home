import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import config from '../config';

export const GET: APIRoute = async () => {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const paths = ['/', '/articles', '/join'];
  paths.push(...Object.keys(config.articles.categories).map((type) => `/articles/${type}`));
  paths.push(...articles.map((item) => '/articles/' + item.id));
  const base = config.site.url.replace(/\/$/, '');
  const body = paths.map((path) => '<url><loc>' + base + path + '</loc></url>').join('');
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      body +
      '</urlset>',
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
