---
title: 外观 Facade
icon: design
order: 10
category:
  - Java
tag:
  - Java
  - 设计模式
---

# 外观 Facade

> 为子系统中的一组接口提供一个统一的高层接口，使子系统更容易使用。

## 意图

外观模式就像智能家居的中控面板——你不需要分别操作灯光、空调、窗帘、音响，只需按一个"回家模式"按钮，所有设备自动调整到预设状态。在代码中，当你的系统有很多复杂的子系统需要协同工作时，外观模式提供一个简化的接口，隐藏内部复杂性。

:::tip 通俗比喻
想象你去一家高档餐厅吃饭：
- **没有外观**：你需要自己去找服务员点菜、去吧台倒水、去厨房催菜、去找收银台结账——所有子系统你都要亲自打交道
- **有外观**：你只需要告诉服务员"来一份套餐"，服务员帮你搞定一切——他就是"外观"

再比如电脑的电源键——你只需要按一下电源键（外观），电脑就会自动完成 BIOS 初始化、引导系统、加载驱动、启动服务等几十个步骤。
:::

从 GoF 的定义来看，外观模式属于**结构型模式**，它的核心目的是：
- **简化接口**——为复杂子系统提供高层 API
- **解耦客户端和子系统**——客户端不直接依赖子系统
- **分层架构**——各层通过外观交互，不跨层调用

:::warning 外观模式不是封装子系统，而是提供一个便捷的入口。客户端仍然可以直接使用子系统，但简单场景下用外观就够了。外观模式不应该限制对子系统的直接访问。
:::

## 适用场景

- 为复杂的子系统提供简单接口时
- 需要分层架构，让各层通过外观交互时
- 子系统独立演化，但需要对外提供统一入口时
- 需要隐藏子系统的实现细节，降低学习成本时
- 重构遗留系统时，用外观封装旧接口

## UML 类图

```mermaid
classDiagram
    class "Facade" as Facade {
        -SubsystemA subsystemA
        -SubsystemB subsystemB
        -SubsystemC subsystemC
        +operation() void
    }

    class "SubsystemA" as SubsystemA {
        +methodA() void
    }

    class "SubsystemB" as SubsystemB {
        +methodB() void
    }

    class "SubsystemC" as SubsystemC {
        +methodC() void
    }

    class "Client" as Client {
        +main() void
    }

    Facade o-- SubsystemA
    Facade o-- SubsystemB
    Facade o-- SubsystemC
    Client ..> Facade : uses

    note for Facade "提供简化的统一接口\n隐藏子系统复杂性"
```

## 代码示例

### ❌ 没有使用该模式的问题

```java
// 客户端直接和多个子系统打交道——代码复杂，耦合严重
public class Client {
    public static void main(String[] args) {
        // 场景：发送一封欢迎邮件
        // 客户端需要了解所有子系统的 API 和调用顺序

        // 1. 调用模板引擎渲染邮件内容
        TemplateEngine templateEngine = new TemplateEngine();
        Map<String, String> params = new HashMap<>();
        params.put("name", "张三");
        params.put("link", "https://example.com/verify");
        String content = templateEngine.render("welcome_email", params);

        // 2. 验证邮箱格式
        EmailValidator validator = new EmailValidator();
        if (!validator.validate("zhangsan@example.com")) {
            throw new RuntimeException("邮箱格式不正确");
        }

        // 3. 检查邮箱是否已注册
        UserExistenceChecker checker = new UserExistenceChecker();
        if (checker.exists("zhangsan@example.com")) {
            throw new RuntimeException("邮箱已注册");
        }

        // 4. 配置 SMTP 发送器
        EmailSender sender = new EmailSender();
        sender.setSmtpHost("smtp.example.com");
        sender.setPort(587);
        sender.setUsername("noreply@example.com");
        sender.setPassword("password");

        // 5. 发送邮件
        sender.send("zhangsan@example.com", "欢迎加入", content);

        // 6. 记录发送日志
        EmailLogger logger = new EmailLogger();
        logger.log("zhangsan@example.com", "欢迎邮件", "SUCCESS");

        // 7. 触发用户注册事件
        EventPublisher publisher = new EventPublisher();
        publisher.publish("USER_REGISTERED", Map.of("email", "zhangsan@example.com"));

        // 问题：
        // 1. 客户端需要了解 7 个子系统的 API
        // 2. 调用顺序必须正确，否则出 bug
        // 3. 每次发邮件都要写这么多代码
        // 4. 子系统 API 变化，所有调用处都要改
    }
}
```

