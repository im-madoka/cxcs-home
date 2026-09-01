import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cxcs.dev',
  output: 'static',
  build: {
    format: 'directory',
  },
});
