---
title: 策略 Strategy
icon: design
order: 13
category:
  - Java
tag:
  - Java
  - 设计模式
---

# 策略 Strategy

> 定义一系列算法，将每一个算法封装起来，并使它们可以互换。

## 意图

策略模式将不同的算法（策略）封装成独立的类，让它们实现相同的接口。上下文持有策略的引用，运行时可以动态切换不同的策略。这样就消除了大量的 if-else 分支，使算法可以独立于使用它的客户端变化。

:::tip 通俗比喻
就像出行策略——你可以选择开车、坐地铁、骑车、步行，它们都能到达目的地，只是方式不同。策略模式让你可以随时切换出行方式，而不需要把"选择交通方式"的逻辑写死在行程计划里。

再比如你去餐厅点菜，同一道菜可以有"微辣"、"中辣"、"特辣"三种口味策略。厨师（上下文）根据你选的策略来炒菜，你不需要知道每种辣度具体怎么实现的。
:::

从 GoF 的定义来看，策略模式属于**行为型模式**，它的核心目的是：
- **分离算法的选择和实现**——选择哪个算法和使用哪个算法解耦
- **支持开闭原则**——新增算法不需要修改已有代码
- **消除条件语句**——用多态替代 if-else / switch

## 适用场景

- 一个系统有多种算法/规则，需要在运行时动态切换时
- 需要避免多重条件判断（if-else / switch）时
- 算法需要独立变化，不影响使用算法的客户端时
- 多个类只有行为差异时
- 算法有多个版本，需要灵活切换时（比如排序算法：快排、归并、堆排序）

:::warning 实际开发中，策略模式最常出现的场景是"支付方式选择"、"折扣计算规则"、"日志输出格式"、"数据压缩算法"等需要根据配置或运行条件切换算法的地方。
:::

## UML 类图

```mermaid
classDiagram
    class "Strategy" as Strategy {
        <<interface>>
        +execute(Object data) void
    }

    class "ConcreteStrategyA" as ConcreteStrategyA {
        +execute(Object data) void
    }

    class "ConcreteStrategyB" as ConcreteStrategyB {
        +execute(Object data) void
    }

    class "ConcreteStrategyC" as ConcreteStrategyC {
        +execute(Object data) void
    }

    class "Context" as Context {
        -Strategy strategy
        +setStrategy(Strategy strategy) void
        +doWork(Object data) void
    }

    class "Client" as Client {
        +main() void
    }

    Strategy <|.. ConcreteStrategyA
    Strategy <|.. ConcreteStrategyB
    Strategy <|.. ConcreteStrategyC
    Context o-- Strategy : has
    Client ..> Context : uses
```

## 代码示例

### ❌ 没有使用该模式的问题

先看一个电商系统里支付方式的经典反面教材：

```java
// 大量 if-else，每增加一种支付方式都要修改这个方法
// 违反开闭原则，也违反单一职责原则
public class PaymentService {

    public void pay(String paymentType, double amount) {
        if (paymentType.equals("alipay")) {
            // 支付宝特有逻辑：需要调用支付宝 SDK
            System.out.println("调用支付宝 SDK...");
            System.out.println("支付宝支付: " + amount + " 元");
            // 还可能有风控检查、积分抵扣、优惠券等逻辑
            // 每种支付方式的风控逻辑还不一样...
        } else if (paymentType.equals("wechat")) {
            // 微信支付特有逻辑
            System.out.println("调用微信支付 SDK...");
            System.out.println("微信支付: " + amount + " 元");
        } else if (paymentType.equals("credit_card")) {
            // 信用卡特有逻辑
            System.out.println("调用银联 SDK...");
            System.out.println("信用卡支付: " + amount + " 元");
        } else if (paymentType.equals("bank_transfer")) {
            System.out.println("银行转账: " + amount + " 元");
        }
        // 新增支付方式？继续加 else if？
        // 这个方法会越来越长，越来越难维护
    }

    // 更糟糕的是，退款逻辑也要写一遍类似的 if-else
    public void refund(String paymentType, double amount) {
        if (paymentType.equals("alipay")) {
            System.out.println("支付宝退款: " + amount + " 元");
        } else if (paymentType.equals("wechat")) {
            System.out.println("微信退款: " + amount + " 元");
        }
        // ... 又是一堆 if-else
    }
}
```

**运行结果：**

```
调用支付宝 SDK...
支付宝支付: 100.0 元
```

