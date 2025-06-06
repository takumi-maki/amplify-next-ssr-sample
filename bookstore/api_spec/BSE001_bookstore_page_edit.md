## API設計(GraphQL API)

### 1. エンドポイント: 書店ページ対象ライブラリ取得

#### GraphQL Query定義

```graphql
query GetBookstoreLibrary($id: ID!) {
  getBookstoreLibrary(id: $id) {
    id
    storeName
    libraryId
    htmlFileUrl
    createdAt
    updatedAt
  }
}
```

#### クエリ変数

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| id | ID | ○ | 書店ページ対象ライブラリの一意識別子 |

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| id | ID | 書店ページ対象ライブラリの一意識別子 |
| storeName | String | 書店名 |
| libraryId | String | Library ID |
| htmlFileUrl | AWSURL | HTMLファイルのURL |
| createdAt | AWSDateTime | 作成日時 |
| updatedAt | AWSDateTime | 更新日時 |
| recommendedBooks | Array of Object | おすすめ本リスト |
| recommendedBooks[].isbn | String | ISBN |
| recommendedBooks[].title | String | 書籍タイトル |
| recommendedBooks[].author | String | 著者名 |
| recommendedBooks[].coverUrl | String | 書影URL |
| recommendedBooks[].comment | String | おすすめコメント |
| recommendedBooks[].displayOrder | Integer | 表示順 |
| createdAt | ISO8601日時 | 作成日時 |
| updatedAt | ISO8601日時 | 更新日時 |
| createdBy | String | 作成者ID |
| updatedBy | String | 更新者ID |
| version | Integer | 楽観的ロック用バージョン番号 |

#### レスポンス例 (JSON)

```json
{
  "id": "bp-12345",
  "storeName": "古書店 文学堂",
  "storeCode": "BUNGAKUDO",
  "description": "昭和初期から平成までの文学作品を中心に取り扱っています。特に太宰治や三島由紀夫など、日本文学の名作を多数取り揃えております。店内には読書スペースもあり、ゆっくりと本を選んでいただけます。",
  "status": "published",
  "imageUrl": "/images/stores/bp-12345/main.jpg",
  "tags": ["古書", "文学", "小説"],
  "recommendedBooks": [
    {
      "isbn": "9784101006062",
      "title": "人間失格",
      "author": "太宰治",
      "coverUrl": "/images/books/9784101006062.jpg",
      "comment": "太宰治の代表作。人間の弱さと強さを描いた名作です。",
      "displayOrder": 1
    },
    {
      "isbn": "9784101026022",
      "title": "金閣寺",
      "author": "三島由紀夫",
      "coverUrl": "/images/books/9784101026022.jpg",
      "comment": "三島由紀夫の最高傑作と言われる小説。文体の美しさをぜひ味わってください。",
      "displayOrder": 2
    }
  ],
  "createdAt": "2025-02-15T09:30:00Z",
  "updatedAt": "2025-05-01T14:45:00Z",
  "createdBy": "user-001",
  "updatedBy": "user-002",
  "version": 5
}
```

### 2. エンドポイント: 書店ページ更新

#### リクエスト定義

```javascript
import { API } from 'aws-amplify';

async function updateBookstorePage(bookstorePageId, data) {
  const apiName = 'bookstoreApi';
  const path = `/bookstore-pages/${bookstorePageId}`;
  const myInit = {
    body: data,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return await API.put(apiName, path, myInit);
}
```

- **HTTPメソッド**: PUT
- **エンドポイント**: `/bookstore-pages/{bookstorePageId}`
- **コンテントタイプ**: `application/json`

#### パスパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| bookstorePageId | String | ○ | 書店ページの一意識別子 |

#### リクエストボディ

| フィールド | 型 | 必須 | 説明 |
|------------|----|----|------|
| storeName | String | ○ | 書店名（最大100文字） |
| storeCode | String | ○ | 書店コード（英数字、最大20文字、一意） |
| description | String | ○ | 店舗紹介文（最大2000文字） |
| status | String | ○ | ステータス（"published"=公開, "draft"=下書き, "archived"=アーカイブ） |
| tags | Array of String | × | 書店タグリスト（最大10個） |
| recommendedBooks | Array of Object | × | おすすめ本リスト（最大20冊） |
| recommendedBooks[].isbn | String | ○ | ISBN（13桁） |
| recommendedBooks[].comment | String | × | おすすめコメント（最大300文字） |
| recommendedBooks[].displayOrder | Integer | × | 表示順（1から開始） |
| version | Integer | ○ | 楽観的ロック用バージョン番号（取得時と同じ値） |

