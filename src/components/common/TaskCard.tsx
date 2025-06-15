'use client';

import { Task, Status } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onProgressChange?: (progress: number) => void;
  onStatusChange?: (status: Status) => void;
  readOnly?: boolean;
}

const priorityConfig = {
  high: { label: '高', color: 'bg-red-100 text-red-800', border: 'border-red-200' },
  medium: { label: '中', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
  low: { label: '低', color: 'bg-green-100 text-green-800', border: 'border-green-200' },
};

const statusConfig = {
  '未着手': { color: 'bg-gray-100 text-gray-800' },
  '進行中': { color: 'bg-blue-100 text-blue-800' },
  '完了': { color: 'bg-green-100 text-green-800' },
};

const categoryConfig = {
  '企画': { color: 'bg-purple-100 text-purple-800' },
  'グラフィック': { color: 'bg-pink-100 text-pink-800' },
  'プログラミング': { color: 'bg-indigo-100 text-indigo-800' },
  'サウンド': { color: 'bg-orange-100 text-orange-800' },
  'その他': { color: 'bg-gray-100 text-gray-800' },
};

export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onProgressChange, 
  onStatusChange, 
  readOnly = false 
}: TaskCardProps) {
  const daysUntilDeadline = differenceInDays(task.deadline, new Date());
  const isOverdue = daysUntilDeadline < 0;
  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;

  const getDeadlineColor = () => {
    if (isOverdue) return 'text-red-600 font-semibold';
    if (isUrgent) return 'text-orange-600 font-medium';
    return 'text-gray-600';
  };

  const getDeadlineText = () => {
    if (isOverdue) {
      return `期限切れ (${Math.abs(daysUntilDeadline)}日経過)`;
    }
    if (daysUntilDeadline === 0) {
      return '今日が締切';
    }
    if (daysUntilDeadline === 1) {
      return '明日が締切';
    }
    return `あと${daysUntilDeadline}日`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
      isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[task.priority].color}`}>
              優先度: {priorityConfig[task.priority].label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[task.status].color}`}>
              {task.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryConfig[task.category].color}`}>
              {task.category}
            </span>
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex space-x-1 ml-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="編集"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="削除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">進捗</span>
          <span className="font-medium">{task.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${task.progress}%` }}
          />
        </div>
        {!readOnly && onProgressChange && (
          <input
            type="range"
            min="0"
            max="100"
            value={task.progress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        )}
      </div>

      {/* Deadline */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">
          締切: {format(task.deadline, 'MM/dd (E)', { locale: ja })}
        </span>
        <span className={getDeadlineColor()}>
          {getDeadlineText()}
        </span>
      </div>

      {/* Status Buttons (Admin only) */}
      {!readOnly && onStatusChange && (
        <div className="flex space-x-2 mt-3">
          {(['未着手', '進行中', '完了'] as Status[]).map(status => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                task.status === status
                  ? statusConfig[status].color
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {/* Notes */}
      {task.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">メモ:</p>
          <p className="text-xs text-gray-600">{task.notes}</p>
        </div>
      )}

      {/* Image */}
      {task.imageUrl && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={task.imageUrl} 
            alt="Task image" 
            className="w-full h-32 object-cover rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}