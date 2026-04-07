---
title: 模板方法 Template Method
icon: design
order: 15
category:
  - Java
tag:
  - Java
  - 设计模式
---

# 模板方法 Template Method

> 在父类中定义算法骨架，将某些步骤延迟到子类中实现。

## 意图

模板方法模式（Template Method Pattern）在父类中定义一个算法的骨架（即模板方法），其中某些步骤是抽象的，由子类实现。子类可以重写特定步骤，但不能改变算法的整体结构。

:::tip 通俗理解

就像做菜的食谱——"洗菜 → 切菜 → 炒菜 → 装盘"的步骤是固定的，但每道菜具体洗什么菜、怎么炒是不同的。大厨（父类）规定了做菜流程，徒弟（子类）负责每一步的具体实现。模板方法确保了流程的统一性，又保留了步骤的灵活性。

另一个比喻：银行办理业务的流程——"取号 → 排队 → 叫号 → 办理 → 离开"，无论你办理存款、取款还是转账，这个流程都不变，只是"办理"这一步的具体操作不同。

:::

模板方法属于**行为型模式**，它利用了面向对象的**多态**特性，是**代码复用**的经典方案之一。在框架设计中，模板方法是最常用的设计模式之一——Spring、MyBatis、JUnit 等框架的核心流程几乎都用到了它。

## 适用场景

- **多个类有相同的算法骨架，但某些步骤实现不同时**：比如多种数据解析器、多种报表生成器，流程一样但细节不同
- **需要控制子类扩展，只允许修改特定步骤时**：通过 `final` 修饰模板方法，防止子类破坏算法结构
- **需要避免代码重复，将公共逻辑提取到父类时**：DRY（Don't Repeat Yourself）原则的典型实践
- **框架设计中，定义扩展点给使用者时**：框架定义流程骨架，用户通过继承来定制行为
- **需要在不改变算法结构的前提下，灵活地添加钩子逻辑时**：通过钩子方法实现可选的扩展点

:::warning 注意
模板方法模式基于**继承**实现，这意味着子类和父类之间是紧耦合的。如果算法骨架本身不稳定（经常需要调整步骤），模板方法反而会增加维护成本。此时可以考虑**策略模式**或**组合**来替代。
:::

## UML 类图

```mermaid
classDiagram
    class "AbstractClass" as AbstractClass {
        <<abstract>>
        +templateMethod() void
        #step1() void*
        #step2() void*
        #step3() void
        #hook() void
    }
    class "ConcreteClassA" as ConcreteClassA {
        +step1() void
        +step2() void
    }
    class "ConcreteClassB" as ConcreteClassB {
        +step1() void
        +step2() void
    }
    class "Client" as Client {
        +main() void
    }
    AbstractClass <|-- ConcreteClassA
    AbstractClass <|-- ConcreteClassB
    Client ..> AbstractClass : uses
    note for AbstractClass "模板方法定义算法骨架\n*表示抽象方法"
```

**关键角色说明：**

| 角色 | 说明 |
|------|------|
| **AbstractClass（抽象类）** | 定义抽象的原语操作，以及一个以这些原语操作为基础的模板方法 |
| **ConcreteClass（具体类）** | 实现原语操作以完成算法中与特定子类相关的步骤 |
| **templateMethod()** | 模板方法，定义算法骨架，通常为 `final` 防止子类覆盖 |
| **hook()** | 钩子方法，提供默认实现，子类可选覆盖 |

## 代码示例

### ❌ 没有使用该模式的问题

```java
// 场景：电商系统中需要生成多种报表（日报、周报、月报）
// 每种报表的生成流程都一样，但具体实现不同

// 日报生成器
public class DailyReportGenerator {
    public void generateReport(String date) {
        // 步骤1：连接数据库
        System.out.println("连接数据库...");
        // 步骤2：查询数据
        System.out.println("查询日报数据: " + date);
        // 步骤3：格式化数据（只有这一步不同）
        System.out.println("按日汇总数据...");
        // 步骤4：生成报表
        System.out.println("生成日报表格...");
        // 步骤5：发送通知
        System.out.println("发送日报邮件通知...");
        // 步骤6：关闭连接
        System.out.println("关闭数据库连接...");
    }
}

// 周报生成器
public class WeeklyReportGenerator {
    public void generateReport(String date) {
        // 步骤1：连接数据库 —— 和日报完全重复！
        System.out.println("连接数据库...");
        // 步骤2：查询数据 —— 和日报完全重复！
        System.out.println("查询周报数据: " + date);
        // 步骤3：格式化数据（不同）
        System.out.println("按周汇总数据...");
        // 步骤4：生成报表 —— 和日报完全重复！
        System.out.println("生成周报表格...");
        // 步骤5：发送通知 —— 和日报完全重复！
        System.out.println("发送周报邮件通知...");
        // 步骤6：关闭连接 —— 和日报完全重复！
        System.out.println("关闭数据库连接...");
    }
}

// 月报生成器... 同样的代码再来一遍
// 问题总结：
// 1. 大量重复代码：连接、关闭、通知逻辑在每个类中重复
// 2. 修改困难：如果"连接数据库"逻辑变了，要改3个类
// 3. 容易遗漏：新增报表类型时可能漏掉某些步骤
// 4. 违反 DRY 原则
```