**运行结果：**

```
渲染模板: welcome_email
验证邮箱: zhangsan@example.com ✓
检查邮箱是否存在: zhangsan@example.com
发送邮件给: zhangsan@example.com, 主题: 欢迎加入
记录日志: SUCCESS
发布事件: USER_REGISTERED
```

:::danger 问题总结
1. **客户端过于复杂**：需要了解所有子系统的 API 和调用顺序
2. **高耦合**：客户端和多个子系统直接依赖
3. **代码重复**：每次使用都要编排相同的调用顺序
4. **脆弱性**：子系统 API 变化会导致所有调用处修改
5. **不可测试**：复杂的调用链难以单元测试
:::

### ✅ 使用该模式后的改进

```java
// ===== 子系统类：各自独立，不知道外观的存在 =====

// 子系统1：模板引擎
public class TemplateEngine {
    public String render(String templateName, Map<String, String> params) {
        System.out.println("[模板] 渲染模板: " + templateName);
        return "亲爱的 " + params.get("name") + "，欢迎加入！请点击链接激活账号。";
    }
}

// 子系统2：邮箱验证器
public class EmailValidator {
    public boolean validate(String email) {
        boolean valid = email != null && email.contains("@") && email.contains(".");
        System.out.println("[验证] 邮箱格式 " + (valid ? "有效" : "无效") + ": " + email);
        return valid;
    }
}

// 子系统3：用户存在检查器
public class UserExistenceChecker {
    public boolean exists(String email) {
        System.out.println("[检查] 查询邮箱是否已注册: " + email);
        return false; // 模拟：邮箱不存在
    }
}

// 子系统4：邮件发送器
public class EmailSender {
    public void send(String to, String subject, String content) {
        System.out.println("[发送] 邮件发送成功 -> " + to + ", 主题: " + subject);
    }
}

// 子系统5：日志记录器
public class EmailLogger {
    public void log(String to, String subject, String status) {
        System.out.println("[日志] " + status + " | " + to + " | " + subject);
    }
}

// 子系统6：事件发布器
public class EventPublisher {
    public void publish(String eventName, Map<String, String> data) {
        System.out.println("[事件] 发布事件: " + eventName + ", 数据: " + data);
    }
}

// ===== 外观类：封装所有子系统的协调逻辑 =====
public class EmailServiceFacade {
    // 组合所有子系统——外观持有子系统的引用
    private final TemplateEngine templateEngine = new TemplateEngine();
    private final EmailValidator validator = new EmailValidator();
    private final UserExistenceChecker existenceChecker = new UserExistenceChecker();
    private final EmailSender sender = new EmailSender();
    private final EmailLogger logger = new EmailLogger();
    private final EventPublisher eventPublisher = new EventPublisher();

    /**
     * 发送欢迎邮件——外观提供的简化接口
     * 客户端只需要调用这一个方法，不需要了解内部子系统的调用顺序
     */
    public void sendWelcomeEmail(String email, String name) {
        System.out.println("===== 发送欢迎邮件开始 =====");

        // 步骤1：验证邮箱格式
        if (!validator.validate(email)) {
            throw new IllegalArgumentException("邮箱格式不正确: " + email);
        }

        // 步骤2：检查邮箱是否已注册
        if (existenceChecker.exists(email)) {
            throw new IllegalArgumentException("邮箱已注册: " + email);
        }

        // 步骤3：渲染邮件模板
        Map<String, String> params = Map.of("name", name);
        String content = templateEngine.render("welcome_email", params);

        // 步骤4：发送邮件
        sender.send(email, "欢迎加入", content);

        // 步骤5：记录日志
        logger.log(email, "欢迎邮件", "SUCCESS");

        // 步骤6：发布事件
        eventPublisher.publish("USER_REGISTERED", Map.of("email", email));

        System.out.println("===== 发送欢迎邮件完成 =====\n");
    }

    /**
     * 发送密码重置邮件——另一个简化接口
     */
    public void sendPasswordResetEmail(String email) {
        if (!validator.validate(email)) {
            throw new IllegalArgumentException("邮箱格式不正确: " + email);
        }

        String content = templateEngine.render("reset_password", Map.of("email", email));
        sender.send(email, "密码重置", content);
        logger.log(email, "密码重置邮件", "SUCCESS");
    }
}

// ===== 客户端代码：极简 =====
public class FacadeDemo {
    public static void main(String[] args) {
        EmailServiceFacade emailService = new EmailServiceFacade();

        // 发送欢迎邮件——只需要一行代码
        emailService.sendWelcomeEmail("zhangsan@example.com", "张三");

        // 发送密码重置邮件
        emailService.sendPasswordResetEmail("lisi@example.com");

        // 客户端完全不知道背后有 6 个子系统在工作
    }
}
```

