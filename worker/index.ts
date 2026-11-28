// サイトの Worker。ページ自体は静的ファイル（dist/）をそのまま返し、次の処理だけここで行う。
// 1) 旧WordPressサイトのURL（?page_id= / ?p=）を新しいURLへ301転送（redirects.ts）
// 2) /api/news：Googleフォームで投稿されたお知らせを返す（news.ts）
// 3) /api/contact：ご注文フォームの内容をメールで送る（contact.ts）
import { contactApi } from './contact';
import { json, newsApi } from './news';
import { legacyRedirect } from './redirects';

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/news') return newsApi(env);
    if (url.pathname === '/api/contact') return contactApi(request, env, url);
    if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'Not found' }, 404);

    const to = legacyRedirect(url);
    if (to) return Response.redirect(new URL(to, url.origin).toString(), 301);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