### ✅ 使用该模式后的改进

```java
// ========================================
// 第一步：定义抽象报表生成器（父类）
// ========================================
public abstract class AbstractReportGenerator {

    // 模板方法：定义报表生成的完整流程
    // final 防止子类覆盖，保证算法骨架不变
    public final void generateReport(String date) {
        connect();                    // 固定步骤：连接数据库
        fetchRawData(date);           // 固定步骤：查询原始数据
        processData();                // 抽象步骤：子类决定如何处理数据
        buildReport();                // 固定步骤：生成报表
        if (shouldNotify()) {         // 钩子方法：子类决定是否发送通知
            sendNotification();
        }
        close();                      // 固定步骤：关闭连接
    }

    // ========== 抽象方法（子类必须实现） ==========

    /**
     * 处理数据 —— 子类根据报表类型实现不同的汇总逻辑
     * 日报按日汇总，周报按周汇总，月报按月汇总
     */
    protected abstract void processData();

    // ========== 具体方法（所有子类共享） ==========

    /**
     * 连接数据库 —— 公共逻辑，所有报表都需要
     */
    private void connect() {
        System.out.println("[通用] 连接数据库...");
    }

    /**
     * 查询原始数据 —— 公共逻辑，从数据库获取原始记录
     */
    private void fetchRawData(String date) {
        System.out.println("[通用] 查询原始数据，日期范围: " + date);
    }

    /**
     * 生成报表 —— 公共逻辑，将处理后的数据输出为报表
     */
    private void buildReport() {
        System.out.println("[通用] 生成报表文件...");
    }

    /**
     * 关闭数据库连接 —— 公共逻辑，释放资源
     */
    private void close() {
        System.out.println("[通用] 关闭数据库连接...");
    }

    // ========== 钩子方法（子类可选覆盖） ==========

    /**
     * 是否发送通知 —— 默认不发送，子类可覆盖
     * 比如日报不需要通知，但月报需要发送给管理层
     */
    protected boolean shouldNotify() {
        return false;
    }

    /**
     * 发送通知 —— 可被子类覆盖以定制通知内容
     */
    protected void sendNotification() {
        System.out.println("[通用] 发送邮件通知...");
    }
}

// ========================================
// 第二步：实现具体报表生成器（子类）
// ========================================

// 日报生成器
public class DailyReportGenerator extends AbstractReportGenerator {

    @Override
    protected void processData() {
        // 日报的数据处理逻辑：按小时汇总
        System.out.println("[日报] 按小时汇总数据，生成趋势图...");
    }
    // 不覆盖 shouldNotify()，日报不需要通知
}

// 周报生成器
public class WeeklyReportGenerator extends AbstractReportGenerator {

    @Override
    protected void processData() {
        // 周报的数据处理逻辑：按天汇总，计算环比
        System.out.println("[周报] 按天汇总数据，计算周环比...");
    }

    @Override
    protected boolean shouldNotify() {
        return true; // 周报需要通知
    }
}

// 月报生成器
public class MonthlyReportGenerator extends AbstractReportGenerator {

    @Override
    protected void processData() {
        // 月报的数据处理逻辑：按周汇总，生成对比图表
        System.out.println("[月报] 按周汇总数据，生成同比/环比对比...");
    }

    @Override
    protected boolean shouldNotify() {
        return true; // 月报需要通知
    }

    @Override
    protected void sendNotification() {
        // 月报的通知更正式，发送给管理层
        System.out.println("[月报] 发送月报给管理层（含附件）...");
    }
}

// ========================================
// 第三步：客户端调用
// ========================================
public class Main {
    public static void main(String[] args) {
        System.out.println("===== 生成日报 =====");
        AbstractReportGenerator daily = new DailyReportGenerator();
        daily.generateReport("2024-01-15");

        System.out.println("\n===== 生成周报 =====");
        AbstractReportGenerator weekly = new WeeklyReportGenerator();
        weekly.generateReport("2024-01-08 ~ 2024-01-14");

        System.out.println("\n===== 生成月报 =====");
        AbstractReportGenerator monthly = new MonthlyReportGenerator();
        monthly.generateReport("2024-01");
    }
}
```

