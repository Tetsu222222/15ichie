export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  publishedAt?: string;
  body?: string;
  eyecatch?: { url: string; width?: number; height?: number };
  description?: string;
  isPublished?: boolean;
};

const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = import.meta.env.MICROCMS_API_KEY;
const endpoint = import.meta.env.MICROCMS_NEWS_ENDPOINT ?? 'news';

const isProduction = import.meta.env.PROD;

function ensureConfig() {
  if (!serviceDomain || !apiKey) {
    throw new Error(
      'microCMS設定が不足しています。MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY を設定してください。'
    );
  }
}

async function fetchMicroCMS<T>(path: string): Promise<T> {
  ensureConfig();
  const url = `https://${serviceDomain}.microcms.io/api/v1/${endpoint}${path}`;
  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': apiKey
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`microCMS API取得に失敗しました (${response.status}): ${detail}`);
  }

  return response.json() as Promise<T>;
}

export async function getNewsList(): Promise<NewsItem[]> {
  const query = isProduction ? '?filters=isPublished[equals]true&orders=-publishedAt&limit=100' : '?orders=-publishedAt&limit=100';
  const data = await fetchMicroCMS<{ contents: NewsItem[] }>(query);
  return data.contents ?? [];
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const filters = encodeURIComponent(`slug[equals]${slug}${isProduction ? '[and]isPublished[equals]true' : ''}`);
  const data = await fetchMicroCMS<{ contents: NewsItem[] }>(`?filters=${filters}&limit=1`);
  return data.contents?.[0] ?? null;
}
