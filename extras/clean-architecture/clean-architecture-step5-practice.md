# クリーンアーキテクチャ - STEP 5: 実践応用

## 概要

このステップでは、STEP 1～4で学んだ内容を、**実装例・アンチパターン・FAQ** を通じて深掘りします。

- **このステップの学習時間**：約1.5～2時間
- **このステップの位置づけ**：最終ステップ。実装の手引きと注意点をまとめる
- **前提知識**：STEP 1～4 の全内容
- **このステップの学習成果**：
  - 実装例を通じた、具体的な設計方針の理解
  - よくあるアンチパターンの認識と回避方法
  - 制約条件下での適切な適応
  - よくある質問への回答

---

## 目次

1. [完全な実装例](#完全な実装例)
   - ユースケース：タスク管理アプリ
   - 要件・設計方針
   - 実装コード（すべての層）

2. [よくあるアンチパターンと対策](#よくあるアンチパターンと対策)
   - パターン 1: 依存性の逆転に失敗
   - パターン 2: 層の責務が曖昧
   - パターン 3: インターフェースの乱用
   - パターン 4: 過度な抽象化
   - パターン 5: テスト戦略の欠落

3. [リソース制約下での適応](#リソース制約下での適応)
   - 小規模チーム（2-3人）での導入
   - 既存レガシーコードへの部分適用
   - MVP 開発での適合レベル調整

4. [よくある質問 (FAQ)](#よくある質問-faq)

5. [参考リソース](#参考リソース)

---

## 完全な実装例

### ユースケース：タスク管理アプリ

簡単だが、実務的な複雑さを持つ「タスク管理アプリ」を例に、クリーンアーキテクチャの実装を示します。

### 要件

```
【ユーザーストーリー】

1. ユーザーはタスクを作成できる
   - タイトル、説明、期限を指定
   - 優先度を設定（低・中・高）

2. ユーザーはタスクの一覧を表示できる
   - フィルタリング（完了/未完了）
   - ソート（期限、優先度）

3. ユーザーはタスクを完了にできる
   - 完了日時を自動記録

4. ユーザーはタスクを削除できる
   - 完了したタスクのみ削除可

【非機能要件】
- 応答時間：< 500ms
- テストカバレッジ：> 85%
- 複数プラットフォーム対応想定
  （Web, モバイル, CLI）
```

### 設計方針

```
【ドメイン分析】
- メインエンティティ：Task
- ビジネスルール：
  ├─ 完了したタスクのみ削除可
  ├─ 優先度は変更不可
  └─ 期限は過去日時 NG

【責務分割】
Domain層（Task エンティティ）
  └─ タスクのライフサイクル、ビジネスルール

Application層
  ├─ CreateTaskUseCase
  ├─ ListTasksUseCase
  ├─ CompleteTaskUseCase
  └─ DeleteTaskUseCase

Adapter層
  ├─ REST Endpoint（Web）
  ├─ GraphQL Resolver（モバイル可視）
  ├─ CLI Command（バッチ処理）
  └─ TaskRepository（DB アクセス）

Framework層（Spring Boot）
  └─ DI 設定、サーバー起動
```

### 実装コード（TypeScript 版）

#### Domain 層

```typescript
// domain/Task.ts
import { v4 as uuid } from "uuid";

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export class Task {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly priority: Priority,
    public dueDate: Date,
    public status: TaskStatus,
    public readonly createdAt: Date,
    public completedAt?: Date
  ) {}

  // Factory method
  static create(
    title: string,
    description: string,
    priority: Priority,
    dueDate: Date
  ): Task {
    if (!title || title.trim() === "") {
      throw new Error("Title is required");
    }

    if (dueDate < new Date()) {
      throw new Error("Due date cannot be in the past");
    }

    return new Task(
      uuid(),
      title,
      description,
      priority,
      dueDate,
      TaskStatus.TODO,
      new Date()
    );
  }

  // ビジネスロジック：完了にする
  complete(): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error("Task is already completed");
    }

    this.status = TaskStatus.COMPLETED;
    this.completedAt = new Date();
  }

  // ビジネスロジック：削除可能か判定
  canDelete(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  // ビジネスロジック：是否期限切れ
  isOverdue(): boolean {
    return this.status !== TaskStatus.COMPLETED && this.dueDate < new Date();
  }
}
```

#### Application 層

```typescript
// application/use-cases/CreateTaskUseCase.ts
import { injectable, inject } from "tsyringe";
import { Task, Priority } from "@domain/Task";
import { ITaskRepository } from "@application/ports";

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: string;
  dueDate: string; // ISO 8601 format
}

export interface CreateTaskResponse {
  taskId: string;
  success: boolean;
  message?: string;
}

@injectable()
export class CreateTaskUseCase {
  constructor(@inject("ITaskRepository") private repository: ITaskRepository) {}

  async execute(request: CreateTaskRequest): Promise<CreateTaskResponse> {
    try {
      // バリデーション
      if (!request.title?.trim()) {
        return { taskId: "", success: false, message: "Title is required" };
      }

      const priority = this.parsePriority(request.priority);
      const dueDate = new Date(request.dueDate);

      // ドメインオブジェクト生成
      const task = Task.create(
        request.title,
        request.description,
        priority,
        dueDate
      );

      // 永続化（依存性は注入）
      await this.repository.save(task);

      return {
        taskId: task.id,
        success: true
      };
    } catch (error) {
      return {
        taskId: "",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private parsePriority(priority: string): Priority {
    const map: Record<string, Priority> = {
      LOW: Priority.LOW,
      MEDIUM: Priority.MEDIUM,
      HIGH: Priority.HIGH
    };
    return map[priority.toUpperCase()] || Priority.MEDIUM;
  }
}

// application/ports/ITaskRepository.ts
import { Task } from "@domain/Task";

export interface ITaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  delete(id: string): Promise<void>;
}
```

#### Adapter 層

```typescript
// adapters/driving/http/TaskController.ts
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { CreateTaskUseCase } from "@application/use-cases";

@injectable()
export class TaskController {
  constructor(
    @inject(CreateTaskUseCase) private createTaskUseCase: CreateTaskUseCase
  ) {}

  async handleCreateTask(req: Request, res: Response): Promise<void> {
    const response = await this.createTaskUseCase.execute(req.body);

    if (response.success) {
      res.status(201).json(response);
    } else {
      res.status(400).json(response);
    }
  }
}

// adapters/driven/TaskRepositoryImpl.ts
import { injectable } from "tsyringe";
import { Task } from "@domain/Task";
import { ITaskRepository } from "@application/ports";

@injectable()
export class TaskRepositoryImpl implements ITaskRepository {
  // メモリ実装（実証用）
  private tasks = new Map<string, Task>();

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }
}
```

#### テストコード

```typescript
// test/CreateTaskUseCase.spec.ts
import { CreateTaskUseCase } from "@application/use-cases";
import { ITaskRepository } from "@application/ports";

describe("CreateTaskUseCase", () => {
  let useCase: CreateTaskUseCase;
  let mockRepository: ITaskRepository;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    };

    useCase = new CreateTaskUseCase(mockRepository);
  });

  test("should create task successfully", async () => {
    const request = {
      title: "Learn Clean Architecture",
      description: "Study and practice",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const response = await useCase.execute(request);

    expect(response.success).toBe(true);
    expect(response.taskId).toBeDefined();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  test("should fail when title is empty", async () => {
    const request = {
      title: "",
      description: "Study",
      priority: "HIGH",
      dueDate: new Date().toISOString()
    };

    const response = await useCase.execute(request);

    expect(response.success).toBe(false);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
```

---

## よくあるアンチパターンと対策

### パターン 1: 依存性の逆転に失敗（重大）

Application層が Adapter層の具体的な実装に依存してしまうケース。

#### 反例（NG）

```typescript
// NG: Application が具体的な実装に依存
import { TaskRepositoryImpl } from "@adapters/driven";

@Service
export class CreateTaskUseCase {
  private repository = new TaskRepositoryImpl();  // ❌ 具体的なクラスに依存

  execute(request: CreateTaskRequest) {
    const task = Task.create(...);
    this.repository.save(task);  // TaskRepositoryImpl の実装に依存
  }
}

問題：
- テスト時にモック実装に切り替えられない
- DB 実装の変更が ユースケースに波及
- Repository が複数存在する場合、選択肢がない
```

#### 正例（OK）

```typescript
// OK: インターフェースに依存
import { ITaskRepository } from "@application/ports";

@injectable()
export class CreateTaskUseCase {
  constructor(@inject("ITaskRepository") private repository: ITaskRepository) {
    // ✓ インターフェースを注入
    // テスト時：MockRepository を注入
    // 本番時：TaskRepositoryImpl を注入
  }

  async execute(request: CreateTaskRequest) {
    const task = Task.create(...);
    await this.repository.save(task);  // インターフェース経由
  }
}
```

#### 対策

- Application層では**インターフェース定義のみ**
- Adapter層で**インターフェース実装**
- DI コンテナで**実装を注入**

---

### パターン 2: 層の責務が曖昧（重大）

複数の層にまたがるロジックが存在し、どこが責務なのか不明確なケース。

#### 反例（NG）

```typescript
// ❌ 責務が曖昧な実装

// Adapter層（本来は入出力）で、ビジネスロジックを実装
@Post("/tasks")
async createTask(req: Request, res: Response) {
  const task = new Task();  // ❌ Domain エンティティを Adapter で生成
  task.title = req.body.title;

  // ビジネスロジック（本来は Domain/Application）が混在
  if (task.title.length < 3) {  // ❌ Adapter で validation
    return res.status(400).json({ error: "Title too short" });
  }

  // DB 実装（本来は Adapter）を直接実行
  const result = await db.query(  // ❌ SQL を直接実行
    "INSERT INTO tasks (title) VALUES (?)",
    [task.title]
  );

  return res.json({ taskId: result.insertId });
}

問題：
- ビジネスロジックが Adapter に散らばっている
- テストが困難（HTTP や DB に依存）
- 複数の UI から再利用できない
- 責務が不明確で、修正時に波及の特定が困難
```

#### 正例（OK）

```typescript
// ✓ 責務を明確に分離

// Domain層：エンティティとビジネスルール
class Task {
  static create(title: string): Task {
    if (title.length < 3) {  // ✓ Domain で validation
      throw new Error("Title too short");
    }
    return new Task(uuid(), title);
  }
}

// Application層：ユースケース（ビジネスフロー）
@Service
class CreateTaskUseCase {
  execute(request: CreateTaskRequest) {
    const task = Task.create(request.title);  // ✓ Domain 経由
    this.repository.save(task);  // ✓ Repository 経由（実装不知）
  }
}

// Adapter層：HTTP 入出力のみ
@Post("/tasks")
async createTask(req: Request, res: Response) {
  const response = await this.useCase.execute(req.body);  // ✓ ユースケース呼び出し
  res.status(response.success ? 201 : 400).json(response);
}
```

#### 対策

```
□ Domain層 = エンティティ + ビジネスルール（入出力なし）
□ Application層 = ユースケース（ユーザーの目的の流れ）
□ Adapter層 = HTTP/CLI/DB の入出力（ビジネスロジックなし）
□ Framework層 = DI設定・起動（ロジックなし）
```

---

### パターン 3: インターフェースの乱用（中程度）

必要のない場所でインターフェースを作り、複雑化している。

#### 反例（NG）

```typescript
// ❌ 過剰なインターフェース化

// シンプルなロジック用に、わざわざインターフェース
interface IDateProvider {
  getCurrentDate(): Date;
}

class SystemDateProvider implements IDateProvider {
  getCurrentDate(): Date {
    return new Date();
  }
}

class Task {
  dateProvider: IDateProvider;  // ❌ テスト対象ではないのに Mock 化
  constructor(dateProvider: IDateProvider) {
    this.dateProvider = dateProvider;
  }
}

// テストで mock
const mockDateProvider = { getCurrentDate: () => new Date("2024-01-01") };
const task = new Task(mockDateProvider);

問題：
- インターフェースが増えて、コード量増加
- 何度も切り替える必要のない部分を mock
- 複雑化で、保守コスト増加
```

#### 正例（OK）

```typescript
// ✓ インターフェースは必要な場所のみ

class Task {
  // 日付は、コンストラクタで固定
  constructor(
    title: string,
    dueDate: Date  // ✓ テスト時は単に違う日付を渡すだけ
  ) {
    this.dueDate = dueDate;
  }

  isOverdue(): boolean {
    return this.dueDate < new Date();
  }
}

// テスト
test("isOverdue returns true when dueDate is past", () => {
  const pastDate = new Date("2020-01-01");
  const task = new Task("title", pastDate);
  expect(task.isOverdue()).toBe(true);
});

// ✓ シンプルで直感的
```

#### 対策

**インターフェースは以下の場合のみ：**
- 複数の実装が存在する、または将来存在する可能性がある
- テスト時に mock を切り替える必要がある
- 外部サービスの依存を抽象化する

---

### パターン 4: 過度な抽象化（中程度）

一般化しすぎて、ビジネスロジックの意図が不明確になるケース。

#### 反例（NG）

```typescript
// ❌ 過度に一般化

interface IProcessor<T, R> {
  process(input: T): Promise<R>;
}

class GenericTaskProcessor implements IProcessor<any, any> {
  constructor(
    private validator: IValidator<any>,
    private transformer: ITransformer<any, any>,
    private persister: IPersister<any>
  ) {}

  async process(input: any): Promise<any> {
    const validated = await this.validator.validate(input);
    const transformed = await this.transformer.transform(validated);
    const result = await this.persister.persist(transformed);
    return result;
  }
}

// 呼び出し側
const processor = new GenericTaskProcessor(
  new TaskValidator(),
  new TaskTransformer(),
  new TaskPersister()
);
const result = await processor.process(taskData);

問題：
- 「何をしているのか」が一目で分からない
- Type が any だらけで、型安全性がない
- エラーハンドリングが曖昧
- Domain logic が隠蔽されている
```

#### 正例（OK）

```typescript
// ✓ ビジネス用語で明確に

class CreateTaskUseCase {
  constructor(
    private repository: ITaskRepository,
    private validator: TaskValidator
  ) {}

  async execute(request: CreateTaskRequest): Promise<CreateTaskResponse> {
    // ビジネス用語を使用
    const validationResult = this.validator.validate(request);
    if (!validationResult.isValid) {
      return { success: false, message: validationResult.error };
    }

    // Domain エンティティ生成
    const task = Task.create(request.title, request.dueDate);

    // 永続化
    await this.repository.save(task);

    return { success: true, taskId: task.id };
  }
}

// ✓ 意図が明確で、一つのユースケースに集中
```

#### 対策

```
□ ビジネス用語を使う（Generic でなく Task, Order など）
□ 型安全性を保つ（any を避ける）
□ 各ユースケースは一つの目的に集中
□ 本当に複数用途あるなら、初めて一般化する（YAGNI原則）
```

---

### パターン 5: テスト戦略の欠落（重大）

テストがなく、クリーンアーキテクチャのメリットが活かせていない。

#### 反例（NG）

```typescript
// ❌ テストなし（クリーンアーキテクチャの意味がない）

export class CreateTaskUseCase {
  constructor(private repository: ITaskRepository) {}

  async execute(request: CreateTaskRequest): Promise<CreateTaskResponse> {
    // ユースケース実装
    ...
  }
}

// テスト：なし
// ⇒ ビジネスロジックの正確性を確認できない
// ⇒ リファクタリングしても、動作保証がない
// ⇒ 新しいメンバーが不安心に修正できない
```

#### 正例（OK）

```typescript
// ✓ テスト層別の戦略

// Unit テスト（ビジネスロジック）
test("CreateTaskUseCase success", async () => {
  const mockRepository = { save: jest.fn() };
  const useCase = new CreateTaskUseCase(mockRepository);
  const response = await useCase.execute({...});
  expect(response.success).toBe(true);
});

// Integration テスト（Database との連携確認）
test("Task saved to database", async () => {
  const db = new TestDatabase();
  const repository = new RealTaskRepository(db);
  const useCase = new CreateTaskUseCase(repository);
  const response = await useCase.execute({...});
  const savedTask = await db.query("SELECT * FROM tasks WHERE id = ?");
  expect(savedTask).toBeDefined();
});

// E2E テスト（HTTP エンドポイント）
test("POST /tasks returns 201", async () => {
  const response = await request(app).post("/tasks").send({...});
  expect(response.status).toBe(201);
});

テスト戦略：
├─ Unit：ビジネスロジック（70%）
├─ Integration：DB/API（20%）
└─ E2E：エンドポイント（10%）
```

#### 対策

```
□ Unit テストで、ビジネスロジック 100% カバー
□ 各 Port に対応したテスト（mock 含む）
□ Integration テストで、実装と連携確認
□ テストコードは、ドキュメント の役割も果たす
```

---

## リソース制約下での適応

### 1. 小規模チーム（2-3人）での導入

小規模チームでは、すべての層を厳密に分けるのが不可能な場合があります。実用的な適応方法を示します。

```
【制約】
- メンバー 2-3 名
- 初期は1人で複数層を担当
- ドキュメント時間が限定

【推奨】

層の分け方（オプション1：緩くする）
├─ Domain層 = ビジネスロジック（厳密）
├─ Application層 + Adapter層 = 一緒（ユースケース実装）
└─ Framework層 = DI 設定のみ

ファイル構成：
src/
├─ domain/
│  └─ Task.ts（厳密に DB 知らない）
├─ application/
│  ├─ CreateTaskUseCase.ts（ユースケース実装）
│  └─ TaskRepository.ts（実装 & インターフェース同ファイル）
└─ api.ts（Express + DI設定）

【メリット】
✓ ファイルが減り、管理が容易
✓ ビジネスロジックは守る（Domain 層）
✓ テスト（Unit）はできる

【デメリット】
✗ Repository 切り替えの敏捷性が落ちる
```

### 2. 既存レガシーコードへの部分適用

全面的なリファクタリングは不可能な場合、新規機能からクリーンアーキテクチャを導入する方法。

```
【状況】
- 既存コードベース：複雑に絡み合った MVC
- 新規機能：「グループ機能」追加したい
- 全面リファクタ：時間・リスクが高い

【戦略】

既存システム
├─ 従来 MVC（既存機能）
│  ├─ UserController
│  ├─ TaskController
│  └─ Database（直接依存）
│
└─ 新規機能コード（クリーンアーキテクチャ）
   ├─ GroupDomain
   ├─ GroupUseCase
   ├─ GroupAdapter
   └─ （独立）

既存層から、新規層のユースケースを呼び出す：
// 既存 Controller で、新規 UseCase を使用
@PostMapping("/groups")
public ResponseEntity<?> createGroup(@RequestBody GroupDto dto) {
  CreateGroupRequest request = new CreateGroupRequest(...);
  CreateGroupResponse response = createGroupUseCase.execute(request);  // 新規ユースケース
  return ResponseEntity.status(201).body(response);
}

【メリット】
✓ 新規機能は高品質（テスト充実）
✓ 既存機能への影響ゼロ
✓ 段階的な改善が可能

【次のステップ】
数ヶ月後、既存機能を1つずつ新アーキテクチャに移行可能
```

### 3. MVP 開発での適合レベル調整

MVP（Minimum Viable Product）では、充実したアーキテクチャは不要です。段階的に導入する方法。

```
【MVP Phase：6-8週間】

ビジネスロジックのみ焦点：
├─ Domain層：ビジネスルール（厳密）
├─ Application層：簡略
│  └─ ユースケース実装は最小限
├─ Adapter層：既存 Web フレームワークと統合
│  └─ インターフェース定義なし（後で足す）
└─ テスト：Unit テストのみ（テスト基盤を最小化）

ファイル構成：
src/
├─ domain/          （厳密に実装）
├─ application/     （機能実装）
├─ controllers/     （Direct）
└─ database.ts      （シンプルな Repository）

【メリット】
✓ 初期開発が高速（アーキテクチャ学習時間不要）
✓ ビジネスロジック は厳密に分離可能
✓ MVP 後の Refactor が容易

【Post-MVP Phase：12-16週間】

User feedback に基づいて、アーキテクチャを進化：
①既存 Domain と Application を保つ
②Adapter 層を正式に定義（インターフェース追加）
③Repository パターン導入
④テスト整備（Unit + Integration）
⑤複数 UI 対応（Web, Mobile, CLI）

【結果】
MVP：高速リリース + ビジネスロジック保全
Post-MVP：スケーラブルで保守性高い構成へ進化
```

---

## よくある質問 (FAQ)

### Q1: すべてのプロジェクトにクリーンアーキテクチャは必要ですか？

**A:** いいえ。プロジェクト規模とスキルで判断してください。

- **必須**：中規模以上（5+ 人、3+ ヶ月）
- **推奨**：複数年の保守前提
- **不要**：MVP、小規模 script、個人プロジェクト

判定フローは STEP 4 を参照。

---

### Q2: Domain 層が空（ビジネスロジック少ない）場合、どうしますか？

**A:** Domain 層は最小限でOK。重要なのは「責務の分離」です。

```typescript
// Domain 層が薄い場合の例
class Article {
  constructor(public id: string, public title: string, public content: string) {}
}

// Domain に ロジックがなくても OK
// 責務分離と テスト容易性は保証される
```

---

### Q3: すでに別のアーキテクチャ（Hexagonal など）を使っています。クリーンアーキテクチャと併用できますか？

**A:** はい。多くの点で重複しています。

```
Hexagonal Architecture （ポート・アダパターン）
  ≒ クリーンアーキテクチャの Adapter 層

両方の利点を取ることが多い。
```

---

### Q4: Repository パターンに「Find All」メソッドがあると、N+1 問題が起こります。どう対策しますか？

**A:** Query Optimization は Repository 実装側で対策。

```typescript
// Port（インターフェース）：ユースケースが求める形
interface ITaskRepository {
  findAll(): Promise<Task[]>;
}

// Adapter 実装：最適化
class TaskRepositoryImpl implements ITaskRepository {
  async findAll(): Promise<Task[]> {
    // N+1 対策
    return prisma.task.findMany({
      include: { subtasks: true }  // 一度に取得
    });
  }
}

// ユースケースは N+1 を意識しない
```

---

### Q5: Exception handling はどこで行いますか？

**A:** 層ごとに異なります。

```
Domain層：
  - ビジネスルール違反は Exception スロー
  - 例：new Error("Task must have title")

Application層：
  - Domain Exception をキャッチ
  - Response オブジェクトで返却
  - 例：catch (error) => return { success: false, ... }

Adapter層：
  - Application Response を HTTP status に変換
  - 例：if (response.success) res.status(201)

Framework層：
  - Global Exception Handler で一括処理
```

---

### Q6: DTOと Entity は常に異なる必要がありますか？

**A:** いいえ。場合によります。

```
同じでOK：
- 単純なデータ構造
- API 仕様が Entity そのまま
  
異なるべき：
- Entity に内部用プロパティ（timestamp など）がある
- API では特定フィールド隠蔽したい
- 複数 View で異なる形式が必要
```

---

### Q7: Database Transaction はどこで管理しますか？

**A:** Adapter 層の Repository 実装内。

```typescript
// Application層（ユースケース）：知らない
class CreateOrderUseCase {
  async execute(request) {
    const order = Order.create(...);
    await this.repository.save(order);  // 内部で Transaction
    await this.paymentGateway.charge(...);
  }
}

// Adapter層（Repository実装）：Transaction管理
class OrderRepositoryImpl implements IOrderRepository {
  async save(order: Order): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      await tx.order.create(...);
      // Transaction の中で複数操作可能
    });
  }
}
```

---

### Q8: Logging はどこに入れますか？

**A:** 各層で最適な形で。

```typescript
Domain層：
  - 通常ロギングなし（Pure）
  - 例外発生時は呼び出し側に任せる

Application層：
  - useCase 実行時の重要情報
  - logger.info("Order created: " + orderId)

Adapter層：
  - API リクエスト・レスポンス
  - logger.debug(JSON.stringify(request))

Framework層：
  - リクエスト開始・終了
  - Global middleware で一括
```

---

### Q9: Configuration（設定値）はどこに置きますか？

**A:** Framework 層で管理、Domain/Application では使用しない。

```typescript
// Framework層
class AppConfig {
  readonly maxOrderAmount = process.env.MAX_ORDER_AMOUNT;
  readonly paymentTimeout = process.env.PAYMENT_TIMEOUT;
}

// Application層：Portを通じて情報を受け取る
class CreateOrderUseCase {
  async execute(request) {
    // 設定を直接参照しない
    // 必要なら Port を通じて inject
  }
}
```

---

### Q10: マイクロサービスへの移行時、クリーンアーキテクチャはどう活かされますか？

**A:** 層の独立性 → 独立した Microservice へ。

```
単一 Monolith（クリーンアーキテクチャ）
├─ Domain: Order
├─ Application: OrderService
├─ Adapter: OrderRepository, PaymentGateway
└─ Framework

     ↓ (1-2年後)

Microservices（各層が異なるサービス）
├─ Order Service
│  ├─ Domain: Order
│  ├─ Application: OrderService
│  ├─ Adapter: OrderRepository
│  └─ API Gateway
│
├─ Payment Service
│  ├─ Domain: Payment
│  └─ Application
│
└─ Notification Service
   ├─ Domain: Notification
   └─ Application

メリット：
  - 移行がスムーズ（各層がすでに独立）
  - Domain/Application はそのままコピー
  - API Gateway で新しい Interface を定義
```

---

## まとめ

STEP 5 では、クリーンアーキテクチャの**実装例・アンチパターン・FAQ** を通じて、実務的な知識を深めました。

### 学習完了の目安

このすべてのステップを学んで、以下が説明できれば、マスタ―レベルです：

✓ 5段階の層構造と依存方向を描画できる  
✓ SOLID 原則が各層でどう実現されるか説明できる  
✓ テスト層別戦略（Unit, Integration, E2E）が設計できる  
✓ Port/Adapter パターンで DI 設定ができる  
✓ プロジェクト特性に応じた適用判断ができる  
✓ よくあるアンチパターンを認識し、回避できる  

### 学習の次のステップ

① **実践**：実際のプロジェクトで PHASE 1（部分適用）を実施  
② **経験**: 3-6 個のユースケース實装して体得  
③ **最適化**：チーム独自のパターンを確立  
④ **指導**：他のメンバーを教導

---

## 参考リソース

### このステップの確認ポイント
- 実装例のコード構造が理解できたか
- アンチパターンの問題点が説明できるか
- 小規模チームでの適応方法を即座に判断できるか
- FAQ 10個に回答できるか

### 関連するSTEP
- **STEP 1-4：全体復習** ← 理論から適用判断まで

### 外部リソース
- **Clean Code: A Handbook of Agile Software Craftsmanship**
  Robert C. Martin著。コード例が豊富。

- **Clean Architecture**
  Robert C. Martin著。原著。必読。

- **Domain Driven Design**
  Eric Evans著。Domain層の深掘り。

- **Test Driven Development by Example**
  Kent Beck著。TDD と テスト戦略。

- **Refactoring: Improving the Design of Existing Code**
  Martin Fowler著。レガシー改善。

---

**[完了]** クリーンアーキテクチャの 5 ステップすべてを学びました。

次は、実践プロジェクトで活用する番です。最初は小さく始めて、段階的に拡大することが成功の鍵です。頑張ってください！
