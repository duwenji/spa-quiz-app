# GitHub Copilot活用ベストプラクティス（C#版）
## 〜機能別・ユーザー別完全ガイド〜

## 📖 はじめに

このガイドでは、GitHub Copilotを**機能別**と**ユーザー別**の2つの観点から体系的にまとめています。C#開発者向けに、実際のコードサンプルを交えながら解説します。

---

# 第1部：機能別活用ガイド

## 1️⃣ コード補完（Inline Suggestions）

### 🎯 基本機能
コードを書いている最中に、灰色のテキストで次のコードを提案する機能です。

### 💡 活用テクニック

#### 【テクニック1】コメント駆動開発
```csharp
// Before: 曖昧なコメント
// ユーザーを処理する

// After: 具体的なコメント（Copilotが正確に提案）
// ユーザーリストから、最終ログインが30日以上前のユーザーを抽出し、
// 非アクティブユーザーとしてマークする
public List<User> MarkInactiveUsers(List<User> users)
{
    var thirtyDaysAgo = DateTime.Now.AddDays(-30);
    
    foreach (var user in users)
    {
        if (user.LastLogin < thirtyDaysAgo)
        {
            user.Status = UserStatus.Inactive;
        }
    }
    
    return users;
}

// 使用例
var users = new List<User>
{
    new User { Name = "田中", LastLogin = DateTime.Parse("2024-02-01"), Status = UserStatus.Active },
    new User { Name = "鈴木", LastLogin = DateTime.Parse("2024-01-15"), Status = UserStatus.Active }
};
```

#### 【テクニック2】XMLコメントで精度向上
```csharp
/// <summary>
/// スコアの平均を計算する
/// </summary>
/// <param name="scores">スコアのリスト</param>
/// <returns>平均値、リストが空の場合はnull</returns>
public double? CalculateAverageScore(List<double> scores)
{
    // XMLコメントがあることで、適切な実装を提案
    if (scores == null || scores.Count == 0)
        return null;
    
    return scores.Average();
}

/// <summary>
/// しきい値以上のスコアを持つ学生の名前を返す
/// </summary>
/// <param name="students">学生リスト</param>
/// <param name="threshold">しきい値（デフォルト: 80.0）</param>
/// <returns>条件を満たす学生の名前リスト</returns>
public List<string> FindHighScorers(List<Dictionary<string, object>> students, double threshold = 80.0)
{
    return students
        .Where(s => s.ContainsKey("Score") && Convert.ToDouble(s["Score"]) >= threshold)
        .Select(s => s["Name"].ToString())
        .ToList();
}
```

#### 【テクニック3】繰り返しパターンの自動化
```csharp
public class UserValidator
{
    public bool ValidateName(string name)
    {
        return name.Length >= 2 && name.All(char.IsLetter);
    }
    
    // Validate_ と入力すると、以下のような補完が提案される
    public bool ValidateEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
    
    public bool ValidateAge(int age)
    {
        return age >= 0 && age <= 150;
    }
    
    public bool ValidatePhone(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        return digits.Length >= 10;
    }
}
```

---

## 2️⃣ Copilot Chat

### 🎯 基本機能
自然言語で質問したり、コードについて相談できるチャットインターフェースです。

### 💡 活用テクニック

#### 【テクニック1】コードの説明を依頼
```
ユーザー: このコードは何をしていますか？

```csharp
var result = items
    .Where(x => !string.IsNullOrEmpty(x))
    .Select(x => x.Trim().ToLower())
    .Distinct()
    .ToList();
```

Copilot: このコードは以下の処理を行っています：
1. `Where(x => !string.IsNullOrEmpty(x))` - 空またはnullの要素を除外
2. `Select(x => x.Trim().ToLower())` - 各要素の前後の空白を除去し、小文字に変換
3. `Distinct()` - 重複する要素を除去
4. `ToList()` - 結果をリストに変換

つまり、大文字小文字を区別せず、空白を無視したユニークな文字列のリストを返します。
```

#### 【テクニック2】リファクタリングの提案
```
ユーザー: このコードをリファクタリングして、もっと読みやすくしてください

```csharp
public double Calc(double x)
{
    if (x > 0)
    {
        if (x < 100)
        {
            return x * 1.1;
        }
        else
        {
            return x * 0.9;
        }
    }
    else
    {
        return 0;
    }
}
```

Copilot: 以下のようにリファクタリングできます：

```csharp
/// <summary>
/// 価格を条件に応じて調整する
/// </summary>
/// <param name="price">調整前の価格</param>
/// <returns>調整後の価格（0以上の値）</returns>
public double CalculateAdjustedPrice(double price)
{
    if (price <= 0)
        return 0;
    
    // 100未満は10%アップ、100以上は10%ダウン
    return price < 100 
        ? price * 1.1  // 10%アップ
        : price * 0.9; // 10%ダウン
}
```

主な改善点：
- 意味のあるメソッド名とパラメータ名
- XMLコメントの追加
- 条件式の明確化
- 三項演算子で簡潔に表現
- マジックナンバーにコメントを追加
```

#### 【テクニック3】エラー解決
```
ユーザー: 以下のエラーが出ています。原因と解決方法を教えてください

```csharp
var json = File.ReadAllText("data.json");
var data = JsonSerializer.Deserialize<List<Item>>(json);
// Error: System.Text.Json.JsonException: The JSON value could not be converted to System.Collections.Generic.List`1[Item]
```

Copilot: このエラーはJSONの形式が期待するList<Item>と一致しないことが原因です。

解決策：

```csharp
using System.Text.Json;