**运行结果：**

```
===== 发送欢迎邮件开始 =====
[验证] 邮箱格式 有效: zhangsan@example.com
[检查] 查询邮箱是否已注册: zhangsan@example.com
[模板] 渲染模板: welcome_email
[发送] 邮件发送成功 -> zhangsan@example.com, 主题: 欢迎加入
[日志] SUCCESS | zhangsan@example.com | 欢迎邮件
[事件] 发布事件: USER_REGISTERED, 数据: {email=zhangsan@example.com}
===== 发送欢迎邮件完成 =====

[验证] 邮箱格式 有效: lisi@example.com
[模板] 渲染模板: reset_password
[发送] 邮件发送成功 -> lisi@example.com, 主题: 密码重置
[日志] SUCCESS | lisi@example.com | 密码重置邮件
```

### 变体与扩展

**1. 有状态的外观**

外观类可以维护自己的状态，提供更高级的功能：

```java
// 有状态的外观：维护会话信息
public class OrderFacade {
    private final CartService cartService = new CartService();
    private final PaymentService paymentService = new PaymentService();
    private final ShippingService shippingService = new ShippingService();
    private final NotificationService notificationService = new NotificationService();

    // 封装整个下单流程
    public OrderResult placeOrder(String userId, String address, String paymentType) {
        // 1. 获取购物车
        Cart cart = cartService.getCart(userId);

        // 2. 计算总价
        double total = cart.calculateTotal();

        // 3. 支付
        paymentService.pay(paymentType, total);

        // 4. 创建订单
        Order order = Order.create(userId, cart, address, total);

        // 5. 发货
        shippingService.createShipment(order, address);

        // 6. 清空购物车
        cartService.clearCart(userId);

        // 7. 发送通知
        notificationService.notifyOrderCreated(order);

        return new OrderResult(order, "下单成功");
    }
}
```

**2. 多个外观**

一个子系统可以有多个外观，每个外观服务不同的使用场景：

```java
// 面向普通用户的简单外观
public class SimpleVideoFacade {
    public void play(String videoId) { /* 简单播放 */ }
    public void pause() { /* 暂停 */ }
    public void stop() { /* 停止 */ }
}

// 面向管理员的复杂外观
public class AdminVideoFacade {
    public void upload(String filePath, Metadata metadata) { /* 上传+转码+生成封面 */ }
    public void analyzeAnalytics(String videoId) { /* 查看详细分析数据 */ }
    public void moderate(String videoId, ModerationResult result) { /* 内容审核 */ }
}
```

### 运行结果

完整的 FacadeDemo 运行输出已在上方展示。注意客户端只需要一行代码 `emailService.sendWelcomeEmail(...)` 就完成了 6 个子系统的协同工作。

## Spring/JDK 中的应用

### Spring 框架中的外观模式

**1. JdbcTemplate——JDBC 的外观**

Spring 的 `JdbcTemplate` 是外观模式的教科书级实现，隐藏了 JDBC 的所有繁琐操作：

