# CXCS Website

东南大学成贤学院计算机协会官方网站，主站为 `cxcs.dev`。

## 本地运行

```bash
bun install
bun run dev
```

生产构建：

```bash
bun run build
```

设计基线见 [`docs/design.md`](./docs/design.md)，实施顺序见 [`docs/plan.md`](./docs/plan.md)。

## 内容

文章使用 Astro Content Collections 和 MDX，每篇文章拥有独立目录：

```text
src/content/articles/
├── news/
│   └── autumn-recruitment/
│       ├── index.mdx
│       └── assets/
│           └── images/
│               └── cover.jpg
└── blog/
    └── cxcs-page/
        ├── index.mdx
        └── assets/
            └── images/
                └── cover.jpg
```

正文统一命名为 `index.mdx`；图片放在该文章的 `assets/images/`，其他附件也可以按类型整理在 `assets/` 内。只有两层文章目录下的 `index.mdx` 会被加载，资源文件不会被识别为文章。

```mdx
---
title: 我的第一篇文章
description: 这篇文章的简短介绍。
type: blog
publishedAt: 2026-09-10
authors:
  - Leo
cover:
  image: ./assets/images/cover.jpg
  alt: 封面的内容说明
---

这里是正文。

![活动现场](./assets/images/activity.jpg)
```

必填字段为 `title`、`description`、`type`、`publishedAt`。可选字段包括 `authors`、`updatedAt`、`draft`、`featured`、`tags`、`cover` 等。`cover` 支持本地相对路径、远程 URL 和 `public/` 下的绝对站点路径；省略封面时自动生成标题封面。正文图片可以直接使用 Markdown 相对路径，Astro 会处理并输出图片；普通附件可以通过 MDX 的 `import fileUrl from './assets/files/example.pdf?url'` 引入，再用 `<a href={fileUrl}>下载附件</a>` 链接。

文章地址为 `/articles/<type>/<article-name>`，例如 `/articles/blog/cxcs-page`。`type` 来自 frontmatter，文章名来自 `index.mdx` 所在文件夹，不需要另写 `slug`。分类文件夹用于组织源文件，建议与 `type` 一致；修改 frontmatter 会改变实际分类和 URL，构建不会自动移动源文件。类型和文章名使用字母、数字、下划线或连字符，并以字母或数字开头。同一分类中的文章名必须唯一，不同分类可以重名。草稿不会出现在页面、RSS、sitemap 或自动封面输出中。

## 站点和分类配置

`src/config.ts` 默认导出一个配置对象，统一维护 `site`、`nav`、`articles.categories`、`recruitment` 和 `footer`。使用 `import config from './config'` 读取。

所有分类都在 `config.articles.categories` 中定义。配置键对应 frontmatter 的 `type` 和分类路径 `/articles/<type>`；配置顺序就是分类导航顺序。每个分类包含：

- `label`：分类名称。
- `title`、`description`：分类页标题及介绍。
- `byline`：文章详情中的发布说明。
- `coverLabel`、`accent`：自动生成封面的标签与配色。

新增分类只需添加配置项，并在文章 frontmatter 中填写该类型。分类页面、筛选导航、文章标签和 sitemap 自动更新；暂无文章的分类显示空状态。未配置的 `type` 会导致构建失败。

## 检查

```bash
bun run check
bun test
bun run lint
bun run format:check
```

## 目录约定

- `src/config.ts`：默认导出的站点、导航、文章分类、招新与页脚配置。
- `src/layouts/`：`BaseLayout`、`BaseHead`、顶栏和页脚。
- `src/components/`：按钮、卡片、主题切换等基础控件。
- `src/widgets/`：由基础控件组成的页面模块，例如首页能力栈滚动卡片。
- `src/assets/styles/` 与 `src/assets/scripts/`：全站通用样式和脚本。
- `src/pages/`、`src/content/`：Astro 页面与支持 MDX 的内容集合。
