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
- 仕組み：フォームの回答 →「公開用」シート（タイムスタンプ・タイトル・本文だけを式で表示。合言葉は出さない）→「ウェブに公開」したCSV → サイトの `/api/news`（`worker/index.js`）。CSVのURLは `wrangler.jsonc` の `NEWS_CSV_URL`
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
初期設定では、フォームの「送信」を押すと **入力内容入りのメールが作成され、お客様のメールアプリから bsgarden@docomo.ne.jp に送られる** 方式です（サーバー不要）。
Googleフォームで受け付けたい場合は、Googleフォームを作って `src/site.ts` の `orderForm` に送信先と `entry.○○` 番号を設定してください。

### 旧URLからの転送
旧 WordPress の `/?page_id=31` や `/?p=1144` は、`worker/index.js` で新しいURLへ 301 転送します。

## 開発

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に出力
npx wrangler dev # Cloudflare と同じ環境で確認（旧URL転送も動く）
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
