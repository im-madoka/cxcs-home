# CXCS Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the CXCS static association portal defined in [`docs/design.md`](./design.md), including the immersive homepage, content-first inner pages, typed content, accessible enhancement, and GitHub/Preview/Production delivery.

**Architecture:** Astro SSG/MPA with native `.astro` components. Pages compose independent Layouts and business Widgets; low-semantic Components and shared data remain below them. Markdown/YAML content is built statically, while browser scripts enhance theme, temporal statuses, navigation, and GSAP motion without making content depend on JavaScript.

**Tech Stack:** Astro, Bun, TypeScript, Astro Content Collections, native browser APIs, GSAP, ESLint, Prettier, Prettier Astro Plugin, `astro check`, GitHub, CXCS Page.

**Spec:** [`docs/design.md`](./design.md)

## Global Constraints

- Use Astro, Bun, and TypeScript; components are native Astro `.astro` components.
- Do not add React, Vue, another UI framework, a database, CMS, login, or a server API for V1.
- V1 is Astro SSG/MPA with Git-based Markdown/YAML/JSON content and Content Collections.
- Preserve `/`, `/about`, `/articles`, `/articles/news`, `/articles/blog`, `/articles/[slug]`, `/activities`, `/activities/[slug]`, `/projects`, `/projects/[slug]`, `/theater`, `/theater/[slug]`, `/join`, and `/404`.
- Keep `cxcs.dev`, `guide.cxcs.dev`, and `cxcs.page` distinct; use `→` for internal links and `↗` for external links.
- Preserve `#FAFAFA` Light and `#232323` Dark backgrounds, `system | light | dark` choices, LocalStorage selection, and circular View Transition with fallback.
- Keep Home cinematic and inner pages content-first; mobile is a fluid re-composition, not a scaled desktop animation.
- Respect `prefers-reduced-motion: reduce`; reduced motion removes Pin, Scrub, Parallax, Magnetic, and long transforms without removing content or functionality.
- Use approved association data only; missing names, links, permissions, people, history, organization, recruitment facts, and role rights block only the affected content, never justify invented facts.
- Prefer `transform` and `opacity`; avoid layout-property animation, unnecessary loops, infinite particles, large always-running canvases, and content hidden until JavaScript runs.
- Keep output vendor-neutral (`bun run build` produces `dist/`); only `main` publishes Production, and failed builds preserve the previous release.
- Preview is independently addressable and always `noindex`; Draft content is Preview-only.

## File Map

| Area | Responsibility |
| --- | --- |
| `astro.config.*`, `package.json`, `bun.lock`, `tsconfig.json` | Tooling, static output, scripts and pinned dependencies |
| `src/layouts/` | Base, content, article, project, activity, theater and episode shells |
| `src/widgets/home/` | Eight homepage sections and section-scoped enhancement hooks |
| `src/widgets/content/` | Editorial, project, activity and theater listing widgets |
| `src/widgets/global/` | Header, footer and mobile navigation overlay |
| `src/components/` | Buttons, links, theme, cards, media, tags and low-semantic primitives |
| `src/content/` | Articles, activities, projects and theater entries with colocated media |
| `src/data/` | Site, recruitment, organization, people, characters, config and tags |
| `src/lib/` | Typed queries, relations, temporal status, metadata and URL helpers |
| `src/scripts/` | Theme, menu, status recalculation, enhancement bootstrap and GSAP modules |
| `src/styles/` | Tokens, reset, typography, layout utilities and reduced-motion rules |
| `src/pages/` | Route composition and static path generation only |
| `.github/workflows/` | Checks, Preview, Production and scheduled rebuilds |

## Phase 0: Inputs and Scaffold

### Task 0.1: Confirm association inputs

**Files:**
- Read: `docs/design.md`
- Create: `docs/content-intake.md`

**Interfaces:**
- Consumes: the real-data checklist in `docs/design.md` section 10.
- Produces: an approved inventory of names, links, permissions, people, organization, recruitment facts, role assets, first content entries and Credits.

