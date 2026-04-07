---
title: 装饰器 Decorator
icon: design
order: 9
category:
  - Java
tag:
  - Java
  - 设计模式
---

# 装饰器 Decorator

> 动态地给一个对象添加额外职责，比继承更灵活的替代方案。

## 意图

装饰器模式允许你在不修改原始类代码的情况下，通过"包装"对象来动态添加新功能。每个装饰器都实现与被装饰对象相同的接口，并在内部持有被装饰对象的引用，调用时先执行自己的逻辑再委托给被装饰对象。

:::tip 通俗比喻
想象一下咖啡店——你可以点一杯黑咖啡，然后动态地加上牛奶（+3元）、加奶泡（+5元）、加焦糖（+4元）。每种添加都是一个装饰器，可以自由组合，而且顺序不同味道也不同。

再比如穿衣服——你先穿一件 T 恤（基础组件），然后可以加外套（装饰器1），再加围巾（装饰器2），再加帽子（装饰器3）。每一层都在原有基础上增加了功能，而且随时可以脱掉某层。
:::

从 GoF 的定义来看，装饰器模式属于**结构型模式**，它的核心目的是：
- **动态扩展功能**——不修改原始类，运行时添加新行为
- **比继承更灵活**——避免类爆炸问题
- **透明性**——装饰器和被装饰对象实现相同接口，客户端无感知
- **可组合**——多个装饰器可以自由组合

:::warning 装饰器模式的核心要点：装饰器和被装饰对象必须实现相同的接口。这样客户端使用装饰器和使用原始对象的方式完全一样——这就是"透明性"。
:::

## 适用场景

- 需要动态、透明地给对象添加职责时
- 需要大量排列组合产生不同功能时
- 不方便使用继承来扩展功能时（类被 final 修饰、类层次过深）
- 需要在运行时撤销添加的功能时
- Java IO 流的包装就是装饰器模式的经典应用

## UML 类图

```mermaid
classDiagram
    class "Component" as Component {
        <<interface>>
        +operation() void
    }

    class "ConcreteComponent" as ConcreteComponent {
        +operation() void
    }

    class "Decorator" as Decorator {
        <<abstract>>
        #Component component
        +operation() void
    }

    class "ConcreteDecoratorA" as ConcreteDecoratorA {
        +operation() void
        +addedBehavior() void
    }

    class "ConcreteDecoratorB" as ConcreteDecoratorB {
        +operation() void
        +addedBehavior() void
    }

    class "Client" as Client {
        +main() void
    }

    Component <|.. ConcreteComponent
    Component <|.. Decorator
    Decorator <|-- ConcreteDecoratorA
    Decorator <|-- ConcreteDecoratorB
    Decorator o-- Component : wraps
    Client ..> Component : uses
```

## 代码示例

### ❌ 没有使用该模式的问题

```java
// 用继承扩展功能——导致类爆炸
// 假设我们有基础咖啡 + 3种配料（牛奶、奶泡、焦糖）
// 如果用继承，需要 2^3 = 8 个子类

public class Coffee {
    public String getDescription() { return "咖啡"; }
    public double getCost() { return 10.0; }
}

// 只加一种配料
public class MilkCoffee extends Coffee {
    @Override
    public String getDescription() { return "咖啡 + 牛奶"; }
    @Override
    public double getCost() { return 13.0; }
}

public class WhipCoffee extends Coffee {
    @Override
    public String getDescription() { return "咖啡 + 奶泡"; }
    @Override
    public double getCost() { return 15.0; }
}

public class MochaCoffee extends Coffee {
    @Override
    public String getDescription() { return "咖啡 + 焦糖"; }
    @Override
    public double getCost() { return 14.0; }
}

// 两种配料组合——类数量开始爆炸
public class MilkWhipCoffee extends MilkCoffee {
    @Override
    public String getDescription() { return "咖啡 + 牛奶 + 奶泡"; }
    @Override
    public double getCost() { return 18.0; }
}

public class MilkMochaCoffee extends MilkCoffee {
    @Override
    public String getDescription() { return "咖啡 + 牛奶 + 焦糖"; }
    @Override
    public double getCost() { return 17.0; }
}

// 三种配料组合
public class MilkWhipMochaCoffee extends MilkWhipCoffee {
    @Override
    public String getDescription() { return "咖啡 + 牛奶 + 奶泡 + 焦糖"; }
    @Override
    public double getCost() { return 22.0; }
}

// 如果再加一种配料（比如豆奶）？类数量翻倍！
// n 种配料需要 2^n 个子类——完全不可维护
```

