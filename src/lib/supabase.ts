import { createClient } from '@supabase/supabase-js';

// 環境変数から設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase設定が不完全です。LocalStorageモードで動作します。');
}

// Supabaseクライアントを作成
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// データベーステーブル型定義
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string | null;
          share_id: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id?: string | null;
          share_id?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          owner_id?: string | null;
          share_id?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          deadline: string;
          progress: number;
          priority: 'high' | 'medium' | 'low';
          category: '企画' | 'グラフィック' | 'プログラミング' | 'サウンド' | 'その他';
          status: '未着手' | '進行中' | '完了';
          notes: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          deadline: string;
          progress?: number;
          priority?: 'high' | 'medium' | 'low';
          category?: '企画' | 'グラフィック' | 'プログラミング' | 'サウンド' | 'その他';
          status?: '未着手' | '進行中' | '完了';
          notes?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          deadline?: string;
          progress?: number;
          priority?: 'high' | 'medium' | 'low';
          category?: '企画' | 'グラフィック' | 'プログラミング' | 'サウンド' | 'その他';
          status?: '未着手' | '進行中' | '完了';
          notes?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Supabaseが利用可能かチェック
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// LocalStorageフォールバック用のストレージキー
export const FALLBACK_STORAGE_KEYS = {
  PROJECT: 'game-schedule-project-fallback',
  SETTINGS: 'game-schedule-settings-fallback',
  ADMIN_PASSWORD: 'game-schedule-admin-password-fallback',
} as const;