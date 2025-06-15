'use client';

import { useState } from 'react';
import { TaskFormData, Priority, Category } from '@/types';

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TaskFormData>;
  isEditing?: boolean;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: '高', color: 'text-red-600' },
  { value: 'medium', label: '中', color: 'text-yellow-600' },
  { value: 'low', label: '低', color: 'text-green-600' },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: '企画', label: '企画' },
  { value: 'グラフィック', label: 'グラフィック' },
  { value: 'プログラミング', label: 'プログラミング' },
  { value: 'サウンド', label: 'サウンド' },
  { value: 'その他', label: 'その他' },
];

export default function TaskForm({ onSubmit, onCancel, initialData, isEditing = false }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    deadline: initialData?.deadline || '',
    priority: initialData?.priority || 'medium',
    category: initialData?.category || '企画',
    notes: initialData?.notes || '',
    imageUrl: initialData?.imageUrl || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }

    if (!formData.description.trim()) {
      newErrors.description = '説明は必須です';
    }

    if (!formData.deadline) {
      newErrors.deadline = '締切日は必須です';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = '締切日は今日以降の日付を選択してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'タスクを編集' : '新しいタスクを作成'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="タスクのタイトルを入力"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明 *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="タスクの詳細説明を入力"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                締切日 *
              </label>
              <input
                type="date"
                id="deadline"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                  errors.deadline ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                優先度
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="追加のメモがあれば入力"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              画像URL
            </label>
            <input
              type="url"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {isEditing ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}