import { getCollection, type CollectionEntry } from 'astro:content';

export type News = CollectionEntry<'news'>;

/** 公開済みのお知らせを新しい順で取得 */
export async function getNews(): Promise<News[]> {
  const all = await getCollection('news', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** 本文Markdownから一覧用の要約を作る */
export function excerpt(entry: News, len = 70): string {
  if (entry.data.summary) return entry.data.summary;
  const text = (entry.body ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/[#*>`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > len ? text.slice(0, len) + '…' : text;
}

/** 公開から30日以内なら NEW 表示 */
export function isNew(d: Date): boolean {
  return Date.now() - d.getTime() < 30 * 24 * 60 * 60 * 1000;
}

export const yen = (n: number) => n.toLocaleString('ja-JP');
