'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import TaskCard from '@/components/common/TaskCard';
import { Project } from '@/types';

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SharePage({ params }: SharePageProps) {
  const { loadProjectByShareId } = useAppStore();
  const [sharedProject, setSharedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string>('');

  useEffect(() => {
    params.then(p => setShareId(p.id));
  }, [params]);

  useEffect(() => {
    if (shareId) {
      const loadSharedProject = async () => {
        try {
          const project = await loadProjectByShareId(shareId);
          if (project) {
            setSharedProject(project);
          } else {
            setError('共有IDが見つかりません');
          }
        } catch {
          setError('プロジェクトの読み込みに失敗しました');
        } finally {
          setLoading(false);
        }
      };
      
      loadSharedProject();
    }
  }, [shareId, loadProjectByShareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            プロジェクトが見つかりません
          </h1>
          <p className="text-gray-600 mb-8">
            {error}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!sharedProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">プロジェクトが見つかりません</div>
      </div>
    );
  }

  const completedTasks = sharedProject.tasks.filter(t => t.status === '完了').length;
  const progressPercentage = sharedProject.tasks.length > 0 
    ? Math.round((completedTasks / sharedProject.tasks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sharedProject.name}
              </h1>
              <p className="text-gray-600">
                閲覧専用 | 共有ID: {shareId}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {progressPercentage}%
              </div>
              <div className="text-sm text-gray-600">
                進捗率
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {sharedProject.tasks.length}
              </div>
              <div className="text-sm text-gray-600">総タスク数</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {sharedProject.tasks.filter(t => t.status === '進行中').length}
              </div>
              <div className="text-sm text-gray-600">進行中</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {completedTasks}
              </div>
              <div className="text-sm text-gray-600">完了済み</div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {sharedProject.tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">タスクがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedProject.tasks
              .sort((a, b) => {
                // 期限切れ > 緊急 > 通常の順でソート
                const aOverdue = new Date(a.deadline) < new Date();
                const bOverdue = new Date(b.deadline) < new Date();
                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;
                
                // 期限日でソート
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
              })
              .map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  readOnly={true}
                />
              ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            このプロジェクトは閲覧専用です。編集するには管理者モードでアクセスしてください。
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}