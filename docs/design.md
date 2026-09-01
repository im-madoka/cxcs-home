# CXCS Website 统一设计规范

> 东南大学成贤学院计算机协会官网（`cxcs.dev`）的统一设计基线，合并此前设计文档与第二份增量总结。

## 0. 状态与边界

当前阶段是设计与文档整理，尚未进入正式实现。本文不生成页面代码、Astro 组件、TypeScript、CSS、GSAP Timeline，不安装依赖，也不替协会编造历史、组织、联系方式、招新规则或角色版权事实。

| 状态 | 含义 |
| --- | --- |
| **已确定** | 后续实现必须遵守的决策或约束 |
| **设计方向** | 总体方案已认可，具体数值或表现可在实现验证中微调 |
| **待真实资料确认** | 架构已经确定，但内容必须由协会提供或授权 |
| **Phase 2** | 明确不属于 V1，但当前架构应为未来扩展保留空间 |

仓库检查结果：当前没有已有实现、README、设计稿、资源文件或 Git 历史；此前的 `docs/design/` 拆分文档已被本文取代，未发现既有规范冲突。

## 1. 产品定位

### 1.1 网站身份与用户

项目名称为 `CXCS Website`，中文身份为东南大学成贤学院计算机协会官方网站。它不是普通学校社团宣传页，也不是纯技术博客，而是服务以下用户的长期协会门户：

- 第一次了解协会的新生；
- 想要加入协会的学生；
- 已加入协会的成员；
- 对计算机、编程、比赛、项目感兴趣的全校学生；
- 希望了解协会活动、项目和新闻的老师、学校组织及外部访客。

首页第一优先级是新生和潜在新成员。用户应快速知道：这是什么协会、平时做什么、不会编程能否加入、加入后从哪里开始、协会是否真的在活动和创造内容。

核心原则：

> 先让人看懂，再让人觉得酷。

> 表现层可以高级，理解门槛必须低。

### 1.2 三站点边界

| 站点 | 定位 | 回答的问题 |
| --- | --- | --- |
| `cxcs.dev` | 官方门户、协会官网和招新入口 | 我们是谁、最近在做什么、做过什么、怎样加入 |
| `guide.cxcs.dev` | 教程与知识库 | 从哪里开始学习、知识怎样掌握 |
| `cxcs.page` | 成员网站部署与托管平台 | 怎样把自己做的网站发布到互联网上 |

主站介绍 Guide 和 Page，但不复刻其系统教程或平台功能。Guide 承载系统教程、学习路线、C/C++、Git、Shell、Markdown、比赛指南等长期知识。Page 从 GitHub 拉取代码、安装依赖、构建、生成地址，并支持 Preview、正式发布、团队权限、域名、私有仓库认证、配额、状态和审计。

首页表达 Page 时使用通俗中文，不堆 CI/CD、RBAC、Build Pipeline 等术语。辅助品牌路径为：

```text
Learn  → CXCS Guide
Build  → Projects
Deploy → CXCS Page
Share  → Articles / Activities
```

`Learn. Build. Deploy. Share.` 只作辅助品牌节奏，核心招新文案使用中文。

### 1.3 Home 与 Inner Pages

```text
Home = Experience
Inner Pages = Content
```

首页是沉浸式、强视觉、强动效的 Astro 单页 Experience，负责招新、第一印象、品牌故事、真实动态、项目与生态展示，并导向 Articles、Projects、Guide、Page、Join。内页是阅读优先的独立 Astro 页面，负责阅读、查找、项目了解、活动参与、漫画阅读、协会介绍和招新行动。整站不是 SPA。

页面气质分别为：Home = Experience；Articles = Editorial；Projects = Showcase；Activities = Timeline；Theater = Playground；About = Identity / Story / Trust；Join = Friendly / Clear / Action。各内页共享设计系统，但不得复制首页的长 Pin、横向 Scroll 或高强度 Cinematic 演出。

### 1.4 V1 技术与非目标

已确定使用 Astro、Bun、TypeScript、Astro SSG、MPA、构建时内容生成、Git-based 内容维护和 Astro Content Collections。组件以原生 `.astro` 为主体，客户端交互只使用 TypeScript、浏览器原生 API、GSAP 和必要的轻量脚本。

