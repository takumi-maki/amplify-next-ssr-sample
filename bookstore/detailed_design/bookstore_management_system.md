# ビブリオン：書店ページ管理システム 詳細設計書

## 1. システム概要

### 1.1 システム名
ビブリオン（Biblion）- 書店ページ管理システム

### 1.2 目的
valuebooks.jpの書店ページ管理者用Webシステムとして、書店ページ対象ライブラリ情報の管理、静的HTMLファイルのS3への操作、CloudFrontキャッシュの削除機能、およびAurora MySQLデータベースの更新機能を提供する。

### 1.3 システム構成
- **インフラストラクチャ:** AWS Amplify Gen 2
- **認証:** IPアドレス制限のみ（システム利用者は全員同じ権限）
- **データストア（メイン）:** AWS Amplify Data (GraphQL API)
- **データストア（HTML）:** 既存S3バケット `valuebooks-producton-mainsite-cdn`
- **データストア（連携先）:** Aurora MySQL `shelf_items_folder` テーブル
- **サーバーサイド:** Amplify Functions (PythonまたはNode.js)
- **クライアントサイド:** React

## 2. アーキテクチャ設計

### 2.1 システム構成図
```
[React Frontend] 
    ↓ Amplify API (GraphQL/REST)
[Amplify Functions]
    ↓ AWS SDK
[Amplify Data (DynamoDB)] [S3 Bucket] [Aurora MySQL]
    ↓ CloudFront Invalidation API
[CloudFront CDN]
```

### 2.2 データフロー
1. クライアント → Amplify API → Amplify Functions
2. Amplify Functions → Amplify Data (CRUD操作)
3. Amplify Functions → S3 (HTMLファイル操作)
4. Amplify Functions → Aurora MySQL (連携データ更新)
5. Amplify Functions → CloudFront (キャッシュ削除)

## 3. データモデル設計

### 3.1 Amplify Data スキーマ
```graphql
type Bookstore @model @auth(rules: [{ allow: private, operations: [read, create, update, delete] }]) {
  id: ID!
  bookstore_name: String! @index(name: "byBookstoreName", queryField: "bookstoresByName")
  library_id: String! @index(name: "byLibraryId", queryField: "bookstoresByLibraryId")
  created_at: AWSDateTime
  updated_at: AWSDateTime
}
```

### 3.2 フィールド定義
| フィールド名 | データ型 | 説明 | バリデーション |
|-------------|----------|------|---------------|
| id | ID! | Amplify自動生成ID | 主キー |
| bookstore_name | String! | 書店名 | 必須、30文字以内 |
| library_id | String! | ライブラリID | 必須、英数字のみ、15桁 |
| created_at | AWSDateTime | 作成日時 | Amplify自動設定 |
| updated_at | AWSDateTime | 更新日時 | Amplify自動設定 |

### 3.3 Aurora MySQL連携テーブル
**テーブル名:** `shelf_items_folder`

| カラム名 | データ型 | 説明 | 更新値 |
|----------|----------|------|--------|
| folder_id | varchar | フォルダID | library_idと同一値 |
| external_html_url | varchar | CloudFront経由HTML URL | `https://wcdn.valuebooks.jp/ws/library/{library_id}.html` |
| upd_dtm | datetime | 更新日時 | 処理時の現在日時(JST) |
| upd_user | varchar | 更新ユーザー | 固定値: 'biblion' |
| upd_pgid | varchar | 更新プログラムID | 固定値: 'biblion' |

## 4. API設計

### 4.1 GraphQL API (Amplify Data)
```graphql
# クエリ
type Query {
  listBookstores: [Bookstore]
  getBookstore(id: ID!): Bookstore
  bookstoresByName(bookstore_name: String!): [Bookstore]
  bookstoresByLibraryId(library_id: String!): [Bookstore]
}

# ミューテーション
type Mutation {
  createBookstore(input: CreateBookstoreInput!): Bookstore
  updateBookstore(input: UpdateBookstoreInput!): Bookstore
  deleteBookstore(input: DeleteBookstoreInput!): Bookstore
}
```