// 1. JSONの構造を確認
var json = File.ReadAllText("data.json");
Console.WriteLine(json); // JSONの内容を表示

// 2. 適切なオプションを設定
var options = new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true, // プロパティ名の大文字小文字を区別しない
    AllowTrailingCommas = true,         // 末尾のカンマを許可
    ReadCommentHandling = JsonCommentHandling.Skip // コメントをスキップ
};

try
{
    // 3. エラーハンドリング付きでデシリアライズ
    var data = JsonSerializer.Deserialize<List<Item>>(json, options);
    
    if (data == null)
    {
        Console.WriteLine("データがnullです");
    }
}
catch (JsonException ex)
{
    Console.WriteLine($"JSON解析エラー: {ex.Message}");
    Console.WriteLine($"エラー位置: 行 {ex.LineNumber}, 位置 {ex.BytePositionInLine}");
}
```

## 3️⃣ Copilot Edits（インライン編集）

### 🎯 基本機能
既存のコードを選択して、直接修正や改善を指示できる機能です。

### 💡 活用テクニック

#### 【テクニック1】コードの最適化
```csharp
// 選択したコードに対して「パフォーマンスを最適化して」と指示

// Before（選択）
public List<int> FindDuplicates(int[] items)
{
    var duplicates = new List<int>();
    for (int i = 0; i < items.Length; i++)
    {
        for (int j = i + 1; j < items.Length; j++)
        {
            if (items[i] == items[j] && !duplicates.Contains(items[i]))
            {
                duplicates.Add(items[i]);
            }
        }
    }
    return duplicates;
}

// After（Copilotが提案）
/// <summary>
/// ハッシュセットを使用して重複を効率的に検出（O(n)）
/// </summary>
public List<int> FindDuplicatesOptimized(int[] items)
{
    var seen = new HashSet<int>();
    var duplicates = new HashSet<int>();
    
    foreach (var item in items)
    {
        if (seen.Contains(item))
        {
            duplicates.Add(item);
        }
        else
        {
            seen.Add(item);
        }
    }
    
    return duplicates.ToList();
}

// パフォーマンス比較
public void ComparePerformance()
{
    var testData = Enumerable.Range(0, 10000)
        .Concat(Enumerable.Range(0, 5000))
        .ToArray();
    
    var sw = new System.Diagnostics.Stopwatch();
    
    sw.Start();
    var result1 = FindDuplicates(testData);
    sw.Stop();
    Console.WriteLine($"最適化前: {sw.ElapsedMilliseconds}ms");
    
    sw.Restart();
    var result2 = FindDuplicatesOptimized(testData);
    sw.Stop();
    Console.WriteLine($"最適化後: {sw.ElapsedMilliseconds}ms");
}
```

#### 【テクニック2】エラーハンドリングの追加
```csharp
// 選択したコードに対して「エラーハンドリングを追加して」と指示

// Before（選択）
public Config ReadConfig(string filename)
{
    var json = File.ReadAllText(filename);
    return JsonSerializer.Deserialize<Config>(json);
}

// After（Copilotが提案）
using System.Text.Json;
using System.IO;

public class ConfigService
{
    private readonly ILogger<ConfigService> _logger;
    
    public ConfigService(ILogger<ConfigService> logger)
    {
        _logger = logger;
    }
    
    /// <summary>
    /// 設定ファイルを安全に読み込む
    /// </summary>
    /// <param name="filename">設定ファイルのパス</param>
    /// <returns>設定オブジェクト</returns>
    /// <exception cref="FileNotFoundException">ファイルが存在しない場合</exception>
    /// <exception cref="JsonException">JSON形式が不正な場合</exception>
    /// <exception cref="UnauthorizedAccessException">アクセス権限がない場合</exception>
    public async Task<Config> ReadConfigAsync(string filename)
    {
        // ファイル存在チェック
        if (!File.Exists(filename))
        {
            _logger.LogError("設定ファイルが見つかりません: {Filename}", filename);
            throw new FileNotFoundException($"設定ファイルが見つかりません: {filename}");
        }
        
        try
        {
            // 非同期で読み込み
            var json = await File.ReadAllTextAsync(filename);
            
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true
            };
            
            var config = JsonSerializer.Deserialize<Config>(json, options);
            
            if (config == null)
            {
                throw new InvalidOperationException("設定ファイルが空です");
            }
            
            // 必須設定のバリデーション
            ValidateConfig(config);
            
            _logger.LogInformation("設定ファイルを読み込みました: {Filename}", filename);
            return config;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "JSON形式が不正です: {Filename}", filename);
            throw;
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogError(ex, "ファイルの読み込み権限がありません: {Filename}", filename);
            throw;
        }
    }
    
    private void ValidateConfig(Config config)
    {
        var required = new[] { "Database", "ApiKey", "Port" };
        var missing = required.Where(r => 
            typeof(Config).GetProperty(r)?.GetValue(config) == null
        ).ToList();
        
        if (missing.Any())
        {
            throw new InvalidOperationException(
                $"必須設定が不足しています: {string.Join(", ", missing)}"
            );
        }
    }
}

