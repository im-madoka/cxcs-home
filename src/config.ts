const site = {
  shortName: 'CXCS',
  title: 'CXCS · 东南大学成贤学院计算机协会',
  description: '一起学习，一起折腾，一起做点有意思的东西。',
  url: 'https://cxcs.dev',
  guideUrl: 'https://guide.cxcs.dev',
  pageUrl: 'https://cxcs.page',
};

const nav = [
  { label: 'About', href: '/about' },
  { label: 'Articles', href: '/articles' },
];

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
        byline: 'CXCS 官方发布',
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
    } satisfies Record<
      string,
      {
        label: string;
        title: string;
        description: string;
        byline: string;
        coverLabel: string;
        accent: string;
      }
    >,
  },
  recruitment: {
    title: '下一次招新信息待确认',
    opensAt: undefined as string | undefined,
    closesAt: undefined as string | undefined,
    qqGroup: '870131425',
  },
  footer: [
    { title: 'Explore', links: nav.concat([{ label: 'Join', href: '/join' }]) },
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
};
