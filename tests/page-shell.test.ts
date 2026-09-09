import { beforeAll, describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
let baseLayout = '';
let pageMotion = '';
let globalStyles = '';
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
  pageMotion = readFileSync(join(projectRoot, 'src/assets/scripts/page-motion.ts'), 'utf8');
  globalStyles = readFileSync(join(projectRoot, 'src/assets/styles/global.css'), 'utf8');
  themeSwitcher = readFileSync(join(projectRoot, 'src/components/ThemeSwitcher.astro'), 'utf8');
}, 30_000);

describe('inner page shell', () => {
  test('uses Astro client-side navigation and reinitializes motion after a page swap', () => {
    expect(baseLayout).toContain("import { ClientRouter } from 'astro:transitions';");
    expect(baseLayout).toContain('<ClientRouter />');
    expect(baseLayout).not.toContain('transition:name="page-main"');
    expect(pageMotion).toContain("document.addEventListener('astro:page-load'");
  });

  test('uses one shared hero height and the current page name on every target page', () => {
    expect(globalStyles).toMatch(/\.page-hero\s*\{[\s\S]*--page-hero-height:/);

    for (const [path, label] of pages) {
      const html = readFileSync(join(projectRoot, 'dist', path, 'index.html'), 'utf8');
      const hero = html.match(/<section class="page-hero[^"]*">[\s\S]*?<\/section>/)?.[0] || '';
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
    expect(globalStyles).toMatch(/:root\[data-theme-transition='true'\]::view-transition-new\(root\)/);
    expect(globalStyles).toContain('animation: theme-reveal');
    expect(globalStyles).not.toMatch(/(?:^|\n)::view-transition-new\(root\)\s*\{\s*clip-path:\s*circle/);
    expect(siteHeader).not.toContain('transition:persist');
    expect(siteFooter).not.toContain('transition:persist');
  });
});