#### リクエスト例 (JSON)

```json
{
  "storeName": "古書店 文学堂",
  "storeCode": "BUNGAKUDO",
  "description": "昭和初期から平成までの文学作品を中心に取り扱っています。特に太宰治や三島由紀夫など、日本文学の名作を多数取り揃えております。新たに、谷崎潤一郎の作品コーナーも設けました。店内には読書スペースもあり、ゆっくりと本を選んでいただけます。",
  "status": "published",
  "tags": ["古書", "文学", "小説", "名作文学"],
  "recommendedBooks": [
    {
      "isbn": "9784101006062",
      "comment": "太宰治の代表作。人間の弱さと強さを描いた名作です。",
      "displayOrder": 1
    },
    {
      "isbn": "9784101026022",
      "comment": "三島由紀夫の最高傑作と言われる小説。文体の美しさをぜひ味わってください。",
      "displayOrder": 2
    },
    {
      "isbn": "9784101007038",
      "comment": "谷崎潤一郎の代表作。細部まで行き届いた描写が魅力です。",
      "displayOrder": 3
    }
  ],
  "version": 5
}
```

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| id | String | 書店ページの一意識別子 |
| storeName | String | 書店名 |
| storeCode | String | 書店コード |
| description | String | 店舗紹介文 |
| status | String | ステータス（"published", "draft", "archived"） |
| imageUrl | String | 店舗画像URL |
| tags | Array of String | 書店タグリスト |
| recommendedBooks | Array of Object | おすすめ本リスト |
| recommendedBooks[].isbn | String | ISBN |
| recommendedBooks[].title | String | 書籍タイトル（ISBN検索結果から自動設定） |
| recommendedBooks[].author | String | 著者名（ISBN検索結果から自動設定） |
| recommendedBooks[].coverUrl | String | 書影URL（ISBN検索結果から自動設定） |
| recommendedBooks[].comment | String | おすすめコメント |
| recommendedBooks[].displayOrder | Integer | 表示順 |
| createdAt | ISO8601日時 | 作成日時 |
| updatedAt | ISO8601日時 | 更新日時 |
| createdBy | String | 作成者ID |
| updatedBy | String | 更新者ID |
| version | Integer | 更新後の新しいバージョン番号 |

#### レスポンス例 (JSON)

```json
{
  "id": "bp-12345",
  "storeName": "古書店 文学堂",
  "storeCode": "BUNGAKUDO",
  "description": "昭和初期から平成までの文学作品を中心に取り扱っています。特に太宰治や三島由紀夫など、日本文学の名作を多数取り揃えております。新たに、谷崎潤一郎の作品コーナーも設けました。店内には読書スペースもあり、ゆっくりと本を選んでいただけます。",
  "status": "published",
  "imageUrl": "/images/stores/bp-12345/main.jpg",
  "tags": ["古書", "文学", "小説", "名作文学"],
  "recommendedBooks": [
    {
      "isbn": "9784101006062",
      "title": "人間失格",
      "author": "太宰治",
      "coverUrl": "/images/books/9784101006062.jpg",
      "comment": "太宰治の代表作。人間の弱さと強さを描いた名作です。",
      "displayOrder": 1
    },
    {
      "isbn": "9784101026022",
      "title": "金閣寺",
      "author": "三島由紀夫",
      "coverUrl": "/images/books/9784101026022.jpg",
      "comment": "三島由紀夫の最高傑作と言われる小説。文体の美しさをぜひ味わってください。",
      "displayOrder": 2
    },
    {
      "isbn": "9784101007038",
      "title": "細雪",
      "author": "谷崎潤一郎",
      "coverUrl": "/images/books/9784101007038.jpg",
      "comment": "谷崎潤一郎の代表作。細部まで行き届いた描写が魅力です。",
      "displayOrder": 3
    }
  ],
  "createdAt": "2025-02-15T09:30:00Z",
  "updatedAt": "2025-05-14T10:15:00Z",
  "createdBy": "user-001",
  "updatedBy": "user-003",
  "version": 6
}
```

### 3. エンドポイント: 店舗画像更新

#### リクエスト定義

```javascript
import { API } from 'aws-amplify';

async function updateBookstoreImage(bookstorePageId, imageFile, version) {
  const apiName = 'bookstoreApi';
  const path = `/bookstore-pages/${bookstorePageId}/image`;
  
  // FormDataを作成
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('version', version);
  
  const myInit = {
    body: formData,
    headers: {
      // multipart/form-dataの場合はヘッダーを自動設定させる
    }
  };

  return await API.put(apiName, path, myInit);
}
```