### 变体与扩展

#### 1. 钩子方法的多种用法

钩子方法是模板方法模式中最灵活的部分，常见的用法包括：

```java
public abstract class AdvancedReportGenerator {

    // 钩子用法1：作为条件控制（决定是否执行某个步骤）
    public final void generate() {
        connect();
        if (enableCache()) {          // 钩子：是否启用缓存
            loadFromCache();
        }
        processData();
        if (shouldCompress()) {       // 钩子：是否压缩输出
            compress();
        }
        close();
    }

    // 钩子用法2：作为可选步骤的占位
    protected void beforeProcess() {}  // 空实现，子类可选覆盖
    protected void afterProcess() {}   // 空实现，子类可选覆盖

    // 钩子用法3：提供默认值，子类可覆盖
    protected int getMaxRetryCount() { return 3; }
    protected String getReportFormat() { return "PDF"; }

    protected boolean enableCache() { return false; }
    protected boolean shouldCompress() { return true; }

    protected abstract void processData();
    // ... 其他方法省略
}
```

#### 2. 使用组合替代继承（函数式模板方法）

Java 8 的函数式接口可以让我们用**组合**替代**继承**来实现模板方法：

```java
// 用函数式接口定义步骤
public class FunctionalReportGenerator {

    // 每个步骤都是一个函数，通过构造器注入
    private final Consumer<String> dataProcessor;
    private final boolean sendNotify;

    /**
     * 构造器注入：用 Lambda 表达式定义数据处理逻辑
     * 不再需要继承，更灵活
     */
    public FunctionalReportGenerator(Consumer<String> dataProcessor,
                                      boolean sendNotify) {
        this.dataProcessor = dataProcessor;
        this.sendNotify = sendNotify;
    }

    // 模板方法
    public final void generate(String date) {
        System.out.println("[通用] 连接数据库...");
        System.out.println("[通用] 查询原始数据: " + date);
        dataProcessor.accept(date);   // 执行注入的数据处理逻辑
        System.out.println("[通用] 生成报表...");
        if (sendNotify) {
            System.out.println("[通用] 发送通知...");
        }
        System.out.println("[通用] 关闭连接...");
    }

    // 使用：通过 Lambda 传入不同逻辑，无需创建子类
    public static void main(String[] args) {
        // 日报：用 Lambda 定义处理逻辑
        FunctionalReportGenerator daily = new FunctionalReportGenerator(
            date -> System.out.println("[日报] 按小时汇总: " + date),
            false
        );
        daily.generate("2024-01-15");

        // 周报：不同的 Lambda，不同的通知策略
        FunctionalReportGenerator weekly = new FunctionalReportGenerator(
            date -> System.out.println("[周报] 按天汇总: " + date),
            true
        );
        weekly.generate("2024-W03");
    }
}
```

:::tip 函数式模板方法 vs 继承式模板方法

- **继承式**：适合步骤固定、子类较少的场景，类型安全
- **函数式**：适合步骤灵活、运行时决定逻辑的场景，更简洁
- 实际项目中可以混合使用——核心骨架用继承，可选步骤用函数式接口
:::

### 运行结果

```
===== 生成日报 =====
[通用] 连接数据库...
[通用] 查询原始数据，日期范围: 2024-01-15
[日报] 按小时汇总数据，生成趋势图...
[通用] 生成报表文件...
[通用] 关闭数据库连接...

===== 生成周报 =====
[通用] 连接数据库...
[通用] 查询原始数据，日期范围: 2024-01-08 ~ 2024-01-14
[周报] 按天汇总数据，计算周环比...
[通用] 生成报表文件...
[通用] 发送邮件通知...
[通用] 关闭数据库连接...

===== 生成月报 =====
[通用] 连接数据库...
[通用] 查询原始数据，日期范围: 2024-01
[月报] 按周汇总数据，生成同比/环比对比...
[通用] 生成报表文件...
[月报] 发送月报给管理层（含附件）...
[通用] 关闭数据库连接...
```

## Spring/JDK 中的应用

### 1. Spring 框架中的模板方法

Spring 框架是模板方法模式的"重度用户"，几乎每个模块都有体现：

