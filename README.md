# Next.js Blog App

Next.js (App Router) と Prisma を使用したブログアプリケーションです。記事の作成・編集・削除、カテゴリ管理、検索・フィルター機能などを備えています。

## 目次

- [機能一覧](#機能一覧)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [使い方](#使い方)
- [プロジェクト構成](#プロジェクト構成)
- [API仕様](#api仕様)

## 機能一覧

### 公開ページ

- **トップページ (`/`)**: 投稿記事の一覧表示
- **記事詳細ページ (`/posts/[id]`)**: 個別記事の閲覧
- **Aboutページ (`/about`)**: プロフィール・サイト情報

### 管理画面

- **投稿記事管理 (`/admin/posts`)**
  - 記事一覧の表示
  - テキスト検索（タイトル・本文）
  - カテゴリフィルター
  - 日付範囲フィルター
  - 検索結果件数の表示
  - 記事の削除

- **投稿記事作成 (`/admin/posts/new`)**
  - タイトル、本文、カバー画像URLの入力
  - カテゴリの複数選択

- **投稿記事編集 (`/admin/posts/[id]`)**
  - 記事内容の編集
  - **リアルタイムプレビュー機能**（編集/プレビューのタブ切り替え）
  - HTMLタグのサニタイズ
  - 記事の削除

- **カテゴリ管理 (`/admin/categories`)**
  - カテゴリ一覧の表示
  - **使用状況表示**（各カテゴリに紐づく記事数）
  - 使用中カテゴリの削除時の警告
  - カテゴリの削除

- **カテゴリ作成 (`/admin/categories/new`)**
  - 新規カテゴリの追加

- **カテゴリ編集 (`/admin/categories/[id]`)**
  - カテゴリ名の変更
  - カテゴリの削除

## 🛠 技術スタック

### フロントエンド

- **Next.js 15.5.9** (App Router)
- **React 19.1.0**
- **TypeScript 5.x**
- **Tailwind CSS 4.x**

### バックエンド

- **Prisma 7.2.0** (ORM)
- **SQLite** (開発環境用データベース)
- **Better SQLite3** (Prisma Adapter)

### ライブラリ

- **FontAwesome** (アイコン)
- **Day.js** (日付フォーマット)
- **isomorphic-dompurify** (HTMLサニタイズ)
- **tailwind-merge** (Tailwindクラスの結合)

## セットアップ

### 必要な環境

- Node.js 20.x 以上
- npm または yarn

### インストール手順

1. **リポジトリのクローン**

```bash
git clone <repository-url>
cd next-blog-app
```

2. **依存パッケージのインストール**

```bash
npm install
```

3. **環境変数の設定**

`.env`ファイルをプロジェクトルートに作成:

```env
DATABASE_URL="file:./dev.db"
```

4. **データベースのセットアップ**

```bash
# Prismaスキーマからデータベースを作成
npx prisma db push

# Prisma Clientを生成
npx prisma generate

# 初期データを投入（シードデータ）
npx prisma db seed
```

5. **開発サーバーの起動**

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

## 使い方

### 初期データ

シードデータとして以下が自動的に作成されます:

- カテゴリ: 4件（カテゴリ1〜4）
- 投稿記事: 4件（投稿1〜4）

### 管理画面へのアクセス

- カテゴリ管理: http://localhost:3000/admin/categories
- 投稿記事管理: http://localhost:3000/admin/posts

### データベースのリセット

```bash
# 開発サーバーを停止してから実行
rm prisma/dev.db
npx prisma db push
npx prisma generate
npx prisma db seed
```

### Prisma Studioでデータを確認

```bash
npx prisma studio
```

ブラウザで http://localhost:5555 が開き、GUIでデータベースを確認・編集できます。

## プロジェクト構成

```
next-blog-app/
├── prisma/
│   ├── schema.prisma      # データベーススキーマ
│   └── seed.ts            # シードデータ
├── public/
│   └── images
├── src/
│   ├── app/
│   │   ├── _components/   # 共通コンポーネント
│   │   │   ├── Header.tsx
│   │   │   └── PostSummary.tsx
│   │   ├── _types/        # 型定義
│   │   │   ├── Category.ts
│   │   │   ├── CoverImage.ts
│   │   │   └── Post.ts
│   │   ├── admin/         # 管理画面
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   └── posts/
│   │   │       ├── page.tsx
│   │   │       ├── new/
│   │   │       └── [id]/
│   │   ├── api/           # APIルート
│   │   │   ├── categories/
│   │   │   ├── posts/
│   │   │   └── admin/
│   │   ├── about/
│   │   ├── posts/[id]/
│   │   ├── layout.tsx
│   │   ├── page.tsx       # トップページ
│   │   └── globals.css
│   ├── lib/
│   │   └── prisma.ts      # Prismaクライアント
│   └── generated/
│       └── prisma/        # 生成されたPrisma Client
├── public/
│   └── images/
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔌 API仕様

### カテゴリAPI

| エンドポイント               | メソッド | 説明                                       | リクエストボディ   |
| ---------------------------- | -------- | ------------------------------------------ | ------------------ |
| `/api/categories`            | GET      | カテゴリ一覧を取得（使用中の記事数を含む） | -                  |
| `/api/admin/categories`      | POST     | カテゴリを作成                             | `{ name: string }` |
| `/api/admin/categories/[id]` | PUT      | カテゴリ名を変更                           | `{ name: string }` |
| `/api/admin/categories/[id]` | DELETE   | カテゴリを削除                             | -                  |

### 投稿記事API

| エンドポイント          | メソッド | 説明                   | リクエストボディ                                   |
| ----------------------- | -------- | ---------------------- | -------------------------------------------------- |
| `/api/posts`            | GET      | 投稿記事一覧を取得     | -                                                  |
| `/api/posts/[id]`       | GET      | 投稿記事（単体）を取得 | -                                                  |
| `/api/admin/posts`      | POST     | 投稿記事を作成         | `{ title, content, coverImageURL, categoryIds[] }` |
| `/api/admin/posts/[id]` | PUT      | 投稿記事を更新         | `{ title, content, coverImageURL, categoryIds[] }` |
| `/api/admin/posts/[id]` | DELETE   | 投稿記事を削除         | -                                                  |

### レスポンス例

#### カテゴリ一覧取得 (`GET /api/categories`)

```json
[
  {
    "id": "uuid",
    "name": "カテゴリ1",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "posts": 3
    }
  }
]
```

#### 投稿記事一覧取得 (`GET /api/posts`)

```json
[
  {
    "id": "uuid",
    "title": "投稿1",
    "content": "本文...",
    "coverImageURL": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "categories": [
      {
        "category": {
          "id": "uuid",
          "name": "カテゴリ1"
        }
      }
    ]
  }
]
```

## 追加機能の詳細

### 1. カテゴリ使用状況表示

各カテゴリに紐づいている投稿記事の数を表示。使用中のカテゴリを削除する際は警告メッセージが表示されます。

### 2. 検索・フィルター機能

- テキスト検索（タイトル・本文の部分一致）
- カテゴリでの絞り込み
- 日付範囲での絞り込み
- 検索結果件数の表示

### 3. リアルタイムプレビュー

記事編集画面で「編集」と「プレビュー」をタブで切り替え可能。プレビューモードでは、入力中の内容が実際の表示イメージで確認できます。
