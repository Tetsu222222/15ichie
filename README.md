# 石黒いちご農園 いちごいちえ 公式サイト

https://15ichie.net のソースです。[Astro](https://astro.build) で作った静的サイトを **Cloudflare（無料プラン）** で配信します。
（旧：ロリポップ上の WordPress）

## お知らせの更新方法

### A. AI（ChatGPT Codex / Claude など）に頼む（おすすめ）
1. このリポジトリ（`15ichie`）を選んで、次のように頼む

   > お知らせを追加してください。
   > 日付：2026年12月5日
   > タイトル：2026年12月の販売開始のお知らせ
   > 内容：販売所は12月12日（土）10時からオープンします。……

2. できたプルリクエストを GitHub で確認して **Merge** → 1〜2分でサイトに反映

書き方のルールは [AGENTS.md](./AGENTS.md) にあります。

### B. GitHub の画面から直接書く
1. GitHub で `src/content/news/` を開き **Add file → Create new file**
2. ファイル名を `2026-12-05-season-start.md` のようにし、既存のファイルをまねて書く
3. **Commit changes** → 自動で公開

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
サイトのフォームから送られた注文は、Googleフォーム「ご注文フォーム」に回答として届きます（スプレッドシートで一覧、メール通知あり）。
Googleフォームの質問を追加・変更したときは、`src/site.ts` の `orderForm.entries` の番号（entry.○○）も直してください（Googleフォームの「事前入力した URL を取得」で確認できます）。

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
