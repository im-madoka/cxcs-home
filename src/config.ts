import type { NavItem, RecruitmentConfig, SiteConfig, SiteInfo } from './types/config';

const site: SiteInfo = {
  shortName: 'CXCS',
  title: 'CXCS · 东南大学成贤学院计算机协会',
  description: '用代码赋予思想形状，以好奇探寻技术本质。在成贤，一群热衷于技术与创造的人在此相遇。',
  url: 'https://home.cxcs.page',
  guideUrl: 'https://guide.cxcs.dev',
  pageUrl: 'https://cxcs.page',
};

const nav: NavItem[] = [
  { label: 'Articles', href: '/articles' },
  { label: 'Guide', mobileLabel: 'CXCS Guide', href: site.guideUrl, external: true },
  { label: 'Page', mobileLabel: 'CXCS Page', href: site.pageUrl, external: true },
];

const recruitment: RecruitmentConfig = {
  title: '2026 年秋季招新',
  status: 'open',
  opensAt: undefined,
  closesAt: undefined,
  qqGroup: '870131425',
};

export default {
  site,
  nav,
  articles: {
    // Keys are the allowed frontmatter types and category URL segments.
    categories: {
      news: {
        label: '新闻',
        title: '新闻正在发生。',
        description: '正式事件、活动消息和协会里值得被记下来的时刻。',
        byline: '成贤计协官方发布',
        coverLabel: 'NEWS / CXCS',
        accent: '#f05a28',
      },
      blog: {
        label: '博客',
        title: '写点有意思的。',
        description: '项目故事、成员随笔、技术旁路和一点不太严肃的观察。',
        byline: 'CXCS Editorial',
        coverLabel: 'BLOG / CXCS EDITORIAL',
        accent: '#1479f5',
      },
    },
  },
  recruitment,
  footer: [
    { title: 'Explore', links: nav.filter((item) => !item.external).concat([{ label: 'Join', href: '/join' }]) },
    {
      title: 'CXCS Online',
      links: [
        { label: 'CXCS Guide ↗', href: site.guideUrl, external: true },
        { label: 'CXCS Page ↗', href: site.pageUrl, external: true },
      ],
    },
    {
      title: 'Projects',
      links: [
        { label: 'CXCS Guide', href: site.guideUrl, external: true },
        { label: 'CXCS Page', href: site.pageUrl, external: true },
      ],
    },
  ],
} satisfies SiteConfig;
