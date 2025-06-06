import { redirect } from 'next/navigation';

export default function BookstoreIndexPage() {
  // 書店ページ一覧にリダイレクト
  redirect('/bookstore/page');
}
