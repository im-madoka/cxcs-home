export const siteData = {
  name: '东南大学成贤学院计算机协会',
  shortName: 'CXCS',
  englishName: undefined as string | undefined,
  title: 'CXCS · 东南大学成贤学院计算机协会',
  description: '一起学习，一起折腾，一起做点有意思的东西。',
  url: 'https://cxcs.dev',
  guideUrl: 'https://guide.cxcs.dev',
  pageUrl: 'https://cxcs.page',
  githubUrl: undefined as string | undefined,
  contact: 'QQ群：870131425',
};

export const navItems = [
  { label: 'About', href: '/about' },
  { label: 'Articles', href: '/articles' },
];

export const people = {
  cxcs: { displayName: 'CXCS', bio: '东南大学成贤学院计算机协会' },
  lin: { displayName: 'Lin', bio: '把复杂的问题拆成可以一起解决的小问题。' },
  momo: { displayName: 'Momo', bio: '喜欢做项目，也喜欢把项目讲给别人听。' },
};

export const characters: Record<string, { name: string; description: string; accent: 'blue' | 'orange' }> = {
  jixie: { name: '计协娘', description: 'CXCS 看板娘。看起来很正常，Rust 发卡不这么认为。', accent: 'blue' },
  lucy: { name: '洛茜', description: '总能在截止日期前找到一个新想法。', accent: 'orange' },
  alice: { name: '爱丽丝', description: '认真提问，然后让所有人开始重新思考。', accent: 'blue' },
  madoka: { name: '鹿目圆', description: '带着相机和一大袋现场故事。', accent: 'orange' },
};

export const recruitment = {
  title: '下一次招新信息待确认',
  description: '招新时间和入口会在这里更新。没有编程基础也没关系，有兴趣，就已经是很好的开始。',
  opensAt: undefined as string | undefined,
  closesAt: undefined as string | undefined,
  applicationUrl: undefined as string | undefined,
  groupUrl: undefined as string | undefined,
  qqGroup: '870131425',
};

export const footerGroups = [
  { title: 'Explore', links: navItems.concat([{ label: 'Join', href: '/join' }]) },
  {
    title: 'CXCS Online',
    links: [
      { label: 'CXCS Guide ↗', href: siteData.guideUrl, external: true },
      { label: 'CXCS Page ↗', href: siteData.pageUrl, external: true },
      ...(siteData.githubUrl ? [{ label: 'GitHub ↗', href: siteData.githubUrl, external: true }] : []),
    ],
  },
  {
    title: 'Projects',
    links: [
      { label: 'CXCS Guide', href: siteData.guideUrl, external: true },
      { label: 'CXCS Page', href: siteData.pageUrl, external: true },
    ],
  },
];