:::danger 问题总结
1. **违反开闭原则**：新增支付方式必须修改 `PaymentService`
2. **违反单一职责原则**：`PaymentService` 承担了所有支付方式的逻辑
3. **代码重复**：退款、查询等方法中又要写一遍 if-else
4. **测试困难**：测试某种支付方式要把整个类加载进来
5. **可读性差**：方法越来越长，逻辑越来越复杂
:::

### ✅ 使用该模式后的改进

```java
// ===== 策略接口：定义所有支付策略的统一契约 =====
public interface PaymentStrategy {
    // 支付方法
    void pay(double amount);
    // 退款方法——不同支付方式的退款逻辑也不同
    void refund(double amount);
}

// ===== 具体策略：支付宝 =====
public class AlipayStrategy implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        // 支付宝特有逻辑：调用支付宝 SDK、风控检查等
        System.out.println("[支付宝] 风控检查通过");
        System.out.println("[支付宝] 调用支付宝 SDK 创建交易...");
        System.out.println("[支付宝] 支付成功: " + amount + " 元");
    }

    @Override
    public void refund(double amount) {
        // 支付宝退款逻辑
        System.out.println("[支付宝] 发起退款请求...");
        System.out.println("[支付宝] 退款成功: " + amount + " 元");
    }
}

// ===== 具体策略：微信支付 =====
public class WeChatPayStrategy implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        // 微信支付特有逻辑
        System.out.println("[微信] 调用微信支付统一下单接口...");
        System.out.println("[微信] 支付成功: " + amount + " 元");
    }

    @Override
    public void refund(double amount) {
        System.out.println("[微信] 发起退款...");
        System.out.println("[微信] 退款成功: " + amount + " 元");
    }
}

// ===== 具体策略：信用卡 =====
public class CreditCardStrategy implements PaymentStrategy {
    private final String cardNumber;

    // 信用卡需要卡号等信息，通过构造函数注入
    public CreditCardStrategy(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    @Override
    public void pay(double amount) {
        // 信用卡特有逻辑：验证卡号、调用银联接口等
        System.out.println("[信用卡] 验证卡号: ****" + cardNumber.substring(cardNumber.length() - 4));
        System.out.println("[信用卡] 调用银联支付接口...");
        System.out.println("[信用卡] 支付成功: " + amount + " 元");
    }

    @Override
    public void refund(double amount) {
        System.out.println("[信用卡] 发起退款...");
        System.out.println("[信用卡] 退款成功: " + amount + " 元");
    }
}

// ===== 上下文：持有策略引用，委托执行 =====
public class PaymentContext {
    private PaymentStrategy strategy;

    // 通过构造函数注入策略
    public PaymentContext(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    // 运行时切换策略
    public void setStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    // 委托给策略执行支付
    public void checkout(double amount) {
        strategy.pay(amount);
    }

    // 委托给策略执行退款
    public void refundCheckout(double amount) {
        strategy.refund(amount);
    }
}

// ===== 使用示例 =====
public class StrategyDemo {
    public static void main(String[] args) {
        PaymentContext context = new PaymentContext(new AlipayStrategy());

        // 使用支付宝支付
        context.checkout(100.0);
        System.out.println("---");

        // 切换到微信支付
        context.setStrategy(new WeChatPayStrategy());
        context.checkout(200.0);
        System.out.println("---");

        // 切换到信用卡支付
        context.setStrategy(new CreditCardStrategy("6222021234567890"));
        context.checkout(500.0);
        System.out.println("---");

        // 退款——复用同一个策略
        context.refundCheckout(500.0);
    }
}
```

**运行结果：**

```
[支付宝] 风控检查通过
[支付宝] 调用支付宝 SDK 创建交易...
[支付宝] 支付成功: 100.0 元
---
[微信] 调用微信支付统一下单接口...
[微信] 支付成功: 200.0 元
---
[信用卡] 验证卡号: ****7890
[信用卡] 调用银联支付接口...
[信用卡] 支付成功: 500.0 元
---
[信用卡] 发起退款...
[信用卡] 退款成功: 500.0 元
```

### 变体与扩展

**1. 策略 + 工厂模式**

实际开发中，策略通常配合工厂来创建，避免客户端直接 new 策略对象：

