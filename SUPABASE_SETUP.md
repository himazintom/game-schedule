# Supabase設定手順

このガイドでは、ゲーム開発スケジュール管理システムでSupabaseを使用するための設定手順を説明します。

## 1. Supabaseプロジェクト作成

### 1.1 アカウント作成
1. [Supabase](https://supabase.com)にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ

### 1.2 新規プロジェクト作成
1. 「New Project」をクリック
2. プロジェクト情報を入力:
   - **Name**: `game-schedule` (任意)
   - **Database Password**: 強力なパスワードを生成・保存
   - **Region**: `Northeast Asia (Tokyo)` (推奨)
3. 「Create new project」をクリック
4. プロジェクト作成完了まで2-3分待機

## 2. データベース設定

### 2.1 SQLエディタでスキーマ作成
1. Supabaseダッシュボードで「SQL Editor」を開く
2. 「New query」をクリック
3. `/supabase/schema.sql`の内容をコピー&ペースト
4. 「Run」をクリックしてスキーマを実行

### 2.2 設定確認
1. 「Table Editor」で以下のテーブルが作成されていることを確認:
   - `projects`
   - `tasks`
2. サンプルデータが挿入されていることを確認

## 3. 環境変数設定

### 3.1 API キー取得
1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の値をコピー:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJxxx...` (長いJWTトークン)

### 3.2 環境変数ファイル作成
1. プロジェクトルートに`.env.local`ファイルを作成:
```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# アプリケーション設定
NEXT_PUBLIC_APP_NAME="ゲーム開発スケジュール管理"
```

⚠️ **重要**: `.env.local`は`.gitignore`に追加され、GitHubにプッシュされません

## 4. Vercelデプロイ設定

### 4.1 環境変数をVercelに設定
1. [Vercel Dashboard](https://vercel.com/dashboard)を開く
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」
4. 以下の環境変数を追加:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
```

### 4.2 再デプロイ
1. 「Deployments」タブ
2. 最新デプロイの「...」→「Redeploy」

## 5. 機能確認

### 5.1 データベース連携確認
1. アプリケーションにアクセス
2. 管理者モードでプロジェクト作成
3. Supabaseダッシュボードの「Table Editor」でデータが保存されていることを確認

### 5.2 共有機能確認
1. 共有IDを生成
2. 別のブラウザ/デバイスで共有URLにアクセス
3. リアルタイム更新動作確認

## 6. トラブルシューティング

### 6.1 接続エラー
- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトがアクティブか確認
- コンソールエラーを確認

### 6.2 データが表示されない
- RLS (Row Level Security) ポリシーが正しく設定されているか確認
- ネットワーク接続を確認

### 6.3 LocalStorageフォールバック
- Supabase接続に失敗した場合、自動的にLocalStorageを使用
- 設定確認後、手動でデータをマイグレーション可能

## 7. セキュリティ考慮事項

### 7.1 RLS設定
- プロジェクトとタスクにRow Level Securityが有効
- 公開プロジェクトは読み取り専用アクセス
- 管理者操作は一時的に全許可（将来改善予定）

### 7.2 APIキー管理
- `anon`キーは公開用（フロントエンドで使用安全）
- `service_role`キーは絶対にフロントエンドで使用しない

## 8. 今後の拡張

### 8.1 ユーザー認証
- Supabase Authによる本格的なユーザー管理
- プロジェクト所有権の厳密な管理

### 8.2 リアルタイム機能
- 複数ユーザー間でのリアルタイム同期
- タスク変更通知

### 8.3 ファイルストレージ
- Supabase Storageでの画像・ファイル管理

---

## サポート

問題が発生した場合:
1. [Supabase Documentation](https://supabase.com/docs)
2. [Next.js Documentation](https://nextjs.org/docs)
3. このプロジェクトのGitHub Issues