public class Config
{
    public string Database { get; set; }
    public string ApiKey { get; set; }
    public int Port { get; set; }
}
```

---

## 4️⃣ エージェントモード（Agent Mode）

### 🎯 基本機能
複数ファイルにまたがる複雑なタスクを自動的に実行する機能です。

### 💡 活用テクニック

#### 【テクニック1】新機能の追加
```
ユーザー: ユーザー認証機能を追加して。以下の要件：
- パスワードはハッシュ化して保存（BCrypt）
- JWTトークンを発行
- ログイン/ログアウトAPI（コントローラー）
- レート制限（1分間に5回まで）

Copilot（エージェント）: 以下のファイルを作成・修正します：

📁 C#Project/
├── Controllers/
│   └── AuthController.cs（新規作成）
├── Services/
│   ├── AuthService.cs（新規作成）
│   └── JwtService.cs（新規作成）
├── Models/
│   └── User.cs（更新）
├── Middleware/
│   └── RateLimitMiddleware.cs（新規作成）
├── appsettings.json（更新）
└── Program.cs（更新）
```

#### 【テクニック2】リファクタリング
```
ユーザー: @workspace このプロジェクトのデータアクセス層をリポジトリパターンにリファクタリングして

Copilot（エージェント）: 以下の変更を実行します：
1. Repositories/ ディレクトリを作成
2. IRepository<T> インターフェースを作成
3. 各エンティティのリポジトリクラスを実装
4. 依存性注入を設定
5. 既存のコントローラーを修正
```

#### 【テクニック3】テスト自動生成
```csharp
// 「このクラスのユニットテストを生成して」と指示

// Before: Calculator.cs
public class Calculator
{
    public int Add(int a, int b) => a + b;
    
    public double Divide(int a, int b)
    {
        if (b == 0)
            throw new DivideByZeroException("0で割ることはできません");
        return (double)a / b;
    }
}

// After: CalculatorTests.cs（自動生成）
using Xunit;
using FluentAssertions;

public class CalculatorTests
{
    private readonly Calculator _calculator;
    
    public CalculatorTests()
    {
        _calculator = new Calculator();
    }
    
    [Theory]
    [InlineData(2, 3, 5)]
    [InlineData(-1, -2, -3)]
    [InlineData(5, 0, 5)]
    [InlineData(int.MaxValue, 1, int.MinValue)] // オーバーフロー
    public void Add_ShouldReturnSum_WhenCalled(int a, int b, int expected)
    {
        // Act
        var result = _calculator.Add(a, b);
        
        // Assert
        result.Should().Be(expected);
    }
    
    [Theory]
    [InlineData(10, 2, 5.0)]
    [InlineData(5, 2, 2.5)]
    [InlineData(-10, 2, -5.0)]
    [InlineData(0, 5, 0.0)]
    public void Divide_ShouldReturnQuotient_WhenValidInputs(int a, int b, double expected)
    {
        // Act
        var result = _calculator.Divide(a, b);
        
        // Assert
        result.Should().Be(expected);
    }
    
    [Fact]
    public void Divide_ShouldThrowDivideByZeroException_WhenDivisorIsZero()
    {
        // Act
        Action act = () => _calculator.Divide(10, 0);
        
        // Assert
        act.Should().Throw<DivideByZeroException>()
            .WithMessage("0で割ることはできません");
    }
    
    [Theory]
    [InlineData(1000000, 1000000)] // 大きな数値でのパフォーマンステスト
    public void Divide_ShouldHandleLargeNumbers(int a, int b)
    {
        // Act
        var result = _calculator.Divide(a, b);
        
        // Assert
        result.Should().Be(1.0);
    }
}
```

---

# 第2部：ユーザー別活用ガイド

## 👨‍💻 初心者プログラマー向け

### 🎯 目標：学習効率の向上とコーディング習慣の形成

#### 【シナリオ1】C#の書き方を学ぶ

```csharp
// 状況：ファイル操作をしたいが、書き方がわからない

// Step1: コメントで意図を伝える
// テキストファイルを読み込んで、各行をリストとして返す

// Step2: Copilotの提案を確認
public List<string> ReadFileLines(string filename)
{
    var lines = new List<string>();
    
    try
    {
        using (var reader = new StreamReader(filename))
        {
            string line;
            while ((line = reader.ReadLine()) != null)
            {
                lines.Add(line);
            }
        }
    }
    catch (FileNotFoundException)
    {
        Console.WriteLine($"ファイルが見つかりません: {filename}");
    }
    catch (IOException ex)
    {
        Console.WriteLine($"ファイル読み込みエラー: {ex.Message}");
    }
    
    return lines;
}

// Step3: よりモダンな書き方を提案してもらう
public async IAsyncEnumerable<string> ReadFileLinesAsync(string filename)
{
    using var reader = new StreamReader(filename);
    
    while (await reader.ReadLineAsync() is string line)
    {
        yield return line;
    }
}
```

#### 【シナリオ2】LINQの使い方を学ぶ

```csharp
// 状況：コレクションの操作を効率的に行いたい

// 基本的なforeach
var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
var evenNumbers = new List<int>();

foreach (var num in numbers)
{
    if (num % 2 == 0)
    {
        evenNumbers.Add(num);
    }
}

// CopilotにLINQバージョンを提案してもらう
var evenNumbersLinq = numbers.Where(n => n % 2 == 0).ToList();

// より複雑な例
var students = new List<Student>
{
    new Student { Name = "田中", Score = 85, Grade = "A" },
    new Student { Name = "鈴木", Score = 92, Grade = "A" },
    new Student { Name = "佐藤", Score = 78, Grade = "B" }
};

