# クリーンアーキテクチャ - STEP 3B: TypeScript/JavaScript での実装

## 概要

このステップでは、STEP 1・2で学んだ理論と設計パターンを **TypeScript/JavaScript** で実装する方法を学びます。

- **このステップの学習時間**：約1.5～2時間
- **このステップの位置づけ**：設計を TypeScript の具体的な実装へ落とし込む
- **前提知識**：STEP 1・2の理論と設計パターン、TypeScript の基本文法
- **このステップの学習成果**：
  - Node.js/React 環境でのクリーンアーキテクチャ
  - モジュール構成とナムスペース管理
  - TypeScript のインターフェースを活用した Port 設計
  - npm の DI パッケージ（tsyringe, inversify など）の活用
  - React や Vue との層分離

---

## 目次

1. [プロジェクト構成とモジュール設計](#プロジェクト構成とモジュール設計)
   - フォルダ構造設計
   - npm package.json 構成例
   - モジュール分割戦略

2. [実装パターン](#実装パターン)
   - エンティティ層の実装（TypeScript クラス）
   - ユースケース層の実装
   - インターフェース・アダプタ層の実装
   - フレームワーク層の設定

3. [DI と モジュール管理](#di-とモジュール管理)
   - tsyringe による DI
   - inversify による DI
   - 環境別設定の切り替え

4. [完全な実装例](#完全な実装例)
   - ドメイン: 注文エンティティ
   - ユースケース: 注文作成
   - アダプタ: API Handler, Repository
   - セットアップ: DI 設定

5. [参考リソース](#参考リソース)

---

## プロジェクト構成とモジュール設計

### フォルダ構造設計

JavaScript/TypeScript では、ファイルシステムがモジュール構成の基本になります。

```
【npm プロジェクト構成】

clean-architecture-example/
├── package.json
├── tsconfig.json
├── .eslintrc.json
│
├── src/
│   ├── 1_domain/              ← エンティティ層
│   │   ├── entities/
│   │   │   ├── Order.ts
│   │   │   ├── OrderItem.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── value-objects/
│   │   │   ├── Money.ts
│   │   │   ├── CustomerId.ts
│   │   │   └── index.ts
│   │   │
│   │   └── services/
│   │       ├── OrderPolicies.ts
│   │       └── index.ts
│   │
│   ├── 2_application/         ← ユースケース層
│   │   ├── use-cases/
│   │   │   └── orders/
│   │   │       ├── create-order/
│   │   │       │   ├── CreateOrderUseCase.ts
│   │   │       │   ├── CreateOrderRequest.ts
│   │   │       │   ├── CreateOrderResponse.ts
│   │   │       │   └── index.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── ports/             ← インターフェース定義
│   │   │   ├── IOrderRepository.ts
│   │   │   ├── IPaymentProcessor.ts
│   │   │   ├── INotificationService.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── dtos/
│   │   │   ├── OrderDto.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── 3_adapters/            ← インターフェース・アダプタ層
│   │   ├── driven/            ← Output Adapter
│   │   │   ├── persistence/
│   │   │   │   ├── OrderRepository.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── gateways/
│   │   │       ├── PaymentGateway.ts
│   │   │       ├── NotificationGateway.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── driving/           ← Input Adapter
│   │   │   ├── http/
│   │   │   │   ├── OrderHandler.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── presenters/
│   │   │       ├── OrderPresenter.ts
│   │   │       └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── 4_framework/           ← フレームワーク層
│   │   ├── config/
│   │   │   ├── di-config.ts
│   │   │   └── database-config.ts
│   │   │
│   │   ├── app.ts             ← Express/Fastify セットアップ
│   │   └── index.ts
│   │
│   └── index.ts
│
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   └── application/
│   └── integration/
│       └── adapters/
│
└── .env
```

### package.json の構成

```json
{
  "name": "clean-architecture-example",
  "version": "1.0.0",
  "description": "Clean Architecture implementation in TypeScript",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/4_framework/app.js",
    "dev": "ts-node src/4_framework/app.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "tsyringe": "^4.8.0",
    "reflect-metadata": "^0.1.13",
    "uuid": "^9.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.2",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.0",
    "eslint": "^8.40.0",
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0"
  }
}
```

### tsconfig.json の設定

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@domain/*": ["1_domain/*"],
      "@application/*": ["2_application/*"],
      "@adapters/*": ["3_adapters/*"],
      "@framework/*": ["4_framework/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**paths の効果**：
```typescript
// これが可能に
import { Order } from "@domain/entities";
import { CreateOrderUseCase } from "@application/use-cases";

// 代わりに
// import { Order } from "../../1_domain/entities";
```

---

## 実装パターン

### エンティティ層の実装

#### エンティティクラスの実装

```typescript
// src/1_domain/entities/Order.ts
import { v4 as uuid } from "uuid";

export enum OrderStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Paid = "paid",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled"
}

/**
 * Order エンティティ
 * ビジネスルールを実装
 * フレームワークに非依存（Pure TypeScript クラス）
 */
export class Order {
  private items: OrderItem[] = [];

  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly createdAt: Date,
    public status: OrderStatus
  ) {}

  /**
   * Factory method: Order インスタンス作成
   */
  public static create(customerId: string): Order {
    if (!customerId || customerId.trim() === "") {
      throw new Error("CustomerId cannot be empty");
    }

    return new Order(
      uuid(),
      customerId,
      new Date(),
      OrderStatus.Pending
    );
  }

  /**
   * ビジネスロジック：商品追加
   */
  public addItem(productId: string, quantity: number, price: number): void {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    if (this.status !== OrderStatus.Pending) {
      throw new Error("Cannot add items to confirmed order");
    }

    const item = OrderItem.create(productId, quantity, price);
    this.items.push(item);
  }

  /**
   * ビジネスロジック：注文確定
   */
  public confirm(): void {
    if (this.items.length === 0) {
      throw new Error("Order must have items before confirming");
    }

    this.status = OrderStatus.Confirmed;
  }

  /**
   * ビジネスロジック：合計金額計算
   */
  public getTotalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.getSubtotal(), 0);
  }

  /**
   * GetterS
   */
  public getItems(): OrderItem[] {
    return [...this.items];  // 配列のコピーを返す（外部修正防止）
  }
}

export class OrderItem {
  private constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly price: number
  ) {}

  public static create(
    productId: string,
    quantity: number,
    price: number
  ): OrderItem {
    if (!productId) {
      throw new Error("ProductId cannot be empty");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    if (price < 0) {
      throw new Error("Price cannot be negative");
    }

    return new OrderItem(uuid(), productId, quantity, price);
  }

  public getSubtotal(): number {
    return this.price * this.quantity;
  }
}
```

### ユースケース層の実装

#### Port（インターフェース）定義

```typescript
// src/2_application/ports/IOrderRepository.ts
import { Order } from "@domain/entities";

/**
 * Order 永続化のポート (Output Port)
 * ユースケース層で定義
 * 実装は Adapters 層
 */
export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
}

// src/2_application/ports/IPaymentProcessor.ts
export interface IPaymentProcessor {
  processPayment(orderId: string, amount: number): Promise<boolean>;
}

// src/2_application/ports/INotificationService.ts
export interface INotificationService {
  notifyOrderCreated(customerId: string, orderId: string): Promise<void>;
}

// src/2_application/ports/index.ts
export { IOrderRepository } from "./IOrderRepository";
export { IPaymentProcessor } from "./IPaymentProcessor";
export { INotificationService } from "./INotificationService";
```

#### Request/Response 定義

```typescript
// src/2_application/use-cases/orders/create-order/CreateOrderRequest.ts
export interface CreateOrderRequest {
  customerId: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  price: number;
}

// src/2_application/use-cases/orders/create-order/CreateOrderResponse.ts
export interface CreateOrderResponse {
  orderId: string;
  totalAmount: number;
  status: string;
  success: boolean;
  message?: string;
}
```

#### ユースケース実装

```typescript
// src/2_application/use-cases/orders/create-order/CreateOrderUseCase.ts
import { Order, OrderStatus } from "@domain/entities";
import {
  IOrderRepository,
  IPaymentProcessor,
  INotificationService
} from "@application/ports";
import { CreateOrderRequest, CreateOrderResponse } from "./CreateOrderRequest";
import { injectable, inject } from "tsyringe";

/**
 * 注文作成ユースケース
 * @injectable デコレーターで DI コンテナに登録
 */
@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject("IOrderRepository") private repository: IOrderRepository,
    @inject("IPaymentProcessor") private paymentProcessor: IPaymentProcessor,
    @inject("INotificationService")
    private notificationService: INotificationService
  ) {}

  /**
   * ユースケース実行
   */
  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // 入力検証
      if (!request?.customerId?.trim()) {
        return this.failureResponse("Invalid customer ID");
      }

      if (!request.items || request.items.length === 0) {
        return this.failureResponse("Order must have at least one item");
      }

      // ビジネスロジック：エンティティ作成
      const order = Order.create(request.customerId);

      // ビジネスロジック：商品追加
      for (const item of request.items) {
        order.addItem(item.productId, item.quantity, item.price);
      }

      // ビジネスロジック：注文確定
      order.confirm();

      // 外部サービス：支払い処理（実装は別層）
      const totalAmount = order.getTotalAmount();
      const paymentSuccess = await this.paymentProcessor.processPayment(
        order.id,
        totalAmount
      );

      if (!paymentSuccess) {
        return this.failureResponse("Payment processing failed");
      }

      // 永続化（実装は別層）
      await this.repository.save(order);

      // 通知（実装は別層）
      await this.notificationService.notifyOrderCreated(
        order.customerId,
        order.id
      );

      // 成功レスポンス
      return {
        orderId: order.id,
        totalAmount: totalAmount,
        status: order.status,
        success: true,
        message: "Order created successfully"
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return this.failureResponse(`Error creating order: ${message}`);
    }
  }

  private failureResponse(message: string): CreateOrderResponse {
    return {
      success: false,
      message: message,
      orderId: "",
      totalAmount: 0,
      status: ""
    };
  }
}
```

### インターフェース・アダプタ層の実装

#### HTTP Handler（Controller 相当）

```typescript
// src/3_adapters/driving/http/OrderHandler.ts
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { CreateOrderUseCase } from "@application/use-cases";
import { CreateOrderRequest } from "@application/use-cases";

