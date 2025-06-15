import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AppState, Project, Task, ViewType, NotificationSettings, TaskFormData, Status } from '@/types';
import { StorageManager } from './storage';

interface AppStore extends AppState {
  // Actions
  setProject: (project: Project | null) => void;
  setAdminMode: (isAdmin: boolean) => void;
  setCurrentView: (view: ViewType) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotifications: (settings: NotificationSettings) => void;
  
  // Project actions
  createProject: (name: string) => void;
  updateProject: (updates: Partial<Project>) => void;
  generateShareId: () => void;
  
  // Task actions
  addTask: (taskData: TaskFormData) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  
  // Utility actions
  loadFromStorage: () => void;
  exportProject: () => string;
  importProject: (jsonData: string) => void;
  clearAll: () => void;
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

    // Actions
    setProject: (project) => {
      set({ project });
      if (project) {
        StorageManager.saveProject(project);
      }
    },

    setAdminMode: (isAdmin) => set({ isAdminMode: isAdmin }),
    
    setCurrentView: (view) => set({ currentView: view }),
    
    setTheme: (theme) => set({ theme }),
    
    setNotifications: (notifications) => {
      set({ notifications });
      StorageManager.saveSettings({ notifications });
    },

    createProject: (name) => {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        tasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      get().setProject(newProject);
    },

    updateProject: (updates) => {
      const { project } = get();
      if (project) {
        const updatedProject = {
          ...project,
          ...updates,
          updatedAt: new Date(),
        };
        get().setProject(updatedProject);
      }
    },

    generateShareId: () => {
      const { project } = get();
      if (project) {
        const shareId = StorageManager.generateShareId();
        get().updateProject({ shareId });
      }
    },

    addTask: (taskData) => {
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
        get().setProject(updatedProject);
      }
    },

    updateTask: (taskId, updates) => {
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
        get().setProject(updatedProject);
      }
    },

    deleteTask: (taskId) => {
      const { project } = get();
      if (project) {
        const updatedTasks = project.tasks.filter(task => task.id !== taskId);
        const updatedProject = {
          ...project,
          tasks: updatedTasks,
          updatedAt: new Date(),
        };
        get().setProject(updatedProject);
      }
    },

    updateTaskProgress: (taskId, progress) => {
      get().updateTask(taskId, { 
        progress: Math.max(0, Math.min(100, progress)),
        status: progress === 100 ? '完了' : progress > 0 ? '進行中' : '未着手'
      });
    },

    updateTaskStatus: (taskId, status) => {
      const progressMap = {
        '未着手': 0,
        '進行中': 50,
        '完了': 100,
      };
      get().updateTask(taskId, { 
        status,
        progress: progressMap[status]
      });
    },

    loadFromStorage: () => {
      const project = StorageManager.loadProject();
      const settings = StorageManager.loadSettings();
      
      if (project) {
        set({ project });
      }
      
      if (settings?.notifications) {
        set({ notifications: settings.notifications as NotificationSettings });
      }
      
      if (settings?.theme) {
        set({ theme: settings.theme as 'light' | 'dark' });
      }
    },

    exportProject: () => {
      return StorageManager.exportProject();
    },

    importProject: (jsonData: string) => {
      const project = StorageManager.importProject(jsonData);
      get().setProject(project);
    },

    clearAll: () => {
      StorageManager.clearAll();
      set({
        project: null,
        isAdminMode: false,
        currentView: 'dashboard',
        notifications: defaultNotifications,
        theme: 'light',
      });
    },
  }))
);

// Subscribe to project changes to auto-save
useAppStore.subscribe(
  (state) => state.project,
  (project) => {
    if (project) {
      StorageManager.saveProject(project);
    }
  }
);