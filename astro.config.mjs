import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://ze2phyrzhenyin.github.io',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'fr'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    mdx(),
    sitemap(),
    tailwind({ applyBaseStyles: false }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: true,
    },
  },
});
