import { Project } from '@/types';
import { supabase, isSupabaseAvailable, FALLBACK_STORAGE_KEYS } from './supabase';
import { StorageManager } from './storage';

export class DatabaseManager {
  // プロジェクト管理
  static async saveProject(project: Project): Promise<void> {
    if (!isSupabaseAvailable()) {
      // フォールバックとしてLocalStorageを使用
      return StorageManager.saveProject(project);
    }

    try {
      // プロジェクトを保存
      const { error: projectError } = await supabase!
        .from('projects')
        .upsert({
          id: project.id,
          name: project.name,
          share_id: project.shareId || null,
          owner_id: this.getOwnerId(),
          is_public: !!project.shareId,
          updated_at: project.updatedAt.toISOString(),
        });

      if (projectError) throw projectError;

      // 既存のタスクを削除してから新しいタスクを挿入
      const { error: deleteError } = await supabase!
        .from('tasks')
        .delete()
        .eq('project_id', project.id);

      if (deleteError) throw deleteError;

      // タスクを保存
      if (project.tasks.length > 0) {
        const tasksToInsert = project.tasks.map(task => ({
          id: task.id,
          project_id: project.id,
          title: task.title,
          description: task.description,
          deadline: task.deadline.toISOString(),
          progress: task.progress,
          priority: task.priority,
          category: task.category,
          status: task.status,
          notes: task.notes || null,
          image_url: task.imageUrl || null,
          created_at: task.createdAt.toISOString(),
          updated_at: task.updatedAt.toISOString(),
        }));

        const { error: tasksError } = await supabase!
          .from('tasks')
          .insert(tasksToInsert);

        if (tasksError) throw tasksError;
      }

      // フォールバックとしてLocalStorageにも保存
      StorageManager.saveProject(project);
    } catch (error) {
      console.error('Supabaseプロジェクト保存エラー:', error);
      // エラー時はLocalStorageにフォールバック
      StorageManager.saveProject(project);
    }
  }