/**
 * Order 関連の HTTP エンドポイント処理
 */
@injectable()
export class OrderHandler {
  constructor(
    @inject(CreateOrderUseCase) private createOrderUseCase: CreateOrderUseCase
  ) {}

  /**
   * POST /orders
   */
  async handleCreateOrder(req: Request, res: Response): Promise<void> {
    try {
      // HTTP リクエスト → ユースケース入力に変換
      const request: CreateOrderRequest = {
        customerId: req.body.customerId,
        items: req.body.items || []
      };

      // ユースケース実行
      const response = await this.createOrderUseCase.execute(request);

      // ユースケース出力 → HTTP レスポンス
      if (response.success) {
        res.status(201).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ success: false, message });
    }
  }
}
```

#### Repository 実装

```typescript
// src/3_adapters/driven/persistence/OrderRepository.ts
import { injectable } from "tsyringe";
import { Order } from "@domain/entities";
import { IOrderRepository } from "@application/ports";

/**
 * IOrderRepository の実装
 * 実装例）メモリスタレッジ（実際には DB を使用）
 */
@injectable()
export class OrderRepository implements IOrderRepository {
  // メモリに保存（実証用）
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
    // 実際：DB.insert(order)
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
    // 実際：DB.findById(orderId)
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId
    );
    // 実際：DB.find({ customerId })
  }
}

