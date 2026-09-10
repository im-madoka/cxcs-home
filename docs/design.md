# CXCS Website 设计与实现说明

本文以当前仓库代码为依据，记录页面结构、视觉系统、交互、内容模型和维护边界。开发命令与文章写作示例见 [README](../README.md)。调整页面、配置或内容模型时，应同步更新对应说明。

## 1. 产品定位与当前范围

CXCS Website 是东南大学成贤学院计算机协会的官方门户，服务希望了解协会、参与活动、阅读成员分享和加入协会的学生及其他访客。首页负责建立第一印象并提供行动入口，内页优先保证信息清晰和阅读舒适。

| 站点             | 职责                           |
| ---------------- | ------------------------------ |
| `cxcs.dev`       | 协会介绍、文章与动态、招新入口 |
| `guide.cxcs.dev` | 学习指南与知识库               |
| `cxcs.page`      | 成员网站构建、部署与托管平台   |

中文承担主要信息，`Learn. Build. Deploy. Share.` 和英文区块名称承担辅助品牌表达。主站介绍并链接 Guide、Page，相关平台功能由各自站点提供。

当前实现为 Astro SSG，使用原生 `.astro` 组件、TypeScript、GSAP 和浏览器 API，无 React / Vue、登录、CMS、数据库或服务端业务 API。Astro `ClientRouter` 增强站内导航，生产结果仍是可独立访问的静态页面。

### 路由

| 路径                                                   | 实现文件（相对 `src/pages/`）                | 内容                      |
| ------------------------------------------------------ | -------------------------------------------- | ------------------------- |
| `/`                                                    | `index.astro`                                | 六区块首页                |
| `/about`                                               | `about.astro`                                | 协会介绍与社区原则        |
| `/articles`                                            | `articles/index.astro`                       | 推荐文章与全部公开文章    |
| `/articles/<type>`                                     | `articles/[type]/index.astro`                | 配置驱动的分类列表        |
| `/articles/<type>/<article-name>`                      | `articles/[type]/[slug].astro`               | 文章详情                  |
| `/join`                                                | `join.astro`                                 | 招新状态、群入口与 FAQ    |
| `/404`                                                 | `404.astro`                                  | 错误页，构建为 `404.html` |
| `/rss.xml`                                             | `rss.xml.ts`                                 | 公开文章订阅              |
| `/sitemap.xml`                                         | `sitemap.xml.ts`                             | 公开页面索引              |
| `/robots.txt`                                          | `robots.txt.ts`                              | 抓取规则和 sitemap 地址   |
| `/generated/article-covers/<type>/<article-name>.webp` | `generated/article-covers/[...slug].webp.ts` | 构建时生成的文章标题封面  |

分类当前为 `news` 和 `blog`，由 `config.articles.categories` 决定。项目、活动、小剧场的独立页面和集合尚未实现，相关消息目前通过文章发布。新增这些模块应另行设计其数据与路由。

## 2. 首页

首页在 [src/pages/index.astro](../src/pages/index.astro) 中组织，实际顺序为：

```text
Hero → What We Do → Start Here → Latest from CXCS → CXCS Ecosystem → Join Us
```

| 区块             | 内容与布局                                                      | 主要入口                 |
| ---------------- | --------------------------------------------------------------- | ------------------------ |
| Hero             | 满屏网格背景、巨幅 `HELLO / WORLD.`、计协娘、中文协会名称和简介 | What We Do 锚点、`/join` |
| What We Do       | 学习原理、动手构建、协作竞技、分享交流四张卡片                  | 提供协会日常的概览       |
| Start Here       | 从零开始、付诸工程、分享作品三个步骤                            | Guide、`/articles`、Page |
| Latest from CXCS | 一篇主推文章和最多两篇侧栏文章                                  | 详情页与 `/articles`     |
| CXCS Ecosystem   | Website、Guide、Page 三张纵向堆叠卡片，配社徽与平台截图         | Guide、Page              |
| Join Us          | 结束语、招新提示、公开群号                                      | `/join`                  |

Hero 使用 `100dvh`，角色图片带固有宽高和 `fetchpriority="high"`。装饰性英文标题对辅助技术隐藏，中文名称使用 `h1`。GSAP 实现标题、角色、说明和按钮的入场，角色支持轻微指针视差与点击回弹；视差的 `requestAnimationFrame` 在接近目标位置后停止。

