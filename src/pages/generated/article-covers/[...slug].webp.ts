import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getArticleCategory } from '../../../articles';
import { renderTitleCover } from '../../../title-cover';

type Props = {
  entry: CollectionEntry<'articles'>;
};

export const getStaticPaths = (async () => {
  const articles = await getCollection('articles', ({ data }) => !data.draft && !data.cover?.image);

  return articles.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = ({ props: { entry } }) => {
  const category = getArticleCategory(entry.data.type);
  return renderTitleCover({
    title: entry.data.title,
    label: category.coverLabel,
    accent: category.accent,
    date: entry.data.publishedAt.toLocaleDateString('zh-CN'),
    path: entry.id,
  });
};
