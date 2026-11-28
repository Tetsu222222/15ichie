// /api/news：Googleフォームで投稿されたお知らせ（スプレッドシート「公開用」シートの公開CSV）をJSONで返す。
// --- お知らせ（Googleフォーム → スプレッドシート「公開用」→ CSV） ---

/** CSV を 2次元配列にする（"…" 内の改行・カンマ・"" に対応） */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
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
function parseStamp(s: string): { id: string; iso: string } | null {
  const m = String(s).match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})(?:\D+(\d{1,2})\D+(\d{1,2})(?:\D+(\d{1,2}))?)?/);
  if (!m) return null;
  const p = (v: string | undefined) => String(v ?? 0).padStart(2, '0');
  const [, y, mo, d, h, mi, se] = m;
  return {
    id: `${y}${p(mo)}${p(d)}${p(h)}${p(mi)}${p(se)}`,
    iso: `${y}-${p(mo)}-${p(d)}T${p(h)}:${p(mi)}:${p(se)}+09:00`,
  };
}

export async function newsApi(env: Env): Promise<Response> {
  if (!env.NEWS_CSV_URL) return json([]);
  try {
    const res = await fetch(env.NEWS_CSV_URL, { cf: { cacheTtl: 60, cacheEverything: true } } as RequestInit);
    if (!res.ok) throw new Error(`CSV ${res.status}`);
    const rows = parseCsv(await res.text());
    const items: { id: string; date: string; title: string; body: string }[] = [];
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

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  });
}