- [ ] Record official Chinese/English names, default description, public contacts, GitHub URL, product URLs, and Legal/Credits wording.
- [ ] Record approved photos, logos, people, guest characters, Alt text, and publication permissions.
- [ ] Record recruitment rules, dates, application URL, group URL/QR, FAQ answers, and whether Join is currently open.
- [ ] Record first Articles, Activities, Projects, Episodes, images, and manual Relations.
- [ ] Have the association owner approve the inventory before any of those facts enter Production content.

### Task 0.2: Scaffold Astro and Bun

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/pages/index.astro`
- Create: `src/styles/global.css`
- Create: `bun.lock`

**Interfaces:**
- Consumes: approved tooling choices and Task 0.1 inputs.
- Produces: a static, buildable Astro project with a visible no-JS placeholder homepage.

- [ ] Configure static output and `site: 'https://cxcs.dev'`.
- [ ] Add scripts for `dev`, `build`, `preview`, `check`, `lint`, `format:check`, `test`, and `links:check`.
- [ ] Add only Astro, GSAP, lint/format, and selected test dependencies; commit the resolved `bun.lock`.
- [ ] Run `bun run build` and verify `dist/` before feature work.

## Phase 1: Foundation

### Task 1.1: Create tokens, global layout, and accessibility base

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Create: `src/components/Container/Container.astro`
- Create: `src/components/SectionTitle/SectionTitle.astro`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/ContentLayout.astro`

**Interfaces:**
- Consumes: fixed backgrounds and approved brand values when supplied.
- Produces: CSS token names, Full Bleed/Wide Content/Reading Content containers, semantic HTML shell, skip-link target, and focus/reduced-motion defaults.

- [ ] Define neutral, theme, typography, spacing, radius, border, shadow, and motion tokens without component-local duplicates.
- [ ] Keep content visible in both themes and when scripts are absent.
- [ ] Add `:focus-visible`, semantic `main`, Skip to Content, and reduced-motion rules that never set content to hidden.
- [ ] Run `bun run check` and a keyboard-only pass on the placeholder.

### Task 1.2: Implement theme persistence and transition

