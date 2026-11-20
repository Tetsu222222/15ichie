// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkBreaks from 'remark-breaks';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://15ichie.net',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  markdown: {
    // 改行をそのまま改行として表示（お知らせを書きやすくするため）
    processor: unified({ remarkPlugins: [remarkBreaks] }),
  },
});
