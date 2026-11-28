# 石黒いちご農園 いちごいちえ 公式サイト

https://15ichie.net のソースです。[Astro](https://astro.build) で作った静的サイトを **Cloudflare（無料プラン）** で配信します。
（旧：ロリポップ上の WordPress）

## お知らせの更新方法

### いつもの更新：スマホの Googleフォームから（おすすめ）
1. お知らせ投稿用の Googleフォーム（「15ichie.netお知らせ更新」）を開く
2. **タイトル・本文・合言葉** を入れて送信
3. 1〜5分ほどでサイトのトップ・お知らせ一覧に表示される

- 改行はそのまま改行として表示されます。URL は自動でリンクになります
- **直す・消す**：スプレッドシート「15ichie.netお知らせ更新（回答）」の回答シートで、その行のタイトルや本文を直す／行を削除する
- 投稿日時はフォームを送った日時になります
- 仕組み：フォームの回答 →「公開用」シート（タイムスタンプ・タイトル・本文だけを式で表示。合言葉は出さない）→「ウェブに公開」したCSV → サイトの `/api/news`（`worker/news.ts`）。CSVのURLは `wrangler.jsonc` の `NEWS_CSV_URL`
- 「公開用」シートの公開設定を止めると、フォームからのお知らせはサイトに出なくなります

### 写真付きなど凝った記事：AI か GitHub で Markdown を書く
`src/content/news/` に Markdown を追加します（書き方は [AGENTS.md](./AGENTS.md)）。AI（Claude / ChatGPT Codex）に「お知らせを追加して」と頼むのが簡単です。Markdown の記事とフォームの記事は、日付順に混ざって表示されます。

## よく変える場所

| 内容 | ファイル |
| --- | --- |
| 営業時間・定休日・電話・住所・振込先 | `src/site.ts` の `SITE` |
| 商品名・価格・説明 | `src/site.ts` の `PRODUCTS` |
| お知らせ | `src/content/news/*.md` |
| 写真 | `src/assets/photos/`（同じファイル名で差し替えれば反映） |

> 写真はすべてAIで生成したイメージです。実際の商品・ハウスの写真が撮れたら、同じファイル名で差し替えてください。

## ページ構成

| URL | 内容 |
| --- | --- |
| `/` | トップ |
| `/about/` | 農園紹介 |
| `/taste/` | おいしさの秘密 |
| `/products/` | 商品・価格 |
| `/access/` | 地図・アクセス |
| `/order/` | ご注文・ご予約（フォーム） |
| `/news/` | お知らせ一覧・各記事 |

### ご注文フォームについて
サイトのご注文フォーム（`/order/`）の内容は、Worker の `/api/contact`（`worker/contact.ts`）が受け取り、Cloudflare のメール送信（Email Routing の `send_email`）で自分たちのアドレスに届きます。外部サービスは使っていません。

- 送信元：`noreply@15ichie.net`（返信先はお客様が入力したメールアドレス）
- 送り先：Cloudflare の **Secret `CONTACT_TO`**（カンマ区切りで複数可）。公開リポジトリなので、アドレスはコードや `wrangler.jsonc` に書かない
  - 変更：Cloudflare ダッシュボード → Workers & Pages → `15ichie` → Settings → Variables and Secrets、または `npx wrangler secret put CONTACT_TO`
- 送り先は Email Routing の **Destination addresses で「確認済み」** のアドレスだけ（Workers 無料プランの条件）。新しいアドレスを足すときは、先にそこで追加・確認する
- 入力チェック・同じサイト以外からの送信の拒否・スパム対策の隠し欄（`website`）は Worker 側で行う

### 旧URLからの転送
旧 WordPress の `/?page_id=31` や `/?p=1144` は、`worker/redirects.ts` で新しいURLへ 301 転送します。

## 開発

ローカルでご注文フォームを試すときは `.dev.vars.example` を `.dev.vars` にコピーしてください（`wrangler dev` はメールを実際には送らず、内容をコンソールと `.wrangler/tmp/email/` に出します）。

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に出力
npx wrangler dev # Cloudflare と同じ環境で確認（旧URL転送・/api も動く）
npm run typecheck # Worker（worker/*.ts）の型チェック
npm run types     # wrangler.jsonc を変えたら型定義を作り直す
```

## Cloudflare への公開と移行手順（初回のみ）

1. Cloudflare ダッシュボード → **Workers & Pages → Create → Import a repository** → `15ichie` を選択
   - Build command：`npx astro build`
   - Deploy command：`npx wrangler deploy`（`wrangler.jsonc` 設定済み）
2. 発行された `*.workers.dev` のURLで表示を確認
3. Cloudflare に `15ichie.net` を追加（**Add a domain**・Freeプラン）
   - 既存のDNSレコードが自動で読み込まれるので、**メール関係（MX・TXT）があれば残す**
4. ムームードメインのコントロールパネル → ドメイン操作 → **ネームサーバ設定変更** →「GMOペパボ以外のネームサーバを使用する」で、Cloudflare が指定する2つのネームサーバを入力
5. Cloudflare 側で「Active」になったら、Worker の **Settings → Domains & Routes → Add → Custom domain** で `15ichie.net` と `www.15ichie.net` を追加
   - 既存の `@` / `www` の A / CNAME レコード（ロリポップ向け）は、追加時に置き換えを求められたら置き換える
6. https://15ichie.net で新サイトが出ることを確認してから、ロリポップの契約を解約
   - ドメイン自体は引き続きムームードメインで更新します