首页的普通卡片由 ScrollTrigger 在进入视口时 Reveal，没有滚动锁定、横向 Gallery 或 GSAP Pin / Scrub。生态堆叠由 [StackScroll](../src/widgets/StackScroll.astro) 和 [StackScrollCard](../src/widgets/StackScrollCard.astro) 的 CSS `position: sticky` 实现：默认停靠在顶栏高度处，卡片高 570px，溢出内容可在卡片内滚动。三张卡依次使用主题 Surface、蓝色和深色背景。

移动端调整 Hero 构图、字号、卡片列数与按钮排列；生态卡片在 900px 及以下改为上下布局，仍保留 sticky 堆叠。当前没有单独的移动端滚动动画时间线。

Latest 的数据规则与文章总列表一致：过滤草稿，按 `publishedAt` 降序排列，取最新的 `featured: true` 文章；没有推荐时取最新文章。侧栏取排除主推后的前两篇。

## 3. 公共页面框架

### 顶栏与页脚

[BaseLayout](../src/layouts/BaseLayout.astro) 提供完整 HTML、`BaseHead`、`ClientRouter`、导航进度条、跳转到主要内容的链接、顶栏、`main` 和页脚。所有页面使用此布局，文章详情的结构和排版直接维护在对应路由文件中。

桌面顶栏包括社徽与字标、About、Articles、Guide、Page、主题菜单和 Join Us。导航文案来自 `config.nav`；Join Us 入口由顶栏单独渲染。顶栏固定在页面顶部，初始高 72px，滚动超过 30px 后收缩为 64px，并出现半透明背景、模糊和分隔线。

1000px 及以下使用移动菜单，打开后显示整屏 Overlay、锁定背景滚动并聚焦关闭按钮；支持 Escape、点击链接关闭和关闭后返回触发按钮。关闭状态通过 `inert` 与 `aria-hidden` 隐藏交互内容。当前没有焦点循环锁定。

页脚显示社徽、随主题着色的 SVG 字标、配置分组链接、QQ 群和版权文案。QQ 群读取 `config.recruitment.qqGroup`；完整署名、口号和版权年份仍在 `SiteFooter.astro` 中维护，修改站点名称或年份时需一并检查。

### 内页标题

[PageHero](../src/components/PageHero.astro) 供 About、Join、文章总列表和分类页共用，包含英文标签、主标题、说明，以及可选的 `title`、`meta` 插槽。背景使用 `--ice`，底部有细分隔线。高度默认 460px，在 520px 及以下为 520px。文章详情采用自己的标题区。

### 主题与导航反馈

主题支持 `system | light | dark`，通过根元素 `data-theme` 和 CSS 变量实现。`BaseHead` 的内联脚本在页面加载早期读取 LocalStorage 的 `cxcs-theme`，读取失败时使用 `system`；系统模式由 `prefers-color-scheme` 跟随系统外观。

[ThemeSwitcher](../src/components/ThemeSwitcher.astro) 通过事件委托管理桌面、移动端主题按钮。在视觉主题发生变化且浏览器支持 View Transitions 时，以选项按钮位置为圆心展开新主题，当前动画时长为 2000ms。重复切换或站内导航会中断旧动画；不支持该 API 或启用 Reduced Motion 时直接应用主题。`astro:before-swap` 将当前选择复制到新文档。

导航进度条是固定在视口顶部的 3px 蓝线，跨页面保留，根据 Astro 导航准备、完成和中止事件更新。它提供导航反馈，不表示实际下载字节比例。文章详情另外有按整页滚动比例计算的阅读进度条。

## 4. 内页内容设计

### 文章列表与分类

`/articles` 使用大型推荐封面卡片，下方为剩余文章网格；分类页按时间展示该分类的所有公开文章，不单独抽出推荐项。卡片显示封面、分类、日期、可选作者、标题、摘要与阅读入口。网格从桌面三列，在 980px 及以下改为两列，640px 及以下改为单列。

分类导航使用带下划线的普通链接和 `aria-current="page"`，由 `ArticleTabs` 遍历配置生成，可横向滚动。分类筛选通过独立页面完成，空分类保留导航并显示“这个分类还没有文章”。

