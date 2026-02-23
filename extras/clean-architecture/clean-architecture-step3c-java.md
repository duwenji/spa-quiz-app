# クリーンアーキテクチャ - STEP 3C: Java での実装

## 概要

このステップでは、STEP 1・2で学んだ理論と設計パターンを **Java** で実装する方法を学びます。

- **このステップの学習時間**：約1.5～2時間
- **このステップの位置づけ**：設計を Java の具体的な実装へ落とし込む
- **前提知識**：STEP 1・2の理論と設計パターン、Java の基本文法
- **このステップの学習成果**：
  - Spring Boot を活用したクリーンアーキテクチャ
  - Maven/Gradle でのプロジェクト構成
  - Spring の DI コンテナの活用
  - JPA/Hibernate との統合
  - Java 固有の実装パターン

---

## 目次

1. [プロジェクト構成とパッケージ設計](#プロジェクト構成とパッケージ設計)
   - Maven/Gradle 構成例
   - パッケージ構造設計
   - プロジェクト依存関係
   - pom.xml / build.gradle の設定

2. [実装パターン](#実装パターン)
   - エンティティ層の実装
   - ユースケース層の実装
   - インターフェース・アダプタ層の実装
   - フレームワーク層の実装

3. [Spring DI の設定](#spring-di-の設定)
   - @Component / @Service による自動登録
   - @Autowired と Constructor Injection
   - @Configuration での明示的設定
   - 環境別設定の切り替え

4. [完全な実装例](#完全な実装例)
   - ドメイン: 注文エンティティ
   - ユースケース: 注文作成
   - アダプタ: REST Controller, Repository
   - セットアップ: Spring Boot Configuration

5. [参考リソース](#参考リソース)

---

## プロジェクト構成とパッケージ設計

### Maven 構成（pom.xml の例）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example.clean</groupId>
  <artifactId>clean-architecture-example</artifactId>
  <version>1.0.0</version>
  <packaging>jar</packaging>

  <name>Clean Architecture Example</name>
  <description>Clean Architecture implementation in Java</description>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.1.0</version>
    <relativePath/>
  </parent>

  <properties>
    <java.version>17</java.version>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
  </properties>

  <dependencies>
    <!-- Spring Boot Web -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Boot Data JPA -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- H2 Database (開発・テスト用) -->
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
    </dependency>

    <!-- MySQL (本番用) -->
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <version>8.0.33</version>
      <scope>runtime</scope>
    </dependency>

    <!-- MapStruct (DTO マッピング) -->
    <dependency>
      <groupId>org.mapstruct</groupId>
      <artifactId>mapstruct</artifactId>
      <version>1.5.3.Final</version>
    </dependency>

    <!-- Testing -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>

    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <configuration>
          <source>17</source>
          <target>17</target>
          <annotationProcessorPaths>
            <path>
              <groupId>org.mapstruct</groupId>
              <artifactId>mapstruct-processor</artifactId>
              <version>1.5.3.Final</version>
            </path>
          </annotationProcessorPaths>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

### Gradle 構成（build.gradle の例）

```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.1.0'
    id 'io.spring.dependency-management' version '1.1.0'
}

group = 'com.example.clean'
version = '1.0.0'
sourceCompatibility = '17'

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // MapStruct
    implementation 'org.mapstruct:mapstruct:1.5.3.Final'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.3.Final'

    // Database
    runtimeOnly 'com.h2database:h2'
    runtimeOnly 'mysql:mysql-connector-java:8.0.33'

    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.junit.jupiter:junit-jupiter'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

### パッケージ構造（マルチモジュール）

実際のプロジェクトでは、Maven マルチモジュール構成が推奨されます。

```
clean-architecture-example/
├── pom.xml                    （親 POM）
│
├── clean-architecture-domain/
│   ├── pom.xml
│   └── src/main/java/com/example/clean/domain/
│       ├── entities/
│       │   ├── Order.java
│       │   └── OrderItem.java
│       ├── valueobjects/
│       │   └── Money.java
│       └── services/
│           └── OrderPolicies.java
│
├── clean-architecture-application/
│   ├── pom.xml
│   └── src/main/java/com/example/clean/application/
│       ├── usecases/
│       │   └── orders/
│       │       └── CreateOrderUseCase.java
│       ├── ports/
│       │   ├── IOrderRepository.java
│       │   ├── IPaymentProcessor.java
│       │   └── INotificationService.java
│       └── dtos/
│           └── OrderDto.java
│
├── clean-architecture-adapters/
│   ├── pom.xml
│   └── src/main/java/com/example/clean/adapters/
│       ├── driven/
│       │   ├── persistence/
│       │   │   └── OrderRepositoryImpl.java
│       │   └── gateways/
│       │       ├── PaymentGatewayImpl.java
│       │       └── NotificationGatewayImpl.java
│       └── driving/
│           ├── http/
│           │   └── OrderController.java
│           └── presenters/
│               └── OrderPresenter.java
│
└── clean-architecture-app/
    ├── pom.xml
    ├── src/main/java/com/example/clean/
    │   ├── CleanArchitectureApplication.java
    │   ├── config/
    │   │   └── BeansConfiguration.java
    │   └── Application.properties
    └── src/test/java/...

【親 pom.xml】
<modules>
  <module>clean-architecture-domain</module>
  <module>clean-architecture-application</module>
  <module>clean-architecture-adapters</module>
  <module>clean-architecture-app</module>
</modules>

【依存関係】
app         → adapters + application + domain
adapters    → application + domain
application → domain
domain      → (なし)
```

---

## 実装パターン

### エンティティ層の実装

#### JPA エンティティの設計

```java
// domain/entities/Order.java
package com.example.clean.domain.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Order エンティティ
 * ビジネスルールを実装
 * JPA アノテーションは必要だが、ビジネスロジックが中心
 */
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();

    // コンストラクタ（JPA 用のデフォルトコンストラクタ）
    protected Order() {
    }

    /**
     * Factory メソッド: Order インスタンス作成
     */
    public static Order create(String customerId) {
        if (customerId == null || customerId.trim().isEmpty()) {
            throw new IllegalArgumentException("CustomerId cannot be empty");
        }

        Order order = new Order();
        order.id = UUID.randomUUID().toString();
        order.customerId = customerId;
        order.createdAt = LocalDateTime.now();
        order.status = OrderStatus.PENDING;

        return order;
    }

    /**
     * ビジネスロジック：商品追加
     */
    public void addItem(String productId, int quantity, java.math.BigDecimal price) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("Cannot add items to confirmed order");
        }

        OrderItem item = OrderItem.create(productId, quantity, price);
        this.items.add(item);
    }

    /**
     * ビジネスロジック：注文確定
     */
    public void confirm() {
        if (this.items.isEmpty()) {
            throw new IllegalStateException("Order must have items before confirming");
        }
        this.status = OrderStatus.CONFIRMED;
    }

    /**
     * ビジネスロジック：合計金額計算
     */
    public java.math.BigDecimal getTotalAmount() {
        return items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
    }

    // ================================
    // Getters
    // ================================

    public String getId() {
        return id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }
}

// OrderStatus 定義
public enum OrderStatus {
    PENDING("保留中"),
    CONFIRMED("確定"),
    PAID("支払済"),
    SHIPPED("発送済"),
    DELIVERED("配送完了"),
    CANCELLED("キャンセル");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

#### 子エンティティの実装

```java
// domain/entities/OrderItem.java
package com.example.clean.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // JPA 用デフォルトコンストラクタ
    protected OrderItem() {
    }

    public static OrderItem create(String productId, int quantity, BigDecimal price) {
        if (productId == null || productId.trim().isEmpty()) {
            throw new IllegalArgumentException("ProductId cannot be empty");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }

        OrderItem item = new OrderItem();
        item.id = UUID.randomUUID().toString();
        item.productId = productId;
        item.quantity = quantity;
        item.price = price;

        return item;
    }

    public BigDecimal getSubtotal() {
        return price.multiply(new BigDecimal(quantity));
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getProductId() {
        return productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }
}
```

### ユースケース層の実装

#### Port（インターフェース）定義

```java
// application/ports/IOrderRepository.java
package com.example.clean.application.ports;

import com.example.clean.domain.entities.Order;
import java.util.List;
import java.util.Optional;

/**
 * Order 永続化のポート (Output Port)
 * ユースケース層で定義
 * 実装は Adapters 層
 */
public interface IOrderRepository {
    void save(Order order);

    Optional<Order> findById(String orderId);

    List<Order> findByCustomerId(String customerId);
}

// application/ports/IPaymentProcessor.java
package com.example.clean.application.ports;

public interface IPaymentProcessor {
    boolean processPayment(String orderId, java.math.BigDecimal amount);
}

// application/ports/INotificationService.java
package com.example.clean.application.ports;

public interface INotificationService {
    void notifyOrderCreated(String customerId, String orderId);
}
```

#### Request/Response DTO

```java
// application/usecases/orders/CreateOrderRequest.java
package com.example.clean.application.usecases.orders;

import java.util.List;
import java.math.BigDecimal;

public class CreateOrderRequest {
    private String customerId;
    private List<OrderItemRequest> items;

    public CreateOrderRequest(String customerId, List<OrderItemRequest> items) {
        this.customerId = customerId;
        this.items = items;
    }

    // Getters
    public String getCustomerId() {
        return customerId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public static class OrderItemRequest {
        private String productId;
        private int quantity;
        private BigDecimal price;

        public OrderItemRequest(String productId, int quantity, BigDecimal price) {
            this.productId = productId;
            this.quantity = quantity;
            this.price = price;
        }

        // Getters
        public String getProductId() {
            return productId;
        }

        public int getQuantity() {
            return quantity;
        }

        public BigDecimal getPrice() {
            return price;
        }
    }
}

// application/usecases/orders/CreateOrderResponse.java
package com.example.clean.application.usecases.orders;

import java.math.BigDecimal;

public class CreateOrderResponse {
    private String orderId;
    private BigDecimal totalAmount;
    private String status;
    private boolean success;
    private String message;

    public CreateOrderResponse(String orderId, BigDecimal totalAmount,
                              String status, boolean success, String message) {
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.success = success;
        this.message = message;
    }

    // Getters
    public String getOrderId() {
        return orderId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    // Factory メソッド
    public static CreateOrderResponse success(String orderId, BigDecimal totalAmount, String status) {
        return new CreateOrderResponse(orderId, totalAmount, status, true,
                "Order created successfully");
    }

    public static CreateOrderResponse failure(String message) {
        return new CreateOrderResponse(null, null, null, false, message);
    }
}
```

#### ユースケース実装

```java
// application/usecases/orders/CreateOrderUseCase.java
package com.example.clean.application.usecases.orders;

import com.example.clean.domain.entities.Order;
import com.example.clean.application.ports.IOrderRepository;
import com.example.clean.application.ports.IPaymentProcessor;
import com.example.clean.application.ports.INotificationService;
import org.springframework.stereotype.Service;

/**
 * 注文作成ユースケース
 */
@Service
public class CreateOrderUseCase {

    private final IOrderRepository repository;
    private final IPaymentProcessor paymentProcessor;
    private final INotificationService notificationService;

    // Constructor Injection（推奨）
    public CreateOrderUseCase(
            IOrderRepository repository,
            IPaymentProcessor paymentProcessor,
            INotificationService notificationService) {
        this.repository = repository;
        this.paymentProcessor = paymentProcessor;
        this.notificationService = notificationService;
    }

    /**
     * ユースケース実行
     */
    public CreateOrderResponse execute(CreateOrderRequest request) {
        try {
            // 入力検証
            if (request.getCustomerId() == null || request.getCustomerId().trim().isEmpty()) {
                return CreateOrderResponse.failure("Invalid customer ID");
            }

            if (request.getItems() == null || request.getItems().isEmpty()) {
                return CreateOrderResponse.failure("Order must have at least one item");
            }

            // ビジネスロジック：エンティティ作成
            Order order = Order.create(request.getCustomerId());

            // ビジネスロジック：商品追加
            for (CreateOrderRequest.OrderItemRequest item : request.getItems()) {
                order.addItem(item.getProductId(), item.getQuantity(), item.getPrice());
            }

            // ビジネスロジック：注文確定
            order.confirm();

            // 外部サービス：支払い処理（実装は別層）
            var totalAmount = order.getTotalAmount();
            boolean paymentSuccess = paymentProcessor.processPayment(order.getId(), totalAmount);

            if (!paymentSuccess) {
                return CreateOrderResponse.failure("Payment processing failed");
            }

            // 永続化（実装は別層）
            repository.save(order);

            // 通知（実装は別層）
            notificationService.notifyOrderCreated(order.getCustomerId(), order.getId());

            // 成功レスポンス
            return CreateOrderResponse.success(
                    order.getId(),
                    totalAmount,
                    order.getStatus().toString()
            );

        } catch (Exception ex) {
            return CreateOrderResponse.failure("Error creating order: " + ex.getMessage());
        }
    }
}
```

### インターフェース・アダプタ層の実装

#### REST Controller

```java
// adapters/driving/http/OrderController.java
package com.example.clean.adapters.driving.http;

import com.example.clean.application.usecases.orders.CreateOrderRequest;
import com.example.clean.application.usecases.orders.CreateOrderResponse;
import com.example.clean.application.usecases.orders.CreateOrderUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;

    public OrderController(CreateOrderUseCase createOrderUseCase) {
        this.createOrderUseCase = createOrderUseCase;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        CreateOrderResponse response = createOrderUseCase.execute(request);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
```

#### Repository 実装（Spring Data JPA）

```java
// adapters/driven/persistence/OrderRepositorySpringData.java
package com.example.clean.adapters.driven.persistence;

import com.example.clean.domain.entities.Order;
import com.example.clean.application.ports.IOrderRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA → IOrderRepository の適応
 */
@Component
public class OrderRepositoryAdapter implements IOrderRepository {

    private final OrderJpaRepository jpaRepository;

    public OrderRepositoryAdapter(OrderJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public void save(Order order) {
        jpaRepository.save(order);
    }

    @Override
    public Optional<Order> findById(String orderId) {
        return jpaRepository.findById(orderId);
    }

    @Override
    public List<Order> findByCustomerId(String customerId) {
        return jpaRepository.findByCustomerId(customerId);
    }
}

// Spring Data JPA インターフェース
interface OrderJpaRepository extends JpaRepository<Order, String> {
    List<Order> findByCustomerId(String customerId);
}
```

#### Gateway 実装（外部サービス）

```java
// adapters/driven/gateways/PaymentGatewayImpl.java
package com.example.clean.adapters.driven.gateways;

import com.example.clean.application.ports.IPaymentProcessor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class PaymentGatewayImpl implements IPaymentProcessor {

    @Override
    public boolean processPayment(String orderId, BigDecimal amount) {
        try {
            // 実装例：外部決済サービスへリクエスト
            // RestTemplate を使用: restTemplate.postForObject(...)
            
            System.out.println("Processing payment for order: " + orderId + " amount: " + amount);
            return true;  // 実証用

        } catch (Exception ex) {
            System.err.println("Payment error: " + ex.getMessage());
            return false;
        }
    }
}

// adapters/driven/gateways/NotificationGatewayImpl.java
package com.example.clean.adapters.driven.gateways;

import com.example.clean.application.ports.INotificationService;
import org.springframework.stereotype.Component;

@Component
public class NotificationGatewayImpl implements INotificationService {

    @Override
    public void notifyOrderCreated(String customerId, String orderId) {
        // 実装例：メール送信
        // JavaMailSender を注入して使用可能
        
        System.out.println("Notification sent to customer: " + customerId + " for order: " + orderId);
    }
}
```

---

## Spring DI の設定

### 自動設定（@Component, @Service）

```java
// Spring Boot アプリケーション起動クラス
package com.example.clean;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CleanArchitectureApplication {

    public static void main(String[] args) {
        SpringApplication.run(CleanArchitectureApplication.class, args);
    }
}

// @Service でユースケースを登録
@Service
public class CreateOrderUseCase { ... }

// @Component でAdapter を登録
@Component
public class PaymentGatewayImpl implements IPaymentProcessor { ... }

// @Component でRepository を登録
@Component
public class OrderRepositoryAdapter implements IOrderRepository { ... }
```

### @Configuration による明示的設定

```java
// config/BeansConfiguration.java
package com.example.clean.config;

import com.example.clean.adapters.driven.persistence.OrderRepositoryAdapter;
import com.example.clean.adapters.driven.gateways.PaymentGatewayImpl;
import com.example.clean.adapters.driven.gateways.NotificationGatewayImpl;
import com.example.clean.application.ports.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeansConfiguration {

    /**
     * Adapter を Port インターフェースとして登録
     */
    @Bean
    public IOrderRepository orderRepository(OrderRepositoryAdapter adapter) {
        return adapter;
    }

    @Bean
    public IPaymentProcessor paymentProcessor(PaymentGatewayImpl gateway) {
        return gateway;
    }

    @Bean
    public INotificationService notificationService(NotificationGatewayImpl gateway) {
        return gateway;
    }
}
```

### 環境別設定（profiles）

```java
// config/DevConfiguration.java
package com.example.clean.config;

import com.example.clean.application.ports.IOrderRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class DevConfiguration {

    @Bean
    public IOrderRepository orderRepository() {
        // 開発環境：H2 In-Memory DB を使用
        return new InMemoryOrderRepository();
    }
}

// config/ProdConfiguration.java
@Configuration
@Profile("prod")
public class ProdConfiguration {

    @Bean
    public IOrderRepository orderRepository(OrderRepositoryAdapter adapter) {
        // 本番環境：MySQL リポジトリを使用
        return adapter;
    }
}
```

### application.properties での設定

```properties
# application.properties（開発環境）
spring.profiles.active=dev
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true

# application-prod.properties（本番環境）
spring.profiles.active=prod
spring.datasource.url=jdbc:mysql://localhost:3306/cleanarch
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

---

## 完全な実装例とテスト

### ユニットテスト例（JUnit 5 + Mockito）

```java
// test/java/com/example/clean/application/usecases/CreateOrderUseCaseTest.java
package com.example.clean.application.usecases.orders;

import com.example.clean.application.ports.IOrderRepository;
import com.example.clean.application.ports.IPaymentProcessor;
import com.example.clean.application.ports.INotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class CreateOrderUseCaseTest {

    private CreateOrderUseCase useCase;

    @Mock
    private IOrderRepository mockRepository;

    @Mock
    private IPaymentProcessor mockPayment;

    @Mock
    private INotificationService mockNotification;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        useCase = new CreateOrderUseCase(mockRepository, mockPayment, mockNotification);
    }

    @Test
    void testCreateOrderSuccessfully() {
        // Arrange
        when(mockPayment.processPayment(any(), any())).thenReturn(true);

        var itemRequest = new CreateOrderRequest.OrderItemRequest(
                "PROD001", 2, new BigDecimal("5000"));

        CreateOrderRequest request = new CreateOrderRequest(
                "CUST123",
                List.of(itemRequest)
        );

        // Act
        CreateOrderResponse response = useCase.execute(request);

        // Assert
        assertTrue(response.isSuccess());
        assertNotNull(response.getOrderId());
        assertEquals(new BigDecimal("10000"), response.getTotalAmount());

        // Verify
        verify(mockRepository, times(1)).save(any());
        verify(mockPayment, times(1)).processPayment(any(), any());
        verify(mockNotification, times(1)).notifyOrderCreated(any(), any());
    }

    @Test
    void testCreateOrderWithoutItems() {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest("CUST123", List.of());

        // Act
        CreateOrderResponse response = useCase.execute(request);

        // Assert
        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("must have at least one item"));
    }
}
```

### 統合テスト例

```java
// test/java/com/example/clean/adapters/OrderControllerIntegrationTest.java
package com.example.clean.adapters.driving.http;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateOrderEndpoint() throws Exception {
        // Arrange
        var request = new CreateOrderRequest(
                "CUST123",
                List.of(new CreateOrderRequest.OrderItemRequest("PROD001", 1, new BigDecimal("5000")))
        );

        // Act & Assert
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.orderId").isNotEmpty());
    }
}
```

---

## まとめ

STEP 3C では、クリーンアーキテクチャを **Java/Spring Boot で実装する方法**を学びました。

### 重要な実装ポイント

✓ パッケージ構造で層を分離（物理階層で分割）  
✓ Domain層 は JPA アノテーション含むが、ビジネスロジック重視  
✓ Application層 は Port インターフェース経由で外部と通信  
✓ Adapter層 が Port の実装を提供  
✓ Spring DI コンテナ（@Service, @Component）で自動管理  
✓ Repository パターンで DB アクセスを抽象化  
✓ テストは Mockito でPort実装をモック化  

### Java での推奨設定

| 項目 | 推奨 | 理由 |
|-----|-----|------|
| **Web フレームワーク** | Spring Boot | 標準的、DI 濃厚 |
| **DI コンテナ** | Spring Context | Spring に統合 |
| **ORM** | Spring Data JPA | JPA 標準実装 |
| **ビルド ツール** | Maven/Gradle | 標準的 |
| **テスティング** | JUnit 5 + Mockito | 標準的 |
| **パッケージ分割** | 階層別パッケージ | 物理分離 |

### C#・TypeScript との比較

| 項目 | C# | TypeScript | Java |
|-----|----|-----------|------|
| **プロジェクト分割** | 4 プロジェクト | 4 フォルダ | 4 パッケージ |
| **DI コンテナ** | MS.Extensions.DI | tsyringe | Spring |
| **ORM** | Entity Framework | TypeORM | JPA/Hibernate |
| **型システム** | 静的型付け | 静的型付け | 静的型付け |
| **Web フレームワーク** | ASP.NET Core | Express | Spring Boot |

### 次のステップへ

STEP 3A・3B・3C（3つの言語での実装）を完了しました。
- **STEP 4: 適用判断** ← プロジェクトでどう判断するか
- **STEP 5: 実践応用** ← より複雑な実装例

---

## 参考リソース

### このステップの確認ポイント
- Maven マルチモジュール構成がなぜ良いのか
- JPA エンティティがなぜ ビジネスロジック重視なのか
- Port インターフェースが Repository  に分離できるのはなぜか
- Spring DI コンテナが自動登録と明示的設定のどちらを選ぶべきか
- テスト時に Mockito でモック実装をどう使うか

### 関連するSTEP
- **STEP 1: 理論基盤** ← Java 実装の理論的背景
- **STEP 2: 設計方法論** ← ここで学んだパターンの設計背景
- **STEP 3A: C# 実装** ← 別言語での実装
- **STEP 3B: TypeScript 実装** ← 別言語での実装
- **STEP 4: 適用判断** ← Java/Spring プロジェクトでどう判断するか
- **STEP 5: 実践応用** ← より複雑な実装例

### 外部リソース
- **Spring Boot Documentation**
  https://spring.io/projects/spring-boot
  公式ドキュメント。一番正確。

- **Spring Data JPA**
  https://spring.io/projects/spring-data-jpa
  Repository パターンの実装。

- **Mockito Documentation**
  https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html
  テストモック。

- **Clean Architecture with Spring Boot** by Baeldung
  実装例が豊富です。

---

**[STEP 4 へ進む]** → STEP 4: 適用判断では、プロジェクトでクリーンアーキテクチャを導入すべきか、その判断基準を学びます。
