'use client';

import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

interface BookstoreSearchFormProps {
  onSearch: (params: any) => void;
}

export default function BookstoreSearchForm({ onSearch }: BookstoreSearchFormProps) {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // ステータス一覧を取得
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        // 実際のAPIが実装されるまでのダミーデータ
        const dummyStatuses = ['published', 'draft', 'archived'];
        setStatuses(dummyStatuses);
        
        // 実際のAPI呼び出しは以下のようになる
        // const response = await API.get('bookstoreApi', '/bookstore-pages/statuses', {});
        // setStatuses(response);
      } catch (err) {
        console.error('ステータス一覧の取得に失敗しました:', err);
      }
    };
    
    fetchStatuses();
  }, []);

  // 検索実行
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      keyword,
      status,
      sortField,
      sortDirection
    });
  };

  // フォームリセット
  const handleReset = () => {
    setKeyword('');
    setStatus('');
    setSortField('updatedAt');
    setSortDirection('desc');
    
    // リセット後に検索実行
    onSearch({
      keyword: '',
      status: '',
      sortField: 'updatedAt',
      sortDirection: 'desc'
    });
  };

  // フィルターの表示/非表示を切り替え
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="filter-card mb-6">
      <div className="filter-header" onClick={toggleExpand}>
        <div className="filter-title">検索条件</div>
        <div>
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="filter-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* キーワード検索 */}
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                  キーワード
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="書店名で検索"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              
              {/* ステータス */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">すべて</option>
                  {statuses.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption === 'published' ? '公開' : 
                      statusOption === 'draft' ? '下書き' : 
                      statusOption === 'archived' ? 'アーカイブ' : statusOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* ソートフィールド */}
              <div>
                <label htmlFor="sortField" className="block text-sm font-medium text-gray-700 mb-1">
                  並び替え項目
                </label>
                <select
                  id="sortField"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="storeName">書店名</option>
                  <option value="storeCode">書店コード</option>
                  <option value="createdAt">作成日時</option>
                  <option value="updatedAt">更新日時</option>
                </select>
              </div>
              
              {/* ソート方向 */}
              <div>
                <label htmlFor="sortDirection" className="block text-sm font-medium text-gray-700 mb-1">
                  並び替え順序
                </label>
                <select
                  id="sortDirection"
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="asc">昇順</option>
                  <option value="desc">降順</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                リセット
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                検索
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
