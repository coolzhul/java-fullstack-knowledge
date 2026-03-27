---
title: 泛型与注解
icon: tag
order: 6
category:
  - Java
tag:
  - Java
  - 泛型
  - 注解
---

# Java 泛型与注解

> 泛型是 Java 类型系统的基石，注解是元编程的入口。它们看起来简单，但泛型的类型擦除机制、PECS 原则，以及注解在框架中的反射驱动方式，都是理解 Java 生态的关键。

## 泛型——编译时的安全网

### 为什么需要泛型？

```java
// 没有泛型的 Java（JDK 5 之前）—— 什么都能放，什么都能取
List list = new ArrayList();
list.add("hello");
list.add(123);
String s = (String) list.get(1);  // 运行时 ClassCastException！

// 有泛型——编译时就发现问题
List<String> list = new ArrayList<>();
list.add("hello");
// list.add(123);  // 编译错误！
String s = list.get(0);  // 不需要强转
```

泛型的核心价值：**把运行时的 ClassCastException 提前到编译期**。

### 类型擦除——泛型只存在于编译期

这是 Java 泛型最大的"坑"，也是和其他语言（C#、Kotlin）泛型最大的区别：

```java
// 你写的代码
public class Box<T> {
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

// 编译后的字节码（类型参数被擦除为 Object）
public class Box {
    private Object value;
    public void set(Object value) { this.value = value; }
    public Object get() { return value; }
}
```

**这意味着什么？**

```java
// 1. 运行时无法区分 List<String> 和 List<Integer>
List<String> strings = new ArrayList<>();
List<Integer> integers = new ArrayList<>();
System.out.println(strings.getClass() == integers.getClass());  // true！都是 ArrayList

// 2. 不能用 instanceof 检查泛型类型
// if (obj instanceof List<String>) {}  // 编译错误
if (obj instanceof List<?>) {}  // 可以

// 3. 不能创建泛型数组
// List<String>[] array = new List<String>[10];  // 编译错误
// 因为擦除后变成 List[]，类型不安全

// 4. 不能实例化类型参数
// public <T> T create() { return new T(); }  // 编译错误
public <T> T create(Class<T> clazz) throws Exception {
    return clazz.getDeclaredConstructor().newInstance();
}
```

::: tip 为什么 Java 用类型擦除而不是像 C# 那样保留泛型类型？
为了向后兼容。JDK 5 引入泛型时，需要让新旧代码能互操作。泛型信息被擦除后，编译后的 class 文件和 JDK 5 之前的代码完全兼容。这是 Java"兼容性至上"哲学的典型体现。
:::

### PECS 原则——泛型通配符的核心法则

这是《Effective Java》中最经典的法则之一，搞懂了它就搞懂了泛型通配符：

```
PECS = Producer Extends, Consumer Super

Producer（生产者）——从集合中读取数据 → 用 <? extends T>
Consumer（消费者）——向集合中写入数据 → 用 <? super T>

记忆口诀：读取用 extends，写入用 super
```

```java
// 场景1：你只需要从集合中读取（生产者）
public static double sum(List<? extends Number> list) {
    double total = 0;
    for (Number num : list) {
        total += num.doubleValue();  // ✅ 可以读取，因为都是 Number 的子类
    }
    // list.add(10);  // ❌ 不能写入！编译器不知道集合实际存的是什么类型
    return total;
}

// 可以传入 List<Integer>、List<Double>、List<Long>...
sum(Arrays.asList(1, 2, 3));
sum(Arrays.asList(1.1, 2.2, 3.3));

// 场景2：你需要向集合中写入（消费者）
public static void addNumbers(List<? super Integer> list) {
    list.add(1);       // ✅ 可以写入 Integer
    list.add(2);
    // Integer i = list.get(0);  // ❌ 不能读取为 Integer！只能读取为 Object
    Object obj = list.get(0);  // ✅
}

// 可以传入 List<Integer>、List<Number>、List<Object>...
List<Number> numbers = new ArrayList<>();
addNumbers(numbers);
```

::: warning 既读又写怎么办？
如果你的方法既要从集合中读取，又要向集合中写入，那就**不要用通配符**，直接用精确类型 `List<T>`。通配符的代价就是丧失某一方向的操作能力。
:::

### 桥接方法——类型擦除的补偿