V1 不做 React、Vue、其他 UI 框架、登录、成员后台、CMS、数据库、评论、私信、论坛、活动报名后台、复杂成员主页、内部 Wiki、账户权限系统、全站 SPA、主站复刻 Guide/Page、全站 Loading Screen、Skeleton、全站 Search、PWA、广告型或用户画像型 Analytics、视频依赖的核心体验、无限粒子、满屏代码雨、蓝紫霓虹模板、全站毛玻璃、全站胶囊化、每段都 Pin、所有动画都用 GSAP 或万能 Card 模板。

## 2. 信息架构与路由

### 2.1 V1 路由

```text
/
├── /about
├── /articles
│   ├── /articles/news
│   ├── /articles/blog
│   └── /articles/[slug]
├── /activities
│   └── /activities/[slug]
├── /projects
│   └── /projects/[slug]
├── /theater
│   └── /theater/[slug]
├── /join
└── /404
```

外部入口为 `https://guide.cxcs.dev`、`https://cxcs.page`。站内链接统一用 `→`，外部链接统一用 `↗`；外链新窗口使用 `rel="noopener noreferrer"`。

### 2.2 Header 与关系

桌面端方向：`CXCS / About / Articles / Activities / Projects / Theater / Guide ↗ / Page ↗ / Theme / Join Us`。首页首屏 Header 透明融入 Hero，滚离 Hero 后缩小并出现半透明 Surface、适量 blur、极淡 Border；内页使用稳定状态。移动端为 `CXCS / Menu`，菜单是整屏 Overlay，支持 Escape、焦点管理和返回焦点。

```text
首页 Experience
  ├─ 认识协会 ───────────────→ /about
  ├─ 最近发生了什么 ──────────→ /articles /activities
  ├─ 看看大家做过什么 ────────→ /projects
  ├─ 小剧场 ─────────────────→ /theater
  ├─ 从零开始 ───────────────→ guide.cxcs.dev
  ├─ 把网站发布出去 ─────────→ cxcs.page
  └─ 加入协会 ───────────────→ /join
```

Articles 是发布内容总入口。V1 只显示“全部 / 新闻 / 博客”，对应 `/articles`、`/articles/news`、`/articles/blog`；详情统一 `/articles/[slug]`，不带分类路径。Articles 是发布内容，Activities 是真实活动实体；同一活动可以有报名新闻、Activity 和结束回顾。Guide 是系统知识，不与 Articles 混合。

## 3. 首页 Experience

首页顺序已冻结：

```text
01 Hero → 02 What We Do → 03 Start Here → 04 Latest from CXCS
→ 05 Projects → 06 CXCS Ecosystem → 07 Theater → 08 Join Us
```

叙事为“进入网站 → 认识协会 → 了解日常 → 说出并消除不会编程的顾虑 → 给出成长入口 → 展示动态 → 展示项目 → 展示生态 → 展示人格 → 完成招新转化”。

### 3.1 Hero 与转场

推荐方向（不是最终逐字稿）：

```text
Hello, World.

欢迎来到
东南大学成贤学院计算机协会

一起学习，一起折腾，
一起做点有意思的东西。

[ 看看我们在做什么 ]  [ 加入计协 ]
```

首屏约 `100svh`，计协娘参与构图而不是贴右侧 PNG；允许少量 UI、圆弧、网格和技术符号，不用代码雨、不堆技术词、不做游戏首页。入场顺序为背景/网格/环境光、`Hello, World.` Mask Reveal、协会名称和中文、计协娘、CTA、Scroll 引导。

第一次滚动可短暂 Pin：标题向左上退出或缩小，CTA 淡出，角色缩小到右侧，网格变明显，中央出现“所以……我们平时到底在干嘛？”。不得长时间锁住滚动。

### 3.2 What We Do 与 Start Here

What We Do 只保留四项：

| 内容 | 文案方向 |
| --- | --- |
| 学点新东西 | 编程、电脑、软件、开发板……感兴趣的东西，都可以一起研究。 |
| 做点有意思的项目 | 网站、小游戏、机器人、小工具。想到了，就试着把它做出来。 |
| 一起参加比赛 | 有队友、有经验分享，也有人陪你一起踩坑。 |
| 认识一群爱折腾的人 | 技术很重要，但找到一群志同道合的人也很重要。 |

四张卡组成规整 Bento Grid，计协娘作为引导角色，可配“什么都不会也没关系”。卡片散开后中央依次出现“可是……我什么都不会。”“那就从零开始。”

Start Here 不采用“萌新 / 会一点 / 大佬”，而是：