```java
// 策略工厂：根据类型创建对应的策略
public class PaymentStrategyFactory {
    private static final Map<String, PaymentStrategy> STRATEGY_MAP = new HashMap<>();

    static {
        // 注册所有策略——也可以通过 Spring 自动注入
        STRATEGY_MAP.put("alipay", new AlipayStrategy());
        STRATEGY_MAP.put("wechat", new WeChatPayStrategy());
    }

    public static PaymentStrategy getStrategy(String type) {
        PaymentStrategy strategy = STRATEGY_MAP.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("不支持的支付方式: " + type);
        }
        return strategy;
    }
}

// 使用：客户端不需要知道具体策略类
PaymentStrategy strategy = PaymentStrategyFactory.getStrategy("alipay");
```

**2. 策略枚举**

当策略比较简单时，可以用枚举来实现，减少类的数量：

```java
public enum CompressionStrategy {
    GZIP {
        @Override
        public byte[] compress(byte[] data) {
            System.out.println("使用 GZIP 压缩");
            return data; // 简化演示
        }
    },
    ZIP {
        @Override
        public byte[] compress(byte[] data) {
            System.out.println("使用 ZIP 压缩");
            return data;
        }
    },
    LZ4 {
        @Override
        public byte[] compress(byte[] data) {
            System.out.println("使用 LZ4 压缩");
            return data;
        }
    };

    public abstract byte[] compress(byte[] data);
}
```

**3. 函数式策略（Java 8+）**

如果策略只是一个简单的行为，用 Lambda 表达式更简洁：

```java
// 用函数式接口替代策略接口
public class PriceCalculator {
    private final Function<Double, Double> pricingStrategy;

    public PriceCalculator(Function<Double, Double> pricingStrategy) {
        this.pricingStrategy = pricingStrategy;
    }

    public double calculate(double basePrice) {
        return pricingStrategy.apply(basePrice);
    }

    public static void main(String[] args) {
        // VIP 打八折
        PriceCalculator vipCalculator = new PriceCalculator(price -> price * 0.8);
        System.out.println("VIP 价格: " + vipCalculator.calculate(100.0));

        // 新用户打九折
        PriceCalculator newCalculator = new PriceCalculator(price -> price * 0.9);
        System.out.println("新用户价格: " + newCalculator.calculate(100.0));

        // 满减：满 200 减 50
        PriceCalculator fullReduction = new PriceCalculator(price ->
            price >= 200 ? price - 50 : price);
        System.out.println("满减价格: " + fullReduction.calculate(250.0));
    }
}
```

**运行结果：**

```
VIP 价格: 80.0
新用户价格: 90.0
满减价格: 200.0
```

### 运行结果

完整的 StrategyDemo 运行输出：

```
[支付宝] 风控检查通过
[支付宝] 调用支付宝 SDK 创建交易...
[支付宝] 支付成功: 100.0 元
---
[微信] 调用微信支付统一下单接口...
[微信] 支付成功: 200.0 元
---
[信用卡] 验证卡号: ****7890
[信用卡] 调用银联支付接口...
[信用卡] 支付成功: 500.0 元
---
[信用卡] 发起退款...
[信用卡] 退款成功: 500.0 元
```

## Spring/JDK 中的应用

### Spring 框架中的策略模式

**1. Resource 资源加载策略**

Spring 的 `Resource` 接口就是策略模式的体现，不同来源的资源是不同的策略实现：

```java
// Resource 是策略接口
public interface Resource extends InputStreamSource {
    InputStream getInputStream() throws IOException;
    boolean exists();
    URL getURL() throws IOException;
}

// 不同来源的资源 = 不同策略
Resource classPathRes = new ClassPathResource("application.yml");   // 从 classpath 加载
Resource fileRes = new FileSystemResource("/etc/config.properties"); // 从文件系统加载
Resource urlRes = new UrlResource("https://example.com/config");    // 从 URL 加载

// ResourceLoader 根据路径前缀自动选择策略
@Autowired
private ResourceLoader resourceLoader;

// 以 "classpath:" 开头用 ClassPathResource
// 以 "file:" 开头用 FileSystemResource
// 否则用默认策略
Resource resource = resourceLoader.getResource("classpath:config.properties");
```

**2. Spring Security 的加密策略**

