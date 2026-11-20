// 旧WordPressサイトのURL（?page_id= / ?p=）を新しいURLへ301転送する。
// それ以外はそのまま静的ファイル（dist/）を返す。
const PAGES = {
  '2': '/news/',
  '19': '/',
  '31': '/taste/',
  '34': '/products/',
  '36': '/access/',
  '95': '/about/',
  '279': '/order/',
};
const POSTS = {
  '1130': '/news/2025-08-03-melon/',
  '1134': '/news/2025-11-20-season-start/',
  '1141': '/news/2025-12-11-open/',
  '1144': '/news/2025-12-12-price/',
  '1148': '/news/2025-12-27-newyear/',
  '1152': '/news/2026-02-06-feb-mar/',
  '1158': '/news/2026-04-01-apr-may/',
  '1164': '/news/2026-05-05-season-end/',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const q = url.searchParams;
    let to = null;
    if (q.has('page_id')) to = PAGES[q.get('page_id')] ?? '/';
    else if (q.has('p')) to = POSTS[q.get('p')] ?? '/news/';
    else if (q.has('feed') || q.has('m') || q.has('cat')) to = '/news/';
    else if (url.pathname === '/index.php') to = '/';
    if (to) return Response.redirect(new URL(to, url.origin).toString(), 301);
    return env.ASSETS.fetch(request);
  },
};
