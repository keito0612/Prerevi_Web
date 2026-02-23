# プレリビ (PreRebi)

都道府県の町のレビューを投稿・閲覧できる Web アプリケーション

## アプリ概要

プレリビは、日本全国の都道府県や市区町村に対してレビューを投稿・閲覧できるサービスです。

## このプロダクトを作った理由

その地域のことを詳しく知らないまま引越し、住んでから後悔するケースは少なくありません。そうした背景から「実際に住んでいる人の生の声」を知りたいというニーズが高まっていますが、これまでは以下の課題がありました。

- 不動産サイト： レビューが物件単位で、地域全体の情報が少ない

- 口コミサイト： 観光客目線の投稿が多く、「生活者」視点の情報が不足

- SNS： 情報が断片的で、体系的な比較検討が難しい

- 情報の偏り： 良い面ばかりが強調され、短所や注意点が見えにくい

プレリビは「住む」という視点に特化し、治安・交通・子育てなど生活に直結する項目に加え、地域のメリット・デメリットをありのままに投稿できるプラットフォームです。事前にリアルな情報を得ることで、引越し後の**「こんなはずじゃなかった」というミスマッチを防ぐために作成しました。

### 主な機能

- **レビュー投稿**: 住んだことのある地域についてレビューを投稿
- **5つの評価軸**: 治安、交通利便性、子育て環境、行政サービス、住みやすさの5項目で評価
- **写真投稿**: レビューに写真を添付可能
- **いいね機能**: 参考になったレビューにいいねを付けられる
- **通知機能**: プッシュ通知で新着情報をお届け
- **Google認証**: Googleアカウントで簡単ログイン

## 機能一覧

| 機能 | 説明 | 
|-----|------|
| **ユーザー認証** | | |
| メールアドレス登録 | メールアドレスとパスワードでアカウント作成 | 
| ログイン/ログアウト | Sanctum トークン認証 |
| Google OAuth | Google アカウントでログイン | 
| パスワードリセット | メールによるパスワード再設定 |
| **レビュー機能** | | 
| レビュー投稿 | 都道府県・市区町村に対するレビュー投稿 | 
| 5段階評価 | 治安/交通/子育て/行政/住みやすさの5項目評価 | 
| 写真添付 | レビューに複数枚の写真を添付 | 
| レビュー一覧 | 都道府県・市区町村ごとのレビュー表示 | 
| レビュー編集/削除 | 自分のレビューの編集・削除 | 
| **インタラクション** | | 
| いいね | レビューへのいいね機能 | 
| いいね通知 | いいねされた時の通知 | 
| **プロフィール** | | |
| プロフィール表示 | ユーザー情報の表示 | 
| プロフィール編集 | ニックネーム・アイコン画像の変更 | 
| 投稿履歴 | 自分のレビュー一覧表示 | 
| いいね投稿 |自分のレビューに対して、いいねをされたレビューの一覧 | 
| **通知機能** | | 
| プッシュ通知 | Firebase Cloud Messaging による通知 | 
| 通知設定 | いいね通知の ON/OFF 切り替え | 
| **その他** | | 
| チュートリアル | 初回利用時のガイド表示 | 
| 利用規約 | 利用規約ページ | 
| プライバシーポリシー | プライバシーポリシーページ | 

## 使用技術

### バックエンド
| 技術 | バージョン | 用途 |
|-----|----------|------|
| PHP | 8.3 | プログラミング言語 |
| Laravel | 11 | APIフレームワーク |
| Laravel Sanctum | 4.0 | API認証 |
| Laravel Socialite | 5.23 | OAuth認証 (Google) |

### フロントエンド
| 技術 | バージョン | 用途 |
|-----|----------|------|
| Next.js | 15 | Reactフレームワーク |
| TypeScript | - | 型安全な開発 |
| Tailwind CSS | - | スタイリング |
| SWR | - | データフェッチング |

### インフラ・サービス
| 技術 | 用途 |
|-----|------|
| Docker | コンテナ化 |
| Nginx | リバースプロキシ |
| MySQL 8.0 | 開発用データベース |
| Supabase (PostgreSQL) | 本番データベース |
| Cloudflare R2 | 画像ストレージ |
| Resend | メール送信 |
| Firebase Cloud Messaging | プッシュ通知 |
| Google Cloud Run | 本番デプロイ |



## 環境構築手順

### 前提条件

- Docker / Docker Compose がインストールされていること
- Git がインストールされていること

### リポジトリのクローン

```bash
git clone <repository-url>
cd prerebi_Web
```

### 環境変数ファイルの作成

```bash
# Docker Compose 用
cp .env.example .env

# Laravel 用
cp src/.env.example src/.env

# Next.js 用
cp next/.env.example next/.env.local
```

### 環境変数の設定

`.env` ファイルを編集して必要な値を設定します：

```env
APP_NAME=prerebi
PHPMYADMIN_PASSWORD=password
WEB_PORT=80
```

### Docker コンテナのビルド・起動

```bash
# コンテナをビルド
make build

# コンテナを起動
make up
```

### Laravel の初期設定

```bash
# API コンテナに入る
make api

# アプリケーションキーの生成
php artisan key:generate

# データベースマイグレーション
php artisan migrate

# シンボリックリンクの作成
php artisan storage:link

# (オプション) シードデータの投入
php artisan db:seed
```

### アクセス確認

| サービス | URL |
|---------|-----|
| フロントエンド | http://localhost |
| API | http://localhost/api |
| phpMyAdmin | http://localhost:10000 |
| Mailhog | http://localhost:8025 |

## 開発コマンド

```bash
# 開発環境
make up          # コンテナ起動
make down        # コンテナ停止
make logs        # ログ表示
make api         # API コンテナに入る
make nextjs      # Next.js コンテナに入る
make test        # テスト実行

# 本番環境 (ローカルテスト)
make prod-up     # 本番ビルドで起動
make prod-down   # 停止
make prod-logs   # ログ表示

# 設定確認
make config-dev  # 開発環境の設定表示
make config-prod # 本番環境の設定表示
```

## ディレクトリ構成

```
prerebi_Web/
├── src/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── routes/api.php
│   └── ...
├── next/                   # Next.js フロントエンド
│   ├── app/
│   │   ├── components/
│   │   ├── home/
│   │   └── ...
│   └── ...
├── docker/                 # Docker 設定
│   ├── php/
│   ├── nginx/
│   └── next/
├── docker-compose.yml      # 共通設定
├── docker-compose.dev.yml  # 開発環境
├── docker-compose.prod.yml # 本番環境
└── Makefile
```

## サイトURL

https://pre-re-vi.com/
