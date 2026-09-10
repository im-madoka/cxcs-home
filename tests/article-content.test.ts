import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import config from '../src/config';

const projectRoot = process.cwd();
let fixtureRoot: string;

function readOutput(path: string) {
  return readFileSync(join(fixtureRoot, 'dist', path), 'utf8');
}

function writeArticle(folder: string, type: string, extra = '', body = 'Fixture article body.', format = 'mdx') {
  const directory = join(fixtureRoot, 'src/content/articles', folder);
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, `index.${format}`),
    `---\ntitle: Fixture ${folder}\ndescription: Integration fixture\ntype: ${type}\npublishedAt: 2026-09-10\n${extra}---\n\n${body}\n`,
  );
  return directory;
}

function failingBuild() {
  const result = spawnSync(process.execPath, ['run', 'build'], { cwd: fixtureRoot, encoding: 'utf8' });
  expect(result.status).not.toBe(0);
  return result.stdout + result.stderr;
}

beforeAll(() => {
  fixtureRoot = mkdtempSync(join(tmpdir(), 'cxcs-article-content-'));
  for (const file of ['src', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
    cpSync(join(projectRoot, file), join(fixtureRoot, file), { recursive: true });
  }
  rmSync(join(fixtureRoot, 'src/content/articles'), { recursive: true });
  symlinkSync(join(projectRoot, 'node_modules'), join(fixtureRoot, 'node_modules'), 'dir');
  symlinkSync(join(projectRoot, 'public'), join(fixtureRoot, 'public'), 'dir');
  // Keep Astro component IDs inside this isolated project when sharing dependencies.
  const astroConfigPath = join(fixtureRoot, 'astro.config.mjs');
  writeFileSync(
    astroConfigPath,
    readFileSync(astroConfigPath, 'utf8').replace(
      'integrations: [mdx()],',
      'integrations: [mdx()],\nvite: { resolve: { preserveSymlinks: true } },',
    ),
  );

  const configPath = join(fixtureRoot, 'src/config.ts');
  const category = {
    ...config.articles.categories.blog,
    label: '笔记',
    title: '测试笔记分类',
    byline: 'Notes Publisher',
    coverLabel: 'NOTES / CXCS',
  };
  writeFileSync(
    configPath,
    readFileSync(configPath, 'utf8').replace(
      'categories: {',
      `categories: {\nnotes: ${JSON.stringify(category)},\nempty: ${JSON.stringify({ ...category, label: '空分类' })},`,
    ),
  );

  // The source folder differs deliberately: frontmatter must determine the URL and category.
  const directory = writeArticle(
    'staging/local-images',
    'notes',
    'cover:\n  image: ./assets/images/cover.jpg\n  alt: Local fixture cover\n',
    '![Local body image](./assets/images/cover.jpg)\n\n<span data-mdx-result>{1 + 1}</span>',
  );
  mkdirSync(join(directory, 'assets/images'), { recursive: true });
  cpSync(join(projectRoot, 'public/assets/articles/code.jpg'), join(directory, 'assets/images/cover.jpg'));
  writeFileSync(join(directory, 'assets/images/ignored.mdx'), 'This is an asset, not an article.');
  writeFileSync(join(directory, 'assets/images/ignored.md'), 'This is an asset, not an article.');
  writeArticle('blog/cxcs-page', 'blog', 'featured: true\n');
  writeArticle('blog/blue-hour', 'blog');
  writeArticle('notes/generated-cover', 'notes');
  writeArticle('news/blue-hour', 'news');
  writeArticle('notes/hidden', 'notes', 'draft: true\n');
  writeArticle('notes/remote-cover', 'notes', 'cover:\n  image: https://example.com/remote.jpg\n  alt: Remote cover\n');
  writeArticle(
    'notes/public-cover',
    'notes',
    'cover:\n  image: /assets/brand/association-emblem.png\n  alt: Public cover\n',
  );

  const mathBody = String.raw`Inline formula: $E = mc^2$ and $\frac{a_1}{b_2}$.

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

Escaped currency: \$42.

\`$not_math$\`

\`\`\`text
$$not_math$$
\`\`\`
`.replaceAll('\\`', '`');
  for (const format of ['md', 'mdx']) {
    writeArticle(
      `notes/math-${format}`,
      'notes',
      '',
      mathBody + (format === 'mdx' ? '\n<span data-mdx-math>{1 + 1}</span>' : ''),
      format,
    );
  }

  execFileSync(process.execPath, ['run', 'build'], { cwd: fixtureRoot, stdio: 'pipe' });
}, 60_000);

afterAll(() => {
  if (fixtureRoot) rmSync(fixtureRoot, { recursive: true, force: true });
});

describe('article directories and configured categories', () => {
  test('generates new and empty categories from configuration', () => {
    expect(readOutput('articles/notes/index.html')).toContain('测试笔记分类');
    expect(readOutput('articles/index.html')).toContain('href="/articles/notes"');
    expect(readOutput('articles/empty/index.html')).toContain('这个分类还没有文章。');
    expect(readOutput('articles/notes/local-images/index.html')).toContain('Notes Publisher');
    expect(existsSync(join(fixtureRoot, 'dist/articles/staging/local-images/index.html'))).toBe(false);
  });

  test('renders MDX and emits local cover and body images', () => {
    const html = readOutput('articles/notes/local-images/index.html');
    expect(html.match(/<span[^>]*data-mdx-result[^>]*>(.*?)<\/span>/)?.[1]).toBe('2');
    const cover = html.match(/<img[^>]+class="detail-cover"[^>]+src="([^"]+)"/)?.[1];
    const bodyImage = html.match(/<img\b[^>]*alt="Local body image"[^>]*>/)?.[0].match(/\bsrc="([^"]+)"/)?.[1];
    for (const src of [cover, bodyImage]) {
      expect(src).toMatch(/^\/_astro\//);
      expect(existsSync(join(fixtureRoot, 'dist', src!))).toBe(true);
    }
    expect(html).toContain(`property="og:image" content="${new URL(cover!, config.site.url)}"`);
    expect(html).toContain('rel="canonical" href="https://cxcs.dev/articles/notes/local-images/"');
  });

  test('keeps remote and public covers usable', () => {
    expect(readOutput('articles/notes/remote-cover/index.html')).toContain('src="https://example.com/remote.jpg"');
    expect(readOutput('articles/notes/public-cover/index.html')).toContain(
      'src="/assets/brand/association-emblem.png"',
    );
  });

  for (const format of ['md', 'mdx']) {
    test(`renders inline and display math in ${format.toUpperCase()} while preserving code and currency`, () => {
      const html = readOutput(`articles/notes/math-${format}/index.html`);
      expect(html.match(/class="katex"/g)).toHaveLength(3);
      expect(html.match(/class="katex-display"/g)).toHaveLength(1);
      expect(html.match(/<math\b/g)).toHaveLength(3);
      expect(html).toContain('encoding="application/x-tex"');
      expect(html).not.toContain('katex-error');
      expect(html).toContain('Escaped currency: $42.');
      expect(html).toContain('<code>$not_math$</code>');
      expect(html).toContain('$$not_math$$');
      expect(html).not.toContain('$E = mc^2$');
      if (format === 'mdx') {
        expect(html.match(/<span[^>]*data-mdx-math[^>]*>(.*?)<\/span>/)?.[1]).toBe('2');
      }
      expect(readOutput('articles/notes/index.html')).toContain(`/articles/notes/math-${format}`);
      expect(readOutput('rss.xml')).toContain(`/articles/notes/math-${format}/`);
      expect(readOutput('sitemap.xml')).toContain(`/articles/notes/math-${format}`);

      const css = Array.from(html.matchAll(/<link[^>]+href="([^"]+\.css)"/g), (match) => readOutput(match[1])).join(
        '\n',
      );
      expect(css).toContain('.katex');
      const fonts = Array.from(css.matchAll(/url\(["']?([^\s)"']*KaTeX[^\s)"']*\.woff2)["']?\)/g), (match) => match[1]);
      expect(fonts.length).toBeGreaterThan(0);
      for (const font of fonts) expect(existsSync(join(fixtureRoot, 'dist', font))).toBe(true);
    });
  }

  test('supports the same article name in different categories and generates category covers', () => {
    for (const id of ['news/blue-hour', 'blog/blue-hour', 'notes/generated-cover']) {
      expect(readOutput(`articles/${id}/index.html`)).toContain(`/generated/article-covers/${id}.webp`);
      expect(existsSync(join(fixtureRoot, `dist/generated/article-covers/${id}.webp`))).toBe(true);
    }
  });

  test('uses categorized links in listings, related articles, RSS, and sitemap', () => {
    for (const [path, article] of [
      ['index.html', 'cxcs-page'],
      ['articles/index.html', 'blue-hour'],
      ['articles/blog/index.html', 'blue-hour'],
      ['articles/blog/cxcs-page/index.html', 'blue-hour'],
    ]) {
      const html = readOutput(path);
      const links = Array.from(html.matchAll(/href="([^"]+)"/g), (match) => match[1]);
      expect(links).toContain(`/articles/blog/${article}`);
      expect(links).not.toContain(`/articles/${article}`);
    }
    expect(readOutput('rss.xml')).toContain('https://cxcs.dev/articles/notes/local-images/');
    expect(readOutput('sitemap.xml')).toContain('https://cxcs.dev/articles/notes/local-images');
    expect(readOutput('sitemap.xml')).toContain('<loc>https://cxcs.dev/articles/empty</loc>');
  });

  test('excludes drafts from all public outputs', () => {
    for (const path of ['index.html', 'articles/index.html', 'articles/notes/index.html', 'rss.xml', 'sitemap.xml']) {
      expect(readOutput(path)).not.toContain('/articles/notes/hidden');
    }
    expect(existsSync(join(fixtureRoot, 'dist/articles/notes/hidden/index.html'))).toBe(false);
    expect(existsSync(join(fixtureRoot, 'dist/generated/article-covers/notes/hidden.webp'))).toBe(false);
  });

  test('rejects unconfigured frontmatter types', () => {
    const directory = writeArticle('notes/invalid', 'unconfigured');
    try {
      expect(failingBuild()).toContain('Unknown article type "unconfigured"');
    } finally {
      rmSync(directory, { recursive: true });
    }
  }, 30_000);

  test('rejects two sources that resolve to the same article URL', () => {
    const directory = writeArticle('elsewhere/local-images', 'notes');
    try {
      expect(failingBuild()).toContain('Duplicate article "notes/local-images"');
    } finally {
      rmSync(directory, { recursive: true });
    }
  }, 30_000);

  test('rejects Markdown and MDX sharing the same article directory', () => {
    const directory = writeArticle('notes/duplicate-formats', 'notes');
    writeArticle('notes/duplicate-formats', 'notes', '', 'Duplicate Markdown article.', 'md');
    try {
      expect(failingBuild()).toContain('Duplicate article "notes/duplicate-formats"');
    } finally {
      rmSync(directory, { recursive: true });
    }
  }, 30_000);
});
