import { beforeAll, describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
let homepage = '';

beforeAll(() => {
  execFileSync(process.execPath, ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'pipe',
  });
  homepage = readFileSync(join(projectRoot, 'dist/index.html'), 'utf8');
}, 30_000);

describe('homepage mascot hero', () => {
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
