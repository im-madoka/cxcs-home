# CXCS Website

东南大学成贤学院计算机协会官方网站，主站为 [cxcs.dev](https://cxcs.dev)。

项目使用 Astro 静态生成页面，以原生 Astro 组件、TypeScript 和 GSAP 实现交互，通过 Markdown / MDX 维护文章。当前包含首页、文章列表与分类、文章详情、招新页和 404，以及 RSS、sitemap 和自动文章封面。站内导航使用 Astro `ClientRouter`，每个页面仍有独立的静态 HTML 输出。

## 本地开发

环境要求：Bun 1.4+。包管理器版本和依赖范围记录在 [package.json](./package.json)，安装结果由 `bun.lock` 锁定。

```bash
bun install --frozen-lockfile
bun run dev
```

开发服务器默认地址为 `http://localhost:4321`。生产构建与本地预览：

```bash
bun run build
bun run preview
```

构建输出为 `dist/`，HTML 按目录输出，例如 `/join` 对应 `dist/join/index.html`。`preview` 用于预览构建结果。当前构建无需环境变量或服务端适配器。

工具链使用 Astro 7、MDX 8、TypeScript 7 和 ESLint 10。由于 `astro check` 与 `typescript-eslint` 仍依赖 TypeScript 6 的编程接口，按 [TypeScript 官方并行安装方案](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0)，`@typescript/native` 提供 TypeScript 7 的 `tsc`，`typescript` 别名指向 6.x 兼容包。`bun run check` 依次执行 Astro 检查和 TypeScript 7 检查。

## 常用命令

| 命令                   | 用途                                              |
| ---------------------- | ------------------------------------------------- |
| `bun run dev`          | 启动开发服务器                                    |
| `bun run build`        | 校验内容集合并生成静态站点、RSS、sitemap 和封面   |
| `bun run preview`      | 本地预览 `dist/`                                  |
| `bun run check`        | 执行 `astro check` 和 `tsc --noEmit`              |
| `bun test`             | 运行 Bun 测试，部分测试会执行生产构建             |
| `bun run lint`         | 检查 JS / MJS / TS；当前 ESLint 配置跳过 `.astro` |
| `bun run format:check` | 执行 Prettier 检查；当前忽略 `docs/`              |

## 页面与输出

| 路径                                                   | 内容                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `/`                                                    | 首页：Hero、What We Do、Start Here、全屏相册、Latest、Ecosystem、Join Us |
| `/articles`                                            | 推荐文章和全部公开文章                                                   |
| `/articles/<type>`                                     | 按配置生成的分类页，当前为 `news`、`blog`                                |
| `/articles/<type>/<article-name>`                      | 文章详情                                                                 |
| `/join`                                                | 招新状态、QQ 群入口与常见问题                                            |
| `/404`                                                 | 404 页面，构建输出为 `404.html`                                          |
| `/rss.xml`、`/sitemap.xml`、`/robots.txt`              | 订阅与搜索引擎发现入口                                                   |
| `/generated/article-covers/<type>/<article-name>.webp` | 未指定封面的公开文章的自动标题封面                                       |

## 内容维护

### 新增文章

文章使用 Astro Content Collections，支持 Markdown（`.md`）和 MDX（`.mdx`），每篇文章拥有独立目录：

```text
src/content/articles/
├── news/
│   └── my-event/
│       ├── index.mdx
│       └── assets/
│           └── images/
│               └── cover.jpg
└── blog/
    └── my-first-post/
        └── index.md
```

正文命名为 `index.md` 或 `index.mdx`，同一目录只能选择一种；需要组件、JSX 或 `import` 时使用 MDX。加载器只读取 `*/*/index.{md,mdx}`，文章内的资源和更深层的 Markdown 文件不会被识别为独立文章。

以下 frontmatter 可直接作为起点，未提供图片也可以发布：

```md
---
title: 我的第一篇文章
description: 这篇文章的简短介绍。
type: blog
publishedAt: 2026-09-10
authors:
  - Leo
tags:
  - getting-started
draft: false
featured: false
---

这里是正文。
```

必填字段为 `title`、`description`、`type`、`publishedAt`，完整 schema 见 [src/content.config.ts](./src/content.config.ts)。常用可选字段：

| 字段              | 默认值与作用                                                                         |
| ----------------- | ------------------------------------------------------------------------------------ |
| `authors`         | 字符串数组，默认 `[]`，用于作者署名                                                  |
| `draft`           | 默认 `false`；设为 `true` 后不生成文章页面、列表项、RSS 条目、sitemap 条目或自动封面 |
| `featured`        | 默认 `false`；首页和文章总列表优先选择发布时间最新的推荐文章，无推荐时选择最新文章   |
| `tags`            | 字符串数组，默认 `[]`，用于相关文章匹配                                              |
| `cover`           | 可选图片路径，或包含必填的 `image`、`alt` 和可选的 `caption` 的对象                  |
| `updatedAt`       | 可选日期；目前仅由 schema 接收，页面与订阅输出未使用                                 |
| `credits`         | 默认 `[]`，每项为 `{ person, credit }`；目前未展示                                   |
| `relatedArticles` | 默认 `[]`，字符串数组；目前未参与推荐选择                                            |

文章地址为 `/articles/<type>/<article-name>`。`type` 来自 frontmatter，文章名来自正文所在文件夹，不需要另写 `slug`。分类文件夹用于组织源文件，建议与 `type` 一致；修改 frontmatter 会改变实际分类和 URL，构建不会自动移动源文件。类型和文章名允许 Unicode 字母、数字、下划线或连字符，并以字母或数字开头。同一分类中的文章名必须唯一，不同分类可以重名。

草稿过滤同样适用于开发服务器和本地生产预览，目前没有单独的草稿预览开关。`publishedAt` 用于日期展示和排序，不会阻止未来日期的非草稿文章立即输出。详情页的相关文章从同分类或有共同标签的公开文章中取前两篇，尚未按时间重新排序。

### 图片与附件

首页活动相册位于 Start Here 与 Latest 之间，由 `src/widgets/HomeGallery.astro` 维护照片顺序和替代文本，原图放在 `src/assets/home-gallery/`，构建时生成响应式 WebP。照片高度为 `100dvh`（回退为 `100vh`），宽度保留原图比例。相册固定期间，向下滚动让照片向左移动、下一张从右侧进入，向上滚动则反向，首尾各保留 0.2 屏的滚动停留。导航覆盖照片时使用随主题变化的渐变背景，并关闭背景模糊。关闭 JavaScript 或启用减少动态效果时，相册提供原生横向滚动。

图片可以直接放在 `index.md` / `index.mdx` 所在的文章目录，也可以按需放在 `assets/images/`；其他附件按类型放在 `assets/` 内。与正文同目录的图片可在 frontmatter 中直接作为封面引用：

```yaml
cover: ./cover.png
```

相对路径以当前文章的正文文件所在目录为基准，构建时由 Astro 处理并输出图片。简写形式使用文章标题作为替代文本；需要指定替代文本或图片说明时，使用对象形式：

```yaml
cover:
  image: ./assets/images/cover.jpg
  alt: 封面的内容说明
  caption: 可选的图片说明
```

`cover` 简写和 `cover.image` 均支持本地相对路径（如 `./cover.png`）、远程 URL 和 `public/` 下的绝对站点路径，例如 `/assets/articles/code.jpg`。手动指定的封面铺满文章详情页 Hero 的背景，叠加随主题切换的遮罩和标题：浅色模式使用浅色遮罩，深色模式使用深色遮罩，顶部导航区域的遮罩更强以保证透明 Header 的文字清晰。文章详情与 Articles、Join 等内页共用 PageHero，标题区默认底部对齐，桌面底部留白 40px、手机端 32px。Hero 高度统一为：桌面端 460px，视口宽度不超过 520px 时为 520px；可选图片说明显示在 Hero 下方。省略封面时，Satori 与 Sharp 在构建时生成 1600 × 1000 的 WebP 标题封面，用于首页、文章列表和社交分享，详情页 Hero 保持纯色背景。

所有页面统一输出 Open Graph 和 Twitter 分享信息。普通页面（含 404）的标题与描述维护在 [src/page-metadata.ts](./src/page-metadata.ts)，构建时使用页面标题和同一套封面模板生成 `/generated/page-covers/<path>.webp`，首页对应 `index.webp`；分类页随分类配置自动生成。新增普通页面时需在该文件登记路径、标题和描述。文章分享图优先使用 `cover.image`，未设置时使用自动文章封面。

正文图片可以直接使用 Markdown 相对路径，Astro 会处理并输出图片：

```md
![活动现场](./assets/images/activity.jpg)
```

普通附件可以在 MDX 中导入并链接：

```mdx
import fileUrl from './assets/files/example.pdf?url';

<a href={fileUrl}>下载附件</a>
```

### 数学公式

Markdown 和 MDX 共用 `remark-math`、`rehype-katex` 配置，在构建时渲染公式，无需浏览器运行公式渲染脚本。文章页面打包 KaTeX 样式和字体，长独立公式可横向滚动。

`package.json` 的 KaTeX override 统一插件渲染器与页面版本的版本，升级 KaTeX 时需同步更新依赖与 override。

行内公式使用 `$...$`，独立公式使用单独成行的 `$$`：

```md
行内公式：$E = mc^2$，分式：$\frac{a_1}{b_2}$。

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

公式内可直接使用 LaTeX 的反斜杠和花括号，MDX 中也无需额外转义。普通美元符号写作 `\$`；行内代码和代码块中的 `$` 不会被识别为公式。

## 站点配置

[src/config.ts](./src/config.ts) 默认导出配置对象，类型定义在 [src/types/config.ts](./src/types/config.ts)：

| 配置                  | 维护内容                                         |
| --------------------- | ------------------------------------------------ |
| `site`                | 站点名称、标题、描述，以及主站、Guide、Page 地址 |
| `nav`                 | 顶栏导航、移动端标签与外链标记                   |
| `articles.categories` | 文章分类、分类页文案、发布说明与自动封面配色     |
| `recruitment`         | 首页招新提示、起止时间、公开 QQ 群号             |
| `footer`              | 页脚分组链接                                     |

分类配置的键对应 frontmatter 的 `type` 和 `/articles/<type>`，配置顺序就是分类导航顺序。每个分类包含 `label`、`title`、`description`、`byline`、`coverLabel` 和 `accent`。新增分类只需补齐配置项并在文章中使用该类型，分类页、导航、标签、sitemap 和封面自动使用新配置；空分类仍生成页面，未配置的文章类型会导致构建失败。

招新页在同时提供 `opensAt`、`closesAt` 时，按构建时间计算 `upcoming → open → closed`；缺少任一时间时显示“即将开启”。时间建议使用带时区的 ISO 8601 字符串。当前只配置了招新提示和群号，未配置起止时间。修改招新周期时，还需检查 [src/pages/join.astro](./src/pages/join.astro) 内的年份提示、说明和 FAQ；这些文案未集中在配置中。群入口目前始终显示，状态不会在浏览器中重新计算，跨越起止时间后需重新构建并发布。

## 目录与工程约定

| 路径                                             | 职责                                               |
| ------------------------------------------------ | -------------------------------------------------- |
| `src/pages/`                                     | 页面、文章动态路由与静态生成端点                   |
| `src/layouts/`                                   | `BaseLayout`、`BaseHead`、顶栏和页脚               |
| `src/components/`                                | 按钮、卡片、页面标题、文章分类导航、主题切换等控件 |
| `src/widgets/`                                   | `StackScroll`、`StackScrollCard` 生态堆叠卡片      |
| `src/assets/styles/`                             | 设计变量、字体、全局基础样式和共享工具类           |
| `src/assets/scripts/`                            | 页面加载初始化和共享 Reveal 动画                   |
| `src/content.config.ts`、`src/content/articles/` | 内容加载器、schema 与文章源文件                    |
| `src/articles.ts`、`src/status.ts`               | 分类与封面辅助函数、时间状态计算                   |
| `public/assets/`                                 | 社徽、字标、角色、生态截图和自托管 Geist 字体      |
| `tests/`                                         | 内容构建、封面、页面结构、初始化生命周期和状态测试 |
| `docs/design.md`                                 | 当前设计与实现说明                                 |

样式和浏览器脚本按所属结构就地维护：页面专属代码放在页面的 `<style>`、`<script>` 中，component、widget 和 layout 的专属代码放在各自 `.astro` 文件中，响应式规则和动画也随所属文件维护。全局脚本提供共享能力，由页面或组件选择自己的元素并调用。

浏览器脚本需兼容 Astro 客户端导航，避免首次进入页面时重复初始化，并在离页或重新初始化时清理元素事件、定时器和滚动监听。共享入口为 `onPageLoad()`；主题切换使用事件委托并在页面替换时保留用户选择。

## 构建与部署

将 `dist/` 发布到支持目录索引和自定义 `404.html` 的静态托管服务即可。`site.url` 同时影响 Astro 的站点地址、canonical、分享图片绝对地址、RSS、sitemap 和 robots，变更正式域名时需要同步修改并重新构建。

仓库当前没有 CI、PR Preview、定时重建或部署配置。`robots.txt` 默认允许抓取，页面没有区分生产与预览环境；如果配置公共预览部署，需要由托管平台或后续代码补充 noindex。部署前可运行上述检查命令和生产构建，再用 `bun run preview` 核对页面。
