import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { siteData } from '../data/site';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('articles', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
  return rss({
    title: siteData.shortName + ' Articles',
    description: siteData.description,
    site: siteData.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: '/articles/' + post.id + '/',
    })),
    customData: '<language>zh-CN</language>',
  });
};