```java
// PasswordEncoder 是策略接口
public interface PasswordEncoder {
    String encode(CharSequence rawPassword);
    boolean matches(CharSequence rawPassword, String encodedPassword);
}

// 不同加密算法 = 不同策略
@Bean
public PasswordEncoder passwordEncoder() {
    // 切换加密策略只需要改这一行
    return new BCryptPasswordEncoder();      // BCrypt 策略
    // return new SCryptPasswordEncoder();   // SCrypt 策略
    // return new Pbkdf2PasswordEncoder();   // PBKDF2 策略
    // return new Argon2PasswordEncoder();   // Argon2 策略
}
```

**3. Spring 的 TaskExecutor 执行策略**

```java
// TaskExecutor 是策略接口
public interface TaskExecutor {
    void execute(Runnable task);
}

// 同步执行策略
TaskExecutor syncExecutor = new SyncTaskExecutor();

// 异步执行策略
TaskExecutor asyncExecutor = new SimpleAsyncTaskExecutor();

// 线程池执行策略
ThreadPoolTaskExecutor poolExecutor = new ThreadPoolTaskExecutor();
poolExecutor.setCorePoolSize(10);
poolExecutor.initialize();
```

### JDK 中的策略模式

**1. Comparator 排序策略**

```java
// Comparator 就是策略接口，不同的比较方式就是不同的策略
List<String> names = Arrays.asList("Charlie", "Alice", "Bob");

// 策略1：自然排序
names.sort(Comparator.naturalOrder());
// [Alice, Bob, Charlie]

// 策略2：按字符串长度排序
names.sort(Comparator.comparingInt(String::length));
// [Bob, Alice, Charlie]

// 策略3：逆序排序
names.sort(Comparator.reverseOrder());
// [Charlie, Bob, Alice]

// 策略4：自定义复杂排序
names.sort(Comparator.comparingInt(String::length)
                      .thenComparing(Comparator.naturalOrder()));
```

:::tip `Arrays.sort()` 和 `Collections.sort()` 的第二个参数就是策略模式的体现。JDK 提供了默认排序策略（自然排序），同时允许传入自定义的比较策略。
:::

**2. ThreadPoolExecutor 拒绝策略**

```java
// RejectedExecutionHandler 是拒绝策略接口
// JDK 提供了 4 种内置拒绝策略
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    2, 4, 60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(10),
    new ThreadPoolExecutor.AbortPolicy()        // 策略1：直接抛 RejectedExecutionException
    // new ThreadPoolExecutor.CallerRunsPolicy() // 策略2：由提交任务的线程执行
    // new ThreadPoolExecutor.DiscardPolicy()    // 策略3：静默丢弃
    // new ThreadPoolExecutor.DiscardOldestPolicy() // 策略4：丢弃队列最老的任务
);
```

## 优缺点

### 优点

| 优点 | 详细说明 |
|------|----------|
| 消除大量 if-else | 用多态替代条件分支，代码更清晰易读 |
| 策略可以自由切换 | 运行时动态切换算法，灵活性强 |
| 符合开闭原则 | 新增策略只需新增类，无需修改已有代码 |
| 算法可以独立测试 | 每个策略类独立，单元测试更简单 |
| 避免多重条件判断 | 复杂的条件分支被拆分为独立的策略类 |
| 提高代码复用性 | 相同的策略可以在不同上下文中复用 |

### 缺点

| 缺点 | 详细说明 | 应对方案 |
|------|----------|----------|
| 客户端必须了解策略差异 | 需要知道不同策略的区别才能选择 | 结合工厂模式或配置文件 |
| 策略类数量增多 | 增加系统类的数量 | 简单策略用枚举或 Lambda |
| 策略之间没有通信 | 需要客户端协调 | 通过上下文传递共享数据 |
| 客户端管理选择逻辑 | 策略选择逻辑可能转移到客户端 | 使用工厂或 Spring 自动注入 |

## 面试追问

### Q1: 策略模式和状态模式的区别？

这个是高频题，两者结构完全相同但意图不同：

| 维度 | 策略模式 | 状态模式 |
|------|----------|----------|
| **切换方** | 客户端主动选择和切换 | 对象内部根据状态自动切换 |
| **策略/状态关系** | 平等的替换关系 | 有流转关系的（A→B→C） |
| **关注点** | "做什么"（算法选择） | "在什么状态下做什么"（状态流转） |
| **客户端感知** | 客户端知道用了什么策略 | 客户端不需要知道当前状态 |
| **典型场景** | 支付方式、排序算法 | 订单状态、自动售货机 |

一句话总结：**策略模式是"你选什么我做什么"，状态模式是"我到了什么状态就做什么"。**

