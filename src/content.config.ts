import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// お知らせ（src/content/news/*.md）
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      // 一覧に表示する写真（任意）。例: ./images/2026-12-10.jpg
      cover: image().optional(),
      // 一覧に表示する要約（任意）。省略時は本文の先頭から自動生成
      summary: z.string().optional(),
      // true にすると公開されない（下書き）
      draft: z.boolean().default(false),
    }),
});

export const collections = { news };
