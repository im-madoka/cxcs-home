import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import config from './src/config.ts';

export default defineConfig({
  site: config.site.url,
  integrations: [mdx()],
  output: 'static',
  build: {
    format: 'directory',
  },
});