### Q2: 策略模式和简单工厂的结合使用？

实际开发中几乎都是这么用的。工厂负责创建策略，客户端不需要关心策略的具体类：

```java
// 工厂根据配置创建策略
public class PaymentStrategyFactory {
    // Spring 环境下可以自动注入所有策略实现
    private final Map<String, PaymentStrategy> strategyMap;

    public PaymentStrategyFactory(List<PaymentStrategy> strategies) {
        // 假设策略类上有 @Qualifier 注解标识类型
        this.strategyMap = strategies.stream()
            .collect(Collectors.toMap(
                s -> s.getClass().getSimpleName().replace("Strategy", "").toLowerCase(),
                Function.identity()
            ));
    }

    public PaymentStrategy getStrategy(String type) {
        PaymentStrategy strategy = strategyMap.get(type.toLowerCase());
        if (strategy == null) {
            throw new IllegalArgumentException("不支持的支付方式: " + type);
        }
        return strategy;
    }
}
```

在 Spring 环境下更优雅的写法是直接注入 `Map<String, PaymentStrategy>`：

```java
@Service
public class PaymentService {
    // Spring 自动将所有 PaymentStrategy Bean 注入 Map
    // key 是 Bean 的名字，value 是 Bean 实例
    private final Map<String, PaymentStrategy> strategyMap;

    public PaymentService(Map<String, PaymentStrategy> strategyMap) {
        this.strategyMap = strategyMap;
    }

    public void pay(String type, double amount) {
        PaymentStrategy strategy = strategyMap.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("不支持的支付方式: " + type);
        }
        strategy.pay(amount);
    }
}
```

### Q3: 如何用 Spring 来管理策略模式？

三种常见方式：

**方式1：Map 注入（推荐）**
```java
@Service
public class DiscountService {
    // Spring 自动注入所有 DiscountStrategy 的 Bean
    // key = bean name, value = bean instance
    @Autowired
    private Map<String, DiscountStrategy> discountStrategies;

    public double calculate(String userType, double price) {
        DiscountStrategy strategy = discountStrategies.get(userType + "Discount");
        return strategy.calculate(price);
    }
}
```

**方式2：List 注入 + 自定义注解**
```java
// 自定义注解标识策略类型
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface DiscountType {
    String value();
}

@DiscountType("VIP")
@Component
public class VipDiscountStrategy implements DiscountStrategy { ... }

// 使用时过滤
@Service
public class DiscountService {
    @Autowired
    private List<DiscountStrategy> strategies;

    public double calculate(String type, double price) {
        return strategies.stream()
            .filter(s -> s.getClass().getAnnotation(DiscountType.class).value().equals(type))
            .findFirst()
            .orElseThrow()
            .calculate(price);
    }
}
```

**方式3：ApplicationContext.getBean()**
```java
@Service
public class PaymentService implements ApplicationContextAware {
    private ApplicationContext context;

    @Override
    public void setApplicationContext(ApplicationContext ctx) {
        this.context = ctx;
    }

    public void pay(String strategyBeanName, double amount) {
        PaymentStrategy strategy = context.getBean(strategyBeanName, PaymentStrategy.class);
        strategy.pay(amount);
    }
}
```

### Q4: 策略模式会不会导致性能问题？

通常不会。策略模式的主要开销在于策略对象的创建和虚方法调用，这两者在现代 JVM 上都极其廉价。如果确实需要优化：

- **策略对象复用**：将策略设为单例（Spring Bean 默认就是单例），避免重复创建
- **避免频繁切换**：如果策略切换非常频繁（每秒百万次），可以考虑缓存策略引用
- **JIT 内联**：JVM 的 JIT 编译器会内联热点方法调用，虚方法调用的开销可以忽略

:::tip 实际开发中，过早优化是万恶之源。策略模式带来的可维护性收益远大于那几纳秒的性能开销。除非在极端性能敏感的场景（高频交易、游戏引擎），否则不需要为此担心。
:::

## 相关模式

- **状态模式**：结构相同，状态自动切换，策略手动切换
- **工厂方法模式**：工厂创建策略对象，隐藏创建细节
- **装饰器模式**：装饰器增强功能，策略替换算法
- **模板方法模式**：模板方法用继承定义流程，策略模式用组合替换算法
- **简单工厂模式**：通常与策略模式配合使用，负责创建策略对象
