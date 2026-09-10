import { beforeAll, describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
let baseLayout = '';
let pageLoad = '';
let pageHero = '';
let navigationProgress = '';
let themeSwitcher = '';
const pages: Array<[string, string]> = [
  ['about', 'ABOUT CXCS'],
  ['articles', 'CXCS EDITORIAL'],
  ['articles/news', 'ARTICLES / NEWS'],
  ['articles/blog', 'ARTICLES / BLOG'],
  ['join', 'JOIN US'],
];

beforeAll(() => {
  execFileSync(process.execPath, ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'pipe',
  });
  baseLayout = readFileSync(join(projectRoot, 'src/layouts/BaseLayout.astro'), 'utf8');
  pageLoad = readFileSync(join(projectRoot, 'src/assets/scripts/page-load.ts'), 'utf8');
  pageHero = readFileSync(join(projectRoot, 'src/components/PageHero.astro'), 'utf8');
  navigationProgress = baseLayout;
  themeSwitcher = readFileSync(join(projectRoot, 'src/components/ThemeSwitcher.astro'), 'utf8');
}, 30_000);

describe('inner page shell', () => {
  test('uses Astro client-side navigation and reinitializes motion after a page swap', () => {
    expect(baseLayout).toContain("import { ClientRouter } from 'astro:transitions';");
    expect(baseLayout).toContain('<ClientRouter />');
    expect(baseLayout).not.toContain('transition:name="page-main"');
    expect(pageHero).toContain('onPageLoad(');
    expect(pageLoad).toContain("document.addEventListener('astro:page-load'");
  });

  test('shows persistent progress while Astro prepares a new page', () => {
    expect(baseLayout).toContain('class="navigation-progress"');
    expect(baseLayout).toContain('transition:persist="navigation-progress"');
    expect(navigationProgress).toContain("document.addEventListener('astro:before-preparation'");
    expect(navigationProgress).toContain("document.addEventListener('astro:after-preparation'");
    expect(navigationProgress).toContain("document.addEventListener('astro:page-load'");
    expect(navigationProgress).toContain("event.signal.addEventListener('abort'");
    expect(baseLayout).toMatch(/\.navigation-progress\s*\{[\s\S]*position:\s*fixed/);
    expect(baseLayout).toMatch(/\.navigation-progress\[data-state='active'\]\s*\{[\s\S]*opacity:\s*1/);
  });

  test('uses one shared hero height and the current page name on every target page', () => {
    expect(pageHero).toMatch(/\.page-hero\s*\{[\s\S]*--page-hero-height:/);

    for (const [path, label] of pages) {
      const html = readFileSync(join(projectRoot, 'dist', path, 'index.html'), 'utf8');
      const hero = html.match(/<section class="page-hero[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] || '';
      expect(hero).toContain('class="page-hero');
      expect(hero).toContain(label);
      expect(hero).not.toContain('>05<');
      expect(hero).not.toContain('>04<');
      expect(hero).not.toContain('>01 / RECRUITMENT<');
    }
  });

  test('limits the long circular reveal to explicit theme transitions', () => {
    const siteHeader = readFileSync(join(projectRoot, 'src/layouts/SiteHeader.astro'), 'utf8');
    const siteFooter = readFileSync(join(projectRoot, 'src/layouts/SiteFooter.astro'), 'utf8');
    expect(themeSwitcher).toContain("dataset.themeTransition = 'true'");
    expect(themeSwitcher).toContain('delete document.documentElement.dataset.themeTransition');
    expect(themeSwitcher).toContain("document.addEventListener('astro:before-preparation'");
    expect(themeSwitcher).toContain("document.addEventListener('astro:before-swap'");
    expect(themeSwitcher).toContain('event.newDocument.documentElement.dataset.theme = currentTheme');
    expect(themeSwitcher).toContain("document.addEventListener('astro:page-load', syncThemeUI)");
    expect(themeSwitcher).toContain(
      'Delegate controls so the same handlers continue working after an Astro page swap.',
    );
    expect(themeSwitcher).toMatch(/:root\[data-theme-transition='true'\]::view-transition-new\(root\)/);
    expect(themeSwitcher).toContain('animation: theme-reveal');
    expect(themeSwitcher).not.toMatch(/:global\(::view-transition-new\(root\)\)\s*\{\s*clip-path:\s*circle/);
    expect(siteHeader).not.toContain('transition:persist');
    expect(siteFooter).not.toContain('transition:persist');
  });
});
