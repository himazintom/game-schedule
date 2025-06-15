import { Project } from '@/types';

const STORAGE_KEYS = {
  PROJECT: 'game-schedule-project',
  SETTINGS: 'game-schedule-settings',
  ADMIN_PASSWORD: 'game-schedule-admin-password',
} as const;

export class StorageManager {
  static saveProject(project: Project): void {
    try {
      const serialized = JSON.stringify({
        ...project,
        tasks: project.tasks.map(task => ({
          ...task,
          deadline: task.deadline.toISOString(),
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        })),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.PROJECT, serialized);
    } catch {
      console.error('Failed to save project');
    }
  }

  static loadProject(): Project | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECT);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        tasks: parsed.tasks.map((task: Record<string, unknown>) => ({
          ...task,
          deadline: new Date(task.deadline as string),
          createdAt: new Date(task.createdAt as string),
          updatedAt: new Date(task.updatedAt as string),
        })),
        createdAt: new Date(parsed.createdAt as string),
        updatedAt: new Date(parsed.updatedAt as string),
      };
    } catch {
      console.error('Failed to load project');
      return null;
    }
  }

  static saveSettings(settings: Record<string, unknown>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      console.error('Failed to save settings');
    }
  }

  static loadSettings(): Record<string, unknown> | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : null;
    } catch {
      console.error('Failed to load settings');
      return null;
    }
  }

  static setAdminPassword(password: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
    } catch {
      console.error('Failed to save admin password');
    }
  }

  static getAdminPassword(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    } catch {
      console.error('Failed to get admin password');
      return null;
    }
  }

  static exportProject(): string {
    const project = this.loadProject();
    if (!project) {
      throw new Error('No project to export');
    }
    return JSON.stringify(project, null, 2);
  }

  static importProject(jsonData: string): Project {
    try {
      const parsed = JSON.parse(jsonData);
      const project: Project = {
        ...parsed,
        tasks: parsed.tasks.map((task: Record<string, unknown>) => ({
          ...task,
          deadline: new Date(task.deadline as string),
          createdAt: new Date(task.createdAt as string),
          updatedAt: new Date(task.updatedAt as string),
        })),
        createdAt: new Date(parsed.createdAt as string),
        updatedAt: new Date(parsed.updatedAt as string),
      };
      this.saveProject(project);
      return project;
    } catch {
      throw new Error('Invalid project data');
    }
  }

  static generateShareId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch {
      console.error('Failed to clear storage');
    }
  }
}