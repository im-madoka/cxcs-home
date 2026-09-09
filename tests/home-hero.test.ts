import { beforeAll, describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
let homepage = '';
let globalStyles = '';
let motionScript = '';

beforeAll(() => {
  execFileSync(process.execPath, ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'pipe',
  });
  homepage = readFileSync(join(projectRoot, 'dist/index.html'), 'utf8');
  globalStyles = readFileSync(join(projectRoot, 'src/assets/styles/global.css'), 'utf8');
  motionScript = readFileSync(join(projectRoot, 'src/assets/scripts/home-motion.ts'), 'utf8');
}, 30_000);

describe('homepage mascot hero', () => {
  test('groups the title lockup and mascot inside one centered stage', () => {
    expect(homepage).toMatch(
      /<div class="hero-stage">[\s\S]*<div class="hero-title-lockup">[\s\S]*class="hello"[\s\S]*class="world"[\s\S]*class="hero-character"/,
    );
  });

  test('centers the title lockup vertically from the mascot stage center', () => {
    expect(homepage).toContain('<div class="hero-title-lockup">');
    expect(globalStyles).toMatch(
      /\.hero-title-lockup\s*\{[\s\S]*top:\s*var\(--title-center-y\)[\s\S]*margin-top:\s*calc\(\(var\(--title-world-offset\) \+ 0\.83em\) \/ -2\)/,
    );
    expect(globalStyles).toMatch(
      /\.hero-stage\s*\{[\s\S]*--character-center-y:\s*50%[\s\S]*--title-center-y:\s*var\(--character-center-y\)/,
    );
    expect(globalStyles).toMatch(/\.hero-character\s*\{[\s\S]*top:\s*50%[\s\S]*bottom:\s*auto/);
    expect(globalStyles).toContain('calc(-50% + var(--py, 0px))');
  });

  test('keeps WORLD above the mascot in the visual stacking order', () => {
    expect(globalStyles).toMatch(/\.world\s*\{[\s\S]*z-index:\s*3/);
    expect(globalStyles).not.toMatch(/\.hero-title-lockup\s*\{[\s\S]*transform:\s*translateY\(-50%\)/);
  });

  test('does not start the mascot entrance below its centered position', () => {
    expect(motionScript).toMatch(/gsap\.from\(character,\s*\{[\s\S]*opacity:\s*0/);
    expect(motionScript).not.toMatch(/gsap\.from\(character,\s*\{[\s\S]*y:\s*45/);
  });

  test('keeps the mascot click animation separate from responsive positioning', () => {
    expect(globalStyles).toContain('rotate(var(--character-click-rotate, 0deg))');
    expect(globalStyles).toContain('scale(var(--character-click-scale, 1))');
    expect(motionScript).toMatch(/['"]--character-click-scale['"]:\s*0\.94/);
    expect(motionScript).toMatch(/['"]--character-click-rotate['"]:\s*['"]-1\.2deg['"]/);
    expect(motionScript).not.toMatch(/\{\s*scale:\s*0\.94,\s*rotate:\s*-1\.2/);
  });

  test('scales the mobile title while preserving the centered composition', () => {
    expect(globalStyles).toMatch(
      /@media \(max-width: 520px\) \{[\s\S]*?\.hello\s*\{[\s\S]*?font-size:\s*88px[\s\S]*?\.world\s*\{[\s\S]*?font-size:\s*80px[\s\S]*?\.hero-character\s*\{[\s\S]*?height:\s*min\(65dvh, 480px\)/,
    );
    expect(globalStyles).toMatch(
      /@media \(max-width: 520px\) \{[\s\S]*?\.hero-stage\s*\{[\s\S]*?--character-center-y:\s*50%[\s\S]*?--title-center-y:\s*var\(--character-center-y\)[\s\S]*?--title-world-offset:\s*110px/,
    );
  });

  test('keeps one theme control in the mobile header', () => {
    expect(globalStyles).toMatch(
      /@media \(max-width: 1000px\) \{[\s\S]*?\.header-actions \.theme-switcher\s*\{\s*display:\s*none;/,
    );
  });

  test('renders Shurin Aran as the accessible hero visual', () => {
    expect(homepage).toContain('alt="Shurin Aran，计协娘"');
  });

  test('serves the hero mascot as a PNG with an alpha channel', () => {
    const source = homepage.match(/<img[^>]+src="([^"]+)"[^>]+alt="Shurin Aran，计协娘"/)?.[1];

    expect(source).toBeTruthy();

    const png = readFileSync(join(projectRoot, 'public', source!.replace(/^\//, '')));
    const pngSignature = png.subarray(0, 8).toString('hex');
    const colorType = png[25];

    expect(pngSignature).toBe('89504e470d0a1a0a');
    expect([4, 6]).toContain(colorType);
  });
});

describe('site branding', () => {
  test('uses the association emblem for the favicon and visible brand marks', () => {
    expect(homepage).toMatch(/<link[^>]+rel="icon"[^>]+href="\/assets\/brand\/association-emblem\.png"/);

    const visibleEmblems = homepage.match(/<img[^>]+src="\/assets\/brand\/association-emblem\.png"[^>]*>/g);

    expect(visibleEmblems).toHaveLength(3);
  });

  test('exposes the association wordmark in the footer', () => {
    expect(homepage).toContain('class="footer-wordmark"');
    expect(homepage).toContain('aria-label="东南大学成贤学院校团委科创部大学生科学技术协会（计算机分会）"');
  });
});