**运行结果：**

```
咖啡 + 牛奶 + 奶泡: 18.0 元
```

:::danger 问题总结
1. **类爆炸**：n 种配料需要 2^n 个子类
2. **违反开闭原则**：新增配料必须新增大量类
3. **代码重复**：相似的组合逻辑在多个类中重复
4. **不够灵活**：无法在运行时动态添加/移除配料
:::

### ✅ 使用该模式后的改进

```java
// ===== 组件接口：咖啡的统一契约 =====
public interface Coffee {
    String getDescription();  // 描述
    double getCost();         // 价格
}

// ===== 具体组件：基础黑咖啡 =====
public class SimpleCoffee implements Coffee {
    @Override
    public String getDescription() {
        return "黑咖啡";
    }

    @Override
    public double getCost() {
        return 10.0;  // 基础价格
    }
}

// ===== 装饰器基类：实现 Coffee 接口，持有被装饰对象 =====
public abstract class CoffeeDecorator implements Coffee {
    // 被装饰的咖啡——可能是基础咖啡，也可能是已经被装饰过的咖啡
    protected final Coffee coffee;

    // 通过构造函数注入被装饰对象
    protected CoffeeDecorator(Coffee coffee) {
        this.coffee = coffee;
    }

    // 装饰器默认直接委托给被装饰对象
    // 具体装饰器可以选择性地重写
    @Override
    public String getDescription() {
        return coffee.getDescription();
    }

    @Override
    public double getCost() {
        return coffee.getCost();
    }
}

// ===== 具体装饰器1：牛奶 =====
public class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public String getDescription() {
        // 在原有描述上追加牛奶
        return coffee.getDescription() + " + 牛奶";
    }

    @Override
    public double getCost() {
        // 在原有价格上追加牛奶的价格
        return coffee.getCost() + 3.0;
    }
}

// ===== 具体装饰器2：奶泡 =====
public class WhipDecorator extends CoffeeDecorator {
    public WhipDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public String getDescription() {
        return coffee.getDescription() + " + 奶泡";
    }

    @Override
    public double getCost() {
        return coffee.getCost() + 5.0;
    }
}

// ===== 具体装饰器3：焦糖 =====
public class MochaDecorator extends CoffeeDecorator {
    public MochaDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public String getDescription() {
        return coffee.getDescription() + " + 焦糖";
    }

    @Override
    public double getCost() {
        return coffee.getCost() + 4.0;
    }
}

// ===== 使用示例：自由组合 =====
public class DecoratorDemo {
    public static void main(String[] args) {
        // 组合1：黑咖啡 + 牛奶 + 奶泡
        // 从内到外包装：先创建黑咖啡，再用牛奶装饰，再用奶泡装饰
        Coffee order1 = new WhipDecorator(new MilkDecorator(new SimpleCoffee()));
        System.out.println("订单1: " + order1.getDescription());
        System.out.println("价格: " + order1.getCost() + " 元");

        System.out.println("---");

        // 组合2：黑咖啡 + 焦糖 + 牛奶 + 奶泡
        Coffee order2 = new WhipDecorator(
                            new MilkDecorator(
                                new MochaDecorator(new SimpleCoffee())));
        System.out.println("订单2: " + order2.getDescription());
        System.out.println("价格: " + order2.getCost() + " 元");

        System.out.println("---");

        // 组合3：只加焦糖
        Coffee order3 = new MochaDecorator(new SimpleCoffee());
        System.out.println("订单3: " + order3.getDescription());
        System.out.println("价格: " + order3.getCost() + " 元");

        System.out.println("---");

        // 组合4：双倍牛奶（同一个装饰器可以用两次）
        Coffee order4 = new MilkDecorator(new MilkDecorator(new SimpleCoffee()));
        System.out.println("订单4: " + order4.getDescription());
        System.out.println("价格: " + order4.getCost() + " 元");
    }
}
```