```java
// ==================
// JdbcTemplate — 最经典的模板方法
// ==================
// 固定流程：获取连接 → 创建语句 → 执行查询 → 处理结果集 → 关闭资源
// 用户只需实现"如何映射结果"这一步

@Service
public class UserService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<User> findAllUsers() {
        // query() 就是模板方法
        // 内部流程：getConnection() → prepareStatement() → execute() → 
        //           mapRow()（你实现的） → close()
        return jdbcTemplate.query(
            "SELECT id, name, email FROM users",
            (rs, rowNum) -> {
                // 这就是你实现的"可变步骤"
                User user = new User();
                user.setId(rs.getLong("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                return user;
            }
        );
    }
}

// ==================
// AbstractApplicationContext — Spring 容器启动的模板方法
// ==================
// refresh() 方法定义了容器启动的完整流程：
// 1. refreshBeanFactory()        — 刷新 BeanFactory
// 2. invokeBeanFactoryPostProcessors() — 调用 BeanFactory 后置处理器
// 3. registerBeanPostProcessors() — 注册 Bean 后置处理器
// 4. initMessageSource()          — 初始化消息源
// 5. initApplicationEventMulticaster() — 初始化事件广播器
// 6. onRefresh()                  — 子类可覆盖的钩子方法
// 7. registerListeners()          — 注册监听器
// 8. finishBeanFactoryInitialization() — 完成 BeanFactory 初始化
// 9. finishRefresh()              — 完成刷新
// 这些步骤的顺序是固定的，子类（如 GenericWebApplicationContext）
// 可以通过覆盖 onRefresh() 等钩子方法来定制

// ==================
// RestTemplate — HTTP 请求的模板方法
// ==================
// execute() 方法定义了 HTTP 请求的骨架：
// 创建请求 → 执行请求 → 处理响应 → 处理异常 → 释放资源
restTemplate.getForObject(
    "https://api.example.com/users",
    User.class
);
// 你只需要关心 URL 和返回类型，其他步骤框架帮你处理
```

### 2. JDK 中的应用

```java
// ==================
// InputStream — Java IO 中的模板方法
// ==================
// InputStream 是抽象类，read(byte[], int, int) 是模板方法
// 内部调用 read() 抽象方法（单字节读取），子类实现具体的读取逻辑

public class MyInputStream extends InputStream {
    @Override
    public int read() throws IOException {
        // 子类实现：从某个数据源读取一个字节
        return -1; // 示例
    }
}
// 调用 read(byte[] b) 时，内部会循环调用 read() 来填充字节数组
// 这就是模板方法：read(byte[]) 定义了"批量读取"的骨架，read() 是可变步骤

// ==================
// AbstractList — 集合框架中的模板方法
// ==================
// AbstractList.get(int) 是抽象方法，子类实现
// indexOf()、lastIndexOf() 等方法内部调用 get()，是模板方法

public class MyList extends AbstractList<String> {
    private final String[] data;

    public MyList(String[] data) {
        this.data = data;
    }

    // 实现抽象方法
    @Override
    public String get(int index) {
        return data[index];
    }

    @Override
    public int size() {
        return data.length;
    }
    // indexOf()、contains() 等方法自动可用，因为 AbstractList 
    // 的模板方法已经基于 get() 实现了它们

// ==================
// HttpServlet — Servlet 中的模板方法
// ==================
// service() 是模板方法，根据 HTTP 方法分发到 doGet()/doPost() 等
// 子类只需要覆盖 doGet()、doPost() 等具体方法

public class MyServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // 只需要实现 GET 请求的处理逻辑
        resp.getWriter().write("Hello World");
    }
}
// service() 内部：
// if (method.equals("GET")) doGet(req, resp);
// else if (method.equals("POST")) doPost(req, resp);
// ... 这就是模板方法，定义了请求分发的骨架
```

## 优缺点

| 优点 | 说明 | 缺点 | 说明 |
|------|------|------|------|
| **封装不变部分，扩展可变部分** | 公共逻辑在父类，变化逻辑在子类，符合开闭原则 | **子类数量增长** | 每种变体都需要一个子类，类的数量可能膨胀 |
| **提取公共代码，减少重复** | DRY 原则的典型实践，避免代码复制粘贴 | **继承的局限性** | Java 单继承限制，子类不能再继承其他类 |
| **钩子方法提供灵活的扩展点** | 子类可以选择性覆盖，不影响默认行为 | **调试困难** | 行为分散在父类和子类中，调试时需要跳转多个类 |
| **控制子类扩展范围** | `final` 模板方法保证算法结构不被破坏 | **父类修改影响面大** | 父类新增抽象方法会导致所有子类编译失败 |
| **代码结构清晰** | 算法的骨架一目了然，便于理解和维护 | **紧耦合** | 子类依赖父类的实现细节，违反依赖倒置原则 |

:::danger 最佳实践

