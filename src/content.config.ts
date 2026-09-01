import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cover = z.object({
  image: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

const relations = {
  relatedArticles: z.array(z.string()).default([]),
  relatedActivities: z.array(z.string()).default([]),
  relatedProjects: z.array(z.string()).default([]),
  relatedEpisodes: z.array(z.string()).default([]),
};

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
    ...relations,
  }),
});

const activities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/activities' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['sharing', 'workshop', 'competition', 'recruitment', 'social', 'other']),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    cancelled: z.boolean().default(false),
    location: z.object({ name: z.string(), address: z.string().optional(), mapUrl: z.string().url().optional() }),
    registrationUrl: z.string().url().optional(),
    registrationClosesAt: z.coerce.date().optional(),
    capacity: z.number().optional(),
    cover: cover.optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    materials: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    speakers: z.array(z.object({ person: z.string(), role: z.string().optional() })).default([]),
    ...relations,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['active', 'experimental', 'archived']),
    startedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    website: z.string().url().optional(),
    repository: z.string().url().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    deployedWithCxcsPage: z.boolean().default(false),
    members: z.array(z.object({ person: z.string(), role: z.string() })).default([]),
    technologies: z.array(z.string()).default([]),
    cover: cover.optional(),
    featured: z.boolean().default(false),
    ...relations,
  }),
});

const theater = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/theater' }),
  schema: z.object({
    title: z.string(),
    episode: z.number().int().positive(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    draft: z.boolean().default(false),
    cover: cover,
    characters: z.array(z.string()).min(1),
    topics: z.array(z.string()).default([]),
    relatedGuides: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    ...relations,
  }),
});

export const collections = { articles, activities, projects, theater };
