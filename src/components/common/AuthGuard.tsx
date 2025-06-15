'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { useAppStore } from '@/lib/store';
import LoginForm from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { setAdminMode } = useAppStore();

  useEffect(() => {
    if (requireAuth) {
      const isAuthenticated = AuthManager.isAuthenticated();
      if (isAuthenticated) {
        setAdminMode(true);
        setShowLogin(false);
      } else {
        setShowLogin(true);
      }
    } else {
      setShowLogin(false);
    }
    setIsLoading(false);
  }, [requireAuth, setAdminMode]);

  const handleLogin = () => {
    setAdminMode(true);
    setShowLogin(false);
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (showLogin && requireAuth) {
    return <LoginForm onLogin={handleLogin} onCancel={handleCancel} />;
  }

  return <>{children}</>;
}