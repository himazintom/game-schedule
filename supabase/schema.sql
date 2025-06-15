-- ゲーム開発スケジュール管理システム - データベーススキーマ

-- プロジェクトテーブル
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id VARCHAR(255), -- LocalStorageからの移行用、将来的にはユーザー認証と連携
  share_id VARCHAR(50) UNIQUE, -- 共有用ランダムID
  is_public BOOLEAN DEFAULT FALSE, -- 公開設定
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- タスクテーブル
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  category VARCHAR(20) CHECK (category IN ('企画', 'グラフィック', 'プログラミング', 'サウンド', 'その他')) DEFAULT 'その他',
  status VARCHAR(10) CHECK (status IN ('未着手', '進行中', '完了')) DEFAULT '未着手',
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 自動更新トリガー用の関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- プロジェクトの更新時間自動更新トリガー
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- タスクの更新時間自動更新トリガー
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- タスク変更時にプロジェクトの更新時間も更新
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects 
  SET updated_at = NOW() 
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_on_task_change
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_timestamp();

-- Row Level Security (RLS) 設定
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 公開プロジェクトは誰でも読み取り可能
CREATE POLICY "公開プロジェクト読み取り" ON projects
  FOR SELECT USING (is_public = true);

-- 公開プロジェクトのタスクは誰でも読み取り可能
CREATE POLICY "公開プロジェクトタスク読み取り" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.is_public = true
    )
  );

-- 共有IDを持つプロジェクトは読み取り可能
CREATE POLICY "共有プロジェクト読み取り" ON projects
  FOR SELECT USING (share_id IS NOT NULL);

-- 共有IDを持つプロジェクトのタスクは読み取り可能
CREATE POLICY "共有プロジェクトタスク読み取り" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.share_id IS NOT NULL
    )
  );

-- 全てのプロジェクト操作を許可（一時的：将来は認証ベース）
CREATE POLICY "プロジェクト全操作許可" ON projects
  FOR ALL USING (true) WITH CHECK (true);

-- 全てのタスク操作を許可（一時的：将来は認証ベース）
CREATE POLICY "タスク全操作許可" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- インデックス作成
CREATE INDEX idx_projects_share_id ON projects(share_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- サンプルデータ挿入（開発用）
INSERT INTO projects (name, description, share_id, is_public) VALUES 
('サンプルゲームプロジェクト', 'デモ用のサンプルプロジェクトです', 'demo123', true);

INSERT INTO tasks (project_id, title, description, deadline, priority, category, status, progress) 
SELECT 
  p.id,
  'ゲームデザイン設計',
  'コアゲームプレイの設計と仕様書作成',
  NOW() + INTERVAL '7 days',
  'high',
  '企画',
  '進行中',
  60
FROM projects p WHERE p.share_id = 'demo123';