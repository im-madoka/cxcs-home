import type { APIRoute } from 'astro';
export const GET: APIRoute = () =>
  new Response('User-agent: *\nAllow: /\nSitemap: https://cxcs.dev/sitemap.xml\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