// グループ化と集計
var gradeStats = students
    .GroupBy(s => s.Grade)
    .Select(g => new
    {
        Grade = g.Key,
        AverageScore = g.Average(s => s.Score),
        Count = g.Count(),
        TopStudent = g.OrderByDescending(s => s.Score).First().Name
    })
    .ToList();
```

#### 【シナリオ3】非同期プログラミングを学ぶ

```csharp
// 状況：非同期処理の正しい書き方がわからない

// Before: 間違った非同期処理
public async Task<string> GetDataAsync()
{
    using var client = new HttpClient();
    var result = await client.GetStringAsync("https://api.example.com/data");
    return result; // これで正しい？
}

// Copilotに「ベストプラクティスを教えて」と依頼
public class DataService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<DataService> _logger;
    
    public DataService(HttpClient httpClient, ILogger<DataService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }
    
    /// <summary>
    /// 非同期でデータを取得する（ベストプラクティス適用）
    /// </summary>
    public async Task<Result<T>> GetDataAsync<T>(string endpoint, CancellationToken cancellationToken = default)
    {
        try
        {
            // キャンセレーショントークンを渡す
            var response = await _httpClient.GetAsync(endpoint, cancellationToken);
            
            // 成功レスポンスを確認
            response.EnsureSuccessStatusCode();
            
            // コンテンツを非同期で読み取り
            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            
            // デシリアライズ
            var data = JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            return Result<T>.Success(data);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTPリクエストエラー: {Endpoint}", endpoint);
            return Result<T>.Failure("ネットワークエラーが発生しました");
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "JSON解析エラー: {Endpoint}", endpoint);
            return Result<T>.Failure("データ形式が不正です");
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("リクエストがキャンセルされました: {Endpoint}", endpoint);
            return Result<T>.Failure("リクエストがキャンセルされました");
        }
    }
}

// 結果をラップするResult型
public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T Data { get; set; }
    public string Error { get; set; }
    
    public static Result<T> Success(T data) => new() { IsSuccess = true, Data = data };
    public static Result<T> Failure(string error) => new() { IsSuccess = false, Error = error };
}
```

---

## 🧑‍💻 中級者プログラマー向け

### 🎯 目標：生産性の向上とコード品質の改善

#### 【シナリオ1】デザインパターンの適用

```csharp
// 状況：ストラテジーパターンを適用したい

// Copilotに「支払い処理にストラテジーパターンを適用して」と依頼

// 支払い戦略インターフェース
public interface IPaymentStrategy
{
    Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
    string PaymentMethod { get; }
}

// クレジットカード支払い戦略
public class CreditCardPaymentStrategy : IPaymentStrategy
{
    private readonly ICreditCardService _creditCardService;
    private readonly ILogger<CreditCardPaymentStrategy> _logger;
    
    public string PaymentMethod => "CreditCard";
    
    public CreditCardPaymentStrategy(ICreditCardService creditCardService, ILogger<CreditCardPaymentStrategy> logger)
    {
        _creditCardService = creditCardService;
        _logger = logger;
    }
    
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        try
        {
            _logger.LogInformation("クレジットカード支払い処理開始: {Amount}", request.Amount);
            
            var result = await _creditCardService.ChargeAsync(
                request.CardNumber,
                request.ExpiryDate,
                request.Cvv,
                request.Amount
            );
            
            return new PaymentResult
            {
                Success = result.Success,
                TransactionId = result.TransactionId,
                Message = result.Message
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "クレジットカード支払いエラー");
            return PaymentResult.Failed("決済処理中にエラーが発生しました");
        }
    }
}

// PayPal支払い戦略
public class PayPalPaymentStrategy : IPaymentStrategy
{
    private readonly IPayPalService _payPalService;
    
    public string PaymentMethod => "PayPal";
    
    public PayPalPaymentStrategy(IPayPalService payPalService)
    {
        _payPalService = payPalService;
    }
    
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        var result = await _payPalService.CreatePaymentAsync(
            request.PayPalEmail,
            request.Amount,
            request.Currency
        );
        
        return new PaymentResult
        {
            Success = result.Status == "completed",
            TransactionId = result.Id,
            ApprovalUrl = result.ApprovalUrl,
            Message = result.Message
        };
    }
}

// 支払いコンテキスト
public class PaymentContext
{
    private readonly Dictionary<string, IPaymentStrategy> _strategies;
    private readonly ILogger<PaymentContext> _logger;
    
    public PaymentContext(IEnumerable<IPaymentStrategy> strategies, ILogger<PaymentContext> logger)
    {
        _strategies = strategies.ToDictionary(s => s.PaymentMethod);
        _logger = logger;
    }
    
    public async Task<PaymentResult> ExecutePaymentAsync(PaymentRequest request)
    {
        if (!_strategies.TryGetValue(request.PaymentMethod, out var strategy))
        {
            _logger.LogWarning("未対応の支払い方法: {PaymentMethod}", request.PaymentMethod);
            return PaymentResult.Failed($"未対応の支払い方法です: {request.PaymentMethod}");
        }
        
        _logger.LogInformation("支払い実行: {PaymentMethod}, {Amount}", 
            request.PaymentMethod, request.Amount);
        
        return await strategy.ProcessPaymentAsync(request);
    }
}
```

#### 【シナリオ2】パフォーマンス最適化

```csharp
// 状況：大量データを効率的に処理したい