**运行结果：**

```
订单1: 黑咖啡 + 牛奶 + 奶泡
价格: 18.0 元
---
订单2: 黑咖啡 + 焦糖 + 牛奶 + 奶泡
价格: 22.0 元
---
订单3: 黑咖啡 + 焦糖
价格: 14.0 元
---
订单4: 黑咖啡 + 牛奶 + 牛奶
价格: 16.0 元
```

### 变体与扩展

**1. 半透明装饰器**

有时候装饰器需要添加新方法，但为了保持接口一致性又不方便加到接口里。这时可以让装饰器类型在特定场景下向下转型：

```java
// 装饰器添加了接口之外的方法——"半透明"
public class SizeDecorator extends CoffeeDecorator {
    private String size;  // S/M/L

    public SizeDecorator(Coffee coffee, String size) {
        super(coffee);
        this.size = size;
    }

    // 新增方法——不在 Coffee 接口中
    public String getSize() {
        return size;
    }

    @Override
    public double getCost() {
        double base = coffee.getCost();
        return switch (size) {
            case "M" -> base * 1.0;
            case "L" -> base * 1.5;
            default -> base * 0.8;  // S
        };
    }
}

// 使用时需要向下转型
Coffee coffee = new SizeDecorator(new SimpleCoffee(), "L");
if (coffee instanceof SizeDecorator sd) {
    System.out.println("杯型: " + sd.getSize());
}
```

:::warning 半透明装饰器破坏了装饰器模式的透明性原则，应该尽量避免。如果确实需要添加新方法，考虑使用组合模式或代理模式替代。
:::

**2. 装饰器 + 建造者模式**

当装饰器组合比较复杂时，用建造者模式来简化组装：

```java
public class CoffeeBuilder {
    private Coffee coffee = new SimpleCoffee();

    public CoffeeBuilder addMilk() {
        coffee = new MilkDecorator(coffee);
        return this;  // 支持链式调用
    }

    public CoffeeBuilder addWhip() {
        coffee = new WhipDecorator(coffee);
        return this;
    }

    public CoffeeBuilder addMocha() {
        coffee = new MochaDecorator(coffee);
        return this;
    }

    public Coffee build() {
        return coffee;
    }
}

// 使用：比嵌套构造函数清晰多了
Coffee myCoffee = new CoffeeBuilder()
    .addMilk()
    .addMocha()
    .addWhip()
    .build();
```

### 运行结果

完整的 DecoratorDemo 运行输出已在上方展示。4 种不同的组合展示了装饰器模式的灵活性——同样的基础组件和装饰器，通过不同的组合方式产生了不同的结果。

## Spring/JDK 中的应用

### Spring 框架中的装饰器模式

**1. BeanPostProcessor 链**

Spring 的 `BeanPostProcessor` 本质上就是装饰器模式——对 Bean 进行包装增强：

```java
// BeanPostProcessor 可以对 Bean 进行装饰
@Component
public class LoggingBeanPostProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        // 如果是 OrderService，就用装饰器包装它
        if (bean instanceof OrderService) {
            return new LoggingOrderServiceDecorator((OrderService) bean);
        }
        return bean;  // 不需要装饰的 Bean 原样返回
    }
}

// 装饰器：给 OrderService 添加日志功能
public class LoggingOrderServiceDecorator implements OrderService {
    private final OrderService delegate;  // 被装饰的原始对象

    public LoggingOrderServiceDecorator(OrderService delegate) {
        this.delegate = delegate;
    }

    @Override
    public Order createOrder(Order order) {
        System.out.println("[日志] 创建订单开始: " + order.getId());
        Order result = delegate.createOrder(order);  // 委托给原始对象
        System.out.println("[日志] 创建订单完成: " + result.getId());
        return result;
    }
}
```