### 4.2 Amplify Functions API
#### 4.2.1 書店ライブラリ登録API
- **エンドポイント:** POST /api/bookstore/register
- **入力:** bookstore_name, library_id, html_file (optional)
- **処理:** Amplify Data登録 → S3アップロード → Aurora MySQL更新 → CloudFront削除
- **出力:** 成功/失敗ステータス、エラーメッセージ

#### 4.2.2 書店ライブラリ更新API
- **エンドポイント:** PUT /api/bookstore/update
- **入力:** id, bookstore_name, library_id, old_library_id
- **処理:** Amplify Data更新 → Aurora MySQL更新 → S3ファイル移動
- **出力:** 成功/失敗ステータス、エラーメッセージ

#### 4.2.3 HTMLファイル操作API
- **アップロード:** POST /api/html/upload
- **取得:** GET /api/html/get/{library_id}
- **更新:** PUT /api/html/update
- **削除:** DELETE /api/html/delete/{library_id}

## 5. 画面設計

### 5.1 共通レイアウト
- **ヘッダー:** アプリタイトル「ビブリオン」（左側）
- **フッター:** コピーライト「copyright © VALUE BOOKS All rights reserved.」（中央）
- **サイドメニュー:** 書店ページ管理ナビゲーション
- **メインコンテンツ:** 機能別画面表示エリア

### 5.2 画面一覧
1. **書店ページ対象ライブラリ一覧画面**
   - 画面タイトル: 「書店ページ対象ライブラリ一覧」
   - 新規登録ボタン（画面上部）
   - テーブル表示: 書店名, Library ID, 登録日時, 更新日時
   - 各行: 編集ボタン, 削除ボタン
   - デフォルトソート: 登録日時降順

2. **書店ページ対象ライブラリ登録画面**
   - 画面タイトル: 「書店ページ対象ライブラリ 新規登録」
   - 入力フォーム: 書店名, Library ID
   - ファイルアップロードセクション: HTMLファイル選択, プレビュー機能
   - ボタン: 登録, キャンセル

3. **書店ページ対象ライブラリ編集画面**
   - 画面タイトル: 「書店ページ対象ライブラリ 編集」
   - 表示情報: 登録日時, 更新日時（編集不可）
   - 入力フォーム: 書店名, Library ID
   - ファイルアップロードセクション: HTMLアップロード機能
   - HTMLコード編集セクション: コードエディタ, プレビュー機能
   - ボタン: 更新, キャンセル

## 6. セキュリティ設計

### 6.1 認証・認可
- **認証方式:** IPアドレス制限
- **権限:** システム利用者は全員同じ権限
- **将来拡張:** AWS WAF導入、Cognito認証の検討

### 6.2 データ保護
- **Amplify Data:** IAM認証、GraphQL @authディレクティブ
- **S3アクセス:** Amplify FunctionsのIAMロールに最小権限付与
- **Aurora MySQL:** Secrets Manager経由での接続情報管理

### 6.3 入力検証
- **クライアントサイド:** React フォームバリデーション
- **サーバーサイド:** Amplify Functions内でのバリデーション
- **HTMLファイル:** 現状では形式チェックなし（将来拡張検討）

## 7. エラーハンドリング設計

### 7.1 エラー分類
1. **バリデーションエラー:** 入力値不正、重複チェック
2. **システムエラー:** API呼び出し失敗、DB接続エラー
3. **外部サービスエラー:** S3、CloudFront、Aurora MySQL

### 7.2 エラー処理フロー
```
エラー発生 → Amplify Functions内でキャッチ → ログ出力 → クライアントにエラー情報返却 → ユーザーにメッセージ表示
```

### 7.3 ログ設計
- **出力先:** CloudWatch Logs
- **ログレベル:** INFO, WARN, ERROR
- **記録内容:** 処理ステップ、エラー詳細、実行時間