// Before: 非効率なコード
public List<Product> ExpensiveProductSearch(List<Product> products, string keyword)
{
    var results = new List<Product>();
    foreach (var product in products)
    {
        if (product.Name.Contains(keyword) && product.Price > 100)
        {
            results.Add(product);
        }
    }
    return results.OrderBy(p => p.Price).ToList();
}

// After: 最適化されたコード
public class ProductService
{
    private readonly IQueryable<Product> _products;
    private readonly IMemoryCache _cache;
    
    public ProductService(IQueryable<Product> products, IMemoryCache cache)
    {
        _products = products;
        _cache = cache;
    }
    
    /// <summary>
    /// 最適化された商品検索
    /// </summary>
    public async Task<List<Product>> SearchProductsAsync(
        string keyword, 
        decimal? minPrice = null,
        decimal? maxPrice = null,
        string sortBy = "price",
        int page = 1,
        int pageSize = 20)
    {
        // キャッシュキーの生成
        var cacheKey = $"products_{keyword}_{minPrice}_{maxPrice}_{sortBy}_{page}_{pageSize}";
        
        // キャッシュから取得
        if (_cache.TryGetValue(cacheKey, out List<Product> cached))
        {
            return cached;
        }
        
        // クエリの構築
        var query = _products.AsNoTracking(); // 読み取り専用
        
        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(p => p.Name.Contains(keyword) || 
                                     p.Description.Contains(keyword));
        }
        
        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }
        
        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }
        
        // ソート
        query = sortBy?.ToLower() switch
        {
            "price_desc" => query.OrderByDescending(p => p.Price),
            "name" => query.OrderBy(p => p.Name),
            "name_desc" => query.OrderByDescending(p => p.Name),
            _ => query.OrderBy(p => p.Price) // デフォルトは価格順
        };
        
        // ページング
        var results = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        // キャッシュに保存（5分間）
        _cache.Set(cacheKey, results, TimeSpan.FromMinutes(5));
        
        return results;
    }
    
    /// <summary>
    /// 並列処理で複数のAPIを呼び出す
    /// </summary>
    public async Task<AggregatedProductData> GetAggregatedDataAsync(int productId)
    {
        // 複数のAPIを並列で呼び出し
        var productTask = _products.FirstOrDefaultAsync(p => p.Id == productId);
        var reviewsTask = _context.Reviews.Where(r => r.ProductId == productId).ToListAsync();
        var stockTask = _stockService.GetStockAsync(productId);
        var priceHistoryTask = _priceHistoryService.GetHistoryAsync(productId);
        
        await Task.WhenAll(productTask, reviewsTask, stockTask, priceHistoryTask);
        
        return new AggregatedProductData
        {
            Product = await productTask,
            Reviews = await reviewsTask,
            Stock = await stockTask,
            PriceHistory = await priceHistoryTask
        };
    }
}
```

#### 【シナリオ3】テスト容易性の向上

```csharp
// 状況：依存関係の多いコードをテスト可能にしたい

// Before: テスト困難なコード
public class OrderProcessor
{
    public async Task<bool> ProcessOrder(int orderId)
    {
        // 直接データベースにアクセス
        using var conn = new SqlConnection("connection string");
        var order = await conn.QueryFirstOrDefaultAsync<Order>(
            "SELECT * FROM Orders WHERE Id = @Id", new { Id = orderId });
        
        // 直接メール送信
        using var smtp = new SmtpClient("smtp.example.com");
        await smtp.SendMailAsync(new MailMessage(
            "from@example.com", 
            order.CustomerEmail, 
            "Order Processed", 
            "Your order has been processed"
        ));
        
        return true;
    }
}

// After: 依存性注入でテスト可能に
public interface IOrderRepository
{
    Task<Order> GetByIdAsync(int orderId);
    Task UpdateAsync(Order order);
}

public interface INotificationService
{
    Task SendOrderConfirmationAsync(int orderId, string customerEmail);
}

public interface IPaymentService
{
    Task<PaymentResult> ProcessPaymentAsync(int orderId, decimal amount);
}

public class OrderProcessor
{
    private readonly IOrderRepository _orderRepository;
    private readonly INotificationService _notificationService;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<OrderProcessor> _logger;
    
    public OrderProcessor(
        IOrderRepository orderRepository,
        INotificationService notificationService,
        IPaymentService paymentService,
        ILogger<OrderProcessor> logger)
    {
        _orderRepository = orderRepository;
        _notificationService = notificationService;
        _paymentService = paymentService;
        _logger = logger;
    }
    
    public async Task<OrderResult> ProcessOrderAsync(int orderId)
    {
        try
        {
            _logger.LogInformation("注文処理開始: {OrderId}", orderId);
            
            // 注文の取得
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                return OrderResult.Failed("注文が見つかりません");
            }
            
            // 支払い処理
            var paymentResult = await _paymentService.ProcessPaymentAsync(
                orderId, order.TotalAmount);
            
            if (!paymentResult.Success)
            {
                return OrderResult.Failed($"支払い失敗: {paymentResult.Error}");
            }
            
            // 注文ステータス更新
            order.Status = OrderStatus.Processed;
            order.PaymentTransactionId = paymentResult.TransactionId;
            await _orderRepository.UpdateAsync(order);
            
            // 通知送信
            await _notificationService.SendOrderConfirmationAsync(
                orderId, order.CustomerEmail);
            
            _logger.LogInformation("注文処理完了: {OrderId}", orderId);
            
            return OrderResult.Success(orderId, paymentResult.TransactionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "注文処理エラー: {OrderId}", orderId);
            return OrderResult.Failed("注文処理中にエラーが発生しました");
        }
    }
}

