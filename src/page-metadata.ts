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
  '/articles': {
    title: `Articles · ${site.shortName}`,
    description: '记录折腾的过程，分享踩过的坑，也留下一些值得被记住的尝试。',
  },
  '/join': {
    title: `加入我们 · ${site.shortName}`,
    description: '欢迎加入东南大学成贤学院计算机协会，查看招新 QQ 群、加群方式与常见问题。',
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
