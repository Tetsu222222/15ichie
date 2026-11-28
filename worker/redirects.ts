// 旧WordPressサイトのURL（?page_id= / ?p=）を新しいURLへ301転送する。
const PAGES: Record<string, string> = {
  '2': '/news/',
  '19': '/',
  '31': '/taste/',
  '34': '/products/',
  '36': '/access/',
  '95': '/about/',
  '279': '/order/',
};
const POSTS: Record<string, string> = {
  '1130': '/news/2025-08-03-melon/',
  '1134': '/news/2025-11-20-season-start/',
  '1141': '/news/2025-12-11-open/',
  '1144': '/news/2025-12-12-price/',
  '1148': '/news/2025-12-27-newyear/',
  '1152': '/news/2026-02-06-feb-mar/',
  '1158': '/news/2026-04-01-apr-may/',
  '1164': '/news/2026-05-05-season-end/',
};

/** 旧URLなら転送先のパスを返す（該当しなければ null） */
export function legacyRedirect(url: URL): string | null {
  const q = url.searchParams;
  if (q.has('page_id')) return PAGES[q.get('page_id')!] ?? '/';
  if (q.has('p')) return POSTS[q.get('p')!] ?? '/news/';
  if (q.has('feed') || q.has('m') || q.has('cat')) return '/news/';
  if (url.pathname === '/index.php') return '/';
  return null;
}
