import { beforeAll, describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import config from '../src/config';

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

describe('page sharing metadata', () => {
  test('emits complete metadata and a usable cover on every HTML page, including 404', async () => {
    const outputRoot = join(projectRoot, 'dist');
    const pages = readdirSync(outputRoot, { recursive: true, encoding: 'utf8' }).filter((path) =>
      path.endsWith('.html'),
    );
    expect(pages).toContain('404.html');
    expect(pages).toContain('index.html');
    const pageImages = new Set<string>();

    for (const path of pages) {
      const html = readFileSync(join(outputRoot, path), 'utf8');
      const meta = (name: string) => {
        const matches = Array.from(
          html.matchAll(new RegExp(`<meta (?:property|name)="${name}" content="([^"]*)"`, 'g')),
        );
        expect(matches).toHaveLength(1);
        expect(matches[0][1]).not.toBe('');
        return matches[0][1];
      };
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
      const isArticle = /^articles\/[^/]+\/[^/]+\/index\.html$/.test(path);

      expect(meta('og:title')).toBe(title);
      expect(meta('og:description')).toBe(meta('description'));
      expect(meta('og:url')).toBe(canonical);
      expect(meta('og:type')).toBe(isArticle ? 'article' : 'website');
      expect(meta('og:site_name')).toBe(config.site.shortName);
      expect(meta('og:locale')).toBe('zh_CN');
      expect(meta('twitter:card')).toBe('summary_large_image');
      expect(meta('twitter:title')).toBe(title);
      expect(meta('twitter:description')).toBe(meta('description'));
      expect(meta('twitter:image')).toBe(meta('og:image'));
      expect(meta('twitter:image:alt')).toBe(meta('og:image:alt'));

      const imageUrl = new URL(meta('og:image'));
      const imagePath = join(outputRoot, decodeURI(imageUrl.pathname));
      if (imageUrl.origin === new URL(config.site.url).origin) {
        expect(existsSync(imagePath)).toBe(true);
        if (imageUrl.pathname.startsWith('/generated/')) {
          const image = await sharp(imagePath).metadata();
          expect(image.format).toBe('webp');
          expect([image.width, image.height]).toEqual([1600, 1000]);
        }
      }

      if (!isArticle) {
        const slug = path.replace(/\/index\.html$|\.html$/g, '');
        expect(imageUrl.origin).toBe(new URL(config.site.url).origin);
        expect(imageUrl.pathname).toBe(`/generated/page-covers/${slug}.webp`);
        expect(meta('og:image:alt')).toBe(title);
        pageImages.add(imageUrl.href);
      }
    }

    expect(pageImages.size).toBe(5 + Object.keys(config.articles.categories).length);
  });
});