**2. Spring AOP 代理**

Spring AOP 底层也是装饰器模式的体现——通过动态代理给目标对象添加切面功能：

```java
// AOP 切面 = 装饰器
@Aspect
@Component
public class LoggingAspect {
    // 在方法执行前后添加日志——这就是装饰
    @Around("execution(* com.example.service.*.*(..))")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("[AOP] 方法开始: " + methodName);

        // 执行原始方法
        Object result = joinPoint.proceed();

        System.out.println("[AOP] 方法结束: " + methodName);
        return result;
    }
}
```

**3. Spring MVC 的 HandlerInterceptor**

```java
// 拦截器链就是装饰器链——在 Controller 前后添加功能
@Component
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) {
        // 在 Controller 执行前添加鉴权逻辑
        String token = request.getHeader("Authorization");
        if (token == null) {
            response.setStatus(401);
            return false;
        }
        return true;  // 放行，交给下一个拦截器或 Controller
    }
}
```

### JDK 中的装饰器模式

**1. Java IO 流——最经典的装饰器模式**

```java
// InputStream 是抽象组件
// FileInputStream 是具体组件
// BufferedInputStream、DataInputStream 等是装饰器

// 一层装饰：添加缓冲功能
InputStream buffered = new BufferedInputStream(
    new FileInputStream("data.txt")
);

// 两层装饰：添加缓冲 + 数据类型读取功能
DataInputStream dataStream = new DataInputStream(
    new BufferedInputStream(
        new FileInputStream("data.bin")
    )
);

// BufferedReader 装饰 Reader
BufferedReader reader = new BufferedReader(
    new InputStreamReader(
        new FileInputStream("config.properties")
    )
);
```

:::tip Java IO 的设计是装饰器模式的教科书级实现。`InputStream` 是抽象组件，各种 `XXXInputStream` 是装饰器，`FileInputStream`、`ByteArrayInputStream` 等是具体组件。装饰器的嵌套构造（new A(new B(new C(...)))）是装饰器模式的标志性用法。
:::

**2. Collections.unmodifiableList()**

```java
// Collections 提供的不可变包装也是一种装饰器
List<String> original = new ArrayList<>();
original.add("hello");

// 用装饰器包装，添加"不可修改"的约束
List<String> unmodifiable = Collections.unmodifiableList(original);

unmodifiable.add("world");  // 抛出 UnsupportedOperationException

// synchronizedList 也是装饰器——添加线程安全功能
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
```

## 优缺点

### 优点

| 优点 | 详细说明 |
|------|----------|
| 比继承更灵活 | 动态添加/撤销功能，不需要修改类结构 |
| 符合开闭原则 | 新增装饰器不需要修改已有代码 |
| 可排列组合 | 不同装饰器可以自由组合，产生大量行为 |
| 保持接口一致性 | 装饰器和被装饰对象实现相同接口 |
| 单一职责 | 每个装饰器只负责一个增强功能 |

### 缺点

| 缺点 | 详细说明 | 应对方案 |
|------|----------|----------|
| 调试困难 | 装饰器层过多，堆栈很深 | 合并装饰器，用建造者模式管理 |
| 小类太多 | 增加代码量 | 简单增强用 AOP 替代 |
| 顺序敏感 | 装饰器顺序不同结果不同 | 用文档/建造者明确顺序 |
| 类型识别问题 | `instanceof` 判断困难 | 避免类型判断，用接口多态 |
| 客户端感知 | 需要知道何时用装饰器 | 结合工厂或 IoC 容器管理 |

## 面试追问

### Q1: 装饰器模式和代理模式的区别？

