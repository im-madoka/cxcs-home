export type SiteInfo = {
  shortName: string;
  title: string;
  description: string;
  url: string;
  guideUrl: string;
  pageUrl: string;
};

export type LinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavItem = LinkItem & {
  mobileLabel?: string;
};

export type ArticleCategory = {
  label: string;
  title: string;
  description: string;
  byline: string;
  coverLabel: string;
  accent: string;
};

export type ArticlesConfig = {
  categories: Record<string, ArticleCategory>;
};

export type RecruitmentConfig = {
  title: string;
  opensAt?: string;
  closesAt?: string;
  qqGroup: string;
};

export type FooterGroup = {
  title: string;
  links: LinkItem[];
};

export type SiteConfig = {
  site: SiteInfo;
  nav: NavItem[];
  articles: ArticlesConfig;
  recruitment: RecruitmentConfig;
  footer: FooterGroup[];
};