// より現実的な例：TypeORM を使用
/*
import { Repository } from "typeorm";
import { OrderEntity } from "./OrderEntity";

@injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(private db: Repository<OrderEntity>) {}

  async save(order: Order): Promise<void> {
    const entity = this.mapToPersistence(order);
    await this.db.save(entity);
  }

  async findById(orderId: string): Promise<Order | null> {
    const entity = await this.db.findOne({ where: { id: orderId } });
    return entity ? this.mapToDomain(entity) : null;
  }

  private mapToDomain(entity: OrderEntity): Order {
    // Entity → Domain へ変換
  }

  private mapToPersistence(order: Order): OrderEntity {
    // Domain → Entity へ変換
  }
}
*/
```

#### Gateway 実装（外部サービス）

```typescript
// src/3_adapters/driven/gateways/PaymentGateway.ts
import { injectable } from "tsyringe";
import axios from "axios";
import { IPaymentProcessor } from "@application/ports";

@injectable()
export class PaymentGateway implements IPaymentProcessor {
  private readonly paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL || "http://payment.example.com";

  async processPayment(orderId: string, amount: number): Promise<boolean> {
    try {
      const response = await axios.post(`${this.paymentServiceUrl}/process`, {
        orderId,
        amount,
        currency: "JPY"
      });

      return response.status === 200;
    } catch (error) {
      console.error(`Payment error: ${error}`);
      return false;
    }
  }
}

