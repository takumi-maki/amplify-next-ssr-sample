## API設計(GraphQL API)

### 1. エンドポイント: 書店ページ対象ライブラリ一覧取得

#### GraphQL Query定義

```graphql
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
      libraryId
      htmlFileUrl
      createdAt
      updatedAt
    }
    nextToken
  }
}
```

#### クエリ変数

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| filter | ModelBookstoreLibraryFilterInput | × | フィルター条件 |
| limit | Int | × | 取得件数（デフォルト: 20、最大: 100） |
| nextToken | String | × | ページネーション用トークン |
| sortDirection | ModelSortDirection | × | ソート順（ASC, DESC、デフォルト: DESC） |

#### リクエスト例

```javascript
const response = await getBookstorePages({
  keyword: '東京',
  status: 'published',
  sortField: 'updatedAt',
  sortDirection: 'desc',
  page: 1,
  pageSize: 20
});
```

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| items | Array of BookstorePage | 書店ページオブジェクトの配列 |
| pagination | Object | ページネーション情報 |
| pagination.totalItems | Integer | 検索条件に一致する総件数 |
| pagination.totalPages | Integer | 総ページ数 |
| pagination.currentPage | Integer | 現在のページ番号 |
| pagination.pageSize | Integer | 1ページあたりの表示件数 |

#### BookstorePage オブジェクト

| フィールド | 型 | 説明 |
|-----------|----|----|
| id | String | 書店ページの一意識別子 |
| storeName | String | 書店名 |
| storeCode | String | 書店コード |
| description | String | 店舗紹介文 |
| status | String | ステータス（"published", "draft", "archived"） |
| imageUrl | String | 店舗画像URL |
| tags | Array of String | 書店タグリスト |
| createdAt | ISO8601日時 | 作成日時 |
| updatedAt | ISO8601日時 | 更新日時 |
| createdBy | String | 作成者ID |
| updatedBy | String | 更新者ID |

#### レスポンス例 (JSON)

```json
{
  "items": [
    {
      "id": "bp-12345",
      "storeName": "東京古書店",
      "storeCode": "TOKYO-OLD",
      "description": "昭和から平成の名作・名著を多数取り揃えています。",
      "status": "published",
      "imageUrl": "/images/stores/tokyo-old.jpg",
      "tags": ["古書", "昭和文学", "東京"],
      "createdAt": "2025-02-15T09:30:00Z",
      "updatedAt": "2025-05-10T14:45:00Z",
      "createdBy": "user-001",
      "updatedBy": "user-002"
    },
    {
      "id": "bp-67890",
      "storeName": "東京ブックセンター",
      "storeCode": "TOKYO-BC",
      "description": "新刊を中心に、幅広いジャンルの書籍を取り扱っています。",
      "status": "published",
      "imageUrl": "/images/stores/tokyo-bc.jpg",
      "tags": ["新刊", "総合", "東京"],
      "createdAt": "2025-01-20T11:15:00Z",
      "updatedAt": "2025-04-28T16:20:00Z",
      "createdBy": "user-001",
      "updatedBy": "user-001"
    }
  ],
  "pagination": {
    "totalItems": 2,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 20
  }
}
```

### 2. エンドポイント: 書店ステータス一覧取得

#### リクエスト定義

```javascript
import { API } from 'aws-amplify';

async function getBookstoreStatuses() {
  const apiName = 'bookstoreApi';
  const path = '/bookstore-pages/statuses';
  const myInit = {
    headers: {}
  };

  return await API.get(apiName, path, myInit);
}
```

- **HTTPメソッド**: GET
- **エンドポイント**: `/bookstore-pages/statuses`

#### レスポンス定義

書店ページで使用可能なステータス値の配列を返却します。

#### レスポンス例 (JSON)

```json
[
  "published",
  "draft",
  "archived"
]
```

### 3. エンドポイント: 書店タグ一覧取得

#### リクエスト定義

```javascript
import { API } from 'aws-amplify';

async function getBookstoreTags() {
  const apiName = 'bookstoreApi';
  const path = '/bookstore-pages/tags';
  const myInit = {
    headers: {}
  };

  return await API.get(apiName, path, myInit);
}
```

- **HTTPメソッド**: GET
- **エンドポイント**: `/bookstore-pages/tags`

