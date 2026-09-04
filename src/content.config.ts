import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cover = z.object({
  image: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['news', 'blog']),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    authors: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: cover.optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    credits: z.array(z.object({ person: z.string(), credit: z.string() })).default([]),
    relatedArticles: z.array(z.string()).default([]),
  }),
});

export const collections = { articles };