- **HTTPメソッド**: PUT
- **エンドポイント**: `/bookstore-pages/{bookstorePageId}/image`
- **コンテントタイプ**: `multipart/form-data`

#### パスパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| bookstorePageId | String | ○ | 書店ページの一意識別子 |

#### フォームデータ

| フィールド | 型 | 必須 | 説明 |
|------------|----|----|------|
| image | File | ○ | 店舗画像ファイル（JPEG/PNG/GIF形式、最大5MB） |
| version | String | ○ | 楽観的ロック用バージョン番号 |

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| imageUrl | String | 更新された店舗画像のURL |
| updatedAt | ISO8601日時 | 更新日時 |
| version | Integer | 更新後の新しいバージョン番号 |

#### レスポンス例 (JSON)

```json
{
  "imageUrl": "/images/stores/bp-12345/main.jpg?v=20250514101520",
  "updatedAt": "2025-05-14T10:15:20Z",
  "version": 7
}
```

### 4. エンドポイント: 店舗画像削除

#### リクエスト定義

- **HTTPメソッド**: DELETE
- **エンドポイント**: `/bookstore-pages/{bookstorePageId}/image`

#### パスパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| bookstorePageId | String | ○ | 書店ページの一意識別子 |

#### クエリパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| version | Integer | ○ | 楽観的ロック用バージョン番号 |

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| success | Boolean | 削除成功フラグ（常にtrue） |
| updatedAt | ISO8601日時 | 更新日時 |
| version | Integer | 更新後の新しいバージョン番号 |

#### レスポンス例 (JSON)

```json
{
  "success": true,
  "updatedAt": "2025-05-14T10:20:00Z",
  "version": 8
}
```

### 5. エンドポイント: 書店タグ一覧取得

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

### 6. エンドポイント: 書籍情報取得（ISBN検索）

#### リクエスト定義

- **HTTPメソッド**: GET
- **エンドポイント**: `/books/lookup`

#### クエリパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| isbn | String | ○ | ISBN（10桁または13桁） |

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| isbn | String | ISBN（13桁形式） |
| title | String | 書籍タイトル |
| author | String | 著者名 |
| publisher | String | 出版社 |
| publishedDate | String | 出版日（YYYY-MM-DD形式） |
| coverUrl | String | 書影URL |
| description | String | 内容紹介 |
| price | Integer | 定価（税抜、円） |
| status | String | 在庫状態（"AVAILABLE", "OUT_OF_STOCK", "OUT_OF_PRINT"） |

#### レスポンス例 (JSON)

```json
{
  "isbn": "9784101007038",
  "title": "細雪",
  "author": "谷崎潤一郎",
  "publisher": "新潮社",
  "publishedDate": "1985-10-28",
  "coverUrl": "/images/books/9784101007038.jpg",
  "description": "大阪の没落した旧家の四姉妹を主人公に、昭和初期の関西の風俗を丹念に描いた谷崎文学の集大成ともいうべき長編小説。...",
  "price": 770,
  "status": "AVAILABLE"
}
```

### 7. エンドポイント: 書店ページプレビュー

#### リクエスト定義

- **HTTPメソッド**: POST
- **エンドポイント**: `/bookstore-pages/{bookstorePageId}/preview`
- **コンテントタイプ**: `application/json`

#### パスパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| bookstorePageId | String | ○ | 書店ページの一意識別子 |

#### リクエストボディ

書店ページ更新と同じリクエストボディ構造（version除外可）

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| previewUrl | String | プレビュー表示用の一時URL |
| expiresAt | ISO8601日時 | プレビューURL有効期限 |

#### レスポンス例 (JSON)

```json
{
  "previewUrl": "/preview/bookstore-pages/bp-12345/temp-67890",
  "expiresAt": "2025-05-14T10:45:00Z"
}
```

### 8. エンドポイント: 書店ページ削除

#### リクエスト定義

- **HTTPメソッド**: DELETE
- **エンドポイント**: `/bookstore-pages/{bookstorePageId}`

#### パスパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| bookstorePageId | String | ○ | 書店ページの一意識別子 |

#### クエリパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| version | Integer | ○ | 楽観的ロック用バージョン番号 |

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| success | Boolean | 削除成功フラグ（常にtrue） |
| deletedAt | ISO8601日時 | 削除日時 |

#### レスポンス例 (JSON)

```json
{
  "success": true,
  "deletedAt": "2025-05-14T11:00:00Z"
}
```