```java
// 没有 JdbcTemplate 时，直接使用 JDBC 非常繁琐
public User findUserWithoutTemplate(Long id) throws SQLException {
    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;
    try {
        conn = dataSource.getConnection();
        ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
        ps.setLong(1, id);
        rs = ps.executeQuery();
        if (rs.next()) {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setName(rs.getString("name"));
            user.setEmail(rs.getString("email"));
            return user;
        }
        return null;
    } finally {
        // 手动关闭资源——容易忘记，也容易出错
        if (rs != null) rs.close();
        if (ps != null) ps.close();
        if (conn != null) conn.close();
    }
}

// 有了 JdbcTemplate——一行搞定
@Repository
public class UserRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public User findById(Long id) {
        return jdbcTemplate.queryForObject(
            "SELECT * FROM users WHERE id = ?",
            new Object[]{id},
            new BeanPropertyRowMapper<>(User.class)
        );
    }

    public List<User> findAll() {
        return jdbcTemplate.query(
            "SELECT * FROM users",
            new BeanPropertyRowMapper<>(User.class)
        );
    }
}
```

**2. RestTemplate——HTTP 客户端的外观**

```java
// RestTemplate 封装了 HTTP 连接、序列化、异常处理等复杂逻辑
@Service
public class UserService {
    @Autowired
    private RestTemplate restTemplate;

    public User getUser(Long id) {
        // 一行代码完成 HTTP 请求 + JSON 反序列化 + 异常处理
        return restTemplate.getForObject(
            "https://api.example.com/users/{id}",
            User.class,
            id
        );
    }

    public User createUser(User user) {
        return restTemplate.postForObject(
            "https://api.example.com/users",
            user,
            User.class
        );
    }
}
```

:::tip Spring 中类似的外观还有：`RedisTemplate`（Redis 操作）、`JmsTemplate`（JMS 消息）、`MongoTemplate`（MongoDB 操作）、`KafkaTemplate`（Kafka 消息）等。它们都遵循相同的设计思想——用一个统一的 Template 类封装底层操作的复杂性。
:::

### JDK 中的外观模式

**1. java.util.Logger**

```java
// java.util.logging.Logger 是日志子系统的外观
// 底层有 Handler、Formatter、Filter、Level 等复杂子系统
// 但客户端只需要：
Logger logger = Logger.getLogger("com.example");
logger.info("这是一条日志信息");

// Logger 内部帮你处理了：
// - 日志级别的过滤
// - Handler 的选择（ConsoleHandler、FileHandler 等）
// - 格式化（SimpleFormatter、XMLFormatter）
// - 资源管理
```

**2. Executors 工厂类**

```java
// Executors 是线程池子系统的外观
// 底层有 ThreadPoolExecutor、ScheduledThreadPoolExecutor 等复杂实现
// 但客户端只需要：
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> System.out.println("任务执行"));

// Executors 封装了线程池的创建和配置
// 客户端不需要了解 corePoolSize、maxPoolSize、keepAliveTime 等参数
```

## 优缺点

### 优点

| 优点 | 详细说明 |
|------|----------|
| 简化客户端代码 | 客户端不需要了解子系统的内部细节 |
| 降低耦合 | 客户端只依赖外观，不直接依赖子系统 |
| 分层架构 | 各层通过外观交互，不跨层调用 |
| 子系统独立演化 | 子系统可以独立修改，不影响客户端 |
| 更好的组织 | 将复杂的工作流编排集中在 appearance 中 |

### 缺点

| 缺点 | 详细说明 | 应对方案 |
|------|----------|----------|
| 不符合开闭原则 | 新增子系统可能需要修改外观 | 为不同场景提供多个外观 |
| 可能成为上帝对象 | 外观承担过多职责 | 按职责拆分为多个小外观 |
| 隐藏灵活性 | 特殊场景可能绕不过外观 | 保留子系统的直接访问 |
| 增加抽象层 | 简单场景可能过度设计 | 只在子系统确实复杂时使用 |

## 面试追问

### Q1: 外观模式和中介者模式的区别？