1. **从零开始**：第一次写代码？没关系，打开 CXCS Guide ↗。
2. **做点自己的东西**：学会一点后做自己的小项目，进入 `/projects`。
3. **把它分享出去**：用 CXCS Page 发布网站 ↗。

桌面端可纵向滚动驱动横向视觉推进或焦点切换；移动端自然纵向排列，不做复杂横向 Pin。

### 3.3 Latest、Projects、Ecosystem

Latest from CXCS 使用一篇主推加 2–3 篇次级内容的杂志式 Feed，混合 NEWS、BLOG、STORY、ACTIVITY，不做传统学校新闻列表，不使用 Pin。主封面 Mask Reveal，次级卡片 stagger、轻微 Scale、箭头滑入。

Projects 标题方向为“我们真的会做点东西”，桌面端使用横向 Gallery、一次 Pin、卡片占视口 55%–65% 并露出下一张，移动端纵向大卡片。CXCS Page 是首个 Featured Project。Page 卡片使用“获取项目代码 → 安装项目依赖 → 构建完成 → 网站已经上线”的中文流程，项目截图和中文说明优先于 Build Log。

Ecosystem 是首页品牌高潮，不用三张并排卡片，而让 Website、Guide、Page 依次接管整屏。桌面端可较长 Pin，移动端缩短 Pin 或逐屏 Reveal；背景可变化但保持同一品牌。

### 3.4 Theater 与 Join

Theater 用漫画格、分镜、散落画面、照片/卡片拼合，计协娘和角色在此更活泼，Rust 发卡可表达与面部不同步的情绪。这是首页 IP 最明显的区域。

Join Us 方向为“下一段故事，等你一起写。不会编程没关系。有兴趣，就已经是一个很好的开始。”最后一屏停止制造高潮，背景安静、元素减速、文字和 CTA 稳定出现，与 Hero 回环。

## 4. 内页设计

所有内页共享 `#FAFAFA` / `#232323`、CXCS Blue、Rust Orange、留白、大视觉、低阴影、中等圆角和高质量但克制的 Motion；以内 Level 1 Reveal 为主，少量 Level 2，不复制首页 Cinematic。

### 4.1 Articles / Article Detail

`/articles` 是 Editorial Hub。Hero 方向：`05 / ARTICLES / 文章与动态 / 记录最近发生的事情，也写一些我们觉得有意思的东西。`顶部有 Featured Story：大型封面、大标题、类型、日期、摘要、阅读 CTA。`featured: true` 只表示可被推荐，不代表永久置顶。分类是极简文字 Tab，不用胶囊；Feed 用可预测的编辑式错位，大型与普通文章交错。普通卡最多显示类型、日期、标题、两行摘要，Blog 可突出作者；不显示浏览量、点赞、评论、手填阅读时长和大量技术标签。

详情使用独立 `ArticleLayout`。Blog 强调作者和发布时间，News 强调发布时间和 Site Data 发布主体。Cover 使用 Wide Content，正文使用 Reading Content，正文约 680px–760px，支持标题、列表、普通/宽幅图、说明、引用、强调、分割线、链接、代码块和简单 Gallery；不提供 Guide 级侧栏、Playground、知识树或版本切换。可在 Header 下显示极细阅读进度条。正文后显示返回 Articles 和 2–3 个 Related Content，人工 Relations 优先，Tag/时间只作 fallback。

移动端单列、Cover 全宽、稳定 Feed、合理 Padding，不保留复杂错位。

### 4.2 Projects / Project Detail

`/projects` 是数字作品展。顶部展示 1–3 个 Featured Projects，CXCS Page 必须第一个。先讲项目解决的问题，再展示界面，最后技术信息。V1 只需要“全部 / Featured”，项目不足时不创建空分类。Project Card 截图占约 65%–75%，网页项目可用极简 Browser Frame；Hover 只轻微 Scale、上移、Pointer Parallax、Arrow 推进和 `VIEW PROJECT`，不做强 3D Tilt。状态手工维护为 `active | experimental | archived`，不由 GitHub Commit 自动判断。

详情使用独立 `ProjectLayout`，不复用 ArticleLayout。Hero 包含价值、简介、访问项目、GitHub、Status、Year、Team 和大型截图；之后解释“为什么做它”，按功能展示截图，最后放技术、成员和关联内容。大型项目可为 Case Study，小项目可只含简介、截图、使用方式。移动端全部自然纵向。