**Files:**
- Create: `src/components/ThemeSwitcher/ThemeSwitcher.astro`
- Create: `src/scripts/theme.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: tokens and layout from Task 1.1.
- Produces: `system | light | dark` selection, LocalStorage persistence, system preference updates, circular View Transition, and fallback.

- [ ] Initialize before first paint from the stored choice or `prefers-color-scheme`; never store the resolved System result.
- [ ] Provide accessible labels, current-state announcement, keyboard activation, and click-coordinate origin.
- [ ] Use Dark/Light surface expansion when `document.startViewTransition` is available.
- [ ] Use immediate or short-fade fallback when unsupported or Reduced Motion is active.
- [ ] Test reload persistence, system changes, unsupported API, reduced motion, keyboard operation, and no flash.

### Task 1.3: Implement Header, mobile Overlay, Footer, and links

**Files:**
- Create: `src/widgets/global/SiteHeader/SiteHeader.astro`
- Create: `src/widgets/global/MobileNavOverlay/MobileNavOverlay.astro`
- Create: `src/widgets/global/SiteFooter/SiteFooter.astro`
- Create: `src/components/Button/Button.astro`
- Create: `src/components/IconButton/IconButton.astro`
- Create: `src/components/ExternalLink/ExternalLink.astro`

**Interfaces:**
- Consumes: Base/Content Layout, Theme Switcher, and later Site Data.
- Produces: stable desktop/mobile navigation, link arrow conventions, accessible overlay, and footer slots.

- [ ] Keep transparent homepage Header and stable inner-page Header as separate states.
- [ ] Render `→` for internal links and `↗` for external links; add `noopener noreferrer` for new tabs.
- [ ] Implement Escape close, focus containment, return focus, and visible focus for mobile Overlay.
- [ ] Keep Footer content-oriented and reserve Legal/Credits without inventing copy.
- [ ] Test keyboard flow, narrow layout, theme control, external semantics, and no-JS navigation.

## Phase 2: Data Contracts

### Task 2.1: Define Content Collections and registries

**Files:**
- Create: `src/content.config.ts`
- Create: `src/data/site.yaml`
- Create: `src/data/recruitment.yaml`
- Create: `src/data/organization.yaml`
- Create: `src/data/people/`
- Create: `src/data/characters/`
- Create: `src/data/theater-config.yaml`
- Create: `src/data/tags.yaml`

**Interfaces:**
- Consumes: approved inventory from Task 0.1.
- Produces: typed `articles`, `activities`, `projects`, `theater` collections and validated shared data.

- [ ] Encode the fields and enums in `docs/design.md`; do not add duplicate slug, SEO, rank, analytics, social-count, or manual status fields.
- [ ] Keep People and Characters separate; keep current organization roles out of Person.
- [ ] Validate Article `news | blog`, Activity required datetimes, Project `active | experimental | archived`, Theater integer episode/cover/cast, and public URL forms.
- [ ] Reject private contact fields from People and reject unapproved guest-character facts.
- [ ] Add only approved fixtures; schema tests must cover valid and invalid cases.

### Task 2.2: Add queries, relations, and temporal status

**Files:**
- Create: `src/lib/content.ts`
- Create: `src/lib/relations.ts`
- Create: `src/lib/status.ts`
- Create: `src/lib/site-data.ts`
- Create: `src/lib/urls.ts`

**Interfaces:**
- Consumes: collections and registries from Task 2.1.
- Produces: typed featured selection, filters, manual-first related fallback, temporal status, episode navigation, and canonical URL helpers.

- [ ] Treat `featured` as a recommendation candidate, then use deterministic publication-time selection.
- [ ] Resolve relations in order: explicit relation, same Type, same Tag/Topic, nearby time.
- [ ] Compute Activity `upcoming | ongoing | ended | cancelled` and Recruitment `upcoming | open | closed` with Asia/Shanghai semantics.
- [ ] Derive Theater Previous/Next from episode integer; never store manual pointers.
- [ ] Unit-test boundaries, cancellation, draft filtering, fallback order, and canonical URLs.

## Phase 3: Content-First Inner Pages

### Task 3.1: Build Articles and Article Detail

**Files:**
- Create: `src/layouts/ArticleLayout.astro`
- Create: `src/widgets/content/ArticleList/ArticleList.astro`
- Create: `src/components/ArticleCard/ArticleCard.astro`
- Create: `src/components/ReadingProgress/ReadingProgress.astro`
- Create: `src/pages/articles/index.astro`
- Create: `src/pages/articles/news.astro`
- Create: `src/pages/articles/blog.astro`
- Create: `src/pages/articles/[slug].astro`

**Interfaces:**
- Consumes: Article collection, relation helpers, Base/Content Layout, and media primitives.
- Produces: Editorial Hub, Featured Story, category tabs, stable article routes, reading progress, Cover/Body/Related rendering, and readable no-JS HTML.

- [ ] Implement Featured candidate selection, editorial Feed, News/Blog metadata emphasis, and no metrics/comments/hand-authored reading time.
- [ ] Render Cover wider than Reading Content; support headings, lists, regular/wide images, captions, quotes, code and simple Gallery.
- [ ] Render manual-first Related Content and canonical metadata; exclude drafts in Production.
- [ ] Keep mobile single-column and remove desktop editorial offsets.
- [ ] Test all three filters, draft exclusion, no cover Placeholder, keyboard reading, and JavaScript-disabled content.

### Task 3.2: Build Projects and Project Detail

**Files:**
- Create: `src/layouts/ProjectLayout.astro`
- Create: `src/widgets/content/ProjectGrid/ProjectGrid.astro`
- Create: `src/components/ProjectCard/ProjectCard.astro`
- Create: `src/pages/projects/index.astro`
- Create: `src/pages/projects/[slug].astro`
- Create: approved `src/content/projects/*/index.md` and colocated media.

**Interfaces:**
- Consumes: Project collection, People references, relations, and image pipeline.
- Produces: Featured showcase with CXCS Page first, All/Featured filter, distinct project cards, and scalable project detail.

- [ ] Explain problem/value before technologies in Featured and detail Hero.
- [ ] Use screenshot-dominant cards, restrained Browser Frame only for web projects, manual status, and small Hover.
- [ ] Render members and roles from relations; keep no People profile route.
- [ ] Let Body control screenshot order; do not create a frontmatter screenshot array.
- [ ] Test CXCS Page first, all three statuses, mobile single column, external links, drafts, and missing-cover Placeholder.

### Task 3.3: Build Activities and Activity Detail

**Files:**
- Create: `src/layouts/ActivityLayout.astro`
- Create: `src/widgets/content/ActivityTimeline/ActivityTimeline.astro`
- Create: `src/components/ActivityCard/ActivityCard.astro`
- Create: `src/components/EventStatus/EventStatus.astro`
- Create: `src/pages/activities/index.astro`
- Create: `src/pages/activities/[slug].astro`
- Create: approved `src/content/activities/*/index.md` and colocated media.

**Interfaces:**
- Consumes: temporal status helpers, Materials, People speakers, and image pipeline.
- Produces: Upcoming primary event/list, friendly empty state, editorial year timeline, action-first detail, archive state, and simple galleries.

- [ ] Keep date, time, location, status, detail CTA, and registration CTA visible on the mobile first screen.
- [ ] Remove registration when ended/cancelled; retain archive materials and relations.
- [ ] Use friendly no-Upcoming copy and do not fabricate events or links.
- [ ] Test before-start, ongoing, after-end, cancellation, registration close, timezone, and missing optional actions.

### Task 3.4: Build Theater and Episode Detail

**Files:**
- Create: `src/layouts/TheaterLayout.astro`
- Create: `src/layouts/EpisodeLayout.astro`
- Create: `src/widgets/content/TheaterGrid/TheaterGrid.astro`
- Create: `src/widgets/content/Cast/Cast.astro`
- Create: `src/components/TheaterCard/TheaterCard.astro`
- Create: controlled renderers under `src/components/theater/`
- Create: `src/pages/theater/index.astro`
- Create: `src/pages/theater/[slug].astro`
- Create: approved `src/content/theater/ep-*/index.md` and comic media.

**Interfaces:**
- Consumes: Episode collection, Characters, Theater Config, topics/Guide relations, and image metadata.
- Produces: Latest Episode, bounded episode wall, Cast, natural vertical comic reading, Previous/Next, and accessible text alternative.

- [ ] Make `EP.XX` and latest-episode priority consistent; use finite layout patterns rather than random offsets.
- [ ] Keep comic images/dialogue primary; do not add full-screen reader, auto-page, thumbnail rail, complex zoom, or chapter tree.
- [ ] Require meaningful Alt or a text/dialogue summary for each comic sequence.
- [ ] Derive Previous/Next from episode integer and hide absent neighbors.
- [ ] Test one episode, multiple episodes, missing neighbors, mobile Cast, keyboard reading, and Reduced Motion.

### Task 3.5: Build About, Join, 404, Empty, and media fallback

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/pages/join.astro`
- Create: `src/pages/404.astro`
- Create: `src/components/BrandPlaceholder/BrandPlaceholder.astro`
- Create: `src/components/EmptyState/EmptyState.astro`
- Create: `src/components/RecruitmentStatus/RecruitmentStatus.astro`
- Create: `src/components/Accordion/Accordion.astro`

