// /api/contact：サイトのご注文フォームの内容を、Cloudflare のメール送信（send_email バインディング）で
// 自分たちのアドレス（CONTACT_TO）に送る。
//
// - 送り先は Email Routing の「確認済みの宛先アドレス」であること（Workers 無料プランの条件）
// - 送信元は Email Routing を有効にしたドメイン（15ichie.net）のアドレス
// - 送り先アドレスはリポジトリに書かず、Cloudflare の Secret（CONTACT_TO）に入れる
import { json } from './news';

const FROM = { email: 'noreply@15ichie.net', name: 'いちごいちえ サイト' };
const MAX_BODY_BYTES = 20_000;

/** フォームの項目（名前・最大文字数・必須） */
const FIELDS = {
  name: { label: 'お名前', max: 100, required: true },
  zip: { label: '郵便番号', max: 10, required: false },
  address: { label: 'ご住所', max: 300, required: false },
  tel: { label: '電話番号', max: 20, required: true },
  email: { label: 'メールアドレス', max: 254, required: false },
  order: { label: 'ご注文内容', max: 3000, required: true },
} as const;
type Field = keyof typeof FIELDS;
type Values = Record<Field, string>;

/** スパム対策の隠し欄（人には見えない。入力があればボットとみなす） */
const HONEYPOT = 'website';

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;
const TEL_RE = /^[0-9０-９+＋\-－ー（）() ]{10,20}$/;
const ZIP_RE = /^[0-9０-９\-－ー]{0,8}$/;

/** 同じサイトからの送信だけ受け付ける */
function isAllowedOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  const allowed = new Set([url.origin, 'https://15ichie.net', 'https://www.15ichie.net']);
  return allowed.has(origin);
}

/** 入力チェック。エラーがあれば { 項目名: メッセージ } を返す */
export function validate(v: Values): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  for (const [key, f] of Object.entries(FIELDS) as [Field, (typeof FIELDS)[Field]][]) {
    const value = v[key];
    if (f.required && !value) errors[key] = `${f.label}を入力してください`;
    else if (value.length > f.max) errors[key] = `${f.label}は${f.max}文字以内で入力してください`;
  }
  if (!errors.tel && v.tel && !TEL_RE.test(v.tel)) errors.tel = '電話番号を正しく入力してください';
  if (!errors.email && v.email && !EMAIL_RE.test(v.email)) errors.email = 'メールアドレスを正しく入力してください';
  if (!errors.zip && v.zip && !ZIP_RE.test(v.zip)) errors.zip = '郵便番号を正しく入力してください';
  return errors;
}

/** 件名・ヘッダーに入れる文字列から改行などを取り除く */
const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, ' ').trim();

export function buildMail(v: Values) {
  const subject = `【ご注文】${oneLine(v.name)} 様`;
  const text = [
    'いちごいちえ のサイト（ご注文フォーム）から送信がありました。',
    '',
    `お名前　　　：${v.name}`,
    `郵便番号　　：${v.zip || '（未入力）'}`,
    `ご住所　　　：${v.address || '（未入力）'}`,
    `電話番号　　：${v.tel}`,
    `メール　　　：${v.email || '（未入力）'}`,
    '',
    '【ご注文内容】',
    v.order,
    '',
    '---',
    v.email
      ? 'このメールに返信すると、お客様のメールアドレス宛てに返信できます。'
      : 'メールアドレスの入力がないため、お電話でご連絡ください。',
  ].join('\n');
  return { subject, text };
}

export async function contactApi(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== 'POST') return json({ ok: false, error: '送信方法が正しくありません。' }, 405);
  if (!isAllowedOrigin(request, url)) return json({ ok: false, error: 'このページからは送信できません。' }, 403);

  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BODY_BYTES) return json({ ok: false, error: '入力内容が長すぎます。' }, 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: '送信内容を読み取れませんでした。' }, 400);
  }

  // 隠し欄に入力がある＝ボット。成功したふりをして何も送らない
  if (String(form.get(HONEYPOT) ?? '').trim()) return json({ ok: true });

  const values = Object.fromEntries(
    (Object.keys(FIELDS) as Field[]).map((k) => [k, String(form.get(k) ?? '').trim()]),
  ) as Values;
  const errors = validate(values);
  if (Object.keys(errors).length) {
    return json({ ok: false, error: '入力内容をご確認ください。', fields: errors }, 400);
  }

  const to = (env.CONTACT_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!to.length) {
    console.error('CONTACT_TO is not set');
    return json({ ok: false, error: '送信の設定に問題があります。お電話でご連絡ください。' }, 500);
  }

  const { subject, text } = buildMail(values);
  try {
    await env.SEND_EMAIL.send({
      from: FROM,
      to,
      replyTo: values.email || undefined,
      subject,
      text,
    });
  } catch (e) {
    const err = e as { code?: string; message?: string };
    console.error('send_email failed', err.code, err.message);
    return json({ ok: false, error: '送信できませんでした。時間をおいて再度お試しいただくか、お電話でご連絡ください。' }, 502);
  }
  return json({ ok: true });
}