### 4.3 Activities / Activity Detail

`/activities` 是 Timeline + Event Showcase，展示“接下来可参加什么”和“过去做过什么”，核心视觉是活动现场、成员、合照、教室、比赛和分享会。Upcoming 为主活动加紧凑列表，必须高可见标题、日期、时间、地点、简介、详情和 `报名参加 ↗`。无 Upcoming 使用友好说明并导向过去活动，不写“暂无活动”。Past 用年份式 Editorial Timeline 和真实照片，不做密集简历式时间轴。

详情使用独立 `ActivityLayout`，第一屏回答活动是什么、何时、何地、能否报名、是否结束。状态由时间计算 `upcoming | ongoing | ended`，`cancelled` 由 override 产生。结束后转 Event Archive，去掉报名按钮，保留照片、回顾、资料、Guide、GitHub、Articles 和 Projects。Gallery 只支持单图、双图、Editorial Collage。移动端第一屏优先标题、日期、时间、地点和 CTA。

### 4.4 Theater / Episode Detail

`/theater` 是 Playground / IP 舞台。最新一集优先，使用 `EP.XX`、标题、大封面、简介和开始阅读 CTA。剧集墙使用有限的漫画分镜、书架或编辑式 Pattern，不做随机混乱。Cast 展示已确认的核心角色，一句话定位；V1 不做 Character Detail Page。Episode 可连接规范化 topics 和 Guide，形成“先觉得好玩 → 产生兴趣 → 去 Guide”。

详情使用 `TheaterLayout` 或 `EpisodeLayout`，漫画自然纵向阅读，漫画本身优先。V1 不做全屏阅读器、左右/自动翻页、缩略图侧栏、复杂缩放、章节目录。结尾显示知识点、Guide、Related Content、`← EP.07` / `EP.09 →`，可预留复制链接。每个漫画序列需有有意义 Alt 或文字版/对白摘要。移动端单列、稳定 Cast Grid、易点 Previous/Next。

### 4.5 About / Join

About 是 Identity / Story / Trust，不以行政化长段落开头。Hero 方向为“我们是一群喜欢计算机，也喜欢折腾的人”。用“学习的地方 / 把想法做出来的地方 / 认识同类的地方”三个大块，Values 方向为 `Curiosity / Build / Share / Together`。完整社徽适合 About；History 只有真实资料齐备时展示，Organization 只展示协会提供的当前公开结构，不编造部门。About 需解释三站点并导向 Join、Activities。

Join 是全年可用的招新转化页，Hero 方向为“来一起做点有意思的事”。覆盖第一次编程、会一点、喜欢折腾电脑、喜欢做内容以及只是觉得有意思的人。明确“加入计协 ≠ 来上课”。Recruitment 分 Open、Upcoming、Closed，只有真实存在的报名、群、二维码和时间才显示；FAQ 为 5–8 个真实问题。移动端第一屏优先状态、时间、报名和招新群，行动优先。

About 和 Join 优先使用成员合照、活动现场、分享会、比赛、项目交流等真实素材，而不是只用角色和抽象 UI。

## 5. 边缘体验

### Footer、404、Empty、缺图

Footer 不是链接垃圾场，也不是第九个 Hero。包含 CXCS、协会名、品牌文案、Explore、CXCS Online、公开联系方式、版权，并预留 Legal / Credits；可小尺寸放完整社徽，使用有层次的 Surface 和 Level 1 Motion。

404 正常信息优先：

```text
404
好像走错地方了。
这个页面不存在，也可能已经被移动到了别的地方。
[ 返回首页 ]  [ 看看最近的内容 ]
```

可有短暂 Glitch、Terminal、计协娘和 Rust 发卡彩蛋，但不只提供 `cd ..`，不持续闪烁。所有 Empty State 不写“暂无数据”：无 Upcoming 时给出友好说明；空分类可隐藏；Projects 少时放大真实项目；Theater 只有一集时强化 Latest；不制造 Coming Soon 假内容。

缺图使用品牌 Placeholder：项目名 + `</>` + CXCS Blue 几何图形；文章标题/日期/分类/圆弧；活动名/日期/品牌排版。V1 不做全站 Loading Screen 和普通 Skeleton。JS/GSAP 失败时 HTML 仍完整可见、可滚动、可导航、可阅读、可报名。
## 6. 内容模型

### 6.1 组织原则