## 8. パフォーマンス設計

### 8.1 レスポンス時間目標
- **一覧表示:** 2秒以内
- **登録処理:** 5秒以内
- **HTMLアップロード:** 10秒以内

### 8.2 最適化手法
- **GraphQL:** 必要フィールドのみ取得
- **S3:** マルチパートアップロード（大容量ファイル）
- **CloudFront:** 適切なキャッシュ設定

## 9. 運用設計

### 9.1 監視項目
- **Amplify Functions:** 実行時間、エラー率
- **Amplify Data:** クエリ実行時間
- **S3:** アップロード成功率
- **Aurora MySQL:** 接続状況、クエリ実行時間

### 9.2 バックアップ・復旧
- **Amplify Data:** 自動バックアップ（DynamoDB）
- **S3:** バージョニング有効化
- **Aurora MySQL:** 自動バックアップ設定

## 10. 開発・デプロイ設計

### 10.1 開発環境
- **ローカル開発:** Amplify CLI、Amplify Sandbox
- **テスト環境:** Amplify Preview環境
- **本番環境:** Amplify Production環境

### 10.2 CI/CD
- **ソースコード管理:** GitHub
- **ブランチ戦略:** Git Flow（main, develop, feature branches）
- **自動デプロイ:** Amplify Console経由
- **テスト:** Jest（単体テスト）、Cypress（E2Eテスト）

### 10.3 セキュリティ考慮事項
- **入力検証:** XSS、SQLインジェクション対策
- **ファイルアップロード:** ファイル形式・サイズ制限
- **認証:** IPアドレス制限（将来的にCognito導入検討）
- **権限管理:** IAMロール最小権限の原則

## 11. 実装詳細

### 11.1 Amplify Functions実装例
```javascript
// 書店ライブラリ登録Function
export const registerBookstore = async (event) => {
  try {
    const { bookstore_name, library_id, html_file } = JSON.parse(event.body);
    
    // バリデーション
    if (!validateInput(bookstore_name, library_id)) {
      return errorResponse(400, 'Invalid input');
    }
    
    // 重複チェック
    const existing = await checkDuplicate(library_id);
    if (existing) {
      return errorResponse(409, 'Library ID already exists');
    }
    
    // Amplify Data登録
    const bookstore = await createBookstore({ bookstore_name, library_id });
    
    // HTMLファイル処理
    if (html_file) {
      await uploadToS3(html_file, library_id);
      await invalidateCloudFront(library_id);
    }
    
    // Aurora MySQL更新
    await updateAuroraMySQL(library_id);
    
    return successResponse(bookstore);
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(500, 'Internal server error');
  }
};
```

### 11.2 React Component実装例
```jsx
// 書店ライブラリ一覧コンポーネント
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';

const BookstoreList = () => {
  const [bookstores, setBookstores] = useState([]);
  const [loading, setLoading] = useState(true);
  const client = generateClient();
  
  useEffect(() => {
    fetchBookstores();
  }, []);
  
  const fetchBookstores = async () => {
    try {
      const result = await client.graphql({
        query: listBookstores,
        variables: { sortDirection: 'DESC' }
      });
      setBookstores(result.data.listBookstores.items);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bookstore-list">
      <h1>書店ページ対象ライブラリ一覧</h1>
      <button onClick={() => navigate('/register')}>新規登録</button>
      {loading ? (
        <div>読み込み中...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>書店名</th>
              <th>Library ID</th>
              <th>登録日時</th>
              <th>更新日時</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {bookstores.map(bookstore => (
              <tr key={bookstore.id}>
                <td>{bookstore.bookstore_name}</td>
                <td>{bookstore.library_id}</td>
                <td>{formatDate(bookstore.created_at)}</td>
                <td>{formatDate(bookstore.updated_at)}</td>
                <td>
                  <button onClick={() => editBookstore(bookstore.id)}>編集</button>
                  <button onClick={() => deleteBookstore(bookstore.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

### 11.3 GraphQL スキーマ詳細
```graphql
type Bookstore @model @auth(rules: [{ allow: private, operations: [read, create, update, delete] }]) {
  id: ID!
  bookstore_name: String! @index(name: "byBookstoreName", queryField: "bookstoresByName")
  library_id: String! @index(name: "byLibraryId", queryField: "bookstoresByLibraryId")
  created_at: AWSDateTime
  updated_at: AWSDateTime
}