  static async loadProject(): Promise<Project | null> {
    if (!isSupabaseAvailable()) {
      return StorageManager.loadProject();
    }

    try {
      const ownerId = this.getOwnerId();
      
      // オーナーIDに基づいてプロジェクトを取得
      const { data: projects, error: projectError } = await supabase!
        .from('projects')
        .select('*')
        .eq('owner_id', ownerId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (projectError) throw projectError;

      if (!projects || projects.length === 0) {
        // Supabaseにプロジェクトがない場合、LocalStorageから読み込み
        return StorageManager.loadProject();
      }

      const projectData = projects[0];

      // タスクを取得
      const { data: tasks, error: tasksError } = await supabase!
        .from('tasks')
        .select('*')
        .eq('project_id', projectData.id)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      // Project型に変換
      const project: Project = {
        id: projectData.id,
        name: projectData.name,
        shareId: projectData.share_id || undefined,
        createdAt: new Date(projectData.created_at),
        updatedAt: new Date(projectData.updated_at),
        tasks: (tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          deadline: new Date(task.deadline),
          progress: task.progress,
          priority: task.priority,
          category: task.category,
          status: task.status,
          notes: task.notes || undefined,
          imageUrl: task.image_url || undefined,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
        })),
      };

      // フォールバックとしてLocalStorageにも保存
      StorageManager.saveProject(project);

      return project;
    } catch (error) {
      console.error('Supabaseプロジェクト読み込みエラー:', error);
      // エラー時はLocalStorageから読み込み
      return StorageManager.loadProject();
    }
  }

  static async loadProjectByShareId(shareId: string): Promise<Project | null> {
    if (!isSupabaseAvailable()) {
      // LocalStorageからフォールバック読み込み
      const project = StorageManager.loadProject();
      return project?.shareId === shareId ? project : null;
    }

    try {
      // 共有IDでプロジェクトを取得
      const { data: projects, error: projectError } = await supabase!
        .from('projects')
        .select('*')
        .eq('share_id', shareId)
        .limit(1);

      if (projectError) throw projectError;

      if (!projects || projects.length === 0) {
        return null;
      }

      const projectData = projects[0];

      // タスクを取得
      const { data: tasks, error: tasksError } = await supabase!
        .from('tasks')
        .select('*')
        .eq('project_id', projectData.id)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      // Project型に変換
      return {
        id: projectData.id,
        name: projectData.name,
        shareId: projectData.share_id || undefined,
        createdAt: new Date(projectData.created_at),
        updatedAt: new Date(projectData.updated_at),
        tasks: (tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          deadline: new Date(task.deadline),
          progress: task.progress,
          priority: task.priority,
          category: task.category,
          status: task.status,
          notes: task.notes || undefined,
          imageUrl: task.image_url || undefined,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
        })),
      };
    } catch (error) {
      console.error('共有プロジェクト読み込みエラー:', error);
      return null;
    }
  }

  // リアルタイム更新のサブスクリプション
  static subscribeToProject(projectId: string, callback: (project: Project) => void) {
    if (!isSupabaseAvailable()) {
      return null;
    }

    const channel = supabase!
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        async () => {
          // プロジェクトが更新されたときに最新データを取得
          const project = await this.loadProject();
          if (project) {
            callback(project);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          // タスクが更新されたときに最新データを取得
          const project = await this.loadProject();
          if (project) {
            callback(project);
          }
        }
      )
      .subscribe();

    return channel;
  }

  // ユーティリティメソッド
  static generateShareId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static getOwnerId(): string {
    // LocalStorageベースの一意ID（将来的にはユーザー認証に置き換え）
    if (typeof window === 'undefined') return 'server';
    
    let ownerId = localStorage.getItem('game-schedule-owner-id');
    if (!ownerId) {
      ownerId = `owner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('game-schedule-owner-id', ownerId);
    }
    return ownerId;
  }

  // LocalStorageからSupabaseへのマイグレーション
  static async migrateFromLocalStorage(): Promise<void> {
    if (!isSupabaseAvailable()) {
      return;
    }

    try {
      const localProject = StorageManager.loadProject();
      if (localProject) {
        await this.saveProject(localProject);
        console.log('LocalStorageからSupabaseへのマイグレーションが完了しました');
      }
    } catch (error) {
      console.error('マイグレーションエラー:', error);
    }
  }

  // 設定管理
  static saveSettings(settings: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(FALLBACK_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('設定保存エラー:', error);
    }
  }

  static loadSettings(): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(FALLBACK_STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('設定読み込みエラー:', error);
      return null;
    }
  }

  // 管理者パスワード管理
  static setAdminPassword(password: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(FALLBACK_STORAGE_KEYS.ADMIN_PASSWORD, password);
    } catch (error) {
      console.error('管理者パスワード保存エラー:', error);
    }
  }

  static getAdminPassword(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(FALLBACK_STORAGE_KEYS.ADMIN_PASSWORD);
    } catch (error) {
      console.error('管理者パスワード取得エラー:', error);
      return null;
    }
  }

  // エクスポート・インポート
  static async exportProject(): Promise<string> {
    const project = await this.loadProject();
    if (!project) {
      throw new Error('エクスポートするプロジェクトがありません');
    }
    return JSON.stringify(project, null, 2);
  }

  static async importProject(jsonData: string): Promise<Project> {
    try {
      const parsed = JSON.parse(jsonData);
      const project: Project = {
        ...parsed,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tasks: parsed.tasks.map((task: any) => ({
          ...task,
          deadline: new Date(task.deadline),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })),
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      };
      await this.saveProject(project);
      return project;
    } catch {
      throw new Error('無効なプロジェクトデータです');
    }
  }

  // データクリア
  static async clearAll(): Promise<void> {
    if (isSupabaseAvailable()) {
      try {
        const ownerId = this.getOwnerId();
        
        // Supabaseからオーナーのデータを削除
        const { error } = await supabase!
          .from('projects')
          .delete()
          .eq('owner_id', ownerId);

        if (error) throw error;
      } catch (error) {
        console.error('Supabaseデータ削除エラー:', error);
      }
    }

    // LocalStorageもクリア
    if (typeof window !== 'undefined') {
      Object.values(FALLBACK_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      localStorage.removeItem('game-schedule-owner-id');
    }
  }
}