内容目录为 `src/content/articles/`、`src/content/activities/`、`src/content/projects/`、`src/content/theater/`；公共数据为 `people`、`tags`、`organization`、`recruitment`、`site data`、`characters`、`theater config`。Metadata 描述内容是什么，Body 描述内容怎么讲。Slug 默认来自文件名、目录 ID 或 Collection Entry ID，不重复维护 `slug`。

### 6.2 Articles

V1 `type` 只有 `news | blog`，其他类型只作未来扩展。

```text
Identity: title*, description*, type*
Publishing: publishedAt*, updatedAt?, authors[], draft=false
Presentation: cover?, featured=false, tags[]?
Relations: relatedActivities[], relatedProjects[], relatedEpisodes[]
Credits: credits[]? { person, credit }
```

`description` 必填，供列表、首页、Related、SEO 和 OG，不自动截正文。Blog 原则上至少一个作者；News 可无个人作者，发布主体来自 Site Data。`updatedAt` 只表示实质更新。Cover 可选，结构为 `image / alt / caption?`，无 Cover 使用品牌 Placeholder。`featured: true` 只表示可被推荐，不是永久置顶；不加入 rank/homepageFeatured。V1 不放 views、likes、comments、手填 readingTime、重复 SEO 字段、publisher、canonicalUrl、difficulty。优先 Markdown，特殊文章才允许 MDX。

### 6.3 Activities

```text
Identity: title*, description*, type
Schedule: startAt*, endAt*, cancelled=false
Location: { name*, address?, mapUrl? }
Participation: registrationUrl?, registrationClosesAt?, capacity?
Presentation: cover?, featured=false, draft=false
Materials: [{ label, url }]
Speakers: [{ person, role? }]
Relations: relatedArticles[], relatedProjects[], relatedEpisodes[]
Body: 生命周期前后更新的一份正文
```

`type` 方向为 `sharing | workshop | competition | recruitment | social | other`，最终以真实活动核验。时区为 `Asia/Shanghai` 或带 `+08:00`。状态不手填：`now < startAt → upcoming`、`startAt <= now < endAt → ongoing`、`now >= endAt → ended`；`cancelled=true` 优先为 `cancelled`。延期直接修改时间，V1 不支持 RRULE；`capacity` 不展示实时剩余人数。

### 6.4 Projects

```text
Identity: title*, description*
Lifecycle: status*, startedAt?, draft=false
Links: website?, repository?, links[]?, deployedWithCxcsPage=false
Team: members[] { person, role }
Technology: technologies[]
Presentation: cover?, featured=false
Relations: relatedArticles[], relatedActivities[], relatedEpisodes[]
```

V1 `status` 只有 `active | experimental | archived`，不使用 progress 或百分比。常用链接用专用字段，其余为 `{ label, url }`；`deployedWithCxcsPage` 不用于 CXCS Page 自身。Team role 是简短自由文本，technologies 是规范化字符串，V1 不建 Technology Collection。大量截图与顺序由 Body 控制，不放 Frontmatter 数组。

V1 不放 stars、forks、downloads、latestRelease、lastCommit、contributorsCount、manualSortOrder、homepageRank、version、roadmap；GitHub 动态事实未来只能在构建时 API 获取。

### 6.5 Theater Episodes

一集一个目录，例如 `src/content/theater/ep-001/index.md`、`cover.webp`、`01.webp`。字段为：

```text
Identity: title*, episode*, description*
Publishing: publishedAt*, draft=false
Presentation: cover { image*, alt* }
Cast: characters[]
Knowledge: topics[], relatedGuides[] { label, url }
Relations: relatedArticles[], relatedActivities[], relatedProjects[]
Body: 漫画页顺序和布局
```

`episode` 是唯一整数，页面显示 `EP.08`，用于排序和自动 Previous/Next；不保存 previous/next，不做 Season。Cover 必填，Theater 不使用 featured，至少一个角色。漫画顺序由 Body 和严格受控组件决定，不使用 `pages[]`，不让作者手写布局 CSS。V1 不放 views、likes、comments、pageCount、difficulty、duration、rating。

### 6.6 People

People 描述现实人物是谁，不描述关系：

```text
displayName*
avatar?
bio?
associationStatus: current | alumni | collaborator
publicLinks[]?
```

推荐无正文 YAML Registry。只保存明确允许公开的信息，不存学号、手机号、宿舍、班级、私人邮箱、未授权微信或内部通讯录。Articles authors/credits、Projects members、Activities speakers、Organization holders/leads/members 都引用 People。V1 不生成 `/people/[slug]`。

