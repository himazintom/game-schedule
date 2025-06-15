'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import AuthGuard from '@/components/common/AuthGuard';
import TaskForm from '@/components/forms/TaskForm';
import TaskCard from '@/components/common/TaskCard';
import { TaskFormData, Task } from '@/types';

export default function AdminPage() {
  const {
    project,
    createProject,
    addTask,
    updateTask,
    deleteTask,
    updateTaskProgress,
    updateTaskStatus,
    loadFromDatabase,
    migrateFromLocalStorage,
    generateShareId,
  } = useAppStore();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projectName, setProjectName] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await loadFromDatabase();
      // LocalStorageからのマイグレーションを実行
      await migrateFromLocalStorage();
    };
    initializeData();
  }, [loadFromDatabase, migrateFromLocalStorage]);

  const handleCreateProject = async () => {
    if (projectName.trim()) {
      await createProject(projectName.trim());
      setShowProjectForm(false);
      setProjectName('');
    }
  };

  const handleTaskSubmit = async (formData: TaskFormData) => {
    if (editingTask) {
      await updateTask(editingTask.id, {
        title: formData.title,
        description: formData.description,
        deadline: new Date(formData.deadline),
        priority: formData.priority,
        category: formData.category,
        notes: formData.notes,
        imageUrl: formData.imageUrl,
      });
      setEditingTask(null);
    } else {
      await addTask(formData);
    }
    setShowTaskForm(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('このタスクを削除しますか？')) {
      await deleteTask(taskId);
    }
  };

  const handleGenerateShareId = async () => {
    await generateShareId();
    alert('共有IDが生成されました！');
  };

  if (!project) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full p-8">
            {showProjectForm ? (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  新しいプロジェクトを作成
                </h2>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="プロジェクト名を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-gray-900 bg-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowProjectForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleCreateProject}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    作成
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  管理者モード
                </h1>
                <p className="text-gray-600 mb-8">
                  新しいプロジェクトを作成してください
                </p>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  プロジェクトを作成
                </button>
              </div>
            )}
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="text-gray-600">
                タスク数: {project.tasks.length} | 
                完了: {project.tasks.filter(t => t.status === '完了').length}
              </p>
            </div>
            <div className="flex space-x-3">
              {project.shareId ? (
                <div className="text-sm text-gray-600">
                  共有ID: <span className="font-mono font-medium">{project.shareId}</span>
                </div>
              ) : (
                <button
                  onClick={handleGenerateShareId}
                  className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                >
                  共有IDを生成
                </button>
              )}
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                タスクを追加
              </button>
            </div>
          </div>

          {/* Tasks Grid */}
          {project.tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">まだタスクがありません</p>
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                最初のタスクを作成
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onProgressChange={async (progress) => await updateTaskProgress(task.id, progress)}
                  onStatusChange={async (status) => await updateTaskStatus(task.id, status)}
                />
              ))}
            </div>
          )}

          {/* Task Form Modal */}
          {showTaskForm && (
            <TaskForm
              onSubmit={handleTaskSubmit}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
              initialData={editingTask ? {
                title: editingTask.title,
                description: editingTask.description,
                deadline: editingTask.deadline.toISOString().split('T')[0],
                priority: editingTask.priority,
                category: editingTask.category,
                notes: editingTask.notes,
                imageUrl: editingTask.imageUrl,
              } : undefined}
              isEditing={!!editingTask}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}