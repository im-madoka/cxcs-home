import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const [articles, activities, projects, theater] = await Promise.all([
    getCollection('articles', ({ data }) => !data.draft),
    getCollection('activities', ({ data }) => !data.draft),
    getCollection('projects', ({ data }) => !data.draft),
    getCollection('theater', ({ data }) => !data.draft),
  ]);
  const paths = [
    '/',
    '/about',
    '/articles',
    '/articles/news',
    '/articles/blog',
    '/activities',
    '/projects',
    '/theater',
    '/join',
  ];
  paths.push(...articles.map((item) => '/articles/' + item.id));
  paths.push(...activities.map((item) => '/activities/' + item.id));
  paths.push(...projects.map((item) => '/projects/' + item.id));
  paths.push(...theater.map((item) => '/theater/' + item.id));
  const base = site?.toString().replace(/\/$/, '') || 'https://cxcs.dev';
  const body = paths.map((path) => '<url><loc>' + base + path + '</loc></url>').join('');
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      body +
      '</urlset>',
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