### 文章详情与排版

文章详情使用 `render(entry)` 输出 Markdown / MDX，标题区显示类型、发布日期、标题、摘要、可选作者和分类 `byline`。配置了 `cover.image` 才显示正文前的大图与可选图注；自动标题封面用于列表及分享，详情页不会重复展示。

正文宽度为 `min(760px, calc(100% - 48px))`，字号 20px，行高 1.9；在 720px 及以下字号为 18px。标题允许换行，正文支持段落、标题、列表、图片、引用、代码块和数学公式。图片约束在正文宽度内，代码块与独立公式可横向滚动。具体排版规则位于 `articles/[type]/[slug].astro` 的局部样式，通过 `:global()` 作用于渲染内容。

Markdown 与 MDX 共用 `remark-math`、`rehype-katex`，在构建时生成公式 HTML / MathML。详情页引入 KaTeX 样式与字体，浏览器无需执行公式渲染。KaTeX 依赖和 override 应一起维护，写作语法见 README。

正文后有返回列表和最多两篇相关文章。当前推荐规则为：排除自身和草稿，匹配同分类或任一共同标签，然后按集合返回顺序取前两篇。`relatedArticles` 字段尚未接入，也没有基于时间的额外排序。

### About、Join 与 404

About 依次介绍社区、Curiosity / Build / Share / Together 四项原则、三个站点入口和加入 CTA。当前没有组织架构、成员 Registry 或历史时间线。

Join 展示招新状态、四类适合加入的同学、QQ群号和加群链接、招新说明、四项 FAQ 与最终 CTA。FAQ 使用原生 `details` / `summary`。群号来自配置，受众、说明、年份提示和 FAQ 直接维护在 `join.astro`。

| 时间条件                        | 状态       | 页面标签   |
| ------------------------------- | ---------- | ---------- |
| 缺少任一起止时间                | `upcoming` | 即将开启   |
| 当前时间早于 `opensAt`          | `upcoming` | 即将开启   |
| `opensAt ≤ 当前时间 < closesAt` | `open`     | 招新进行中 |
| 当前时间达到或超过 `closesAt`   | `closed`   | 招新已结束 |

状态由 [src/status.ts](../src/status.ts) 在构建时计算；当前未配置起止时间。状态不会控制群链接的显示，也不会在客户端重新计算，时间跨界后需要重新构建。该文件还保留了活动状态辅助函数及测试，但尚无活动页面或集合使用它。

404 保留公共框架，以错误码、简短说明、静态终端示意和返回首页 / 文章列表两个按钮提供恢复路径。

## 5. 视觉系统与资源

全站设计变量在 [tokens.css](../src/assets/styles/tokens.css)，以浅色留白、深色 Surface、蓝色强调、细边框、小圆角和克制阴影构成基础视觉。

| 变量                    | 浅色      | 深色      |
| ----------------------- | --------- | --------- |
| `--bg`                  | `#fafafa` | `#232323` |
| `--surface`             | `#ffffff` | `#2b2b2b` |
| `--surface-strong`      | `#f0f4fa` | `#33363e` |
| `--ice` / `--blue-soft` | `#eef4ff` | `#282f3d` |
| `--text` / `--ink`      | `#181a1e` | `#f4f5f8` |
| `--muted`               | `#657083` | `#bbc2cf` |
| `--line`                | `#dbe2ed` | `#444952` |
| `--line-strong`         | `#b8c5d9` | `#59616e` |
| `--blue`                | `#2464ed` | `#8aafff` |
| `--blue-deep`           | `#1b53c7` | `#6e9bff` |
| `--orange`              | `#bd4c21` | `#ff996c` |

圆角 Token 为 3 / 3 / 7 / 10px，常用容器最大宽度 1296px，左右留白分别为桌面 56px、800px 及以下 24px、520px 及以下 18px。`--reading-width` 当前定义为 740px，但文章页实际使用局部规则的 760px，调整正文时应以文章页为准。

Motion Token 为 120 / 220 / 360 / 720ms；当前组件仍有各自直接定义的时长，主题圆形过渡为 2000ms。普通 Hover 以小幅位移、边框与颜色变化为主。

