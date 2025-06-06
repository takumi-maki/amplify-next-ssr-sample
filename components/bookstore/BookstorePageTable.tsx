'use client';

import { BookstorePage } from '@/types/bookstore';

interface BookstorePageTableProps {
  bookstorePages: BookstorePage[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function BookstorePageTable({
  bookstorePages,
  onEdit,
  onDelete,
  onView
}: BookstorePageTableProps) {
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
    <table className="bookstore-table">
      <thead>
        <tr>
          <th className="w-8">
            <div className="checkbox-container">
              <input type="checkbox" className="checkbox" />
            </div>
          </th>
          <th>書店名</th>
          <th>書店コード</th>
          <th>ステータス</th>
          <th>タグ</th>
          <th>更新日時</th>
          <th className="w-24">操作</th>
        </tr>
      </thead>
      <tbody>
        {bookstorePages.map((page) => (
          <tr key={page.id}>
            <td>
              <div className="checkbox-container">
                <input type="checkbox" className="checkbox" />
              </div>
            </td>
            <td>
              <div className="font-medium text-teal-600 cursor-pointer" onClick={() => onView(page.id)}>
                {page.storeName}
              </div>
            </td>
            <td>{page.storeCode}</td>
            <td>
              <span className={getStatusBadgeClass(page.status)}>
                {getStatusLabel(page.status)}
              </span>
            </td>
            <td>
              <div className="flex flex-wrap gap-1">
                {page.tags && page.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </td>
            <td>{formatDate(page.updatedAt)}</td>
            <td>
              <div className="flex space-x-2">
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
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
