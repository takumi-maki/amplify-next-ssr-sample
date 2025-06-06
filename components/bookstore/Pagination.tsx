'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) {
  // ページネーションの表示範囲を計算
  const getPageRange = () => {
    const range = [];
    const delta = 2; // 現在のページの前後に表示するページ数
    
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);
    
    // 最初のページを常に表示
    if (start > 1) {
      range.push(1);
      if (start > 2) {
        range.push('...');
      }
    }
    
    // 範囲内のページを表示
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    // 最後のページを常に表示
    if (end < totalPages) {
      if (end < totalPages - 1) {
        range.push('...');
      }
      range.push(totalPages);
    }
    
    return range;
  };

  // ページが1ページしかない場合は表示しない
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-controls">
      {/* 前のページボタン */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      {/* ページ番号 */}
      {getPageRange().map((page, index) => (
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ) : (
          <span
            key={index}
            className="px-2 flex items-center"
          >
            {page}
          </span>
        )
      ))}
      
      {/* 次のページボタン */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
}
