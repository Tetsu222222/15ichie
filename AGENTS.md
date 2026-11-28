# AGENTS.md — AI（ChatGPT / Codex / Claude など）向けの作業ルール

このリポジトリは「石黒いちご農園 いちごいちえ」の公式サイト（https://15ichie.net）です。
Astro で作った静的サイトで、`main` ブランチに入った変更は Cloudflare が自動でビルド・公開します。

## よくある依頼：お知らせを追加する

1. `src/content/news/` に新しい Markdown ファイルを作る
   - ファイル名：`YYYY-MM-DD-英数字の短い名前.md`（例：`2026-12-05-season-start.md`）
   - ファイル名がそのまま URL になる（`/news/2026-12-05-season-start/`）。**日本語・スペースは使わない**
2. 先頭に次の形式のフロントマターを書く

```markdown
---
title: "2026年12月の販売開始のお知らせ"
date: 2026-12-05
# summary: "一覧に出す短い説明（省略可）"
# cover: ./images/2026-12-05.jpg   ← 写真があるときだけ
# draft: true                      ← 下書きにしたいときだけ
---

本文をここに書く。改行はそのまま改行として表示される。

## 販売価格（すべて税込）
- デラックス　780円
- グランデ　680円
```

3. 価格・営業時間・定休日が変わったときは、お知らせに加えて `src/site.ts`（`SITE.hours` / `SITE.closed` / `PRODUCTS` の `price`）も直すか、依頼者に確認する
4. `npm run build` が成功することを確認する

### 文章のトーン
- お客様が読む。ていねいでやさしい「です・ます」調（農園主の口調「いつもお世話になります。」で始めることが多い）
- 日付・価格・時間は依頼文の通りに書き、推測で補わない
- **いちご狩りは行っていない**ので、いちご狩り・摘み取りの案内は書かない

## お知らせの仕組み（2種類）
- ふだんのお知らせは Googleフォームから投稿され、`worker/news.ts` の `/api/news` が公開CSV（`wrangler.jsonc` の `NEWS_CSV_URL`）を読んでブラウザ側で一覧に差し込む（`src/scripts/form-news.ts`、個別ページは `/news/post/?id=…`）
- Markdown（`src/content/news/`）は写真付きなど、フォームで書きにくい記事用

## その他のルール
- サイト全体の設定（営業時間・連絡先・振込先・商品と価格）は `src/site.ts`
- ページは `src/pages/`、共通デザインは `src/styles/global.css`（メインカラーはいちご赤 `--berry-*`、葉のグリーン `--leaf-*`）
- Worker は `worker/`（TypeScript）。旧URLの転送 `redirects.ts`、お知らせ `news.ts`、ご注文フォームのメール送信 `contact.ts`
- ご注文フォームの送り先アドレス（Secret `CONTACT_TO`）は、コード・設定ファイル・公開ページに書かない
- 依存パッケージを勝手に追加・更新しない