type Query {
  listBookstores(
    filter: ModelBookstoreFilterInput
    limit: Int
    nextToken: String
    sortDirection: ModelSortDirection
  ): ModelBookstoreConnection
  
  getBookstore(id: ID!): Bookstore
  
  bookstoresByName(
    bookstore_name: String!
    sortDirection: ModelSortDirection
    filter: ModelBookstoreFilterInput
    limit: Int
    nextToken: String
  ): ModelBookstoreConnection
  
  bookstoresByLibraryId(
    library_id: String!
    sortDirection: ModelSortDirection
    filter: ModelBookstoreFilterInput
    limit: Int
    nextToken: String
  ): ModelBookstoreConnection
}

type Mutation {
  createBookstore(input: CreateBookstoreInput!, condition: ModelBookstoreConditionInput): Bookstore
  updateBookstore(input: UpdateBookstoreInput!, condition: ModelBookstoreConditionInput): Bookstore
  deleteBookstore(input: DeleteBookstoreInput!, condition: ModelBookstoreConditionInput): Bookstore
}
```

## 12. テスト設計

### 12.1 テスト戦略
- **単体テスト:** Amplify Functions、React Components
- **統合テスト:** API連携、データベース操作
- **E2Eテスト:** ユーザーシナリオ全体
- **パフォーマンステスト:** 負荷テスト、レスポンス時間測定

### 12.2 テストケース例
```javascript
// 書店ライブラリ登録のテストケース
describe('Bookstore Registration', () => {
  test('正常な登録処理', async () => {
    const input = {
      bookstore_name: 'テスト書店',
      library_id: 'test001'
    };
    
    const result = await registerBookstore(input);
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('success');
  });
  
  test('重複Library IDエラー', async () => {
    const input = {
      bookstore_name: 'テスト書店2',
      library_id: 'test001' // 既存ID
    };
    
    const result = await registerBookstore(input);
    expect(result.statusCode).toBe(409);
  });
  
  test('バリデーションエラー', async () => {
    const input = {
      bookstore_name: '', // 空文字
      library_id: 'test002'
    };
    
    const result = await registerBookstore(input);
    expect(result.statusCode).toBe(400);
  });
});
```

## 13. 運用手順

### 13.1 デプロイ手順
1. 開発環境でのテスト実行
2. ステージング環境へのデプロイ
3. 受入テスト実行
4. 本番環境へのデプロイ
5. 動作確認

### 13.2 監視・アラート設定
- **CloudWatch Alarms:** エラー率、レスポンス時間
- **SNS通知:** 障害発生時の自動通知
- **ダッシュボード:** リアルタイム監視画面

### 13.3 バックアップ・復旧手順
- **データバックアップ:** 日次自動バックアップ
- **復旧手順:** 障害時の復旧プロセス
- **災害対策:** マルチAZ構成による可用性確保

## 14. 今後の拡張計画

### 14.1 機能拡張
- **検索・フィルター機能:** 一覧画面の検索機能追加
- **ページネーション:** 大量データ対応
- **一括操作:** 複数ライブラリの一括処理
- **権限管理:** ユーザーロール別アクセス制御

### 14.2 技術的改善
- **認証強化:** Cognito導入
- **セキュリティ強化:** WAF導入
- **パフォーマンス改善:** キャッシュ戦略最適化
- **監視強化:** APM導入

---

本詳細設計書は、ビブリオン書店ページ管理システムの実装に必要な技術仕様を包括的に定義しています。開発チームは本書に基づいて実装を進め、品質の高いシステムを構築してください。