1. **模板方法标记为 `final`**：防止子类破坏算法骨架
2. **抽象方法尽量少**：只将真正变化的步骤定义为抽象方法
3. **善用钩子方法**：为可选行为提供默认实现，而不是强制子类覆盖
4. **避免过深的继承层次**：一般 2-3 层即可，过深的继承会增加复杂度
5. **考虑函数式替代方案**：Java 8+ 可以用组合 + Lambda 替代部分继承场景
:::

## 面试追问

### Q1: 模板方法模式和策略模式的区别？

**A:** 核心区别在于**实现方式**和**使用场景**：

| 维度 | 模板方法 | 策略模式 |
|------|----------|----------|
| 实现方式 | **继承** | **组合** |
| 变化维度 | 算法的**部分步骤**变化 | 整个**算法**替换 |
| 步骤关系 | 步骤之间有**固定顺序和依赖** | 算法之间是**平替关系** |
| 切换时机 | 编译时确定（子类） | 运行时动态切换 |
| 使用场景 | 流程固定，部分细节不同 | 同一问题有多种解法 |

举例：模板方法像"装修流程"——水电→泥工→木工→油漆，顺序不能变，但每步找不同的工人。策略模式像"出行方式"——开车、坐地铁、骑车，选一个就行。

### Q2: 模板方法模式和建造者模式的区别？

**A:** 两者都涉及"步骤"，但关注点完全不同：

- **模板方法**：步骤的**执行顺序由模板决定**，客户端不能改变顺序。侧重"流程控制"，步骤之间有依赖关系
- **建造者**：客户端**自由决定步骤的组合和顺序**，最后调用 `build()` 生成产品。侧重"对象组装"，步骤之间相对独立

```java
// 模板方法：流程固定，子类不能改变步骤顺序
public final void buildReport() {
    connect();      // 必须第一步
    fetch();        // 必须第二步
    process();      // 必须第三步
    close();        // 必须第四步
}

// 建造者：步骤灵活，客户端自由组合
User user = User.builder()
    .name("张三")       // 顺序随意
    .age(25)            // 顺序随意
    .email("a@b.com")   // 顺序随意
    .build();           // 最后一步必须调用
```

### Q3: Spring Boot 的自动配置用到了模板方法吗？

**A:** 是的，而且是**多层嵌套**的模板方法：

1. `SpringApplication.run()` 是最外层的模板方法：
   - 初始化环境 → 创建上下文 → 准备上下文 → 刷新上下文 → 后置处理
2. `refreshContext()` 内部调用 `AbstractApplicationContext.refresh()`，这又是一个模板方法（9 个步骤）
3. `invokeBeanFactoryPostProcessors()` 也是一个模板方法
4. `AutoConfigurationImportSelector` 通过 `selectImports()` 模板方法加载自动配置类

这些步骤都可以通过 `ApplicationContextInitializer`、`ApplicationListener`、`BeanPostProcessor` 等扩展点来定制——本质上都是钩子方法。

### Q4: 如何在模板方法中添加新的可选步骤而不影响已有子类？

**A:** 这正是**钩子方法**的作用。最佳实践：

1. 在模板方法中添加一个**带默认实现的钩子方法**，而不是抽象方法
2. 钩子方法默认什么都不做（空方法或返回默认值）
3. 已有子类不受影响（它们不覆盖钩子方法，使用默认行为）
4. 新子类可以覆盖钩子方法来定制行为

```java
public abstract class ReportGenerator {
    public final void generate() {
        connect();
        beforeProcess();  // 新增的钩子，默认空实现
        processData();    // 抽象方法
        afterProcess();   // 新增的钩子，默认空实现
        close();
    }

    // 钩子方法：空实现，已有子类无需修改
    protected void beforeProcess() {}
    protected void afterProcess() {}

    protected abstract void processData();
}
// 已有子类编译通过，无需任何修改
// 新子类可以覆盖 beforeProcess() / afterProcess() 来添加逻辑
```

:::tip 关键点
添加**抽象方法**会破坏已有子类（编译失败），添加**钩子方法**（有默认实现）则不会。这是模板方法模式中最重要的扩展技巧。
:::

## 相关模式

- **策略模式**：模板方法用继承控制流程，策略模式用组合替换算法
- **工厂方法模式**：模板方法中可以调用工厂方法来创建对象（如创建子类需要的资源）
- **观察者模式**：模板方法中可以在特定步骤触发通知（如钩子方法中发布事件）
- **装饰器模式**：装饰器可以在模板方法的执行前后添加额外行为
- **钩子方法**：是模板方法模式的重要组成部分，提供灵活的扩展点