| 维度 | 装饰器模式 | 代理模式 |
|------|------------|----------|
| **意图** | 添加功能（增强行为） | 控制访问（隐藏对象） |
| **创建方式** | 客户端主动组合创建 | 代理内部隐藏创建 |
| **关注点** | 增强原始对象的功能 | 控制对原始对象的访问 |
| **层数** | 可以多层嵌套 | 通常只有一层 |
| **客户端感知** | 客户端知道装饰器的存在 | 客户端以为在直接使用原始对象 |
| **典型场景** | Java IO 流、AOP 切面 | 远程代理、虚拟代理、保护代理 |

:::tip 一句话总结：装饰器关注"加功能"，代理关注"控制访问"。装饰器由客户端组装，代理隐藏了被代理对象。装饰器可以多层嵌套，代理通常只有一层。
:::

### Q2: Java IO 中的装饰器模式是怎么体现的？

Java IO 是装饰器模式最经典的实现，几乎所有 IO 类都是装饰器或被装饰对象：

```java
// 四层装饰器的组合
DataInputStream dis = new DataInputStream(         // 装饰器4：数据类型读取
    new BufferedInputStream(                        // 装饰器3：缓冲
        new FileInputStream("data.bin")             // 具体组件：文件读取
    )
);

// Reader 体系也是一样的
BufferedReader br = new BufferedReader(             // 装饰器：缓冲 + readLine()
    new InputStreamReader(                          // 装饰器：字节流转字符流
        new FileInputStream("utf8.txt"),            // 具体组件：文件读取
        StandardCharsets.UTF_8                      // 装饰器参数：编码转换
    )
);
```

**关键设计点：**
- `InputStream`/`OutputStream` 是抽象组件
- `FilterInputStream`/`FilterOutputStream` 是装饰器基类
- `BufferedInputStream`、`DataInputStream`、`PushbackInputStream` 是具体装饰器
- `FileInputStream`、`ByteArrayInputStream` 是具体组件

### Q3: 装饰器模式如何避免装饰器过多导致的问题？

**方案1：合并功能相似的装饰器**
```java
// 把多个小装饰器合并为一个
public class LoggingAndMonitoringDecorator extends ServiceDecorator {
    @Override
    public void execute() {
        log("开始执行");
        long start = System.currentTimeMillis();
        super.execute();
        long cost = System.currentTimeMillis() - start;
        monitor(cost);
    }
}
```

**方案2：使用建造者模式管理装饰器组装**
```java
// 建造者模式让装饰器组装更清晰
Coffee coffee = CoffeeBuilder.newInstance()
    .withMilk()
    .withMocha()
    .withWhip()
    .size("L")
    .build();
```

**方案3：用 AOP 替代简单的装饰逻辑**
```java
// 简单的横切关注点（日志、监控、事务）用 AOP 更合适
@Aspect
@Component
public class ServiceAspect {
    @Around("execution(* com.example.service.*.*(..))")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        // 日志 + 监控 + 事务都在这里处理
        log.info("方法调用: {}", pjp.getSignature());
        return pjp.proceed();
    }
}
```

### Q4: 装饰器模式和继承的区别？什么时候用装饰器而不是继承？

| 维度 | 继承 | 装饰器 |
|------|------|--------|
| **扩展时机** | 编译时静态确定 | 运行时动态添加 |
| **灵活性** | 固定，不能改变 | 灵活，可以组合 |
| **类数量** | 组合爆炸（2^n） | n 个装饰器类 |
| **耦合度** | 高（父类和子类紧耦合） | 低（通过接口耦合） |
| **适用场景** | "is-a" 关系，核心功能扩展 | "has-a" 关系，可选功能增强 |

:::tip 选择原则：如果扩展是"核心的、永久的"，用继承。如果扩展是"可选的、可组合的"，用装饰器。当你发现自己需要大量子类来表示不同组合时，就是用装饰器的信号。
:::

## 相关模式

- **适配器模式**：适配器改变接口，装饰器保持接口不变
- **代理模式**：代理控制访问，装饰器增强功能
- **策略模式**：策略替换算法，装饰器添加功能
- **组合模式**：结构相似，组合关注层次结构，装饰器关注功能增强
- **建造者模式**：建造者简化装饰器的组装过程
