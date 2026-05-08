# 15 Ichie 静的サイト（Astro + microCMS + Netlify）

## 概要
WordPressサイトをベースに、Astroで静的サイトとして再構築した構成です。デザインは白基調に「いちご赤・淡いピンク・葉のグリーン」をアクセントとして使用しています。

## ローカル起動
1. Node.js 20以上を用意
2. 依存関係をインストール
   ```bash
   npm install
   ```
3. `.env.example` を `.env` にコピーして値を設定
4. 開発サーバー起動
   ```bash
   npm run dev
   ```

## ビルド
```bash
npm run build
```
出力先は `dist` です（静的出力）。

## Netlifyデプロイ

## テスト公開向けの安全設定（おすすめ）
- デフォルトで `PUBLIC_SITE_NOINDEX=true` とし、検索エンジンにインデックスされない設定
- `netlify.toml` で全体は noindex、`production` コンテキストのみ `false` に上書き
- まだ公開しないテストサイト運用に向いた初期値です

- Build command: `npm run build`
- Publish directory: `dist`
- GitHub連携で push 時に自動デプロイ
- `netlify.toml` に同設定を記載済み

## microCMS設定
### 1) API作成
- サービスを作成し、API名を `news`（変更する場合は `MICROCMS_NEWS_ENDPOINT` と一致）
- APIタイプ: リスト形式

### 2) フィールド設計
- `title`: テキスト（必須）
- `slug`: テキスト（必須）
- `publishedAt`: 日時
- `body`: リッチエディタ
- `eyecatch`: 画像
- `description`: テキストエリア
- `isPublished`: 真偽値

### 3) 環境変数
Netlify / ローカルに以下を設定します。
- `MICROCMS_SERVICE_DOMAIN`
- `MICROCMS_API_KEY`
- `MICROCMS_NEWS_ENDPOINT`（通常 `news`）

### 4) 公開制御
- 本番ビルド時は `isPublished=true` の記事のみ表示
- 記事が0件でも一覧・トップともに崩れない実装
- 取得失敗時はビルドでエラーを出し原因が分かるように実装

### 5) Build Hook連携
1. Netlifyで Build hook を作成
2. microCMSのWebhook設定で「コンテンツ公開/更新」をトリガーに Build hook URL を登録
3. 記事更新時にNetlify再ビルドされ、静的HTMLが更新される

## 独自ドメイン設定（ムームードメイン + Cloudflare + Netlify）
1. Netlifyで独自ドメインを追加
2. Cloudflare DNSでWeb用レコード（`@` / `www` など）をNetlify指定先へ向ける
3. 反映後、NetlifyでHTTPS証明書を確認

### メール運用の注意
- MX/SPF/DKIM/DMARC のメール用レコードは変更しない
- Web用レコードのみ変更対象にする

## ページ構成
- `/` トップ
- `/about/` 農園紹介
- `/taste/` おいしさの秘密
- `/products/` 商品情報
- `/access/` 地図・アクセス
- `/news/` 新着情報一覧
- `/news/[slug]/` 新着情報詳細
