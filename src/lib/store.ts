import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AppState, Project, Task, ViewType, NotificationSettings, TaskFormData, Status } from '@/types';
import { DatabaseManager } from './database';
import { isSupabaseAvailable } from './supabase';

interface AppStore extends AppState {
  // Actions
  setProject: (project: Project | null) => void;
  setAdminMode: (isAdmin: boolean) => void;
  setCurrentView: (view: ViewType) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotifications: (settings: NotificationSettings) => void;
  
  // Project actions
  createProject: (name: string) => Promise<void>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  generateShareId: () => Promise<void>;
  loadProjectByShareId: (shareId: string) => Promise<Project | null>;
  
  // Task actions
  addTask: (taskData: TaskFormData) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskProgress: (taskId: string, progress: number) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Status) => Promise<void>;
  
  // Utility actions
  loadFromDatabase: () => Promise<void>;
  migrateFromLocalStorage: () => Promise<void>;
  exportProject: () => Promise<string>;
  importProject: (jsonData: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Real-time subscription
  subscribeToProject: () => void;
  unsubscribeFromProject: () => void;
  
  // Internal state
  realtimeChannel: unknown;
}

const defaultNotifications: NotificationSettings = {
  enabled: true,
  threeDaysBefore: true,
  oneDayBefore: true,
  onDeadline: true,
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    project: null,
    isAdminMode: false,
    currentView: 'dashboard',
    notifications: defaultNotifications,
    theme: 'light',
    realtimeChannel: null,

    // Actions
    setProject: (project) => {
      set({ project });
      if (project) {
        DatabaseManager.saveProject(project);
      }
    },

    setAdminMode: (isAdmin) => set({ isAdminMode: isAdmin }),
    
    setCurrentView: (view) => set({ currentView: view }),
    
    setTheme: (theme) => set({ theme }),
    
    setNotifications: (notifications) => {
      set({ notifications });
      DatabaseManager.saveSettings({ notifications });
    },

    createProject: async (name) => {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        tasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set({ project: newProject });
      await DatabaseManager.saveProject(newProject);
      get().subscribeToProject();
    },

    updateProject: async (updates) => {
      const { project } = get();
      if (project) {
        const updatedProject = {
          ...project,
          ...updates,
          updatedAt: new Date(),
        };
        set({ project: updatedProject });
        await DatabaseManager.saveProject(updatedProject);
      }
    },

    generateShareId: async () => {
      const { project } = get();
      if (project) {
        const shareId = DatabaseManager.generateShareId();
        await get().updateProject({ shareId });
      }
    },

    loadProjectByShareId: async (shareId: string) => {
      try {
        const project = await DatabaseManager.loadProjectByShareId(shareId);
        if (project) {
          set({ project });
          get().subscribeToProject();
        }
        return project;
      } catch (error) {
        console.error('共有プロジェクト読み込みエラー:', error);
        return null;
      }
    },

    addTask: async (taskData) => {
      const { project } = get();
      if (project) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskData.title,
          description: taskData.description,
          deadline: new Date(taskData.deadline),
          progress: 0,
          priority: taskData.priority,
          category: taskData.category,
          status: '未着手',
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: taskData.notes,
          imageUrl: taskData.imageUrl,
        };

        const updatedProject = {
          ...project,
          tasks: [...project.tasks, newTask],
          updatedAt: new Date(),
        };
        set({ project: updatedProject });
        await DatabaseManager.saveProject(updatedProject);
      }
    },

    updateTask: async (taskId, updates) => {
      const { project } = get();
      if (project) {
        const updatedTasks = project.tasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        );

        const updatedProject = {
          ...project,
          tasks: updatedTasks,
          updatedAt: new Date(),
        };
        set({ project: updatedProject });
        await DatabaseManager.saveProject(updatedProject);
      }
    },

    deleteTask: async (taskId) => {
      const { project } = get();
      if (project) {
        const updatedTasks = project.tasks.filter(task => task.id !== taskId);
        const updatedProject = {
          ...project,
          tasks: updatedTasks,
          updatedAt: new Date(),
        };
        set({ project: updatedProject });
        await DatabaseManager.saveProject(updatedProject);
      }
    },

    updateTaskProgress: async (taskId, progress) => {
      await get().updateTask(taskId, { 
        progress: Math.max(0, Math.min(100, progress)),
        status: progress === 100 ? '完了' : progress > 0 ? '進行中' : '未着手'
      });
    },

    updateTaskStatus: async (taskId, status) => {
      const progressMap = {
        '未着手': 0,
        '進行中': 50,
        '完了': 100,
      };
      await get().updateTask(taskId, { 
        status,
        progress: progressMap[status]
      });
    },

    loadFromDatabase: async () => {
      try {
        const project = await DatabaseManager.loadProject();
        const settings = DatabaseManager.loadSettings();
        
        if (project) {
          set({ project });
          get().subscribeToProject();
        }
        
        if (settings?.notifications) {
          set({ notifications: settings.notifications as NotificationSettings });
        }
        
        if (settings?.theme) {
          set({ theme: settings.theme as 'light' | 'dark' });
        }
      } catch (error) {
        console.error('データベース読み込みエラー:', error);
      }
    },

    migrateFromLocalStorage: async () => {
      try {
        await DatabaseManager.migrateFromLocalStorage();
        await get().loadFromDatabase();
      } catch (error) {
        console.error('マイグレーションエラー:', error);
      }
    },

    exportProject: async () => {
      return await DatabaseManager.exportProject();
    },

    importProject: async (jsonData: string) => {
      try {
        const project = await DatabaseManager.importProject(jsonData);
        set({ project });
        get().subscribeToProject();
      } catch (error) {
        console.error('インポートエラー:', error);
        throw error;
      }
    },

    clearAll: async () => {
      try {
        get().unsubscribeFromProject();
        await DatabaseManager.clearAll();
        set({
          project: null,
          isAdminMode: false,
          currentView: 'dashboard',
          notifications: defaultNotifications,
          theme: 'light',
          realtimeChannel: null,
        });
      } catch (error) {
        console.error('データクリアエラー:', error);
      }
    },

    subscribeToProject: () => {
      const { project, realtimeChannel } = get();
      
      if (!project || !isSupabaseAvailable() || realtimeChannel) {
        return;
      }

      const channel = DatabaseManager.subscribeToProject(project.id, (updatedProject) => {
        set({ project: updatedProject });
      });

      if (channel) {
        set({ realtimeChannel: channel });
      }
    },

    unsubscribeFromProject: () => {
      const { realtimeChannel } = get();
      
      if (realtimeChannel && isSupabaseAvailable()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (realtimeChannel as any).unsubscribe();
        set({ realtimeChannel: null });
      }
    },
  }))
);

// データベース統合完了
// リアルタイム更新はsubscribeToProject()メソッドで管理