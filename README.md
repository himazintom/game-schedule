# ゲーム開発スケジュール管理システム

ゲーム開発プロジェクト向けの包括的なスケジュール管理Webアプリケーションです。

## 🎮 主な機能

### タスク管理
- ✅ タスクの作成・編集・削除
- 📊 進捗率管理（0-100%）
- 🎯 優先度設定（高・中・低）
- 📂 カテゴリ分類（企画・グラフィック・プログラミング・サウンド・その他）
- 📝 メモ・画像URL添付

### 締切管理
- 📅 締切日設定
- ⚠️ 期限切れタスクの視覚的強調
- 🔔 リアルタイム締切カウントダウン

### アクセス制御
- 👤 管理者モード（パスワード認証）
- 🔗 共有URL生成機能
- 👁️ 閲覧専用モード

### データ管理
- 🗄️ Supabase PostgreSQLデータベース
- 💾 LocalStorageフォールバック対応
- 📤 JSON形式でのエクスポート/インポート
- 🔄 リアルタイム同期・マルチユーザー対応

## 🚀 デモ

[Live Demo](https://your-vercel-url.vercel.app)

## 📱 使用方法

### 管理者モード
1. トップページから「管理者モード」をクリック
2. デフォルトパスワード: `admin123`
3. プロジェクトを作成してタスク管理を開始

### 共有機能
1. 管理者モードで「共有IDを生成」をクリック
2. 生成されたIDを他のメンバーに共有
3. トップページで共有IDを入力して閲覧

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **データベース**: Supabase (PostgreSQL)
- **リアルタイム**: Supabase Realtime
- **日付処理**: date-fns
- **フォールバック**: LocalStorage

## 🔧 開発環境での実行

1. リポジトリをクローン
\`\`\`bash
git clone [repository-url]
cd game-schedule
\`\`\`

2. 依存関係をインストール
\`\`\`bash
npm install
\`\`\`

3. 環境変数を設定
\`\`\`bash
cp .env.local.example .env.local
# .env.localにSupabase設定を追加
\`\`\`

4. 開発サーバーを起動
\`\`\`bash
npm run dev
\`\`\`

5. ブラウザで http://localhost:3000 を開く

📋 **Supabase設定**: 詳細は [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) を参照

## 📦 ビルド

\`\`\`bash
npm run build
npm start
\`\`\`

## 🚀 Vercelでのデプロイ

1. GitHubリポジトリと連携
2. Vercelダッシュボードで「New Project」
3. 自動ビルド・デプロイが実行されます

## 📄 ライセンス

MIT License

## 🤖 開発者

Generated with [Claude Code](https://claude.ai/code)