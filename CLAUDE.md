# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

プレリビ is a Japanese prefecture/city review web application where users can post and browse reviews about different locations. The app consists of a Laravel API backend and a Next.js frontend, running in Docker containers.

## 環境構成

Docker Compose の複数ファイルマージ方式を採用:
- `docker-compose.yml` - 共通設定
- `docker-compose.dev.yml` - 開発環境用
- `docker-compose.prod.yml` - 本番環境用

## Development Commands

### Docker Operations (from project root)

**開発環境 (デフォルト)**
```bash
make build          # Build containers and copy node_modules
make up             # Start containers (dev)
make down           # Stop containers
make logs           # View all logs
```

**本番環境 (ローカルテスト)**
```bash
make prod-build     # Build production containers
make prod-up        # Start production containers
make prod-down      # Stop production containers
make prod-logs      # View production logs
```

**設定確認**
```bash
make config-dev     # 開発環境の設定を表示
make config-prod    # 本番環境の設定を表示
```

### Container Access
```bash
make api            # Enter the API (Laravel) container
make nextjs         # Enter the Next.js container
make test           # Run Laravel tests (PHPUnit)
```

### Container Logs
```bash
make wlog           # View nginx logs
make alog           # View API logs
make nlog           # View Next.js logs
```

### Inside the API Container (Laravel)
```bash
php artisan test                    # Run all tests
php artisan test --filter=TestName  # Run specific test
php artisan migrate                 # Run database migrations
php artisan db:seed                 # Seed database
```

### Inside the Next.js Container
```bash
npm run dev         # Start development server (runs automatically)
npm run build       # Build for production
npm run lint        # Run ESLint
```

### Code Formatting (from project root)
```bash
npx prettier --write "src/app/**/*.php"   # Format PHP files
```
Note: Prettier runs automatically on pre-commit for `src/app/` and `src/config/` PHP files via lint-staged.

## Architecture

### Backend (Laravel API)
- **Location**: `src/` directory contains the Laravel 11 application
- **API Routes**: `src/routes/api.php` - RESTful API endpoints
- **Controllers**: `src/app/Http/Controllers/` - ReviewController, ProfileController, NotificationController, etc.
- **Models**: `src/app/Models/` - User, Review, Rating, City, Prefecture, Photo, Like, UserSetting
- **Authentication**: Laravel Sanctum for API token authentication

### Frontend (Next.js 15)
- **Location**: `next/` directory contains the Next.js application with App Router
- **Pages**: `next/app/` - Uses App Router with file-based routing
- **Components**: `next/app/components/` - Reusable UI components
- **Types**: `next/types.ts` - TypeScript interfaces for Review, User, Rating, etc.
- **API Services**: `next/service/authServise.ts` - Authentication service
- **Data Fetching**: `next/lib/fetcher.ts` - SWR fetcher with auth headers

### Key Data Flow
- Frontend calls Laravel API at localhost (dev) via Sanctum tokens
- API URL configured in `next/Util/Util_api.ts`
- Reviews include ratings (safety, transportation, child_rearing, city_policies, livability)

## Testing

Tests use SQLite in-memory database (configured in `src/phpunit.xml`). Run tests via:
```bash
make test
# or inside api container:
php artisan test
```

## 環境設定

### 開発環境 vs 本番環境

| 設定項目 | 開発環境 | 本番環境 |
|---------|---------|---------|
| Database | SQLite (ローカル) | Turso (libSQL) |
| Storage | public (ローカル) | Cloudflare R2 |
| Mail | Mailhog | Resend |
| Frontend | Docker (localhost) | Cloudflare Workers |
| API | Docker (localhost) | Google Cloud Run |

### 環境変数ファイル構成
```
.env                      # Docker Compose 用 (開発)

src/
├── .env                  # Laravel 開発用
├── .env.example          # Laravel 開発用テンプレート
├── .env.production       # Laravel 本番用 (※gitignore)
└── .env.production.example # Laravel 本番用テンプレート

next/
├── .env.local            # Next.js 開発用
├── .env.example          # Next.js 開発用テンプレート
└── .env.production.example # Next.js 本番用テンプレート
```

### Docker サービス構成

**開発環境 (docker-compose.dev.yml)**
- api: PHP/Laravel (port 8000) + ホットリロード + SQLite
- next: Next.js (port 3000) + ホットリロード
- web: Nginx reverse proxy (port 80)
- mailhog: メールテスト (port 8025)

**本番環境 (docker-compose.prod.yml)**
- api: PHP-FPM + Nginx (port 8080)
- next: Next.js standalone (port 8080)
- web: Nginx reverse proxy (port 80)

## Cloud Run デプロイ

### ビルド・デプロイ
```bash
# API
gcloud builds submit --config cloudbuild-api.yaml

# Next.js
gcloud builds submit --config cloudbuild-next.yaml \
  --substitutions=_NEXT_PUBLIC_API_URL="https://your-api.run.app"
```

### 本番用 Docker 設定
- `docker/php/Dockerfile.prod` - Laravel API (PHP-FPM + Nginx)
- `docker/next/Dockerfile.prod` - Next.js (standalone)
- `docker/nginx/Dockerfile.prod` - Nginx (ローカルテスト用)

### 外部サービス (本番)
- **Database**: Turso (libSQL)
- **Frontend**: Cloudflare Workers
- **API**: Google Cloud Run
- **Storage**: Cloudflare R2
- **Email**: Resend
- **Auth**: Google OAuth
- **Push通知**: Firebase Cloud Messaging
