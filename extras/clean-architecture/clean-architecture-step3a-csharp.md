# クリーンアーキテクチャ - STEP 3A: C# での実装

## 概要

このステップでは、STEP 1・2で学んだ理論と設計パターンを **C#** で実装する方法を学びます。

- **このステップの学習時間**：約1.5～2時間
- **このステップの位置づけ**：設計を C# の具体的な実装へ落とし込む
- **前提知識**：STEP 1・2の理論と設計パターン、C# の基本文法
- **このステップの学習成果**：
  - クリーンアーキテクチャに適合したプロジェクト構成
  - インターフェースと実装クラスの設計
  - .NET の DI Container（Microsoft.Extensions.DependencyInjection）の設定
  - Entity Framework Core との統合方法
  - 各層の実装パターンを C# で表現

---

## 目次

1. [プロジェクト構成とフォルダ設計](#プロジェクト構成とフォルダ設計)
   - 層別プロジェクト分割戦略
   - フォルダ構造設計
   - プロジェクトファイル（.csproj）基本設定

2. [実装パターン](#実装パターン)
   - エンティティ層の実装
   - ユースケース層の実装
   - インターフェース・アダプタ層の実装
   - フレームワーク・ドライバー層の実装

3. [DI コンテナの設定](#di-コンテナの設定)
   - Microsoft.Extensions.DependencyInjection の基本
   - インターフェースと実装の登録
   - 環境別設定の切り替え

4. [完全な実装例](#完全な実装例)
   - ドメイン: 注文エンティティ
   - ユースケース: 注文作成
   - アダプタ: Controller, Repository
   - セットアップ: DI 設定

5. [参考リソース](#参考リソース)

---

## プロジェクト構成とフォルダ設計

### 層別プロジェクト分割戦略

クリーンアーキテクチャでは、各層を**独立したプロジェクト** （assembly） として分割するのが標準的です。これにより、物理的に依存関係を不正なものから守られます。

```
【ソリューション構成】

CleanArchitectureExample/
├── CleanArchitectureExample.sln
│
├── src/
│   ├── 1_Domain/
│   │   └── CleanArchitectureExample.Domain/
│   │       ├── Entities/
│   │       ├── ValueObjects/
│   │       └── CleanArchitectureExample.Domain.csproj
│   │
│   ├── 2_Application/
│   │   └── CleanArchitectureExample.Application/
│   │       ├── UseCases/
│   │       ├── DTOs/
│   │       ├── Ports/（InputPorts, OutputPorts）
│   │       └── CleanArchitectureExample.Application.csproj
│   │
│   ├── 3_Adapters/
│   │   ├── CleanArchitectureExample.Adapters.Driven/
│   │   │   ├── Persistence/（Repository実装）
│   │   │   ├── Gateways/（外部サービス実装）
│   │   │   └── CleanArchitectureExample.Adapters.Driven.csproj
│   │   │
│   │   └── CleanArchitectureExample.Adapters.Driving/
│   │       ├── Http/（Controller）
│   │       ├── Presenters/
│   │       └── CleanArchitectureExample.Adapters.Driving.csproj
│   │
│   └── 4_Framework/
│       └── CleanArchitectureExample.Api/
│           ├── Program.cs（DI設定）
│           ├── appsettings.json
│           ├── Controllers/
│           └── CleanArchitectureExample.Api.csproj
│
└── tests/
    ├── CleanArchitectureExample.Domain.Tests/
    ├── CleanArchitectureExample.Application.Tests/
    └── CleanArchitectureExample.Integration.Tests/

【依存関係（矢印の向き）】
Framework → Adapters.Driving → Application → Domain
            Adapters.Driven ↗

Domain は誰にも依存しない（テストも Domain のみで実行可能）
```

### プロジェクト間の依存関係設定

Visual Studio / csproj で正しい依存関係を設定することが重要です。

```xml
<!-- Domain Project: CleanArchitectureExample.Domain.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>
  
  <!-- Domain は何にも依存しない -->
  <!-- 依存関係なし -->
</Project>


<!-- Application Project: CleanArchitectureExample.Application.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  
  <ItemGroup>
    <!-- Application は Domain のみに依存 -->
    <ProjectReference Include="../1_Domain/CleanArchitectureExample.Domain/CleanArchitectureExample.Domain.csproj" />
  </ItemGroup>
</Project>


<!-- Adapters.Driven Project: CleanArchitectureExample.Adapters.Driven.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  
  <ItemGroup>
    <!-- Adapter は本来 Application に依存するべき。だが実装側なので依存OK -->
    <ProjectReference Include="../2_Application/CleanArchitectureExample.Application/CleanArchitectureExample.Application.csproj" />
  </ItemGroup>
  
  <ItemGroup>
    <!-- DB アクセスなどは Adapter 層でのみ参照 -->
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
  </ItemGroup>
</Project>


<!-- Adapters.Driving Project: CleanArchitectureExample.Adapters.Driving.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  
  <ItemGroup>
    <!-- Driving Adapter (Controller) も Application に依存 -->
    <ProjectReference Include="../2_Application/CleanArchitectureExample.Application/CleanArchitectureExample.Application.csproj" />
  </ItemGroup>
</Project>


<!-- Framework Project: CleanArchitectureExample.Api.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  
  <ItemGroup>
    <!-- Framework は全すべてのプロジェクトに依存可能（最外層） -->
    <ProjectReference Include="../1_Domain/CleanArchitectureExample.Domain/CleanArchitectureExample.Domain.csproj" />
    <ProjectReference Include="../2_Application/CleanArchitectureExample.Application/CleanArchitectureExample.Application.csproj" />
    <ProjectReference Include="../3_Adapters/CleanArchitectureExample.Adapters.Driven/CleanArchitectureExample.Adapters.Driven.csproj" />
    <ProjectReference Include="../3_Adapters/CleanArchitectureExample.Adapters.Driving/CleanArchitectureExample.Adapters.Driving.csproj" />
  </ItemGroup>
</Project>
```

### フォルダ構造の詳細設計

```
【Domain層フォルダ】
src/1_Domain/CleanArchitectureExample.Domain/
├── Entities/
│   ├── Order.cs               ← エンティティ
│   ├── OrderItem.cs           ← 子エンティティ
│   └── OrderStatus.cs         ← Enum・Value Object
│
├── ValueObjects/
│   ├── Money.cs               ← 金額の値オブジェクト
│   └── CustomerId.cs          ← ID の値オブジェクト
│
└── Services/
    └── OrderPolicies.cs       ← ドメインサービス

【Application層フォルダ】
src/2_Application/CleanArchitectureExample.Application/
├── UseCases/
│   └── Orders/
│       ├── CreateOrder/
│       │   ├── CreateOrderRequest.cs     ← 入力
│       │   ├── CreateOrderResponse.cs    ← 出力
│       │   └── CreateOrderUseCase.cs     ← ユースケース実装
│       │
│       └── GetOrder/
│           ├── GetOrderRequest.cs
│           ├── GetOrderResponse.cs
│           └── GetOrderUseCase.cs
│
├── Ports/
│   ├── IOrderRepository.cs    ← Output Port (Repository)
│   ├── IPaymentProcessor.cs   ← Output Port (Gateway)
│   └── INotificationService.cs ← Output Port (Service)
│
└── DTOs/
    └── OrderDto.cs             ← DTO（層間通信用）

【Adapter層フォルダ】
src/3_Adapters/CleanArchitectureExample.Adapters.Driven/
├── Persistence/
│   ├── OrderRepository.cs      ← IOrderRepository の実装
│   └── ApplicationDbContext.cs ← EF Core DbContext
│
└── Gateways/
    ├── PaymentGateway.cs       ← IPaymentProcessor の実装
    └── NotificationGateway.cs  ← INotificationService の実装

src/3_Adapters/CleanArchitectureExample.Adapters.Driving/
└── Http/
    ├── OrderController.cs      ← HTTP Endpoint
    └── Presenters/
        └── OrderPresenter.cs   ← Response 変換

【Framework層フォルダ】
src/4_Framework/CleanArchitectureExample.Api/
├── Program.cs                  ← Startup + DI設定
├── appsettings.json            ← 設定ファイル
├── Controllers/
│   └── OrdersController.cs
└── Middleware/
    └── ErrorHandlingMiddleware.cs
```

---

## 実装パターン

### エンティティ層の実装

#### 基本的なエンティティ例

```csharp
// Domain/Entities/Order.cs
using System;
using System.Collections.Generic;

namespace CleanArchitectureExample.Domain.Entities
{
    /// <summary>
    /// 注文エンティティ
    /// ビジネスルールを実装
    /// EF Core の制約や属性なし（フレームワーク非依存）
    /// </summary>
    public class Order
    {
        // プロパティは private set で保護
        public string Id { get; private set; }
        public string CustomerId { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public OrderStatus Status { get; private set; }
        
        // 子エンティティへの参照（リスト）
        private readonly List<OrderItem> _items = new();
        public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
        
        // コンストラクタ（Factory方式）
        private Order() { }
        
        public static Order Create(string customerId)
        {
            if (string.IsNullOrWhiteSpace(customerId))
                throw new ArgumentException("CustomerId cannot be empty");
            
            return new Order
            {
                Id = Guid.NewGuid().ToString(),
                CustomerId = customerId,
                CreatedAt = DateTime.UtcNow,
                Status = OrderStatus.Pending
            };
        }
        
        // ビジネスロジック：商品追加
        public void AddItem(string productId, int quantity, decimal price)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be positive");
            
            if (Status != OrderStatus.Pending)
                throw new InvalidOperationException("Cannot add items to confirmed order");
            
            var item = OrderItem.Create(productId, quantity, price);
            _items.Add(item);
        }
        
        // ビジネスロジック：注文確定
        public void Confirm()
        {
            if (_items.Count == 0)
                throw new InvalidOperationException("Order must have items before confirming");
            
            Status = OrderStatus.Confirmed;
        }
        
        // ビジネスロジック：合計金額計算
        public decimal GetTotalAmount()
        {
            return _items.Sum(x => x.GetSubtotal());
        }
    }

    // ステータス管理用 Value Object
    public enum OrderStatus
    {
        Pending = 0,      // 保留中
        Confirmed = 1,    // 確定
        Paid = 2,         // 支払済
        Shipped = 3,      // 発送済
        Delivered = 4,    // 配送完了
        Cancelled = 5     // キャンセル
    }
}
```

**重要なポイント**：
- EF Core の `[Table]` や `[Column]` アノテーション **なし**
- DB のこと何も知らない Pure なオブジェクト
- ビジネスルールはメソッドで表現（プロパティの不正な状態遷移を防ぐ）

#### 子エンティティの実装

```csharp
// Domain/Entities/OrderItem.cs
namespace CleanArchitectureExample.Domain.Entities
{
    public class OrderItem
    {
        public string Id { get; private set; }
        public string ProductId { get; private set; }
        public int Quantity { get; private set; }
        public decimal Price { get; private set; }
        
        private OrderItem() { }  // EF Core 用パラメータなしコンストラクタ
        
        public static OrderItem Create(string productId, int quantity, decimal price)
        {
            if (string.IsNullOrWhiteSpace(productId))
                throw new ArgumentException("ProductId cannot be empty");
            
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be positive");
            
            if (price < 0)
                throw new ArgumentException("Price cannot be negative");
            
            return new OrderItem
            {
                Id = Guid.NewGuid().ToString(),
                ProductId = productId,
                Quantity = quantity,
                Price = price
            };
        }
        
        // ビジネスロジック：小計計算
        public decimal GetSubtotal() => Price * Quantity;
    }
}
```

### ユースケース層の実装

#### ユースケースの入出力定義

```csharp
// Application/UseCases/Orders/CreateOrder/CreateOrderRequest.cs
namespace CleanArchitectureExample.Application.UseCases.Orders.CreateOrder
{
    public class CreateOrderRequest
    {
        public string CustomerId { get; set; }
        
        public List<OrderItemRequest> Items { get; set; } = new();
    }

    public class OrderItemRequest
    {
        public string ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}

// Application/UseCases/Orders/CreateOrder/CreateOrderResponse.cs
namespace CleanArchitectureExample.Application.UseCases.Orders.CreateOrder
{
    public class CreateOrderResponse
    {
        public string OrderId { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
```

#### Output Port（インターフェース）定義

```csharp
// Application/Ports/IOrderRepository.cs
using CleanArchitectureExample.Domain.Entities;

namespace CleanArchitectureExample.Application.Ports
{
    /// <summary>
    /// 注文永続化のポート（Output Port）
    /// ユースケースは何も知らない
    /// 実装は Adapters.Driven に存在
    /// </summary>
    public interface IOrderRepository
    {
        Task SaveAsync(Order order);
        Task<Order> FindByIdAsync(string orderId);
        Task<List<Order>> FindByCustomerIdAsync(string customerId);
    }
}

// Application/Ports/IPaymentProcessor.cs
namespace CleanArchitectureExample.Application.Ports
{
    public interface IPaymentProcessor
    {
        Task<bool> ProcessPaymentAsync(string orderId, decimal amount);
    }
}

// Application/Ports/INotificationService.cs
namespace CleanArchitectureExample.Application.Ports
{
    public interface INotificationService
    {
        Task NotifyOrderCreatedAsync(string customerId, string orderId);
    }
}
```

#### ユースケースの実装

```csharp
// Application/UseCases/Orders/CreateOrder/CreateOrderUseCase.cs
using CleanArchitectureExample.Domain.Entities;
using CleanArchitectureExample.Application.Ports;

namespace CleanArchitectureExample.Application.UseCases.Orders.CreateOrder
{
    public class CreateOrderUseCase
    {
        private readonly IOrderRepository _repository;
        private readonly IPaymentProcessor _paymentProcessor;
        private readonly INotificationService _notificationService;
        
        /// <summary>
        /// 依存性注入：必要なPort（インターフェース）をコンストラクタで受け取る
        /// </summary>
        public CreateOrderUseCase(
            IOrderRepository repository,
            IPaymentProcessor paymentProcessor,
            INotificationService notificationService)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _paymentProcessor = paymentProcessor ?? throw new ArgumentNullException(nameof(paymentProcessor));
            _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
        }
        
        public async Task<CreateOrderResponse> ExecuteAsync(CreateOrderRequest request)
        {
            try
            {
                // 入力検証
                if (request == null || string.IsNullOrWhiteSpace(request.CustomerId))
                    return FailureResponse("Invalid customer ID");
                
                if (request.Items == null || request.Items.Count == 0)
                    return FailureResponse("Order must have at least one item");
                
                // ビジネスロジック：エンティティ作成
                var order = Order.Create(request.CustomerId);
                
                // ビジネスロジック：商品追加
                foreach (var item in request.Items)
                {
                    order.AddItem(item.ProductId, item.Quantity, item.Price);
                }
                
                // ビジネスロジック：注文確定
                order.Confirm();
                
                // 外部サービス：支払い処理（実装は別層）
                var totalAmount = order.GetTotalAmount();
                var paymentSuccess = await _paymentProcessor.ProcessPaymentAsync(order.Id, totalAmount);
                
                if (!paymentSuccess)
                    return FailureResponse("Payment processing failed");
                
                // 永続化（実装は別層）
                await _repository.SaveAsync(order);
                
                // 通知（実装は別層）
                await _notificationService.NotifyOrderCreatedAsync(order.CustomerId, order.Id);
                
                // 成功レスポンス
                return new CreateOrderResponse
                {
                    OrderId = order.Id,
                    TotalAmount = totalAmount,
                    Status = order.Status.ToString(),
                    Success = true,
                    Message = "Order created successfully"
                };
            }
            catch (Exception ex)
            {
                return FailureResponse($"Error creating order: {ex.Message}");
            }
        }
        
        private CreateOrderResponse FailureResponse(string message)
        {
            return new CreateOrderResponse
            {
                Success = false,
                Message = message
            };
        }
    }
}
```

**このユースケースの特性**：
- Domain エンティティのビジネスロジックを活用
- 外部サービスはポート（インターフェース）経由で呼び出し
- 実装の詳細は一切知らない
- テスト時にすべてのポートをモック化可能

### インターフェース・アダプタ層の実装

#### Controller（HTTP Adapter）

```csharp
// Adapters.Driving/Http/OrderController.cs
using Microsoft.AspNetCore.Mvc;
using CleanArchitectureExample.Application.UseCases.Orders.CreateOrder;

namespace CleanArchitectureExample.Adapters.Driving.Http
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly CreateOrderUseCase _createOrderUseCase;
        
        public OrderController(CreateOrderUseCase createOrderUseCase)
        {
            _createOrderUseCase = createOrderUseCase ?? throw new ArgumentNullException(nameof(createOrderUseCase));
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            // HTTP リクエスト → ユースケース入力
            var response = await _createOrderUseCase.ExecuteAsync(request);
            
            // ユースケース出力 → HTTP レスポンス
            if (response.Success)
            {
                return Created($"/api/orders/{response.OrderId}", response);
            }
            
            return BadRequest(response);
        }
    }
}
```

**Controller の責務**：
- HTTP リクエストの解析（ASP.NET Core がやる）
- ユースケース呼び出し
- HTTP レスポンス生成

#### Repository 実装

```csharp
// Adapters.Driven/Persistence/OrderRepository.cs
using CleanArchitectureExample.Domain.Entities;
using CleanArchitectureExample.Application.Ports;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureExample.Adapters.Driven.Persistence
{
    /// <summary>
    /// IOrderRepository の実装
    /// データベースアクセスの詳細をカプセル化
    /// </summary>
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _dbContext;
        
        public OrderRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }
        
        public async Task SaveAsync(Order order)
        {
            _dbContext.Orders.Add(order);
            await _dbContext.SaveChangesAsync();
        }
        
        public async Task<Order> FindByIdAsync(string orderId)
        {
            return await _dbContext.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }
        
        public async Task<List<Order>> FindByCustomerIdAsync(string customerId)
        {
            return await _dbContext.Orders
                .Where(o => o.CustomerId == customerId)
                .Include(o => o.Items)
                .ToListAsync();
        }
    }
}

// Adapters.Driven/Persistence/ApplicationDbContext.cs
using CleanArchitectureExample.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureExample.Adapters.Driven.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Order のマッピング（ここだけ DB の詳細）
            modelBuilder.Entity<Order>()
                .HasKey(o => o.Id);
            
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Items)
                .WithOne()
                .IsRequired();
            
            // OrderItem のマッピング
            modelBuilder.Entity<OrderItem>()
                .HasKey(oi => oi.Id);
        }
    }
}
```

#### Gateway 実装（外部サービス）

```csharp
// Adapters.Driven/Gateways/PaymentGateway.cs
using CleanArchitectureExample.Application.Ports;
using HttpClient = System.Net.Http.HttpClient;

namespace CleanArchitectureExample.Adapters.Driven.Gateways
{
    public class PaymentGateway : IPaymentProcessor
    {
        private readonly HttpClient _httpClient;
        private readonly string _paymentServiceUrl;
        
        public PaymentGateway(HttpClient httpClient, string paymentServiceUrl)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _paymentServiceUrl = paymentServiceUrl ?? throw new ArgumentNullException(nameof(paymentServiceUrl));
        }
        
        public async Task<bool> ProcessPaymentAsync(string orderId, decimal amount)
        {
            try
            {
                var request = new
                {
                    orderId = orderId,
                    amount = amount,
                    currency = "JPY"
                };
                
                var content = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(request),
                    System.Text.Encoding.UTF8,
                    "application/json");
                
                var response = await _httpClient.PostAsync(
                    $"{_paymentServiceUrl}/api/payments",
                    content);
                
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                // ログ出力（実際にはロギングライブラリを使用）
                Console.WriteLine($"Payment processing error: {ex.Message}");
                return false;
            }
        }
    }
}

// Adapters.Driven/Gateways/NotificationGateway.cs
using CleanArchitectureExample.Application.Ports;

namespace CleanArchitectureExample.Adapters.Driven.Gateways
{
    public class NotificationGateway : INotificationService
    {
        // 実装例（実際にはメール送信ライブラリを使用）
        public async Task NotifyOrderCreatedAsync(string customerId, string orderId)
        {
            await Task.Delay(100);  // 非同期処理のシミュレーション
            Console.WriteLine($"Notification sent to customer {customerId} for order {orderId}");
        }
    }
}
```

---

## DI コンテナの設定

### Microsoft.Extensions.DependencyInjection の基本

```csharp
// Framework/Program.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using CleanArchitectureExample.Application.UseCases.Orders.CreateOrder;
using CleanArchitectureExample.Application.Ports;
using CleanArchitectureExample.Adapters.Driven.Persistence;
using CleanArchitectureExample.Adapters.Driven.Gateways;

var builder = WebApplication.CreateBuilder(args);

// ========================
// DI Container 設定
// ========================

// 1. Database 設定
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Repository 登録（Output Port）
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// 3. Gateway / 外部サービス登録
builder.Services.AddScoped<IPaymentProcessor, PaymentGateway>();
builder.Services.AddScoped<INotificationService, NotificationGateway>();

// 4. UseCase 登録
builder.Services.AddScoped<CreateOrderUseCase>();

// 5. Controller 登録
builder.Services.AddControllers();

// Swagger など
builder.Services.AddSwaggerGen();

// ========================
// ミドルウェア設定
// ========================

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### 環境別設定の切り替え

```csharp
// Framework/Program.cs（拡張版）
var builder = WebApplication.CreateBuilder(args);

// Database の環境別設定
if (builder.Environment.IsProduction())
{
    // 本番環境：SQL Server
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("ProductionDb")));
}
else if (builder.Environment.IsTesting())
{
    // テスト環境：In-Memory DB
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseInMemoryDatabase("TestDb"));
}
else
{
    // 開発環境：LocalDB
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DevDb")));
}

// Gateway の環境別設定
builder.Services.AddScoped<IPaymentProcessor>(provider =>
{
    var httpClient = provider.GetRequiredService<HttpClient>();
    var config = provider.GetRequiredService<IConfiguration>();
    
    if (builder.Environment.IsProduction())
    {
        return new PaymentGateway(httpClient, config["PaymentService:Url"]);
    }
    else
    {
        // モック Implementation を返す
        return new MockPaymentGateway();
    }
});

// 残りの設定...
```

---

## 完全な実装例

このセクションでは、小規模だが完全な実装例を示します。

### フォルダ構造（実装例全体）

```
ExampleProject/
├── src/
│   └── CleanArchDemo/
│       ├── 1_Domain/
│       │   └── Order.cs
│       │   └── OrderItem.cs
│       ├── 2_Application/
│       │   ├── Ports/
│       │   │   └── IOrderRepository.cs
│       │   └── UseCases/
│       │       └── CreateOrderUseCase.cs
│       ├── 3_Adapters/
│       │   ├── Driven/
│       │   │   └── OrderRepository.cs
│       │   │   └── ApplicationDbContext.cs
│       │   └── Driving/
│       │       └── OrderController.cs
│       └── 4_Framework/
│           ├── Program.cs
│           └── appsettings.json
└── tests/
    └── Application.Tests/
        └── CreateOrderUseCaseTests.cs
```

### テスト例

```csharp
// tests/Application.Tests/CreateOrderUseCaseTests.cs
using Xunit;
using Moq;
using CleanArchitectureExample.Domain.Entities;
using CleanArchitectureExample.Application.UseCases.Orders.CreateOrder;
using CleanArchitectureExample.Application.Ports;

namespace CleanArchitectureExample.Application.Tests
{
    public class CreateOrderUseCaseTests
    {
        [Fact]
        public async Task ExecuteAsync_WithValidRequest_ShouldCreateOrder()
        {
            // Arrange
            var mockRepository = new Mock<IOrderRepository>();
            var mockPayment = new Mock<IPaymentProcessor>();
            var mockNotification = new Mock<INotificationService>();
            
            mockPayment
                .Setup(p => p.ProcessPaymentAsync(It.IsAny<string>(), It.IsAny<decimal>()))
                .ReturnsAsync(true);
            
            var useCase = new CreateOrderUseCase(
                mockRepository.Object,
                mockPayment.Object,
                mockNotification.Object);
            
            var request = new CreateOrderRequest
            {
                CustomerId = "CUST123",
                Items = new()
                {
                    new OrderItemRequest
                    {
                        ProductId = "PROD001",
                        Quantity = 2,
                        Price = 5000
                    }
                }
            };
            
            // Act
            var response = await useCase.ExecuteAsync(request);
            
            // Assert
            Assert.True(response.Success);
            Assert.NotNull(response.OrderId);
            Assert.Equal(10000, response.TotalAmount);
            
            // Repository が呼ばれたことを確認
            mockRepository.Verify(r => r.SaveAsync(It.IsAny<Order>()), Times.Once);
            
            // Notification が呼ばれたことを確認
            mockNotification.Verify(
                n => n.NotifyOrderCreatedAsync(It.IsAny<string>(), It.IsAny<string>()),
                Times.Once);
        }
        
        [Fact]
        public async Task ExecuteAsync_WithoutItems_ShouldReturnFailure()
        {
            // Arrange
            var useCase = new CreateOrderUseCase(
                new Mock<IOrderRepository>().Object,
                new Mock<IPaymentProcessor>().Object,
                new Mock<INotificationService>().Object);
            
            var request = new CreateOrderRequest
            {
                CustomerId = "CUST123",
                Items = new()  // 空のリスト
            };
            
            // Act
            var response = await useCase.ExecuteAsync(request);
            
            // Assert
            Assert.False(response.Success);
            Assert.Contains("must have at least one item", response.Message);
        }
    }
}
```

---

## まとめ

STEP 3A では、クリーンアーキテクチャを **C# で実装する方法**を学びました。

### 重要な実装ポイント

✓ 層別プロジェクト分割で物理的に依存関係を保護  
✓ Domain層は Entity Framework などのアノテーション不要な Pure なクラス  
✓ Application層は Port（インターフェース）経由で外部と通信  
✓ Adapter層が Port の実装を提供  
✓ DI Container（Microsoft.Extensions.DependencyInjection）で依存関係を一元管理  
✓ テストは Moq などでPort実装をモック化  

### C# での推奨設定

| 項目 | 推奨 | 理由 |
|-----|-----|------|
| **DI コンテナ** | Microsoft.Extensions.DependencyInjection | .NET の標準 |
| **ORM** | Entity Framework Core | .NET の標準 ORM |
| **Web フレームワーク** | ASP.NET Core | 最新、最も一般的 |
| **テスティング** | xUnit + Moq | C# での標準 |
| **プロジェクト分割** | 4レイヤー = 4プロジェクト | 依存関係の保護 |

### 次のステップへ

STEP 3A（C#）の実装を学びました。STEP 3B・3C では以下を学びます：
- **STEP 3B: TypeScript/JavaScript 実装** - npm の依存管理、モジュール設計
- **STEP 3C: Java 実装** - Spring Framework、Maven 構成

その後、STEP 4（適用判断）と STEP 5（実践応用）へ進みます。

---

## 参考リソース

### このステップの確認ポイント
- 層別プロジェクト分割の理由が説明できるか
- Domain エンティティがなぜ Pure（フレームワーク非依存）なのか
- Port（インターフェース）と実装の分離ポイントが理解できているか
- DI コンテナの役割が説明できるか
- テスト時にポート実装をモック化できるか

### 関連するSTEP
- **STEP 1: 理論基盤** ← C# 実装の理論的背景
- **STEP 2: 設計方法論** ← ここで学んだパターンの設計背景
- **STEP 3B: TypeScript/JavaScript 実装** ← 別言語での実装
- **STEP 3C: Java 実装** ← 別言語での実装
- **STEP 4: 適用判断** ← C# プロジェクトでどう判断するか
- **STEP 5: 実践応用** ← より複雑な実装例

### 外部リソース
- **Microsoft Learn - Dependency Injection in .NET**
  https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection

- **Entity Framework Core Documentation**
  https://learn.microsoft.com/en-us/ef/core/

- **Clean Architecture with ASP.NET Core** by Jason Taylor
  https://github.com/jasontaylordev/CleanArchitecture
  実装例が豊富です。

- **xUnit.net + Moq Documentation**
  テストフレームワークの詳細。

---

**[STEP 3B へ進む]** → STEP 3B: TypeScript/JavaScript では、同じアーキテクチャパターンを Node.js / JavaScript でどう実装するかを学びます。