### 6.7 Taxonomy 与 Relations

```text
Type     = 它是什么
Tag      = 它在讲什么
Relation = 真实关联
```

Article Tag 为轻量 Registry `{ id, label }`，内部使用稳定 ASCII slug，例如 `recruitment`、`cxcs-page`、`competition`、`project`、`behind-the-scenes`；一篇文章建议 0–4 个。V1 不生成 Tag Archive 和全站 `/topics`。Activity Type 是小型受控枚举；Project technologies、Theater topics 为规范化字符串。Related 优先人工关系，再按同 Type、同 Tag/Topic、时间接近 fallback；V1 不做推荐算法。

### 6.8 Site Data、Recruitment、Organization

Site Data 是长期稳定 Singleton：

```text
Identity: name, shortName, englishName, siteTitle, description
Ecosystem: website, guide, page { name, url, description }
Contact: 公开邮箱、官方 QQ 群、正式渠道
SocialLinks: { label, url, icon }
Legal: Copyright、Character Credits、二创说明、校名/社徽说明、备案信息
```

正式名称、描述、联系方式和 Legal 由协会确认。固定产品地址是 `https://cxcs.dev`、`https://guide.cxcs.dev`、`https://cxcs.page`；GitHub 是第三方入口。颜色、Radius、Shadow、Motion Token 不进入 Site Data。

Recruitment 是随周期变化的 Singleton，与 Join 长期内容分离：`Join Page = 长期内容 + 当前 Recruitment`。

```text
Identity: title, description
Schedule: opensAt, closesAt, overrideStatus?
Actions: applicationUrl?, groupUrl?, groupQr?
Presentation: draft
```

状态为 `upcoming | open | closed`，`overrideStatus` 只用于异常提前关闭；只显示实际存在的入口。V1 不存报名人数、表单响应、面试分数、成员状态或审批流。Preview 可见 Draft，Production 不公开。

Organization 只表示当前届公开结构：

```text
term
leadership[] { title, holders[] }
units[] { id, name, description, leads[], members[]? { person, role? } }
```

People 保留身份，Organization 更新职位；历史内容关系不因换届改变。V1 只维护当前届，职位、部门、职责和公开成员由协会提供。

### 6.9 Characters 与 Theater Config

Characters 只服务 Theater：

```text
name
description
assets { avatar*, portrait? }
origin: original | guest
sourceTitle?
castStatus: core | recurring | guest
creditNote?
```

核心展示顺序由 `TheaterConfig.coreCast[]` 维护。Origin 表示来源，Cast Status 表示剧中地位。Rust 发卡是计协娘特有规则，不抽象成所有角色字段。V1 不生成 `/theater/characters/[slug]`；客串角色版权、二创、署名、许可和免责声明必须上线前确认。

### 6.10 关系图

```text
                         Site Data
                             │
                    ┌────────┴────────┐
                    │                 │
               Recruitment       Organization
                                      │
                                   People
                                      │
                  ┌───────────────────┼──────────────────┐
                  ↓                   ↓                  ↓
              Articles            Projects          Activities
                  │                   │                  │
                  └───────────┬───────┴─────────┬────────┘
                              │                 │
                              ↓                 ↓
                           Theater ←──── Characters
                              │
                              ↓
                         CXCS Guide ↗
```

## 7. SEO、资源与无障碍

### 7.1 SEO 与可见性

Canonical 基准为 `https://cxcs.dev`。默认 Metadata 来自 Site Data；内容页使用 `title / description / cover`，不要求重复 SEO 字段。Structured Data 方向：首页/About 使用 Organization + WebSite；News 用 NewsArticle；Blog 用 BlogPosting；Activities 用 Event；软件项目可 SoftwareApplication，其他项目 CreativeWork；Theater 保持基础 Metadata。

全站支持 OpenGraph、Twitter/X Card、`summary_large_image`；有 Cover 用内容 Cover，无 Cover 用默认品牌 OG；V1 不做动态实时 OG 服务。必须提供 `/sitemap.xml` 和 `/robots.txt`，只包含公开 Production 页面；Draft、404、Preview-only 不进入 Sitemap。Preview 必须 noindex，优先 `X-Robots-Tag: noindex`。V1 提供 `/rss.xml`，只聚合 Articles 的 News/Blog；Theater RSS 和全站搜索属于 Phase 2。