#### レスポンス定義

書店ページで使用可能なタグ値の配列を返却します。

#### レスポンス例 (JSON)

```json
[
  "古書",
  "新刊",
  "文学",
  "小説",
  "総合",
  "東京",
  "大阪",
  "名古屋",
  "児童書",
  "専門書"
]
```

### 4. エラーレスポンス定義

#### エラーレスポンス構造

| フィールド | 型 | 説明 |
|-----------|----|----|
| error | Object | エラー情報 |
| error.code | String | エラーコード |
| error.message | String | エラーメッセージ |
| error.details | Array/Object | エラー詳細情報（オプション） |

#### ステータスコードとエラーコード

| HTTPステータスコード | エラーコード | エラー内容 | メッセージ例 |
|--------------------|------------|-----------|------------|
| 400 | INVALID_PARAMETER | リクエストパラメータ不正 | 無効なパラメータが含まれています。 |
| 400 | INVALID_FILTER | フィルター条件不正 | フィルター条件に問題があります。 |
| 400 | INVALID_SORT | ソート条件不正 | 指定されたソートフィールドは無効です。 |
| 400 | LIMIT_EXCEEDED | 取得上限超過 | 1ページあたりの取得件数は100件以下で指定してください。 |
| 401 | UNAUTHORIZED | 認証エラー | 認証されていません。 |
| 403 | FORBIDDEN | アクセス権限エラー | この操作を行う権限がありません。 |
| 500 | INTERNAL_SERVER_ERROR | サーバー内部エラー | システムエラーが発生しました。 |
| 503 | SERVICE_UNAVAILABLE | サービス一時停止 | 現在サービスをご利用いただけません。 |

#### エラーレスポンス例 (JSON)

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "無効なパラメータが含まれています。",
    "details": [
      {
        "field": "sortBy",
        "message": "指定されたソートフィールドは存在しません。"
      }
    ]
  }
}
```

### 3. セキュリティ・認証仕様

| 項目 | 内容 |
|------|------|
| 認証方式 | AWS_IAM または Cognito User Pools |
| アクセス制御 | RBAC（ロールベースアクセス制御） |
| レート制限 | API Gateway設定に基づく |
| CORS対応 | API Gateway CORS設定 |
| データ検証 | Lambda関数内での入力値の検証 |

### 4. パフォーマンス考慮事項

| 項目 | 設計方針 | 備考 |
|------|---------|------|
| インデックス戦略 | DynamoDBのテーブル設計でインデックスを最適化 | storeName, storeCode, status, createdAt, updatedAt |
| キャッシュ戦略 | API GatewayとCloudFrontのキャッシュ機能を活用 | 公開ページリストなど変更頻度低いデータはキャッシュ活用 |
| 応答時間目標 | CloudWatchメトリックスによる監視 | 95%のリクエストで500ms以内 |
| ページネーション最適化 | DynamoDBのクエリを最適化 | データ量増加に備えた拡張性確保 |

### 5. 監査ログ仕様

| 記録項目 | 内容 | 保存期間 | 備考 |
|---------|------|---------|------|
| リクエストID | 一意のリクエスト識別子 | 30日 | CloudWatch Logsでのトラッキング |
| タイムスタンプ | リクエスト受信日時 | 30日 | ISO8601形式 |
| ユーザー識別情報 | ユーザーID、IPアドレス | 30日 | 監査証跡 |
| リクエスト情報 | HTTPメソッド、URL、クエリパラメータ | 30日 | API Gatewayアクセスログ |
| レスポンス情報 | ステータスコード、応答時間 | 30日 | CloudWatchメトリックス |
| エラー情報 | エラーコード、スタックトレース | 30日 | Lambda関数ログ |

### 6. 追加実装詳細（UC-012より移動）

#### 検索対象フィールド仕様

* **検索対象:** 書店タイトルのみを検索対象とする
* **検索方式:** 部分一致検索
* **検索精度:** 大文字小文字を区別しない

#### 優先度設定

* **一覧の検索・フィルタリング・ページング:** 優先度：低い

#### 権限による表示制御

* **アクセス制御:** バリューブックス側のユーザーなど、ユーザーのロールや担当範囲によって、閲覧可能な書店ページを制限する場合、一覧表示や検索結果にその制御を反映させる必要がある