字体配置在 [fonts.css](../src/assets/styles/fonts.css)。英文使用 `public/assets/fonts/geist.woff2` 自托管可变字体并设置 `font-display: swap`，中文主要使用系统字体回退。`@fontsource/noto-sans-sc` 的粗体 WOFF 供自动封面在构建时使用，未作为页面中文字体整体引入。图标来自 `@lucide/astro`。

社徽、字标、计协娘和生态截图位于 `public/assets/`，按站点绝对路径引用；public 文件按原样复制。文章本地图片经内容加载器或 Markdown / MDX 图片管线处理，远程及 public 路径封面直接作为 URL 使用。当前多数封面和展示图片使用普通 `<img>`，尚未统一提供响应式 `srcset`。

### 自动封面

缺少 `cover.image` 的公开文章在构建时由 Satori 生成 SVG，再由 Sharp 转成 1600 × 1000 WebP。封面采用浅蓝网格背景，展示分类标签、日期、标题、域名和文章 ID；`coverLabel` 与 `accent` 从分类配置读取。`getArticleCover()` 统一选择自定义封面或生成路径。

自动封面属于静态生成结果，不需要线上图片服务。草稿和已有自定义封面的文章不会额外生成标题封面。

## 6. 内容与配置模型

当前仅注册 `articles` 一个 Content Collection，定义见 [src/content.config.ts](../src/content.config.ts)。加载模式为 `src/content/articles/*/*/index.{md,mdx}`。

```text
src/content/articles/<source-category>/<article-name>/index.md 或 index.mdx
                                   ↓
                 entry.id = <frontmatter.type>/<article-name>
                                   ↓
                 /articles/<type>/<article-name>
```

类型必须存在于 `config.articles.categories`。类型和文章名允许 Unicode 字母、数字、下划线、连字符，且以字母或数字开头。加载器检查 `<type>/<article-name>` 的 ID 冲突，包括同目录中使用相同类型的 `index.md` 与 `index.mdx`；每篇文章应只保留一个正文文件。源分类目录不决定最终类型，建议与 frontmatter 保持一致。

| 字段              | 类型 / 默认值                   | 当前用途                               |
| ----------------- | ------------------------------- | -------------------------------------- |
| `title`           | 必填字符串                      | 标题、列表、分享、RSS 与自动封面       |
| `description`     | 必填字符串                      | 摘要、页面元数据与 RSS                 |
| `type`            | 必填、已配置分类                | ID、URL、分类展示与关联匹配            |
| `publishedAt`     | 必填，可转换为 Date             | 日期展示、列表与 RSS 排序              |
| `authors`         | `string[] = []`                 | 可选署名，使用普通文本                 |
| `draft`           | `boolean = false`               | 过滤公开输出                           |
| `featured`        | `boolean = false`               | 首页和总列表推荐选择                   |
| `tags`            | `string[] = []`                 | 相关文章匹配，无标签 Registry 或归档页 |
| `cover`           | 可选 `{ image, alt, caption? }` | 自定义封面与可选图注                   |
| `updatedAt`       | 可选 Date                       | schema 接收，尚未用于页面或订阅输出    |
| `credits`         | `{ person, credit }[] = []`     | schema 接收，尚未展示                  |
| `relatedArticles` | `string[] = []`                 | schema 接收，尚未参与推荐              |

草稿在开发、构建及预览结果中均被页面、RSS、sitemap 和自动封面过滤。未来发布日期不会触发定时发布逻辑；未设置草稿的文章即使日期在未来也会输出。

[src/config.ts](../src/config.ts) 是默认导出的站点配置，使用 [src/types/config.ts](../src/types/config.ts) 的类型约束：

| 配置部分              | 字段与职责                                                                 |
| --------------------- | -------------------------------------------------------------------------- |
| `site`                | `shortName`、`title`、`description`、`url`、`guideUrl`、`pageUrl`          |
| `nav`                 | `label`、`href`、可选 `mobileLabel`、`external`                            |
| `articles.categories` | 分类键及 `label`、`title`、`description`、`byline`、`coverLabel`、`accent` |
| `recruitment`         | `title`、可选 `opensAt` / `closesAt`、`qqGroup`                            |
| `footer`              | 分组标题和链接                                                             |

