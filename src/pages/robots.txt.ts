import type { APIRoute } from 'astro';
import config from '../config';
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', config.site.url)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
