## API設計(GraphQL API)

### 1. エンドポイント: 書店ページ対象ライブラリ登録

#### GraphQL Mutation定義

```graphql
mutation CreateBookstoreLibrary($input: CreateBookstoreLibraryInput!) {
  createBookstoreLibrary(input: $input) {
    id
    storeName
    libraryId
    htmlFileUrl
    createdAt
    updatedAt
  }
}
```

#### 入力型定義

```graphql
input CreateBookstoreLibraryInput {
  storeName: String!
  libraryId: String!
  htmlFile: AWSURL
}
```

#### リクエスト変数

| フィールド | 型 | 必須 | 説明 |
|------------|----|----|------|
| storeName | String | ○ | 書店名（最大100文字） |
| libraryId | String | ○ | Library ID（英数字15桁、一意） |
| htmlFile | AWSURL | × | HTMLファイルのURL |

#### リクエスト例 (GraphQL)

```json
{
  "query": "mutation CreateBookstoreLibrary($input: CreateBookstoreLibraryInput!) { createBookstoreLibrary(input: $input) { id storeName libraryId htmlFileUrl createdAt updatedAt } }",
  "variables": {
    "input": {
      "storeName": "古書店 文学堂",
      "libraryId": "123456789012345",
      "htmlFile": "https://example.com/library.html"
    }
  }
}
```

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| id | ID | 登録された書店ページ対象ライブラリの一意識別子 |
| storeName | String | 書店名 |
| libraryId | String | Library ID |
| htmlFileUrl | AWSURL | HTMLファイルのURL |
| createdAt | AWSDateTime | 作成日時 |
| updatedAt | AWSDateTime | 更新日時 |

#### レスポンス例 (GraphQL)

```json
{
  "data": {
    "createBookstoreLibrary": {
      "id": "01234567-89ab-cdef-0123-456789abcdef",
      "storeName": "古書店 文学堂",
      "libraryId": "123456789012345",
      "htmlFileUrl": "https://valuebooks-producton-mainsite-cdn.s3.amazonaws.com/ws/library/123456789012345.html",
      "createdAt": "2025-06-05T23:50:46.123Z",
      "updatedAt": "2025-06-05T23:50:46.123Z"
    }
  }
}
```

### 2. エンドポイント: HTMLファイルアップロード

#### GraphQL Mutation定義

```graphql
mutation UploadHtmlFile($input: UploadHtmlFileInput!) {
  uploadHtmlFile(input: $input) {
    libraryId
    htmlFileUrl
    updatedAt
  }
}
```

#### 入力型定義

```graphql
input UploadHtmlFileInput {
  libraryId: String!
  htmlFile: AWSURL!
}
```

#### リクエスト変数

| フィールド | 型 | 必須 | 説明 |
|------------|----|----|------|
| libraryId | String | ○ | Library ID |
| htmlFile | AWSURL | ○ | HTMLファイルのURL |

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| libraryId | String | Library ID |
| htmlFileUrl | AWSURL | アップロードされたHTMLファイルのURL |
| updatedAt | AWSDateTime | 更新日時 |

#### レスポンス例 (GraphQL)

```json
{
  "data": {
    "uploadHtmlFile": {
      "libraryId": "123456789012345",
      "htmlFileUrl": "https://valuebooks-producton-mainsite-cdn.s3.amazonaws.com/ws/library/123456789012345.html",
      "updatedAt": "2025-06-05T23:50:46.123Z"
    }
  }
}
```

### 3. エンドポイント: 書店ページ対象ライブラリ一覧取得

#### GraphQL Query定義