```java
// 编译前的代码
public class StringBox extends Box<String> {
    @Override
    public void set(String value) { super.set(value); }
}

// 类型擦除后，父类 set 变成了 set(Object)
// 子类 set(String) 的参数类型和父类不同了——不是重写！
// 所以编译器自动生成一个"桥接方法"：

// 编译后实际的字节码
public class StringBox extends Box {
    public void set(String value) { super.set(value); }     // 你写的方法

    // 编译器自动生成的桥接方法
    public void set(Object value) { set((String) value); }  // 桥接到你的方法
}
```

## 注解——元编程的入口

### 注解的本质

注解不是注释，不是修饰符。注解是**一种特殊的接口**，编译器或运行时可以通过反射读取注解信息来改变程序行为。

```java
// @Override 的定义——本质上就是一个接口
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {
}
```

### 四种保留策略

```java
@Retention(RetentionPolicy.SOURCE)   // 只存在于源码中，编译后丢弃
                                       // 例：@Override, @SuppressWarnings
@Retention(RetentionPolicy.CLASS)    // 存在于字节码中，JVM 运行时不可读（默认）
                                       // 用得很少
@Retention(RetentionPolicy.RUNTIME)  // 运行时可通过反射读取
                                       // 例：几乎所有框架注解（@Autowired, @Entity 等）
```

::: tip 判断用哪种 Retention？
如果你只是让编译器做检查（如 @Override），用 SOURCE。如果框架需要在运行时读取注解来改变行为（如 Spring 的 @Autowired），用 RUNTIME。CLASS 几乎不用。
:::

### 自定义注解的实际应用

```java
// 场景：方法执行耗时监控

// 1. 定义注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface CostTime {
    String value() default "";
    long warnMs() default 1000;  // 超过多少毫秒打印警告
}

// 2. AOP 切面读取注解（Spring 环境中）
@Aspect
@Component
public class CostTimeAspect {

    @Around("@annotation(costTime)")
    public Object logCostTime(ProceedingJoinPoint joinPoint, CostTime costTime) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return joinPoint.proceed();
        } finally {
            long cost = System.currentTimeMillis() - start;
            String name = costTime.value().isEmpty()
                ? joinPoint.getSignature().getName()
                : costTime.value();
            if (cost > costTime.warnMs()) {
                log.warn("方法 {} 耗时 {}ms，超过阈值 {}ms", name, cost, costTime.warnMs());
            } else {
                log.info("方法 {} 耗时 {}ms", name, cost);
            }
        }
    }
}

// 3. 使用
@CostTime(value = "查询用户", warnMs = 500)
public User getUserById(Long id) {
    return userRepository.findById(id);
}
```

### 注解 vs 配置文件

```java
// Spring 的演进：XML 配置 → 注解配置 → Spring Boot 自动配置

// XML 时代：集中配置，但 XML 膨胀后难以维护
<bean id="userService" class="com.example.UserService">
    <property name="userRepository" ref="userRepository"/>
</bean>

// 注解时代：配置和代码在一起，但配置分散在各个类中
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}

// Spring Boot：注解 + 约定大于配置 + application.yml
// 最复杂的配置放 yml，简单的用注解
```

::: tip 注解不是万能的
注解适合配置元数据（什么是什么），不适合配置业务逻辑（怎么做）。当注解的参数变得复杂（多层嵌套、条件判断），就该回到配置文件或代码中了。
:::

## 面试高频题

**Q1：什么是类型擦除？有什么影响？**

Java 泛型在编译后会被擦除为原始类型（Object 或上界）。影响：运行时 `List<String>` 和 `List<Integer>` 是同一类型；不能用 `instanceof` 检查泛型；不能创建泛型数组；不能实例化类型参数。

**Q2：什么是 PECS 原则？**

Producer Extends, Consumer Super。从集合中读取（生产者）用 `<? extends T>`，向集合中写入（消费者）用 `<? super T>`。既读又写就用精确类型 `<T>`，不用通配符。

**Q3：`List<?>` 和 `List<Object>` 有什么区别？**

`List<?>` 是未知类型的列表，只能读取为 Object，不能写入（除 null）。`List<Object>` 是明确类型为 Object 的列表，可以读写任何 Object。`List<String>` 可以赋值给 `List<?>`，但不能赋值给 `List<Object>`。

## 延伸阅读

- 上一篇：[IO/NIO](io.md) — 字节流、字符流、NIO 详解
- 下一篇：[并发编程](concurrency.md) — 线程安全、锁机制、AQS
- [Spring IOC](../spring/ioc.md) — 注解驱动的依赖注入