// src/3_adapters/driven/gateways/NotificationGateway.ts
import { injectable } from "tsyringe";
import { INotificationService } from "@application/ports";

@injectable()
export class NotificationGateway implements INotificationService {
  async notifyOrderCreated(customerId: string, orderId: string): Promise<void> {
    // 実装例：メール送信（nodemailer など）
    console.log(
      `Sending notification to ${customerId} for order ${orderId}`
    );
    // 実際：await emailService.send({ to: customer.email, ... })
  }
}
```

### フレームワーク層（Express セットアップ）

```typescript
// src/4_framework/app.ts
import "reflect-metadata";  // tsyringe 必須
import express from "express";
import { container } from "tsyringe";
import { setupDependencies } from "./config/di-config";
import { OrderHandler } from "@adapters/driving";

const app = express();

// ========================
// ミドルウェア設定
// ========================
app.use(express.json());

// ========================
// DI コンテナ設定
// ========================
setupDependencies(container);

// ========================
// ルート定義
// ========================
const orderHandler = container.resolve(OrderHandler);

app.post("/api/orders", (req, res) =>
  orderHandler.handleCreateOrder(req, res)
);

// ========================
// サーバー起動
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

---

## DI と モジュール管理

### tsyringe による DI（推奨）

tsyringe は Microsoft が開発した軽量 DI コンテナです。デコレーターベースで使いやすい。

```typescript
// src/4_framework/config/di-config.ts
import { Container } from "tsyringe";
import { IOrderRepository } from "@application/ports";
import { IPaymentProcessor } from "@application/ports";
import { INotificationService } from "@application/ports";
import { OrderRepository } from "@adapters/driven/persistence";
import { PaymentGateway } from "@adapters/driven/gateways";
import { NotificationGateway } from "@adapters/driven/gateways";
import { CreateOrderUseCase } from "@application/use-cases";

export function setupDependencies(container: Container): void {
  // Repository 登録
  container.register<IOrderRepository>("IOrderRepository", {
    useClass: OrderRepository
  });

  // Gateway 登録
  container.register<IPaymentProcessor>("IPaymentProcessor", {
    useClass: PaymentGateway
  });

  container.register<INotificationService>("INotificationService", {
    useClass: NotificationGateway
  });

  // UseCase 登録（@injectable でも OK）
  container.registerSingleton(CreateOrderUseCase);
}
```

### inversify による DI（より複雑な場合）

