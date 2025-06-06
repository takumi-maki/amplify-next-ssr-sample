import BookstorePageList from '@/components/bookstore/BookstorePageList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '書店ページ一覧 | Bookstore管理システム',
  description: '書店ページの一覧を表示・検索・管理するページです',
};

export default function BookstoreListPage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="page-title">書店ページ一覧</h1>
        <button className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          新規作成
        </button>
      </div>
      <BookstorePageList />
    </div>
  );
}
