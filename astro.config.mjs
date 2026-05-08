// @ts-check
import { defineConfig } from 'astro/config';
import { card } from './src/config.ts';

export default defineConfig({
  site: card.canonicalUrl,
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      assetsInlineLimit: 4096,
    },
  },
});
