import { beforeAll, describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const articleId = 'news/annual-general-meeting-succession';
const generatedCover = `/generated/article-covers/${articleId}.webp`;
let articlesPage = '';
let categoryPage = '';
let homePage = '';

beforeAll(() => {
  execFileSync(process.execPath, ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'pipe',
  });

  articlesPage = readFileSync(join(projectRoot, 'dist/articles/index.html'), 'utf8');
  categoryPage = readFileSync(join(projectRoot, 'dist/articles/news/index.html'), 'utf8');
  homePage = readFileSync(join(projectRoot, 'dist/index.html'), 'utf8');
}, 30_000);

function articleCard(html: string, articleId: string) {
  return html.match(new RegExp(`<a[^>]+href="/articles/${articleId}"[^>]*>[\\s\\S]*?</a>`))?.[0] || '';
}

describe('generated article covers', () => {
  test('builds a 1600 by 1000 WebP for an article without a cover', async () => {
    const cover = readFileSync(join(projectRoot, 'dist', generatedCover));
    const metadata = await sharp(cover).metadata();

    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBe(1600);
    expect(metadata.height).toBe(1000);
  });

  test('keeps the homepage hero background across the full cover', async () => {
    const cover = readFileSync(join(projectRoot, 'dist', generatedCover));
    const { data, info } = await sharp(cover).raw().toBuffer({ resolveWithObject: true });
    const offset = (500 * info.width + 1500) * info.channels;
    const [red, green, blue] = data.subarray(offset, offset + 3);

    expect(red).toBeGreaterThan(220);
    expect(green).toBeGreaterThan(220);
    expect(blue).toBeGreaterThan(220);
  });

  test('uses the same generated cover everywhere the article is listed', () => {
    expect(articleCard(articlesPage, articleId)).toContain(`src="${generatedCover}"`);
    expect(articleCard(categoryPage, articleId)).toContain(`src="${generatedCover}"`);
    expect(articleCard(homePage, articleId)).toContain(`src="${generatedCover}"`);
  });
});