分类顺序就是导航顺序；新增配置项后，分类页面和 sitemap 会自动扩展，即使分类暂时没有文章。文章作者和 credits 尚未连接到独立人物集合。

## 7. 工程与交互维护

页面负责路由、数据读取和区块组合；Layouts 提供公共框架；Widgets 提供组合模块；Components 提供可复用控件。当前首页各区块主要就地维护，Widgets 仅有生态堆叠卡片，不要求每个区块单独建目录或布局。

页面、layout、widget 和 component 的专属样式、脚本、动画及媒体查询都放在所属 `.astro` 文件中。`src/assets/styles/` 只维护 Token、字体、基础规则和跨页面工具类，`src/assets/scripts/` 提供 `onPageLoad()` 与 `reveal()` 等共享能力。TypeScript 开启 Astro strict 配置，并支持 `@/*` 指向 `src/*`。

客户端增强需要同时处理直接访问和 Astro 导航进入：

1. 使用 `onPageLoad()` 或对应 Astro 生命周期重新查找当前文档的元素，避免首次导航进入时重复播放入场动画。
2. 元素由所属页面或组件选择，共享工具接收元素和参数。
3. 离页或重新初始化时移除元素监听、滚动监听、定时器和 RAF；GSAP 上下文按需回收。
4. 全局事件委托只注册一次；页面替换时保留主题并处理被中断的过渡。

静态 HTML 提供主要内容、普通链接和原生 FAQ。移动菜单、主题手动切换、进度反馈和角色互动依赖 JavaScript。已有 Skip Link、焦点描边、导航标签、图片替代文本和菜单焦点返回，但当前没有完整的无障碍审计结果。

Reduced Motion 已覆盖共享 Reveal、首页入场与滚动 Reveal、主题圆形过渡，以及全局 CSS 动画和 Transition 时长。当前角色指针视差、点击回弹仍会绑定，sticky 堆叠和全局平滑滚动也未单独关闭，不能将其描述为全部动效均已降级。

## 8. 元数据、构建与验证

`astro.config.mjs` 使用 `output: 'static'`、`build.format: 'directory'` 和 HTML 压缩。Bun 负责依赖与脚本，构建输出 `dist/`，无需常驻服务端。工具链版本与 TypeScript 双版本兼容方案见 README 和 `package.json`。

### 搜索与分享

`BaseHead` 输出标题、描述、canonical、OpenGraph、Twitter `summary_large_image` 和社徽 favicon。Canonical 由 `config.site.url` 与当前路径组合；文章使用自己的标题、摘要和封面，普通页面默认分享图片仍是代码中配置的 Unsplash URL。

当前 `og:type` 统一为 `website`，尚未输出 Organization、Article 等 JSON-LD。RSS 按发布日期倒序输出所有分类的公开文章，包含标题、日期、摘要和链接，不含正文。Sitemap 包含首页、About、Articles、Join、全部配置分类和公开文章，排除 404 与草稿。Robots 默认允许抓取并指向 sitemap。

### 部署边界

静态产物可部署到 CXCS Page 或其他支持目录索引和 `404.html` 的服务。仓库没有 CI 工作流、PR Preview、定时重建、生产发布或托管平台 Header 配置，也没有预览环境判断及 noindex 输出。这些能力需要在接入部署时配置；当前不能依赖自动日更来刷新招新状态。

### 现有验证

| 检查                   | 覆盖范围                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `bun run check`        | Astro 检查与 TypeScript 7 类型检查                                                               |
| `bun test`             | 内容目录、分类、Markdown / MDX、数学公式、草稿过滤、封面输出、页面结构、初始化生命周期、时间状态 |
| `bun run lint`         | JS / MJS / TS；当前不检查 `.astro`                                                               |
| `bun run format:check` | Prettier 和 Astro 格式检查；当前忽略 `docs/`                                                     |
| `bun run build`        | 内容 schema、静态页面与资源生成                                                                  |

部分测试会执行完整构建，内容模型测试使用临时副本验证新增分类、图片、公式和非法输入。现有测试主要检查函数、源码约定和生成产物，尚无浏览器端到端测试、完整链接检查或性能 / 无障碍基准报告。后续变更应按涉及的页面检查桌面与移动布局、深浅主题、客户端导航和 Reduced Motion；Core Web Vitals 与资源体积需另行实测。