// テスト
public class OrderProcessorTests
{
    [Fact]
    public async Task ProcessOrderAsync_ShouldSucceed_WhenValidOrder()
    {
        // Arrange
        var orderId = 1;
        var order = new Order { Id = orderId, TotalAmount = 100, CustomerEmail = "test@example.com" };
        
        var mockRepo = new Mock<IOrderRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(orderId)).ReturnsAsync(order);
        
        var mockPayment = new Mock<IPaymentService>();
        mockPayment.Setup(p => p.ProcessPaymentAsync(orderId, 100))
            .ReturnsAsync(PaymentResult.Success("tx123"));
        
        var mockNotification = new Mock<INotificationService>();
        var mockLogger = new Mock<ILogger<OrderProcessor>>();
        
        var processor = new OrderProcessor(
            mockRepo.Object,
            mockNotification.Object,
            mockPayment.Object,
            mockLogger.Object
        );
        
        // Act
        var result = await processor.ProcessOrderAsync(orderId);
        
        // Assert
        Assert.True(result.Success);
        mockRepo.Verify(r => r.UpdateAsync(It.Is<Order>(o => 
            o.Status == OrderStatus.Processed)), Times.Once);
        mockNotification.Verify(n => n.SendOrderConfirmationAsync(
            orderId, order.CustomerEmail), Times.Once);
    }
}
```

---

## 👨‍🏫 上級者/テックリード向け

### 🎯 目標：チーム全体の生産性向上と品質標準化

#### 【シナリオ1】アーキテクチャ設計の支援

```csharp
// 状況：クリーンアーキテクチャの設計

// Copilot Chatでの相談
"""
ユーザー: C#でクリーンアーキテクチャを実装したい。
以下の要件を満たす構造を提案してください：

- ドメイン層、アプリケーション層、インフラ層、プレゼンテーション層
- CQRSパターン
- MediatRの使用
- Entity Framework Core
"""

// Copilotの提案
// Domain/Entities/Order.cs
namespace Domain.Entities
{
    public class Order : IAggregateRoot
    {
        public int Id { get; private set; }
        public string CustomerName { get; private set; }
        public decimal TotalAmount { get; private set; }
        public OrderStatus Status { get; private set; }
        private readonly List<OrderItem> _items = new();
        public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
        
        private Order() { } // EF Core用
        
        public Order(string customerName)
        {
            CustomerName = customerName;
            Status = OrderStatus.Pending;
        }
        
        public void AddItem(string productName, decimal unitPrice, int quantity)
        {
            var item = new OrderItem(productName, unitPrice, quantity);
            _items.Add(item);
            RecalculateTotal();
        }
        
        private void RecalculateTotal()
        {
            TotalAmount = _items.Sum(i => i.Subtotal);
        }
        
        public void MarkAsPaid()
        {
            if (Status != OrderStatus.Pending)
                throw new InvalidOperationException("支払い可能な状態ではありません");
            
            Status = OrderStatus.Paid;
        }
    }
    
    public enum OrderStatus
    {
        Pending,
        Paid,
        Shipped,
        Delivered,
        Cancelled
    }
}

// Application/Features/Orders/Commands/CreateOrderCommand.cs
using MediatR;

namespace Application.Features.Orders.Commands
{
    public record CreateOrderCommand : IRequest<CreateOrderResult>
    {
        public string CustomerName { get; init; }
        public List<OrderItemDto> Items { get; init; }
    }
    
    public record OrderItemDto
    {
        public string ProductName { get; init; }
        public decimal UnitPrice { get; init; }
        public int Quantity { get; init; }
    }
    
    public record CreateOrderResult
    {
        public int OrderId { get; init; }
        public decimal TotalAmount { get; init; }
        public string Message { get; init; }
    }
    
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, CreateOrderResult>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CreateOrderCommandHandler> _logger;
        
        public CreateOrderCommandHandler(
            IOrderRepository orderRepository,
            IUnitOfWork unitOfWork,
            ILogger<CreateOrderCommandHandler> logger)
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }
        
        public async Task<CreateOrderResult> Handle(
            CreateOrderCommand request, 
            CancellationToken cancellationToken)
        {
            var order = new Order(request.CustomerName);
            
            foreach (var item in request.Items)
            {
                order.AddItem(item.ProductName, item.UnitPrice, item.Quantity);
            }
            
            await _orderRepository.AddAsync(order, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation("注文作成完了: {OrderId}", order.Id);
            
            return new CreateOrderResult
            {
                OrderId = order.Id,
                TotalAmount = order.TotalAmount,
                Message = "注文が正常に作成されました"
            };
        }
    }
}

// Infrastructure/Persistence/Repositories/OrderRepository.cs
namespace Infrastructure.Persistence.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _context;
        
        public OrderRepository(AppDbContext context)
        {
            _context = context;
        }
        
        public async Task<Order> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
        }
        
        public async Task AddAsync(Order order, CancellationToken cancellationToken = default)
        {
            await _context.Orders.AddAsync(order, cancellationToken);
        }
        
        public void Update(Order order)
        {
            _context.Entry(order).State = EntityState.Modified;
        }
    }
}
```

#### 【シナリオ2】コーディング標準の策定

```csharp
// .github/copilot-instructions.md（チーム標準）