### 9. エラーレスポンス定義

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
| 400 | INVALID_REQUEST | リクエスト形式不正 | リクエスト形式が不正です。 |
| 400 | VALIDATION_ERROR | バリデーションエラー | 入力内容に問題があります。 |
| 400 | DUPLICATE_STORE_CODE | 書店コード重複 | この書店コードは既に使用されています。 |
| 400 | INVALID_ISBN | ISBN不正 | 無効なISBNが含まれています。 |
| 400 | BOOK_NOT_FOUND | 書籍情報未発見 | 指定されたISBNの書籍情報が見つかりません。 |
| 400 | IMAGE_UPLOAD_ERROR | 画像アップロードエラー | 画像のアップロードに失敗しました。 |
| 401 | UNAUTHORIZED | 認証エラー | 認証されていません。 |
| 403 | FORBIDDEN | アクセス権限エラー | この操作を行う権限がありません。 |
| 403 | STATUS_CONSTRAINT | ステータス制約違反 | 現在のステータスでは実行できない操作です。 |
| 404 | RESOURCE_NOT_FOUND | リソース未発見 | 指定された書店ページが見つかりません。 |
| 409 | VERSION_CONFLICT | バージョン競合 | データが他のユーザーによって更新されています。 |
| 413 | PAYLOAD_TOO_LARGE | リクエストサイズ超過 | ファイルサイズが上限を超えています。 |
| 415 | UNSUPPORTED_MEDIA_TYPE | 未対応メディアタイプ | サポートされていないファイル形式です。 |
| 500 | INTERNAL_SERVER_ERROR | サーバー内部エラー | システムエラーが発生しました。 |
| 503 | SERVICE_UNAVAILABLE | サービス一時停止 | 現在サービスをご利用いただけません。 |

#### バリデーションエラーレスポンス例 (JSON)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に問題があります。",
    "details": [
      {
        "field": "description",
        "message": "店舗紹介文は2000文字以内で入力してください。"
      },
      {
        "field": "recommendedBooks[1].isbn",
        "message": "無効なISBN形式です。"
      }
    ]
  }
}
```

#### バージョン競合エラーレスポンス例 (JSON)

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "データが他のユーザーによって更新されています。最新のデータを取得してから再度操作してください。",
    "details": {
      "currentVersion": 8,
      "requestedVersion": 7
    }
  }
}
```

### 10. セキュリティ・認証仕様

| 項目 | 内容 |
|------|------|
| 認証方式 | AWS_IAM または Cognito User Pools |
| 必要権限 | Cognitoユーザープールにおける書き込み権限（更新/削除）、読み取り権限（参照） |
| 楽観的ロック | DynamoDBのconditional updateを使用したバージョン管理 |
| アクセス制御 | RBAC（ロールベースアクセス制御） |
| レート制限 | API Gateway設定に基づく |
| CORS対応 | API Gateway CORS設定 |
| データ検証 | Lambda関数内での入力値の検証 |

### 11. パフォーマンス考慮事項

| 項目 | 設計方針 | 備考 |
|------|---------|------|
| タイムアウト設定 | API呼び出し：API Gatewayの設定、画像アップロード：S3プリサインドURLを使用 | Storageカテゴリの設定に基づく |
| リクエストサイズ制限 | API GatewayとS3の設定に基づく | バリデーションで事前検証 |
| キャッシュ戦略 | CloudFrontとAPI Gatewayキャッシュ設定 | 変更がない場合に304レスポンス |
| 非同期処理 | S3トリガーによるLambda関数実行 | 即時レスポンス返却後にバックグラウンド処理 |
| データベース負荷 | DynamoDBのインデックス最適化 | 高速検索を実現 |

### 12. 監査ログ仕様

| 記録項目 | 内容 | 保存期間 | 備考 |
|---------|------|---------|------|
| リクエストID | 一意のリクエスト識別子 | 365日 | CloudWatch Logsに記録 |
| タイムスタンプ | リクエスト受信日時 | 365日 | ISO8601形式 |
| ユーザー識別情報 | CognitoユーザーID、IPアドレス | 365日 | API Gatewayアクセスログ |
| リクエスト情報 | HTTPメソッド、URL、リクエスト内容 | 365日 | Lambda関数ログ |
| レスポンス情報 | ステータスコード、成否 | 365日 | CloudWatchメトリクス |
| 変更内容 | リソース変更差分データ | 365日 | DynamoDB Streamsによる追跡 |
| ステータス変更 | 公開状態の変更履歴 | 365日 | CloudWatch Eventsで記録 |
