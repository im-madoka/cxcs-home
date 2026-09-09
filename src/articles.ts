import type { CollectionEntry } from 'astro:content';
import config from './config';

export type ArticleType = keyof typeof config.articles.categories;

export function isArticleType(value: string): value is ArticleType {
  return Object.hasOwn(config.articles.categories, value);
}

export function getArticleCategory(type: string) {
  if (!isArticleType(type)) {
    throw new Error(`Unknown article type "${type}". Add it to config.articles.categories.`);
  }
  return config.articles.categories[type];
}

export function getArticleCover(entry: CollectionEntry<'articles'>): string {
  const image = entry.data.cover?.image;
  return typeof image === 'string' ? image : image?.src || `/generated/article-covers/${entry.id}.webp`;
}
