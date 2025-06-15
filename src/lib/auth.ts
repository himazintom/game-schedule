import { StorageManager } from './storage';

export class AuthManager {
  private static readonly DEFAULT_PASSWORD = 'admin123';
  private static readonly SESSION_KEY = 'game-schedule-admin-session';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static setPassword(password: string): void {
    StorageManager.setAdminPassword(password);
  }

  static authenticate(password: string): boolean {
    const storedPassword = StorageManager.getAdminPassword() || this.DEFAULT_PASSWORD;
    const isValid = password === storedPassword;
    
    if (isValid) {
      this.createSession();
    }
    
    return isValid;
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (!session) return false;
      
      const { timestamp } = JSON.parse(session);
      const now = Date.now();
      
      if (now - timestamp > this.SESSION_DURATION) {
        this.logout();
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  static createSession(): void {
    if (typeof window === 'undefined') return;
    
    const session = {
      timestamp: Date.now(),
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  static logout(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.SESSION_KEY);
  }

  static getDefaultPassword(): string {
    return this.DEFAULT_PASSWORD;
  }

  static hasCustomPassword(): boolean {
    return StorageManager.getAdminPassword() !== null;
  }
}