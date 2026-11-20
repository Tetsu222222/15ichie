// 1) 旧WordPressサイトのURL（?page_id= / ?p=）を新しいURLへ301転送する。
// 2) /api/news：Googleフォームで投稿されたお知らせ（公開用シートのCSV）をJSONで返す。
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

// --- お知らせ（Googleフォーム → スプレッドシート「公開用」→ CSV） ---

/** CSV を 2次元配列にする（"…" 内の改行・カンマ・"" に対応） */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** "2026/11/20 9:05:01" → { id: "20261120090501", iso: "2026-11-20T09:05:01+09:00" } */
function parseStamp(s) {
  const m = String(s).match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})(?:\D+(\d{1,2})\D+(\d{1,2})(?:\D+(\d{1,2}))?)?/);
  if (!m) return null;
  const p = (v) => String(v ?? 0).padStart(2, '0');
  const [, y, mo, d, h, mi, se] = m;
  return {
    id: `${y}${p(mo)}${p(d)}${p(h)}${p(mi)}${p(se)}`,
    iso: `${y}-${p(mo)}-${p(d)}T${p(h)}:${p(mi)}:${p(se)}+09:00`,
  };
}

async function newsApi(env) {
  if (!env.NEWS_CSV_URL) return json([]);
  try {
    const res = await fetch(env.NEWS_CSV_URL, { cf: { cacheTtl: 60, cacheEverything: true } });
    if (!res.ok) throw new Error(`CSV ${res.status}`);
    const rows = parseCsv(await res.text());
    const items = [];
    for (const r of rows.slice(1)) {
      const [stamp, title = '', body = ''] = r;
      const t = parseStamp(stamp);
      if (!t || !title.trim()) continue;
      items.push({ id: t.id, date: t.iso, title: title.trim(), body: body.trim() });
    }
    items.sort((a, b) => (a.id < b.id ? 1 : -1));
    return json(items);
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/news') return newsApi(env);
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