### 7.2 图片、字体、视频

内容素材尽量 colocate 在 `articles/xxx/`、`projects/xxx/`、`activities/xxx/`、`theater/xxx/`，本地图像优先进入 Astro 图片管线。为 Mobile/Tablet/Desktop 生成合适尺寸，移动端不得下载 3840px 项目截图。照片和界面图优先 AVIF/WebP；漫画根据文字清晰度选择高质量 WebP、Lossless WebP 或 PNG。图片提前确定 width、height、aspect-ratio；Hero/LCP 可 Eager，其余 Lazy，漫画按阅读位置加载。

英文主体使用自托管 Geist WOFF2/Variable Font；中文使用现代系统无衬线或构建时子集，不在首屏加载完整数 MB CJK 字库。V1 不依赖视频完成核心体验；未来视频必须有 poster、muted、playsinline 和非视频 fallback。

### 7.3 Progressive Enhancement 与无障碍

支持现代常青 Chrome/Chromium、Edge、Firefox、Safari。必须使用语义 HTML、键盘操作、`:focus-visible`、Skip to Content、移动菜单 Esc、焦点管理、可理解 Theme Switch、有意义 Alt、不以颜色作为唯一状态、不把 Hover 作为唯一信息。目标按 WCAG 2.2 AA 设计；品牌色确认后验证 Light/Dark、Button、Small Text、Badge 对比度。Theater 漫画必须有 Alt 或文字版/对白摘要。

## 8. 响应式、Motion 与性能

Desktop 偏 Cinematic，Tablet 减少极端位移和 Pin，Mobile 偏 Fluid：自然纵向、Projects 纵向卡片、Start Here 纵向步骤、Ecosystem 缩短 Pin/逐屏 Reveal，不依赖 Hover、鼠标或复杂手势。首页最多约 2–3 段明显 Level 3 Cinematic，内页以 Level 1 Reveal 为主。

GSAP 负责首页入场、ScrollTrigger、Pin、Scrub、Projects Gallery、Ecosystem 和角色高级动效；CSS 负责普通 Hover、Transition、颜色和小反馈。Motion Token 方向为 `instant 100–150ms`、`fast 180–250ms`、`normal 300–450ms`、`slow 600–900ms`、`cinematic` 滚动驱动。优先 `transform`、`opacity`，限制 ScrollTrigger、持续 JS、粒子、Canvas、漂浮 DOM 和无意义循环。Magnetic 只用于少量核心 CTA，系统鼠标不替换。

必须支持 `prefers-reduced-motion: reduce`：关闭 Pin、Scrub、Parallax、Magnetic、长距离 Transform，Reveal 改 Fade/直接显示，主题圆形 Transition 降级，内容和功能不减少。JS/GSAP 失败时仍可导航、阅读、查看项目/活动、阅读漫画、报名和访问外链。

| 指标 | V1 目标 |
| --- | ---: |
| Core Web Vitals - LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| 首页压缩后 JS | ≤ 200 KB |
| 普通内容页压缩后 JS | ≤ 100 KB |
| 首屏关键视觉资源 | Mobile 约 ≤ 1 MB；Desktop 约 ≤ 1.5 MB |