/*
# C#コーディング標準

## 🎯 基本ルール
- ファイルスコープの名前空間を使用
- 全てのpublicメンバーにXMLコメント
- メソッドは25行以内
- 循環複雑度は10以下

## 命名規則
- クラス/インターフェース: PascalCase
- メソッド: PascalCase
- パラメータ/ローカル変数: camelCase
- プライベートフィールド: _camelCase
- インターフェース: IPascalCase

## エラーハンドリング
- 特定の例外をキャッチ（Exceptionのキャッチ禁止）
- ビジネス例外はカスタム例外クラス
- ログは構造化ログ（Serilog推奨）

## 非同期パターン
- 非同期メソッドはAsyncサフィックス
- CancellationTokenの受け渡し
- ConfigureAwait(false)の使用（ライブラリコード）

## 実装例
```csharp
namespace MyApp.Services;

/// <summary>
/// ユーザー管理サービスクラス
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;
    
    public UserService(
        IUserRepository userRepository,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }
    
    /// <summary>
    /// アクティブユーザーを非同期で取得
    /// </summary>
    /// <param name="cancellationToken">キャンセレーショントークン</param>
    /// <returns>アクティブユーザーのリスト</returns>
    public async Task<List<UserDto>> GetActiveUsersAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var users = await _userRepository
                .GetActiveUsersAsync(cancellationToken)
                .ConfigureAwait(false);
            
            _logger.LogInformation(
                "アクティブユーザー取得完了: {Count}件", 
                users.Count);
            
            return users.Select(u => u.ToDto()).ToList();
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "ユーザー取得エラー");
            throw new UserServiceException("ユーザー取得に失敗しました", ex);
        }
    }
}
```
*/
```

---

## 🧪 品質保証（QA）エンジニア向け

### 🎯 目標：テスト自動化と品質向上

#### 【シナリオ1】テストケースの自動生成

```csharp
// 状況：複雑なビジネスロジックのテストを効率化したい

public class ShippingCostCalculator
{
    private const decimal BaseCost = 500m;
    private const decimal WeightRate = 100m;
    private const decimal DistanceRate = 10m;
    private const decimal ExpressFee = 1000m;
    private const decimal InternationalMultiplier = 3m;
    private const decimal InternationalDistanceMultiplier = 5m;
    
    /// <summary>
    /// 配送料金を計算する
    /// </summary>
    public decimal CalculateShippingCost(
        decimal weight,
        decimal distance,
        bool express = false,
        bool international = false)
    {
        var baseCost = BaseCost;
        var weightCost = weight * WeightRate;
        var distanceCost = distance * DistanceRate;
        
        if (international)
        {
            baseCost *= InternationalMultiplier;
            distanceCost *= InternationalDistanceMultiplier;
        }
        
        var total = baseCost + weightCost + distanceCost;
        
        if (express)
        {
            total += ExpressFee;
        }
        
        return total;
    }
}

// Copilotに「テストケースを生成して」と依頼
public class ShippingCostCalculatorTests
{
    private readonly ShippingCostCalculator _calculator;
    
    public ShippingCostCalculatorTests()
    {
        _calculator = new ShippingCostCalculator();
    }
    
    [Theory]
    [InlineData(1, 10, false, false, 700)]    // 基本: 500 + 100 + 100
    [InlineData(5, 100, false, false, 2000)]  // 500 + 500 + 1000
    [InlineData(0, 10, false, false, 600)]    // 最小重量: 500 + 0 + 100
    [InlineData(0.1, 10, false, false, 610)]  // 最小+ε: 500 + 10 + 100
    [InlineData(100, 10, false, false, 10600)] // 500 + 10000 + 100
    [InlineData(1, 10, true, false, 1700)]     // 速達: 700 + 1000
    [InlineData(1, 10, false, true, 2100)]     // 国際: (500*3) + 100 + (10*5*10)
    [InlineData(1, 10, true, true, 3100)]      // 国際+速達: 2100 + 1000
    public void CalculateShippingCost_ShouldReturnExpectedValue(
        decimal weight,
        decimal distance,
        bool express,
        bool international,
        decimal expected)
    {
        // Act
        var result = _calculator.CalculateShippingCost(weight, distance, express, international);
        
        // Assert
        Assert.Equal(expected, result);
    }
    
    [Theory]
    [InlineData(-1, 10)]    // 負の重量
    [InlineData(1, -10)]    // 負の距離
    [InlineData(999999, 10)] // 極端に大きい値
    public void CalculateShippingCost_ShouldNotThrowException_WithInvalidInputs(
        decimal weight,
        decimal distance)
    {
        // 例外がスローされないことを確認
        var exception = Record.Exception(() => 
            _calculator.CalculateShippingCost(weight, distance));
        
        Assert.Null(exception);
    }
    
    [Fact]
    public void CalculateShippingCost_ShouldHandleMaximumValues()
    {
        // Arrange
        var maxWeight = decimal.MaxValue / 1000; // オーバーフローを避ける
        var maxDistance = 10000;
        
        // Act
        var result = _calculator.CalculateShippingCost(maxWeight, maxDistance, true, true);
        
        // Assert
        Assert.True(result > 0);
    }
    