inversify は Java の Spring Framework に近い、より高度な DI です。

```typescript
import { Container, injectable, inject } from "inversify";

const TYPES = {
  IOrderRepository: Symbol.for("IOrderRepository"),
  IPaymentProcessor: Symbol.for("IPaymentProcessor")
};

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private repository: IOrderRepository,
    @inject(TYPES.IPaymentProcessor) private processor: IPaymentProcessor
  ) {}
}

// DI 設定
const container = new Container();
container
  .bind<IOrderRepository>(TYPES.IOrderRepository)
  .to(OrderRepository);
container
  .bind<IPaymentProcessor>(TYPES.IPaymentProcessor)
  .to(PaymentGateway);
```

### 環境別設定の切り替え

```typescript
// src/4_framework/config/di-config.ts
import { Container } from "tsyringe";
import { IOrderRepository } from "@application/ports";

export function setupDependencies(container: Container): void {
  if (process.env.NODE_ENV === "production") {
    // 本番環境：実装 Repository
    container.register<IOrderRepository>("IOrderRepository", {
      useClass: TypeOrmOrderRepository  // 実際の DB
    });
  } else if (process.env.NODE_ENV === "test") {
    // テスト環境：モック Repository
    container.register<IOrderRepository>("IOrderRepository", {
      useValue: new MockOrderRepository()  // テスト用
    });
  } else {
    // 開発環境：メモリ Repository
    container.register<IOrderRepository>("IOrderRepository", {
      useClass: InMemoryOrderRepository  // 開発用
    });
  }
}
```

---

## 完全な実装例

### プロジェクト初期化とテスト実行

```bash
# プロジェクト初期化
npm init -y
npm install express tsyringe reflect-metadata uuid
npm install -D typescript @types/express @types/node ts-node jest ts-jest

# TypeScript コンパイル
npm run build

# 開発サーバー起動
npm run dev

# テスト実行
npm test
```

### ユニットテスト例

```typescript
// tests/unit/application/CreateOrderUseCase.spec.ts
import { CreateOrderUseCase } from "@application/use-cases";
import { IOrderRepository, IPaymentProcessor, INotificationService } from "@application/ports";

describe("CreateOrderUseCase", () => {
  let useCase: CreateOrderUseCase;
  let mockRepository: jest.Mocked<IOrderRepository>;
  let mockPayment: jest.Mocked<IPaymentProcessor>;
  let mockNotification: jest.Mocked<INotificationService>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByCustomerId: jest.fn()
    };

    mockPayment = {
      processPayment: jest.fn().mockResolvedValue(true)
    };

    mockNotification = {
      notifyOrderCreated: jest.fn().mockResolvedValue(undefined)
    };

    useCase = new CreateOrderUseCase(
      mockRepository,
      mockPayment,
      mockNotification
    );
  });

  test("should create order successfully", async () => {
    const request = {
      customerId: "CUST123",
      items: [
        {
          productId: "PROD001",
          quantity: 2,
          price: 5000
        }
      ]
    };

    const response = await useCase.execute(request);

    expect(response.success).toBe(true);
    expect(response.totalAmount).toBe(10000);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockPayment.processPayment).toHaveBeenCalled();
  });

  test("should return failure when items empty", async () => {
    const request = {
      customerId: "CUST123",
      items: []
    };

    const response = await useCase.execute(request);

    expect(response.success).toBe(false);
    expect(response.message).toContain("must have at least one item");
  });
});
```

---

## React/Vue との統合

### React での使用例