| 维度 | 外观模式 | 中介者模式 |
|------|----------|------------|
| **目的** | 简化接口 | 解耦通信 |
| **方向** | 单向：客户端 → 子系统 | 双向：子系统 ↔ 子系统 |
| **参与方** | 客户端不需要了解子系统 | 子系统之间互相不了解 |
| **通信** | 外观不参与子系统之间的通信 | 中介者协调子系统之间的交互 |
| **典型场景** | API Gateway、JdbcTemplate | 聊天室、航空管制 |

:::tip 一句话总结：外观模式是"简化使用"——客户端不需要知道子系统怎么工作。中介者模式是"解耦通信"——子系统之间不需要知道对方的存在。
:::

### Q2: 外观模式和代理模式的区别？

| 维度 | 外观模式 | 代理模式 |
|------|----------|----------|
| **目的** | 简化使用 | 控制访问 |
| **对象数量** | 包装多个子系统 | 包装单个对象 |
| **接口** | 提供新的简化接口 | 实现与被代理对象相同的接口 |
| **客户端感知** | 客户端知道在使用外观 | 客户端以为在直接使用原始对象 |
| **典型场景** | Facade 包装一组类 | Proxy 包装一个类 |

### Q3: 外观模式在微服务架构中有什么应用？

**API Gateway 就是最典型的高级外观**：

```java
// 微服务架构中，客户端不需要分别调用各个微服务
// 统一通过 API Gateway 访问

// 没有 Gateway：客户端需要知道每个服务的地址
// POST https://user-service/api/users          创建用户
// POST https://order-service/api/orders        创建订单
// POST https://payment-service/api/payments    发起支付
// POST https://notification-service/api/notify 发送通知

// 有 Gateway：客户端只调用一个入口
// POST https://api-gateway/api/orders
// Gateway 内部协调调用用户服务、订单服务、支付服务、通知服务

// Spring Cloud Gateway 配置示例
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - name: AuthFilter        # 鉴权
            - name: RateLimitFilter   # 限流
            - name: LoggingFilter     # 日志
```

Gateway 作为外观，为客户端提供了统一的入口，隐藏了后端微服务的复杂性，同时集中处理了鉴权、限流、日志等横切关注点。

### Q4: 外观模式是否违反开闭原则？如何缓解？

严格来说，外观模式确实可能违反开闭原则——当子系统新增功能时，可能需要修改外观类。但有几种缓解方式：

**1. 提供多个外观**
```java
// 为不同的使用场景提供不同的外观
public class SimpleEmailFacade {
    // 只提供最基本的发送功能
    public void send(String to, String subject, String content) { ... }
}

public class AdvancedEmailFacade {
    // 提供模板、验证、日志等完整功能
    public void sendWelcomeEmail(String email, String name) { ... }
    public void sendPasswordResetEmail(String email) { ... }
}
```

**2. 保留子系统的直接访问**
```java
public class EmailServiceFacade {
    // 提供简化接口
    public void sendWelcomeEmail(String email, String name) { ... }

    // 同时暴露子系统，供高级用户使用
    public EmailSender getSender() {
        return sender;
    }

    public TemplateEngine getTemplateEngine() {
        return templateEngine;
    }
}
```

**3. 使用策略或插件机制**
```java
public class EmailServiceFacade {
    private final List<EmailPostProcessor> processors = new ArrayList<>();

    // 通过注册后处理器来扩展功能，而不是修改外观
    public void registerProcessor(EmailPostProcessor processor) {
        processors.add(processor);
    }

    public void sendEmail(String to, String subject, String content) {
        // ... 基本发送逻辑
        for (EmailPostProcessor processor : processors) {
            content = processor.process(content);
        }
    }
}
```

## 相关模式

- **中介者模式**：外观简化子系统接口，中介者协调子系统通信
- **代理模式**：外观简化接口，代理控制访问
- **适配器模式**：外观提供简化接口，适配器转换不兼容接口
- **抽象工厂模式**：外观可以结合抽象工厂，根据配置选择不同子系统
- **装饰器模式**：外观简化调用，装饰器增强功能
