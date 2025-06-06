'use client';

import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import BookstorePageTable from './BookstorePageTable';
import BookstorePageCards from './BookstorePageCards';
import BookstoreSearchForm from './BookstoreSearchForm';
import Pagination from './Pagination';
import { BookstorePage, PaginationInfo } from '@/types/bookstore';

export default function BookstorePageList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookstorePages, setBookstorePages] = useState<BookstorePage[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 20
  });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: '',
    sortField: 'updatedAt',
    sortDirection: 'desc'
  });

  // ダミーデータを生成
  const generateDummyData = () => {
    const dummyData: BookstorePage[] = [];
    const statuses = ['published', 'draft', 'archived'];
    const tags = ['古書', '新刊', '文学', '小説', '総合', '東京', '大阪', '名古屋', '児童書', '専門書'];
    
    for (let i = 1; i <= 20; i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomTags = [];
      const tagCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < tagCount; j++) {
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        if (!randomTags.includes(randomTag)) {
          randomTags.push(randomTag);
        }
      }
      
      dummyData.push({
        id: `bp-${i.toString().padStart(5, '0')}`,
        storeName: `書店${i}`,
        storeCode: `STORE-${i.toString().padStart(3, '0')}`,
        description: `書店${i}の説明文です。ここには書店の詳細情報が入ります。`,
        status: randomStatus,
        imageUrl: i % 3 === 0 ? `/images/stores/store-${i}.jpg` : undefined,
        tags: randomTags,
        createdAt: new Date(2025, 0, i).toISOString(),
        updatedAt: new Date(2025, 5, i).toISOString(),
        createdBy: 'user-001',
        updatedBy: 'user-002'
      });
    }
    
    return dummyData;
  };

  // 書店ページデータを取得する関数
  const fetchBookstorePages = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // APIからデータを取得（現在はダミーデータを使用）
      // 実際のAPIが実装されたら、以下のコメントアウトを解除
      /*
      const response = await API.graphql({
        query: `
          query ListBookstoreLibraries(
            $filter: ModelBookstoreLibraryFilterInput
            $limit: Int
            $nextToken: String
            $sortDirection: ModelSortDirection
          ) {
            listBookstoreLibraries(
              filter: $filter
              limit: $limit
              nextToken: $nextToken
              sortDirection: $sortDirection
            ) {
              items {
                id
                storeName
                storeCode
                description
                status
                imageUrl
                tags
                createdAt
                updatedAt
                createdBy
                updatedBy
              }
              nextToken
            }
          }
        `,
        variables: {
          filter: searchParams.keyword ? {
            storeName: { contains: searchParams.keyword }
          } : undefined,
          limit: pagination.pageSize,
          sortDirection: searchParams.sortDirection.toUpperCase(),
        }
      });
      
      const result = response.data.listBookstoreLibraries;
      */
      
      // ダミーデータを使用
      const dummyData = generateDummyData();
      
      // 検索条件でフィルタリング
      let filteredData = [...dummyData];
      
      if (searchParams.keyword) {
        filteredData = filteredData.filter(item => 
          item.storeName.toLowerCase().includes(searchParams.keyword.toLowerCase())
        );
      }
      
      if (searchParams.status) {
        filteredData = filteredData.filter(item => 
          item.status === searchParams.status
        );
      }
      
      // ソート
      filteredData.sort((a, b) => {
        const field = searchParams.sortField as keyof BookstorePage;
        const aValue = a[field];
        const bValue = b[field];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return searchParams.sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
      
      // ページネーション
      const startIndex = (page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      setBookstorePages(paginatedData);
      setPagination({
        ...pagination,
        currentPage: page,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / pagination.pageSize)
      });
      
    } catch (err) {
      console.error('書店ページの取得に失敗しました:', err);
      setError('書店ページの読み込みに失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    fetchBookstorePages();
  }, []);

  // 検索条件変更時の処理
  const handleSearch = (params) => {
    setSearchParams({
      ...searchParams,
      ...params
    });
    fetchBookstorePages(1); // 検索時は1ページ目に戻る
  };

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    fetchBookstorePages(page);
  };

  // 表示形式切替
  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'cards' : 'table');
  };

  // 新規作成ページへの遷移
  const handleCreateNew = () => {
    router.push('/bookstore/page/new');
  };

  // 編集ページへの遷移
  const handleEdit = (id: string) => {
    router.push(`/bookstore/page/edit/${id}`);
  };

  // 詳細ページへの遷移
  const handleViewDetails = (id: string) => {
    router.push(`/bookstore/page/${id}`);
  };

  // 削除処理
  const handleDelete = async (id: string) => {
    if (window.confirm('選択した書店ページを削除してもよろしいですか？')) {
      try {
        // 削除APIを呼び出す処理を実装
        /*
        await API.graphql({
          query: `
            mutation DeleteBookstoreLibrary($input: DeleteBookstoreLibraryInput!) {
              deleteBookstoreLibrary(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: { id }
          }
        });
        */
        
        // ダミー実装：削除したIDを除外
        const updatedPages = bookstorePages.filter(page => page.id !== id);
        setBookstorePages(updatedPages);
        
        // 削除成功後、リストを再取得
        fetchBookstorePages(pagination.currentPage);
        alert('書店ページを削除しました。');
      } catch (err) {
        console.error('書店ページの削除に失敗しました:', err);
        alert('書店ページの削除に失敗しました。再度お試しください。');
      }
    }
  };

  return (
    <div>
      {/* 検索フォーム */}
      <BookstoreSearchForm onSearch={handleSearch} />
      
      {/* アクションボタン */}
      <div className="flex justify-between items-center my-4">
        <div>
          <button
            onClick={toggleViewMode}
            className="flex items-center px-3 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            {viewMode === 'table' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                カード表示
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                テーブル表示
              </>
            )}
          </button>
        </div>
        <div>
          <button
            onClick={handleCreateNew}
            className="btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新規作成
          </button>
        </div>
      </div>
      
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={() => fetchBookstorePages()}
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded mt-2"
          >
            再読み込み
          </button>
        </div>
      )}
      
      {/* ローディング表示 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
          {/* データがない場合 */}
          {bookstorePages.length === 0 ? (
            <div className="bg-gray-100 p-8 text-center rounded">
              <p className="text-gray-600">該当する書店ページがありません。</p>
            </div>
          ) : (
            <>
              {/* テーブル/カード表示 */}
              <div className="table-container">
                {viewMode === 'table' ? (
                  <BookstorePageTable
                    bookstorePages={bookstorePages}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewDetails}
                  />
                ) : (
                  <BookstorePageCards
                    bookstorePages={bookstorePages}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewDetails}
                  />
                )}
              </div>
              
              {/* ページネーション */}
              <div className="pagination">
                <div className="pagination-info">
                  全{pagination.totalItems}件中 {(pagination.currentPage - 1) * pagination.pageSize + 1}-
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}件を表示
                </div>
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
