'use client';

import Image from 'next/image';
import { BookstorePage } from '@/types/bookstore';

interface BookstorePageCardsProps {
  bookstorePages: BookstorePage[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function BookstorePageCards({
  bookstorePages,
  onEdit,
  onDelete,
  onView
}: BookstorePageCardsProps) {
  // ステータスに応じたバッジのスタイルを返す
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'status-badge status-published';
      case 'draft':
        return 'status-badge status-draft';
      case 'archived':
        return 'status-badge status-archived';
      default:
        return 'status-badge';
    }
  };

  // ステータスの日本語表示
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return '公開';
      case 'draft':
        return '下書き';
      case 'archived':
        return 'アーカイブ';
      default:
        return status;
    }
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {bookstorePages.map((page) => (
        <div key={page.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 画像 */}
          <div className="relative h-48 bg-gray-100">
            {page.imageUrl ? (
              <Image
                src={page.imageUrl}
                alt={page.storeName}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <span className={getStatusBadgeClass(page.status)}>
                {getStatusLabel(page.status)}
              </span>
            </div>
          </div>
          
          {/* コンテンツ */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 cursor-pointer text-teal-600" onClick={() => onView(page.id)}>
              {page.storeName}
            </h3>
            <p className="text-sm text-gray-600 mb-2">コード: {page.storeCode}</p>
            
            {/* 説明 */}
            {page.description && (
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{page.description}</p>
            )}
            
            {/* タグ */}
            {page.tags && page.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {page.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* 更新日時 */}
            <p className="text-xs text-gray-500 mb-4">
              更新日時: {formatDate(page.updatedAt)}
            </p>
            
            {/* アクションボタン */}
            <div className="flex justify-between border-t pt-3">
              <button
                onClick={() => onView(page.id)}
                className="action-btn"
              >
                詳細
              </button>
              <button
                onClick={() => onEdit(page.id)}
                className="action-btn"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(page.id)}
                className="action-btn delete"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
