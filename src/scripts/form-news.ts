// Googleフォームで投稿されたお知らせ（/api/news）を、Markdownのお知らせと一緒に並べる
export interface FormNews {
  id: string;
  date: string; // ISO
  title: string;
  body: string;
}

let cache: Promise<FormNews[]> | null = null;
export function fetchFormNews(): Promise<FormNews[]> {
  cache ??= fetch('/api/news')
    .then((r) => (r.ok ? r.json() : []))
    .then((d) => (Array.isArray(d) ? d : []))
    .catch(() => []);
  return cache;
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  // 日本時間で表示
  const j = new Date(d.getTime() + (9 * 60 + d.getTimezoneOffset()) * 60000);
  return `${j.getFullYear()}.${p(j.getMonth() + 1)}.${p(j.getDate())}`;
}

const isNew = (iso: string) => Date.now() - new Date(iso).getTime() < 30 * 24 * 60 * 60 * 1000;

export function excerpt(body: string, len = 70): string {
  const t = body.replace(/\s+/g, ' ').trim();
  return t.length > len ? t.slice(0, len) + '…' : t;
}

/** 本文：HTMLを無効化し、URLをリンクに、改行を<br>に */
export function bodyHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((para) => {
      const h = esc(para).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
      return `<p>${h.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
}

export const postUrl = (n: FormNews) => `/news/post/?id=${n.id}`;

function card(n: FormNews): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'reveal is-visible';
  wrap.dataset.date = n.date;
  wrap.innerHTML = `<a href="${postUrl(n)}" class="news-card card">
    <p class="news-card__meta"><time datetime="${esc(n.date)}">${formatDate(n.date)}</time>${isNew(n.date) ? '<span class="badge">NEW</span>' : ''}</p>
    <h3>${esc(n.title)}</h3>
    <p class="news-card__excerpt">${esc(excerpt(n.body))}</p>
    <span class="news-card__more">続きを読む →</span>
  </a>`;
  return wrap;
}

/** [data-news-list] の中身（data-date 付きの要素）にフォーム投稿を混ぜて新しい順に並べ直す */
export async function enhanceNewsLists() {
  const lists = document.querySelectorAll<HTMLElement>('[data-news-list]');
  const tickers = document.querySelectorAll<HTMLElement>('[data-news-ticker]');
  if (!lists.length && !tickers.length) return;
  const items = await fetchFormNews();
  if (!items.length) return;

  lists.forEach((list) => {
    const limit = Number(list.dataset.limit) || Infinity;
    const all = [...list.querySelectorAll<HTMLElement>(':scope > [data-date]')];
    items.forEach((n) => all.push(card(n)));
    all.sort((a, b) => new Date(b.dataset.date!).getTime() - new Date(a.dataset.date!).getTime());
    list.replaceChildren(...all.slice(0, limit));
    list.closest('[data-news-section]')?.querySelector('[data-news-empty]')?.remove();
  });

  tickers.forEach((t) => {
    const latest = items[0];
    const cur = t.dataset.date ? new Date(t.dataset.date).getTime() : 0;
    if (new Date(latest.date).getTime() <= cur) return;
    const a = t.querySelector<HTMLAnchorElement>('a[data-news-ticker-link]');
    if (!a) return;
    a.href = postUrl(latest);
    a.innerHTML = `<time datetime="${esc(latest.date)}">${formatDate(latest.date)}</time><span>${esc(latest.title)}</span>`;
  });
}