```typescript
// src/ui/react/hooks/useCreateOrder.ts
import { useCallback } from "react";
import { CreateOrderUseCase } from "@application/use-cases";

export function useCreateOrder(useCase: CreateOrderUseCase) {
  return useCallback(
    async (customerId: string, items: any[]) => {
      return await useCase.execute({
        customerId,
        items
      });
    },
    [useCase]
  );
}

// src/ui/react/pages/OrderPage.tsx
import React, { useState } from "react";
import { useCreateOrder } from "./hooks/useCreateOrder";
import { container } from "tsyringe";
import { CreateOrderUseCase } from "@application/use-cases";

export const OrderPage: React.FC = () => {
  const createOrderUseCase = container.resolve(CreateOrderUseCase);
  const createOrder = useCreateOrder(createOrderUseCase);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const response = await createOrder(
        formData.customerId,
        formData.items
      );

      if (response.success) {
        alert(`Order created: ${response.orderId}`);
      } else {
        alert(`Error: ${response.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({
        customerId: "CUST123",
        items: []
      });
    }}>
      {/* フォーム内容 */}
    </form>
  );
};
```

---

## まとめ

STEP 3B では、クリーンアーキテクチャを **TypeScript/JavaScript で実装する方法**を学びました。

### 重要な実装ポイント

✓ モジュール構成で層を分離（フォルダ階層で物理的分離）  
✓ Domain層は Pure TypeScript クラス（フレームワーク非依存）  
✓ Application層は Port（インターフェース）経由で外部と通信  
✓ tsyringe で軽量 DI を実現  
✓ テストは Jest + モック実装で可能  
✓ React/Vue との統合は Hook/Composable 経由  

### TypeScript での推奨設定

| 項目 | 推奨 | 理由 |
|-----|-----|------|
| **DI コンテナ** | tsyringe | 軽量、デコレーター対応 |
| **Web フレームワーク** | Express / Fastify | 最小限・シンプル |
| **データベース** | TypeORM / Sequelize | TypeScript 対応 ORM |
| **テスティング** | Jest + ts-jest | 標準的、TypeScript 対応 |
| **モジュール分割** | フォルダ階層 | npm モジュール化可能 |

### C# との比較

| 項目 | C# | TypeScript |
|-----|----|------------|
| **プロジェクト分割** | 4 プロジェクト（.csproj） | 4 フォルダ / npm モジュール |
| **DI コンテナ** | Microsoft.Extensions.DI | tsyringe / inversify |
| **型システム** | 静的型付け（言語） | 静的型付け（TypeScript） |
| **フレームワーク** | ASP.NET Core（大） | Express（小） |
| **package 管理** | NuGet | npm |

### 次のステップへ

STEP 3B（TypeScript）の実装を学びました。STEP 3C では以下を学びます：
- **STEP 3C: Java 実装** - Spring Framework、Maven 構成

その後、STEP 4（適用判断）と STEP 5（実践応用）へ進みます。

---

## 参考リソース

### このステップの確認ポイント
- フォルダ階層がなぜレイヤーを分離するのか
- tsyringe のデコレーターベース DI とコンテナの関係
- インターフェース（Port）がどうビジネスロジックを保護するか
- テスト時にモック実装をどう注入するか
- React などのフレームワークとの層分離パターン

### 関連するSTEP
- **STEP 1: 理論基盤** ← TypeScript 実装の理論的背景
- **STEP 2: 設計方法論** ← ここで学んだパターンの設計背景
- **STEP 3A: C# 実装** ← 別言語での実装
- **STEP 3C: Java 実装** ← 別言語での実装
- **STEP 4: 適用判断** ← Node.js/React プロジェクトでどう判断するか
- **STEP 5: 実践応用** ← より複雑な実装例

### 外部リソース
- **tsyringe - Microsoft**
  https://github.com/microsoft/tsyringe
  公式ドキュメントとサンプル。

- **Express.js Documentation**
  https://expressjs.com/
  Web フレームワーク。

- **TypeScript Handbook**
  https://www.typescriptlang.org/docs/
  TypeScript の詳細。

- **Jest Documentation**
  https://jestjs.io/
  テスティングフレームワーク。

---

**[STEP 3C へ進む]** → STEP 3C: Java では、同じアーキテクチャパターンを Spring Framework でどう実装するかを学びます。
