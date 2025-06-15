export type Priority = 'high' | 'medium' | 'low';
export type Status = '未着手' | '進行中' | '完了';
export type Category = '企画' | 'グラフィック' | 'プログラミング' | 'サウンド' | 'その他';
export type ViewType = 'dashboard' | 'gantt' | 'calendar' | 'kanban';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  progress: number;
  priority: Priority;
  category: Category;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  imageUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
  shareId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  threeDaysBefore: boolean;
  oneDayBefore: boolean;
  onDeadline: boolean;
}

export interface AppState {
  project: Project | null;
  isAdminMode: boolean;
  currentView: ViewType;
  notifications: NotificationSettings;
  theme: 'light' | 'dark';
}

export interface TaskFormData {
  title: string;
  description: string;
  deadline: string;
  priority: Priority;
  category: Category;
  notes?: string;
  imageUrl?: string;
}

export interface FilterOptions {
  status?: Status[];
  category?: Category[];
  priority?: Priority[];
  search?: string;
}