**Interfaces:**
- Consumes: Site Data, Organization, Recruitment, approved real photos, and global layouts.
- Produces: Community-centered About, lifecycle-aware Join actions, friendly empty states, brand Placeholder, and understandable 404.

- [ ] Hide unapproved history and organization sections rather than inventing facts.
- [ ] Render Recruitment Open/Upcoming/Closed with only available actions and 5–8 approved FAQ items.
- [ ] Keep Join mobile first screen action-oriented and include low-pressure Activities/Guide/Projects paths.
- [ ] Put normal 404 actions before optional Terminal/Glitch delight.
- [ ] Test no recruitment, each recruitment state, absent contact, missing image, accordion keyboard flow, and no-JS behavior.

## Phase 4: Homepage and Motion

### Task 4.1: Build semantic homepage composition

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/widgets/home/HeroExperience/HeroExperience.astro`
- Create: `src/widgets/home/WhatWeDoExperience/WhatWeDoExperience.astro`
- Create: `src/widgets/home/StartHereExperience/StartHereExperience.astro`
- Create: `src/widgets/home/LatestFromCXCS/LatestFromCXCS.astro`
- Create: `src/widgets/home/ProjectShowcase/ProjectShowcase.astro`
- Create: `src/widgets/home/EcosystemExperience/EcosystemExperience.astro`
- Create: `src/widgets/home/TheaterExperience/TheaterExperience.astro`
- Create: `src/widgets/home/JoinExperience/JoinExperience.astro`

**Interfaces:**
- Consumes: content queries, global components, approved assets, and inner-page URLs.
- Produces: all eight sections as visible semantic HTML with stable dimensions, clear headings, normal links, and no animation-dependent content.

- [ ] Preserve the frozen order and user question for every section.
- [ ] Keep Chinese copy primary, English labels secondary, and technical jokes optional.
- [ ] Use real content; recompose sparse sections without fake cards.
- [ ] Add stable aspect ratios and responsive constraints so labels, images, and controls cannot shift layout.
- [ ] Verify full-page reading with JavaScript disabled before adding motion.

### Task 4.2: Add desktop motion and mobile/reduced-motion downgrade

**Files:**
- Create: `src/scripts/animations/home.ts`
- Create: `src/scripts/animations/hero.ts`
- Create: `src/scripts/animations/projects.ts`
- Create: `src/scripts/animations/ecosystem.ts`
- Modify: `src/widgets/home/*/*.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: semantic homepage and Motion rules in `docs/design.md`.
- Produces: layered Hero entry, causal Hero transition, limited Cinematic sections, Level 1/2 inner effects, and safe fallback.

- [ ] Use GSAP only for Hero entry/transition, one Projects Gallery pin, Ecosystem sequence, and intentional role movement.
- [ ] Cap Level 3 at Hero transition, Projects, and Ecosystem; do not add Pin to unrelated sections.
- [ ] Gate motion on capability and Reduced Motion; unregister triggers and show content directly when disabled.
- [ ] Keep mobile vertical flow and remove long Pin, horizontal Gallery, Magnetic, and pointer-dependent behavior.
- [ ] Verify scrolling never locks, sections end readable, CPU settles while idle, and GSAP failure leaves content visible.

### Task 4.3: Add mascot reactions and optional delights

**Files:**
- Create: `src/components/Character/Character.astro`
- Create: `src/components/RustPin/RustPin.astro`
- Modify: `src/widgets/home/HeroExperience/HeroExperience.astro`
- Modify: `src/widgets/home/TheaterExperience/TheaterExperience.astro`
- Modify: `src/pages/404.astro`

**Interfaces:**
- Consumes: approved Character assets and Theater Config.
- Produces: quiet/reactive mascot behavior, Rust pin expressions, and isolated optional easter eggs.

- [ ] Keep idle animation subtle and event-driven; do not continuously shake large DOM groups.
- [ ] Limit Rust pin rules to the mascot; do not add a generic secondary-emotion field.
- [ ] Ensure delights cannot block navigation, reading, Join actions, keyboard flow, or Reduced Motion.
- [ ] Test absent optional assets and JavaScript-disabled pages.

## Phase 5: Metadata, Assets, and Delivery

### Task 5.1: Implement metadata, structured data, OG, sitemap, robots, and RSS

**Files:**
- Create: `src/lib/metadata.ts`
- Create: `src/components/Seo/Seo.astro`
- Create: `src/components/StructuredData/StructuredData.astro`
- Create: `src/pages/sitemap.xml.ts`
- Create: `src/pages/robots.txt.ts`
- Create: `src/pages/rss.xml.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/ArticleLayout.astro`
- Modify: `src/layouts/ProjectLayout.astro`
- Modify: `src/layouts/ActivityLayout.astro`
- Modify: `src/layouts/TheaterLayout.astro`
- Modify: `src/layouts/EpisodeLayout.astro`
- Modify: `src/pages/articles/[slug].astro`
- Modify: `src/pages/projects/[slug].astro`
- Modify: `src/pages/activities/[slug].astro`
- Modify: `src/pages/theater/[slug].astro`

**Interfaces:**
- Consumes: Site Data, content metadata, canonical URL helper, and draft/Preview environment flags.
- Produces: canonical tags, default/content metadata, Organization/WebSite/article/Event/project structured data, public sitemap/robots, and Articles-only RSS.

- [ ] Generate canonical URLs under `https://cxcs.dev`; never use a Preview host as Production canonical metadata.
- [ ] Use `title`, `description`, and Cover; use default branded OG when Cover is absent.
- [ ] Exclude Draft, 404, and Preview-only entries from sitemap and RSS.
- [ ] Send `X-Robots-Tag: noindex` or equivalent Preview behavior without blocking local review.
- [ ] Validate XML, feed dates, structured-data JSON, canonical links, and no Draft leakage.

### Task 5.2: Finish responsive media and font pipeline

**Files:**
- Modify: `astro.config.mjs`
- Create/modify: `src/styles/fonts.css`
- Create/modify: colocated media under `src/content/**`
- Modify: `src/components/ImageFrame/ImageFrame.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/ArticleLayout.astro`
- Modify: `src/layouts/ProjectLayout.astro`
- Modify: `src/layouts/ActivityLayout.astro`
- Modify: `src/layouts/TheaterLayout.astro`
- Modify: `src/layouts/EpisodeLayout.astro`

**Interfaces:**
- Consumes: approved image rights, dimensions, Alt, Credits, Geist WOFF2/Variable Font, and approved Chinese font/subset decision.
- Produces: responsive photo/UI/comic assets, stable aspect ratios, correct eager/lazy boundaries, and no oversized CJK first load.

- [ ] Generate Mobile/Tablet/Desktop image variants and ensure Mobile never requests the 3840px desktop screenshot.
- [ ] Reserve dimensions for every image and verify CLS around Hero/LCP assets.
- [ ] Self-host only approved Geist files; use system/subset Chinese fallback according to approved input.
- [ ] Verify comic text readability before choosing lossy formats.
- [ ] Audit licenses, Credits, Alt, image weight, and network requests at mobile and desktop sizes.

### Task 5.3: Add lint, format, schema, link, and smoke checks

**Files:**
- Create: `eslint.config.*`
- Create: `.prettierrc.*`
- Create: `tests/`
- Create: link/content validation scripts under `scripts/`
- Modify: `package.json`

**Interfaces:**
- Consumes: all route, collection, metadata, and interaction contracts from Phases 1–5.2.
- Produces: repeatable checks for static correctness, schema, links, browser behavior, and responsive states.

- [ ] Add `astro check`, TypeScript, ESLint, Prettier Check, schema validation, Production Build, internal-link check, and smoke-test scripts.
- [ ] Smoke-test homepage, Header, System/Light/Dark, Articles, Join, 404, critical external links, Draft exclusion, and Preview noindex.
- [ ] Add targeted tests for Activity/Recruitment temporal status, Relations, episode ordering, theme fallback, and Reduced Motion gating.
- [ ] Run the full suite from a clean install using the committed `bun.lock`.

### Task 5.4: Configure GitHub PR Preview, Production, and scheduled rebuild

**Files:**
- Create: `.github/workflows/check.yml`
- Create: `.github/workflows/preview.yml`
- Create: `.github/workflows/production.yml`
- Create: `.github/workflows/scheduled-rebuild.yml`
- Create: CXCS Page deployment configuration.

**Interfaces:**
- Consumes: check/build scripts, GitHub repository, CXCS Page project, canonical domain, and approved CSP origins.
- Produces: PR Preview, `main` Production, daily rebuild, noindex Preview, atomic deploy, cache headers, and security headers.

- [ ] Run all checks before Preview and attach one isolated Preview URL to every Pull Request.
- [ ] Allow approved Draft/Recruitment review in Preview while sending noindex and never making Preview canonical.
- [ ] Restrict Production to `main`, run checks then build then atomic publish, and keep the previous release on failure.
- [ ] Schedule one daily rebuild in addition to content-push builds for Activity/Recruitment static statuses.
- [ ] Cache hashed static resources long-term with immutable and HTML short-term with revalidation.
- [ ] Configure CSP, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy after auditing actual origins.
- [ ] Verify output is portable and has no required CXCS Page runtime API.

## Phase 6: Release Review

### Task 6.1: Run cross-device and accessibility review

**Files:**
- Read: all generated routes and widgets.
- Create: `docs/release-checklist.md`
- Modify: only defects found during review.

**Interfaces:**
- Consumes: the complete built site, Preview URL, and approved content inventory.
- Produces: a release candidate with evidence for responsive, accessibility, content fallback, and motion behavior.

- [ ] Check Desktop, Tablet, Mobile, Projects/Start Here/Ecosystem downgrades, and no long mobile Pin.
- [ ] Check Light, Dark, System, OS theme changes, unsupported View Transition, and no flash.
- [ ] Check keyboard order, Skip to Content, focus visibility, menu Escape/return, accordion, external-link labels, and comic alternatives.
- [ ] Check Reduced Motion with Pin/Scrub/Parallax/Magnetic disabled and all content visible.
- [ ] Check 404, no Upcoming, empty categories, sparse Projects, one-episode Theater, missing images, and JS disabled.

### Task 6.2: Verify performance, SEO, links, and browser smoke

**Files:**
- Read: `docs/design.md`, `docs/release-checklist.md`, CI artifacts.
- Modify: only release-blocking defects.

**Interfaces:**
- Consumes: Production-like build and Preview/Production configurations.
- Produces: release evidence for Core Web Vitals, bundle/resource budgets, metadata, links, and browser behavior.

- [ ] Run Chrome/Chromium, Edge, Firefox, and Safari smoke checks on every V1 route.
- [ ] Measure LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 where supported and record deviations.
- [ ] Verify homepage JS ≤ 200 KB compressed, ordinary content pages ≤ 100 KB, and key visual resources near Mobile/Desktop targets.
- [ ] Verify canonical, OG, structured data, sitemap, robots, RSS, Preview noindex, Draft exclusion, broken links, and security headers.
- [ ] Verify a failed build leaves the previous Production version available, then record the release decision.

## Definition of Done

- Every V1 route, collection, field, behavior, and boundary in `docs/design.md` is implemented or explicitly blocked by a named missing real datum.
- No React/Vue, database, CMS, server API, Search, PWA, or invented association facts enter the project.
- No content is hidden when JavaScript or GSAP fails; Reduced Motion and mobile paths are first-class.
- CI passes with committed `bun.lock`; Preview is noindex; Production is `main`-only and atomic.
- The release checklist contains evidence for accessibility, responsive behavior, SEO, links, performance, and approved real-data inventory.