```graphql
query ListBookstoreLibraries($filter: ModelBookstoreLibraryFilterInput, $limit: Int, $nextToken: String) {
  listBookstoreLibraries(filter: $filter, limit: $limit, nextToken: $nextToken) {
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

#### レスポンス定義

| フィールド | 型 | 説明 |
|-----------|----|----|
| items | [BookstoreLibrary] | 書店ページ対象ライブラリのリスト |
| nextToken | String | ページネーション用トークン |

#### レスポンス例 (GraphQL)

```json
{
  "data": {
    "listBookstoreLibraries": {
      "items": [
        {
          "id": "01234567-89ab-cdef-0123-456789abcdef",
          "storeName": "古書店 文学堂",
          "libraryId": "123456789012345",
          "htmlFileUrl": "https://valuebooks-producton-mainsite-cdn.s3.amazonaws.com/ws/library/123456789012345.html",
          "createdAt": "2025-06-05T23:50:46.123Z",
          "updatedAt": "2025-06-05T23:50:46.123Z"
        }
      ],
      "nextToken": null
    }
  }
}
```

### 4. エラーレスポンス定義

#### GraphQLエラーレスポンス構造

| フィールド | 型 | 説明 |
|-----------|----|----|
| errors | [GraphQLError] | エラー情報の配列 |
| errors[].message | String | エラーメッセージ |
| errors[].extensions | Object | エラー詳細情報 |
| errors[].extensions.code | String | エラーコード |
| errors[].extensions.argumentName | String | エラーが発生した引数名（オプション） |

#### エラーコード一覧

| エラーコード | エラー内容 | メッセージ例 |
|------------|-----------|------------|
| VALIDATION_ERROR | バリデーションエラー | 入力内容に問題があります。 |
| DUPLICATE_LIBRARY_ID | Library ID重複 | このLibrary IDは既に使用されています。 |
| FILE_UPLOAD_ERROR | ファイルアップロードエラー | HTMLファイルのアップロードに失敗しました。 |
| UNAUTHORIZED | 認証エラー | 認証されていません。 |
| FORBIDDEN | アクセス権限エラー | この操作を行う権限がありません。 |
| NOT_FOUND | リソース未発見 | 指定されたリソースが見つかりません。 |
| INTERNAL_ERROR | サーバー内部エラー | システムエラーが発生しました。 |

#### バリデーションエラーレスポンス例 (GraphQL)

```json
{
  "data": null,
  "errors": [
    {
      "message": "書店名は必須項目です。",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "argumentName": "storeName"
      }
    },
    {
      "message": "Library IDは15桁の英数字で入力してください。",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "argumentName": "libraryId"
      }
    }
  ]
}
```

### 5. セキュリティ・認証仕様

| 項目 | 内容 |
|------|------|
| 認証方式 | IPアドレス制限 |
| アクセス制御 | 許可されたIPアドレスからのみアクセス可能 |
| データ保護 | HTTPS通信必須 |
| アクセス制御 | RBAC（ロールベースアクセス制御） |
| レート制限 | API Gateway設定に基づく |
| CORS対応 | API Gateway CORS設定 |
| データ検証 | Lambda関数内での入力値の検証 |

### 8. パフォーマンス考慮事項

| 項目 | 設計方針 | 備考 |
|------|---------|------|
| タイムアウト設定 | API呼び出し：30秒、画像アップロード：Storageカテゴリの設定に基づく | S3プリサインドURLを使用 |
| リクエストサイズ制限 | JSON本体：API Gateway設定・画像ファイル：S3設定に基づく | バリデーションで事前検証 |
| 非同期処理 | 画像リサイズ処理はLambda関数で非同期実行 | S3トリガー機能を活用 |
| データベース負荷 | DynamoDBのセカンダリインデックス最適化 | 高速検索を実現 |

### 9. 監査ログ仕様

| 記録項目 | 内容 | 保存期間 | 備考 |
|---------|------|---------|------|
| リクエストID | 一意のリクエスト識別子 | 365日 | CloudWatch Logsで記録 |
| タイムスタンプ | リクエスト受信日時 | 365日 | ISO8601形式 |
| ユーザー識別情報 | ユーザーID、IPアドレス | 365日 | CognitoユーザーID |
| リクエスト情報 | HTTPメソッド、URL、リクエスト内容概要 | 365日 | API Gatewayアクセスログ |
| レスポンス情報 | ステータスコード、成否、登録ID | 365日 | Lambdaログに記録 |
| 変更内容 | リソース変更差分データ | 365日 | DynamoDB Streamsで追跡 |