目标以真实体验为准，不追求跑分截图 100 分。带 Hash 的静态资源使用长缓存和 immutable；HTML 短缓存/重新验证。Production 配置 `Content-Security-Policy`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`，其中 `Content-Security-Policy` 根据真实源头生成。

## 9. 工程、Preview 与 Production

Astro 分层保持 `Pages → Layouts / Widgets → Components → Utils / Styles`，禁止 Component 反向依赖 Widget/Layout/Page，禁止 Widget 依赖 Page/Layout。Layouts 方向为 `BaseLayout`、`ContentLayout`、独立 `ArticleLayout`、`ProjectLayout`、`ActivityLayout`、`TheaterLayout/EpisodeLayout`；Widgets 负责首页八段和内容列表；Components 保持低业务语义。动画脚本集中还是 colocate 属于实现验证项。

主题支持 `system | light | dark`，LocalStorage 只保存选择；System 跟随 `prefers-color-scheme`。优先以按钮点击位置为圆心的 View Transition：Light→Dark 扩散 Dark Surface，Dark→Light 扩散 Light Surface；不支持 API 或 Reduced Motion 时可靠降级。

Production 部署在 CXCS Page，但输出必须 vendor-neutral：`bun run build → dist/`，不依赖 Page 独占 Runtime API。GitHub `main` 是 Production Branch：

```text
Feature Branch → Pull Request → Preview Deployment → Review → Merge → Production
```

每个 PR 有独立 Preview URL，用于检查内容、漫画、GSAP、移动端、主题、Draft 和 Recruitment，且必须 noindex。只有 `main` 触发 Production；CI Checks → Build → 成功 → 发布，失败保留上一版并原子切换。静态输出可迁移到 Cloudflare Pages、Netlify、Nginx、GitHub Pages 等。

CI 至少检查 Bun lockfile 一致性、`astro check`、TypeScript、ESLint、Prettier、Prettier Astro Plugin、Content Schema、Production Build、内部链接和 Smoke Tests。Smoke Tests 覆盖首页、Header、三态主题、Articles、Join、404 和关键外链。`bun.lock` 提交 Git，依赖升级走明确 PR。内容 Push 即时 Build，每日一次 Scheduled Rebuild；Activities/Recruitment 使用 Build Time + Browser Recalculation + Daily Rebuild，不需服务器 API。

V1 Analytics 非必要，PWA（Service Worker、离线、安装、Push）不做。Production 安全 Header 和缓存策略必须在真实资源源头确认后配置。

## 10. Phase 2 与真实资料

### Phase 2

静态全文搜索（Pagefind 类）、Theater 独立 RSS、动态 Build 阶段 OG、历史组织/负责人页面、Character Detail Page、Project 动态 GitHub 数据、隐私友好 Analytics、内容量增长后的 Activity 分类、更细筛选、PWA、视频增强、真实客户端数据后的 Skeleton 和推荐发现均属于 Phase 2。

### 待真实资料确认

品牌精确色值、完整色阶、简化 Mark、favicon、最终中文字体/CJK 子集；正式中英文名称、默认 Description、GitHub、邮箱、QQ 群、社交和 Legal；历史与当前组织、负责人、部门、公开成员；招新规则、报名链接、群、二维码、时间和 FAQ；首批内容、图片、Alt、Credits 和人工 Relations；Activity Type、Tag、Technology/Topic 规范；客串角色来源、二创许可、署名和免责声明。

实现验证项包括 Astro/Bun/GSAP 具体版本、Smoke Test 工具、内部链接工具、MDX 范围、Theater 受控组件、CSP 资源源、CXCS Page Cache/Header 配置、Scheduled Build 执行方和实测性能。

## 11. 统一冻结清单

1. Astro + Bun + TypeScript；原生 Astro 组件；不使用 React/Vue；SSG/MPA；Git 内容；Content Collections。
2. Layouts/Widgets/Components 三层架构和单向依赖；Home = Experience；Inner Pages = Content；八段首页顺序冻结。
3. 三站点边界；Articles Editorial、Projects Showcase、Activities Timeline、Theater Playground、About Identity、Join Action。
4. 三态主题、LocalStorage 选择、圆形 View Transition、GSAP 高级动效、Reduced Motion。
5. Light `#FAFAFA`、Dark `#232323`、CXCS Blue 主色、Rust Orange 少量强调、站内 `→`、外部 `↗`。
6. Articles Featured + 全部/新闻/博客 + `/articles/[slug]` + ArticleLayout；Projects 第一个 Featured 为 CXCS Page + ProjectLayout；Activities 独立 ActivityLayout、时间状态；Theater 最新一集、纵向漫画、独立 Layout。
7. About Community 叙事与完整社徽；Join 全年可用、Recruitment 三状态、移动端行动优先；Footer、404、Empty、缺图、无 JS 增强规则。
8. Article Type news/blog；Activity status 自动；Project status active/experimental/archived；Theater episode 唯一整数；People/Characters 分离；Organization 单独维护当前届；轻量 Tag Registry，无 Tag Archive。
9. V1 SEO、OpenGraph、Sitemap、robots、Articles RSS；不做 Search/PWA；响应式图片；Geist 自托管；中文不加载完整大字库；WCAG 2.2 AA 方向。
10. LCP ≤2.5s、INP ≤200ms、CLS ≤0.1；首页 JS ≤200KB、普通页 ≤100KB；Production 在 CXCS Page 且静态可迁移；GitHub PR Preview；`main` Production；CI、`bun.lock`、每日重建；Preview noindex、Draft 仅 Preview、失败构建保留上一版；基础安全 Header。
