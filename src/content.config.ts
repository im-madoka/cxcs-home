import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { existsSync } from 'node:fs';
import { getArticleCategory, isArticleType } from './articles';

const articleFiles = new Map<string, string>();

const articles = defineCollection({
  loader: glob({
    pattern: '*/*/index.{md,mdx}',
    base: './src/content/articles',
    generateId: ({ entry, data, base }) => {
      const type = z.string().parse(data.type);
      getArticleCategory(type);
      const name = entry.split('/')[1];
      if (!/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(type) || !/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(name)) {
        throw new Error(`Invalid article URL in ${entry}: type and article name must be URL path segments.`);
      }
      const id = `${type}/${name}`;
      for (const [previousId, file] of articleFiles) {
        if (file === entry && previousId !== id) articleFiles.delete(previousId);
      }
      const previousFile = articleFiles.get(id);
      if (previousFile && previousFile !== entry && existsSync(new URL(previousFile, base))) {
        throw new Error(`Duplicate article "${id}": ${previousFile} and ${entry}`);
      }
      articleFiles.set(id, entry);
      return id;
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      type: z.string().refine(isArticleType, 'Article type must be configured in config.articles.categories.'),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      authors: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      cover: z
        .preprocess(
          (value) => (typeof value === 'string' ? { image: value, alt: '' } : value),
          z.object({
            image: z.url().or(z.string().startsWith('/')).or(image()),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .optional(),
      featured: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      credits: z.array(z.object({ person: z.string(), credit: z.string() })).default([]),
      relatedArticles: z.array(z.string()).default([]),
    }),
});

export const collections = { articles };
