import config from './config';

type PageMetadata = {
  title: string;
  description: string;
  coverLabel?: string;
  accent?: string;
};

const { site, articles } = config;

// Share titles between the document head and the static cover endpoints.
export const pageMetadata: Record<string, PageMetadata> = {
  '/': {
    title: site.title,
    description: site.description,
  },
  '/about': {
    title: `About · ${site.shortName}`,
    description: '我们是一群喜欢计算机，也喜欢折腾的人。',
  },
  '/articles': {
    title: `Articles · ${site.shortName}`,
    description: '记录折腾的过程，分享踩过的坑，也留下一些值得被记住的尝试。',
  },
  '/join': {
    title: `Join Us · ${site.shortName}`,
    description: '加入计算机协会，一起学、一起做、一起折腾。',
  },
  '/404': {
    title: `404 · ${site.shortName}`,
    description: '这个页面不存在，也可能已经被移动到了别的地方。',
  },
  ...Object.fromEntries(
    Object.entries(articles.categories).map(([type, category]) => [
      `/articles/${type}`,
      {
        title: `${category.label} · Articles · ${site.shortName}`,
        description: category.description,
        coverLabel: category.coverLabel,
        accent: category.accent,
      },
    ]),
  ),
};

export function getPageCoverPath(path: string) {
  return `/generated/page-covers/${path.replace(/^\/+|\/+$/g, '') || 'index'}.webp`;
}
