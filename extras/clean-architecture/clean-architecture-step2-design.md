# クリーンアーキテクチャ - STEP 2: 設計方法論

## 概要

このステップでは、STEP 1で学んだ理論を**実装レベルの設計パターン**へ展開します。

- **このステップの学習時間**：約1.5～2.5時間
- **このステップの位置づけ**：理論から実装へのブリッジ。各層の具体的な設計方法を学ぶ
- **前提知識**：STEP 1 の基本概念を理解していること
- **このステップの学習成果**：
  - SOLID 原則を各層の設計にどう適用するか
  - ユースケース駆動の層設計
  - インターフェース設計とポートパターン
  - 依存性注入（DI）の戦略を理解する

---

## 目次

1. [設計原則の実装](#設計原則の実装)
   - SOLID 原則の各層への適用
   - 責務の分離と凝集度
   - テスタビリティを考慮した設計

2. [実装パターン](#実装パターン)
   - エンティティ層の設計
   - ユースケース層の構造化
   - インターフェース・アダプタ層のパターン
   - フレームワーク・ドライバー層との統合

3. [ポートとアダプタパターン](#ポートとアダプタパターン)
   - ポアーの役割と設計
   - アダプタの実装パターン
   - 依存性注入戦略

4. [参考リソース](#参考リソース)

---

## 設計原則の実装

### SOLID 原則を各層に適用する

STEP 1 で紹介した SOLID 原則を、実装フェーズでどう応用するかを解説します。

#### 1. Single Responsibility（単一責任）

**原則**：1つのクラス／関数は1つの責任のみを持つ

**各層での適用**：

| 層 | 責任の単位 | 例 |
|----|-----------|---|
| **Enterprise** | エンティティ = 1つのビジネス概念 | 顧客エンティティは「顧客データ管理」のみ |
| **Application** | ユースケース = 1つのビジネスプロセス | 「注文作成」と「支払い処理」は別ユースケース |
| **Adapter** | Controller = 1つのHTTPエンドポイント | POST /orders は注文作成のみ処理 |
| **Framework** | ライブラリマッパー = 1つの外部サービス | DB 接続と API 呼び出しは別クラス |

**具体例：注文ドメインの責任分離戻す**

```
【単一責任に従った実装】

エンティティ層：
  ├─ Order エンティティ
  │  └─ 責任：注文のビジネスルール
  │     （金額計算、ステータス状態遷移等）
  │
ユースケース層：
  ├─ CreateOrderUseCase
  │  └─ 責任：「注文作成」フロー
  ├─ PayOrderUseCase
  │  └─ 責任：「注文決済」フロー
  └─ SelectProductUseCase
     └─ 責任：「商品選択」フロー
```

**反例**：何でも屋クラス（避けるべき）
```
UserService
  ├─ createUser()
  ├─ updateUser()
  ├─ deleteUser()
  ├─ validateUser()
  ├─ notifyUser()
  ├─ generateReport()
  └─ ...10個以上のメソッド

⇒ このクラスの変更理由が多すぎる
⇒ テストも複雑で、修正が他に波及
```

#### 2. Open/Closed（開放閉鎖）

**原則**：拡張には開かれ、修正には閉じられている

**クリーンアーキテクチャでの実現方法**：

```
【拡張（新機能追加）】
既存コード：変更なし ✓
新規ファイル：追加のみ ✓

例：決済方法を「クレジットカード」から「PayPay対応」に拡張

修正前：
  PaymentService
    └─ processCardPayment() ← クレジットカード処理

修正後：
  PaymentService（変更なし）
    ├─ processPayment(paymentMethod)
    └─ paymentMethod は IPaymentMethod インターフェース
    
  新規追加：
    ├─ CardPaymentAdapter : IPaymentMethod
    └─ PayPayPaymentAdapter : IPaymentMethod
```

**設計パターン**：インターフェース + 実装クラス分離

```
【NG: クラスに直接依存】
ユースケース
  └─ cardPaymentProcessorから返ってきた（具体的な実装に依存）
    ⇒ 新規決済方法追加時に、ユースケース修正が必要


【OK: インターフェースに依存】
ユースケース
  └─ IPaymentProcessor インターフェースに依存
    ├─ CardPaymentProcessor : IPaymentProcessor
    ├─ PayPayPaymentProcessor : IPaymentProcessor
    └─ CryptoCurrencyProcessor : IPaymentProcessor
  ⇒ 新規決済追加時、新しいAdapter実装のみ。ユースケース変更なし
```

#### 3. Liskov Substitution（リスコフの置換）

**原則**：派生型は基本型の代わりに使用可能

**クリーンアーキテクチャでの意味**：
インターフェースを実装したすべてのクラスが、同じ場所で相互に置き換え可能であること

**具体例**：在庫管理の置き換え可能性

```
IInventoryRepository インターフェース
  └─ getProductStock(productId): number

実装1: SqlServerInventoryRepository
  └─ SQL Server から在庫を取得

実装2: MongoDbInventoryRepository
  └─ MongoDB から在庫を取得

実装3: RedisInventoryRepository (キャッシュ層)
  └─ Redis から在庫を取得

⇒ すべてが同じメソッドで代替可能
⇒ ユースケースは実装の詳細を知らない
```

**避けるべき悪い例**：
```
interface IPaymentProcessor {
  process(amount): void;
}

class CardPaymentProcessor : IPaymentProcessor {
  process(amount) {
    // クレジットカード処理
  }
}

class PayPayPaymentProcessor : IPaymentProcessor {
  process(amount) {
    // 一度スキャンが必要なため、UI対話が必要
    // インターフェース定義と矛盾
  }
}

⇒ CardPaymentProcessor と PayPayPaymentProcessor は完全には代替不可
⇒ Liskov Substitution 原則違反
```

#### 4. Interface Segregation（インターフェース分離）

**原則**：大きなインターフェースより複数の特定インターフェースが良い

**クリーンアーキテクチャでの適用**：各層が必要な操作だけを持つインターフェースに依存

**具体例：巨大なUserRepository は避ける**

```
【NG: 1つの大きいインターフェース】
interface IUserRepository {
  create(user): void;
  read(id): User;
  update(user): void;
  delete(id): void;
  search(criteria): User[];
  export(format): File;
  import(file): void;
  generateReport(): Report;
  ...
}

⇒ ユースケースが使わないメソッドにも依存
⇒ テスト時にすべてをモック


【OK: 分離されたインターフェース】
interface IUserReader {
  read(id): User;
}

interface IUserWriter {
  create(user): void;
  update(user): void;
  delete(id): void;
}

interface IUserSearcher {
  search(criteria): User[];
}

interface IUserReporter {
  generateReport(): Report;
}

⇒ 各ユースケースが必要な操作のみ依存
⇒ テスト時は必要な部分だけモック
```

#### 5. Dependency Inversion（依存性逆転）

**原則**：高レベルモジュールが低レベルモジュールに依存していない。両者は抽象化に依存する。

**クリーンアーキテクチャでの実現**：

```
【従来のアプローチ（依存性が逆向き）】
ユースケース層
  └─ DB 実装に直接依存
    ├─ SQL Server 固有のコード
    ├─ ORM の詳細
    └─接続文字列の管理

⇒ DB 変更の影響がユースケースに直接波及


【クリーンアーキテクチャ（依存性逆転）】
ユースケース層
  └─ IRepository インターフェースに依存
    （インターフェースは ユースケース層 内で定義）

DB 実装層
  └─ IRepository の実装
    ├─ SqlServerRepository : IRepository
    ├─ MongoRepository : IRepository
    └─ いずれをでも切り替え可能
```

**DIP の効果**：
```
修正前：DB を SQL Server から MongoDB に変更
  影響範囲：ユースケース層全体（修正必須）

修正後：DB を SQL Server から MongoDB に変更
  影響範囲：Repository 実装のみ（ユースケース層は無傷）
```

---

### 責務の分離と凝集度

#### 層別の責務明確化

各層が持つべき責務を明確にすることで、凝集度が高く、疎結合なアーキテクチャが実現します。

```
【Enterprise 層の責務】
✓ ビジネスエンティティの定義
✓ ビジネスルール（計算、状態遷移、制約）
✓ エンティティ間の相互作用
✗ データベースアクセス
✗ UI 表示ロジック
✗ フレームワークの機能

【Application 層の責務】
✓ ユースケースの実装
✓ ユースケース内のビジネスフロー制御
✓ エンティティの操作調整
✓ 外部サービスの呼び出し制御（ただし実装は別層）
✗ HTTP リクエスト
✗ UI レンダリング
✗ データベース詳細操作

【Interface Adapter 層の責務】
✓ HTTP リクエスト/レスポンス処理
✓ データベースアクセス実装
✓ 外部 API との通信
✓ UI コンポーネント
✗ ビジネスロジック
✗ ユースケース全体の流れ（統制）

【Framework 層の責務】
✓ フレームワークの設定
✓ 依存性注入（DI）の設定
✓ ライブラリのセッティング
✗ ビジネスロジック
✗ データの変換
```

#### 凝集度を高める設計

**凝集度が高い** = 関連する機能が近くにある

**「注文」個ドメイン の例**：

```
【凝集度が高い配置】
/domain
  ├─ Order.ts（注文エンティティ）
  ├─ OrderStatus.ts（ステータス管理）
  ├─ OrderItem.ts（注文明細）
  └─ OrderPolicies.ts（注文ビジネスルール）

/application
  ├─ CreateOrderUseCase.ts
  ├─ PayOrderUseCase.ts
  ├─ CancelOrderUseCase.ts
  └─ OrderUseCaseFactory.ts

/adapter/in
  └─ OrderController.ts

/adapter/out
  ├─ OrderRepositoryImpl.ts
  ├─ PaymentGatewayImpl.ts
  └─ NotificationGatewayImpl.ts

⇒ 注文に関わるすべてが論理的に隣接
⇒ 修正時に探すべき場所が明確
```

---

### テスタビリティを考慮した設計

#### テスト容易性は設計で決まる

クリーンアーキテクチャの最大のメリットの1つが**テスト容易性**です。これは偶然ではなく、設計から実現します。

**テスト容易な設計の3つの要素**：

| 要素 | 説明 | 実装方法 |
|-----|------|--------|
| **依存注入** | 外部依存をコンストラクタで受け取り | `constructor(private repo: IRepository)` |
| **インターフェース** | 実装に依存せず抽象化に依存 | インターフェースを定義し、実装はダメ化 |
| **単一責任** | 1つの責任で1つのテストケース | 責務を分割して複数の簡単なテストに |

**具体例：ユースケーステスト**

```
【テスト容易な実装】

class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private inventoryService: IInventoryService,
    private paymentProcessor: IPaymentProcessor
  ) {}

  execute(request: CreateOrderRequest): Promise<Order> {
    // ビジネスロジック
  }
}

テスト時：
────────
const mockRepository = createMock<IOrderRepository>();
const mockInventory = createMock<IInventoryService>();
const mockPayment = createMock<IPaymentProcessor>();

const useCase = new CreateOrderUseCase(
  mockRepository,
  mockInventory,
  mockPayment
);

const result = await useCase.execute({...});

⇒ 実際のDBやAPIを使用せず、ロジックのみをテスト
⇒ テスト実行時間：数ミリ秒（通常DBテストは数秒）
⇒ 各ユースケース = 10-20個の小さいテストケース


【テスト困難な実装】

class CreateOrderUseCase {
  async execute(request) {
    // DB に直接つながっているコード
    const db = await connectToDatabase();
    const order = await db.query("SELECT ...");
    
    // API に直接つながっているコード
    const paymentResult = await fetch('https://...');
    
    // UI表示を含む
    displaySuccessMessage();
    
    // ...
  }
}

テスト時：
────────
① 実際のDBが必要（テスト用別途用意？）
② 実際のAPI呼び出し（API側テストの動作に左右？）
③ UI のモック化が困難
④ テスト実行時間：数秒以上かかる
⇒ テストが遅い、脆弱で、ロジックテストが困難
```

#### 層ごとのテスト層

クリーンアーキテクチャでは、各層を独立してテスト可能です。

```
【テスト層の分け方】

単位テスト（Unitテスト）
└─ Enterprise層：エンティティの計算ロジック
   └─ 実行時間：数ミリ秒

単位テスト
└─ Application層：ユースケースロジック（依存をモック）
   └─ 実行時間：数ミリ秒

統合テスト
└─ Adapter層：DBアクセス、API呼び出し実装（テスト用途DB使用）
   └─ 実行時間：数百ミリ秒～数秒

E2E テスト
└─ Framework層：全体を通したテスト（テスト環境で実行）
   └─ 実行時間：数秒～数十秒

テスト実行戦略：
  開発中：単位テスト（高速フィードバック）
  CI パイプライン：単位 + 統合テスト
  ステージング環境：E2E テスト
```

---

## 実装パターン

### エンティティ層の設計

#### エンティティの定義

エンティティは、**ビジネスドメインで最も重要なビジネス概念**を表現します。

**エンティティが持つべき特性**：

1. **ビジネスデータ** - ドメイン概念の属性
2. **ビジネスルール** - そのデータに対する操作や制約
3. **同一性** - ID で識別可能（同じ ID = 同じエンティティ）
4. **独立性** - フレームワークやテクノロジーに依存しない Pure なオブジェクト

**具体例：商品エンティティ**

```
【構造】
Product エンティティ
├─ id: ProductId （同一性）
├─ name: string （ビジネスデータ）
├─ price: Money （ビジネスデータ）
├─ stock: number （ビジネスデータ）
│
└─ ビジネスルール（メソッド）
   ├─ isAvailable(): boolean
   │  └─ stock > 0 かつ price > 0 であること
   │
   ├─ applyDiscount(discountPercent): void
   │  └─ 割引は 0～100% の範囲に限定
   │
   └─ reduceStock(quantity): void
       └─ 在庫減は、仕入可能数を超えないこと

【実装のポイント】
✓ フレームワーク（ORM 等）のアノテーション名言わない
✓ 計算ロジック（割引適用等）は メソッドで隠蔽
✓ 不正な状態に遷移させない ← ビジネスルール
✓ プロパティはprivate、必要に応じてgetterのみ公開
```

#### エンティティの粒度

**エンティティは立つ?複数のオブジェクトを1つとして扱う?**

```
【粗粒度エンティティ】
Order エンティティ（アグリゲート）
├─ Order（ルート）
│  ├─ id
│  ├─ customerId
│  └─ createdAt
│
└─ OrderItem[]（子エンティティ）
   ├─ productId
   ├─ quantity
   └─ price

整合性：Order を削除する際は、すべての OrderItem も削除

【細粒度エンティティ】
Order エンティティ
├─ id
├─ customerId
├─ createdAt

OrderItem エンティティ
├─ id
├─ orderId
├─ productId
└─ quantity

整合性：各テーブル個別に管理。外部キー制約で保証

選択：ビジネス的に「注文 = 複数の明細」であれば、粗粒度がドメイン駆動設計的
```

---

### ユースケース層の構造化

#### ユースケースの責務

ユースケース = 1つのビジネスプロセス（ユーザーの目的達成の流れ）

**ユースケースが担う処理**：
1. 入力値の検証
2. Pre-condition チェック（前提条件）
3. ビジネスロジックの流れ制御
4. エンティティの変更命令
5. 後処理（通知、ログ等）

**具体例：注文作成ユースケース**

```
CreateOrderUseCase
││
├─ 入力検証
│  └─ 顧客ID存在確認？数量が正数？
│
├─ Pre-condition チェック
│  └─ 顧客はアクティブ？在庫は十分？
│
├─ ビジネスロジックの流れ制御
│  ├─ 注文エンティティ生成
│  ├─ 在庫減
│  ├─ 金額計算
│  └─ 支払い処理実施指示
│
├─ Post-処理
│  ├─ 注文を DB に保存指示
│  ├─ 顧客に確認メール送信指示
│  └─ ログ出力
│
└─ 結果返却

【重要】
✗ ユースケースは自分で DB にアクセスしない
✓ ユースケースは「〇〇を保存せよ」と指示（IRepository経由）

✗ ユースケースは自分でメール送信実装をしない
✓ ユースケースは「〇〇に通知せよ」と指示(INotification経由)
```

#### ユースケースの入出力設計

ユースケースの入出力は、**Request / Response オブジェクト**で定義します。

```
【入口】
interface CreateOrderRequest {
  customerId: string;
  items: OrderItem[];
  paymentMethod: string;
}

【出口】
interface CreateOrderResponse {
  orderId: string;
  totalAmount: number;
  status: 'created' | 'pending' | 'failed';
  message?: string;
}

【ユースケースメソッド】
execute(request: CreateOrderRequest): Promise<CreateOrderResponse>
```

**なぜこの設計なのか**：
- Request / Response を層ごとに分離することで、各層が独立性を保つ
- Controller は HTTP リクエストから CreateOrderRequest を生成
- Presenter は CreateOrderResponse から JSON に変換
- ユースケースはリクエスト/レスポンス仕様に集中

---

### インターフェース・アダプタ層のパターン

#### Controller パターン

Controller = HTTP リクエストをユースケースの入力に変換する層

```
【受け取るもの】
HTTP Request
├─ Method: POST
├─ Path: /orders
├─ Body: {
│   "customerId": "CUST123",
│   "items": [...]
│ }
└─ Headers: { ... }

【処理】
1. リクエストボディを CreateOrderRequest に変換
2. ユースケース実行
3. Response を HTTP Response に変換

【返すもの】
HTTP Response
├─ Status Code: 201
├─ Body: {
│   "orderId": "ORD456",
│   "status": "created"
│ }
└─ Headers: { ... }

【実装例（Pseudocode）】
class OrderController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private presenter: OrderPresenter
  ) {}

  async handleCreateOrder(httpRequest: HttpRequest): Promise<HttpResponse> {
    // HTTP → ユースケース入力に変換
    const request = this.mapHttpToRequest(httpRequest);
    
    // ユースケース実行
    const response = await this.createOrderUseCase.execute(request);
    
    // ユースケース出力 → HTTP に変換
    return this.presenter.present(response);
  }

  private mapHttpToRequest(httpRequest): CreateOrderRequest {
    return {
      customerId: httpRequest.body.customerId,
      items: httpRequest.body.items,
      paymentMethod: httpRequest.body.paymentMethod
    };
  }
}
```

#### Repository / Gateway パターン

Repository = DB アクセスの抽象化
Gateway = 外部サービス呼び出しの抽象化

```
【ユースケースの視点】

"注文を保存してほしい"
   ↓
IOrderRepository インターフェース
   ├─ save(order: Order): Promise<void>
   └─ findById(orderId: string): Promise<Order>

【実装の例】

class SqlServerOrderRepository implements IOrderRepository {
  async save(order: Order): Promise<void> {
    // SQL Server への保存コード
  }

  async findById(orderId: string): Promise<Order> {
    // SQL Server からの取得コード
  }
}

class MongoDbOrderRepository implements IOrderRepository {
  async save(order: Order): Promise<void> {
    // MongoDB への保存コード
  }

  async findById(orderId: string): Promise<Order> {
    // MongoDB からの取得コード
  }
}

⇒ ユースケースはIOrderRepositoryのみ知る
  実装はいくつでも切り替え可能
```

#### Presenter パターン

Presenter = ユースケースの出力を表示用フォーマットに変換

```
【ユースケースの出力】
CreateOrderResponse {
  orderId: "ORD456",
  totalAmount: 15000,
  status: "created"
}

【Presenter が実行】
1. 不要な情報を除外
2. フォーマット変換
3. ローカライズ

【Web用出力（JSON）】
{
  "orderId": "ORD456",
  "amount": "¥15,000",
  "status": "作成完了"
}

【モバイル用出力（JSON）】
{
  "id": "ORD456",
  "amount": "15000"
}

【CLI用出力（テキスト）】
注文ID: ORD456
金額: ¥15,000
状態: 作成完了
```

---

### ポートとアダプタパターン

#### Port とは

Port = インターフェース。アプリケーションのどこが外部と通信するかを定義

```
【ポートの定義】
インターフェースの場所：ユースケース層（内側）
実装の場所：Adapter層（外側）

【例】
port IOrderRepository {
  save(order): void
  find(id): Order
}

port IPaymentProcessor {
  processPayment(amount): boolean
}

port INotificationService {
  notifyCustomer(customerId, message): void
}
```

#### Adapter とは

Adapter = Port の実装。外部サービスの詳細を隠蔽

```
【Adapter の3つのパターン】

1. 【Driven Adapter】
   ユースケース → Repository → DB
   
   IOrderRepository インターフェース
     ↑
   SqlServerOrderRepository（Adapter）

2. 【Driving Adapter】
   HTTP Request → Controller → ユースケース
   
   HttpRequest
     ↓
   OrderController
     ↓
   ICreateOrderUseCase
```

**驚きのポイント**: Adapter は**外側**の層に存在する。これが「依存性の逆転」を実現します。

---

### 依存性注入（DI）戦略

#### なぜ DI が必要か

クリーンアーキテクチャで依存性逆転を実現するには、DI が不可欠です。

```
【DI なし：NG】
class CreateOrderUseCase {
  private repository = new SqlServerOrderRepository();
  
  async execute(request) {
    await this.repository.save(order);
  }
}

⇒ ユースケースが具体的な SqlServerOrderRepository に依存
⇒ テスト時にモックに切り替え不可
⇒ DB 変更時にユースケースも修正必須


【DI あり：OK】
class CreateOrderUseCase {
  constructor(private repository: IOrderRepository) {}
  
  async execute(request) {
    await this.repository.save(order);
  }
}

const useCase = new CreateOrderUseCase(
  new SqlServerOrderRepository()  // 本番
  // new MockRepository()            // テスト
);

⇒ ユースケースは IOrderRepository (抽象化) に依存のみ
⇒ テスト時にモック版を注入
⇒ DB 変更時は注入元のみ修正
```

#### DI のパターン

```
【パターン 1: Constructor Injection】
constructor(private repo: IRepository) {}

メリット：
  ✓ 依存が明示的（引数一覧で確認）
  ✓ 不変性（immutable）
  ✗ 依存が多いと引数が多い

【パターン 2: Property Injection】
private repo: IRepository;

setRepository(repo: IRepository) {
  this.repo = repo;
}

メリット：
  ✓ 引数が少ない
  ✗ 初期化のタイミングが曖昧
  ✗ null チェック必須

【パターン 3: Factory パターン】
class UseCaseFactory {
  createOrderUseCase(): CreateOrderUseCase {
    const repository = new SqlServerOrderRepository();
    return new CreateOrderUseCase(repository);
  }
}

メリット：
  ✓ 複雑な依存関係の構築が集約
  ✓ 環境別の切り替えが容易
  ✗ Factory クラスが必要
```

#### DI Container（推奨）

実際のプロジェクトでは DI Container を使用するのが標準的です。

```
【DI Container なし】
const repository = new SqlServerOrderRepository();
const paymentGateway = new CardPaymentGateway();
const notificationService = new EmailNotificationService();
const useCase = new CreateOrderUseCase(
  repository,
  paymentGateway,
  notificationService
);
const controller = new OrderController(useCase);

⇒ 依存を全部手動で構築
⇒ 複雑で、保守が大変


【DI Container あり】
container.register<IOrderRepository>(
  SqlServerOrderRepository
);
container.register<IPaymentProcessor>(
  CardPaymentGateway
);

const controller = container.resolve<OrderController>();

⇒ 登録した実装を自動で注入
⇒ 環境別に実装を切り替え可能
```

---

## まとめ

STEP 2 では、理論を**実装レベルの設計パターン**へ展開しました。

### 重要な設計ポイント

✓ SOLID原則を各層に適用し、责務明確化・凝集度向上を実現  
✓ テスタビリティが設計から生まれる（依存注入 + インターフェース）  
✓ エンティティ層 = ビジネスのコア（フレームワーク非依存）  
✓ ユースケース層 = ビジネスプロセス（外部とのやり取りは指示形）  
✓ Interface Adapter層 = 変換機（入出力の適応）  
✓ Framework層 = 設定とセットアップ\
✓ Port/Adapter = 外部連携を抽象化して依存性逆転を実現  
✓ DI = 依存性逆転を実装するための技術的手段  

### 次のステップへ

STEP 2 で学んだ**言語非依存のパターン**を、STEP 3 では**言語別実装**として具体化します。
- C# での実装方法（プロジェクト構成、DI コンテナ、Entity Framework）
- TypeScript での実装方法（モジュール設計、DI ライブラリ）
- Java での実装方法（Spring Framework、Maven/Gradle）

---

## 参考リソース

### このミネップの確認ポイント
- SOLID原則を「なぜ」各層で適用するのか説明できるか
- ユースケースが責務を持つ理由が分かっているか
- Port / Adapter パターンで依存性逆転がどう実現されるか?
- DI が「なぜ」必要かが理解できているか
- テスト容易な設計要素が3つ(依存注入、インターフェース、単一責任)説明できるか

### 関連するSTEP
- **STEP 1: 理論基盤** ← 設計の理論的背景
- **STEP 3: 言語別実装** ← 次は具体的な実装
  - STEP 3A: C#
  - STEP 3B: TypeScript/JavaScript
  - STEP 3C: Java
- **STEP 4: 適用判断** ← 導入判断
- **STEP 5: 実践応用** ← 実装例とアンチパターン

### 外部リソース
- **Clean Architecture: A Craftsman's Guide to Software Structure and Design**
  実装パターンの詳細解説が豊富です。

- **Domain Driven Design** by Eric Evans
  エンティティ層、ドメインモデルの設計深掘り。

- **The Pragmatic Programmer**
  テスタビリティと設計品質に関する実践的知見。

---

**[STEP 3 へ進む]** → STEP 3A: C# 実装では、ここまで学んだ設計パターンを C# とプロジェクト構成の具体例で実装します。
