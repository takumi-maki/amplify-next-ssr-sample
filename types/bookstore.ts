// 書店ページの型定義
export interface BookstorePage {
  id: string;
  storeName: string;
  storeCode: string;
  description?: string;
  status: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ページネーション情報の型定義
export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// 検索パラメータの型定義
export interface SearchParams {
  keyword?: string;
  status?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