    // 組み合わせテスト
    public static IEnumerable<object[]> GetCombinationTestData()
    {
        var weights = new[] { 0m, 0.5m, 1m, 5m, 10m, 50m };
        var distances = new[] { 1m, 5m, 10m, 50m, 100m, 500m };
        var expressOptions = new[] { true, false };
        var internationalOptions = new[] { true, false };
        
        foreach (var weight in weights)
        foreach (var distance in distances)
        foreach (var express in expressOptions)
        foreach (var international in internationalOptions)
        {
            yield return new object[] { weight, distance, express, international };
        }
    }
    
    [Theory]
    [MemberData(nameof(GetCombinationTestData))]
    public void CalculateShippingCost_AllCombinations_ShouldReturnPositiveValue(
        decimal weight,
        decimal distance,
        bool express,
        bool international)
    {
        // Act
        var result = _calculator.CalculateShippingCost(weight, distance, express, international);
        
        // Assert
        Assert.True(result >= 0);
    }
}
```

#### 【シナリオ2】統合テストの自動生成

```csharp
// 状況：Web APIの統合テストを作成したい

using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using Xunit;

public class OrdersApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    
    public OrdersApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // テスト用のデータベースに差し替え
                services.RemoveAll<AppDbContext>();
                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase("TestDb"));
            });
        });
        
        _client = _factory.CreateClient();
    }
    
    [Fact]
    public async Task CreateOrder_WithValidData_ReturnsCreated()
    {
        // Arrange
        var request = new
        {
            customerName = "テスト顧客",
            items = new[]
            {
                new { productName = "商品A", unitPrice = 1000m, quantity = 2 },
                new { productName = "商品B", unitPrice = 500m, quantity = 1 }
            }
        };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", request);
        
        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<CreateOrderResult>();
        Assert.NotNull(result);
        Assert.True(result.OrderId > 0);
        Assert.Equal(2500m, result.TotalAmount); // 1000*2 + 500*1
    }
    
    [Fact]
    public async Task GetOrder_WithExistingId_ReturnsOrder()
    {
        // Arrange - 先に注文を作成
        var createResponse = await CreateTestOrder();
        var created = await createResponse.Content.ReadFromJsonAsync<CreateOrderResult>();
        
        // Act
        var response = await _client.GetAsync($"/api/orders/{created.OrderId}");
        
        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var order = await response.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(order);
        Assert.Equal(created.OrderId, order.Id);
        Assert.NotEmpty(order.Items);
    }
    
    [Fact]
    public async Task GetOrder_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/orders/99999");
        
        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
    
    [Fact]
    public async Task UpdateOrderStatus_WithValidData_ReturnsOk()
    {
        // Arrange
        var createResponse = await CreateTestOrder();
        var created = await createResponse.Content.ReadFromJsonAsync<CreateOrderResult>();
        
        var updateRequest = new { status = "Paid" };
        
        // Act
        var response = await _client.PatchAsJsonAsync(
            $"/api/orders/{created.OrderId}/status", 
            updateRequest);
        
        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        // 状態変更の確認
        var getResponse = await _client.GetAsync($"/api/orders/{created.OrderId}");
        var updated = await getResponse.Content.ReadFromJsonAsync<OrderDto>();
        Assert.Equal("Paid", updated.Status);
    }
    
    private async Task<HttpResponseMessage> CreateTestOrder()
    {
        var request = new
        {
            customerName = "テスト顧客",
            items = new[]
            {
                new { productName = "商品A", unitPrice = 1000m, quantity = 1 }
            }
        };
        
        return await _client.PostAsJsonAsync("/api/orders", request);
    }
}
```

---

## 📊 まとめ：役割別おすすめ機能マトリックス（C#版）

| ユーザー種別 | 最も活用すべき機能 | 期待できる効果 | C#特有の活用例 |
|------------|-------------------|--------------|---------------|
| **初心者** | コード補完、チャット（説明依頼） | 学習効率向上、ベストプラクティスの習得 | LINQ、async/awaitの使い方 |
| **中級者** | インライン編集、チャット（リファクタリング） | 生産性向上、コード品質改善 | デザインパターン、EF Core最適化 |
| **上級者/リード** | カスタム命令、エージェントモード | チーム標準化、アーキテクチャ設計支援 | クリーンアーキテクチャ、CQRS |
| **QAエンジニア** | チャット（テスト生成）、エージェントモード | テスト自動化、品質保証の効率化 | xUnit、Moq、統合テスト |

---

## 🎯 C#開発者向けクイックリファレンス

### よく使うプロンプト例

```csharp
// 1. LINQクエリの最適化
// 「このLINQクエリを最適化して」

// 2. 非同期処理のパターン
// 「この同期メソッドを非同期に変換して」

// 3. Entity Frameworkのクエリ
// 「このEFクエリにインクルードとフィルタリングを追加して」

// 4. 例外処理
// 「このメソッドに適切な例外処理を追加して」

// 5. ユニットテスト
// 「このクラスのMoqを使ったユニットテストを生成して」
```

### おすすめの設定（.editorconfig）

```ini
# コーディング規約をCopilotに伝える
dotnet_naming_rule.interface_should_be_ipascalcase.severity = suggestion
dotnet_naming_symbols.interface.applicable_kinds = interface
dotnet_naming_symbols.interface.applicable_accessibilities = public, internal, private, protected, protected_internal, private_protected
dotnet_naming_style.ipascalcase.required_prefix = I
```

---

このガイドを参考に、C#開発におけるGitHub Copilotの活用を最大限に引き出してください！