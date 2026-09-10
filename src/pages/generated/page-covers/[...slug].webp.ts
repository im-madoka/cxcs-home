import type { APIRoute, GetStaticPaths } from 'astro';
import { pageMetadata } from '../../../page-metadata';
import { renderTitleCover } from '../../../title-cover';

type Props = {
  path: string;
};

export const getStaticPaths = (() =>
  Object.keys(pageMetadata).map((path) => ({
    params: { slug: path.slice(1) || 'index' },
    props: { path },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = ({ props: { path } }) => {
  const page = pageMetadata[path];
  return renderTitleCover({
    title: page.title,
    label: page.coverLabel,
    accent: page.accent,
    path,
  });
};
