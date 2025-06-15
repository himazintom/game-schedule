'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ゲーム開発スケジュール管理
          </h1>
          <p className="text-gray-600 mb-8">
            プロジェクトの進捗を効率的に管理しましょう
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            管理者モード
          </Link>
          
          <div className="text-center">
            <span className="text-gray-500 text-sm">または</span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="共有ID を入力"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const shareId = (e.target as HTMLInputElement).value.trim();
                  if (shareId) {
                    router.push(`/share/${shareId}`);
                  }
                }
              }}
            />
            <p className="text-xs text-gray-500">
              共有されたプロジェクトを閲覧する場合はIDを入力してください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}