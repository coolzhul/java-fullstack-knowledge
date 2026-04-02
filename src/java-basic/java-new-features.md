---
title: Java 新特性演进
icon: new
order: 8
category:
  - Java
tag:
  - Java基础
  - 新特性
  - 版本演进
---

# Java 新特性演进

> Java 语言从诞生到现在，不断引入新的特性和改进。从 Java 8 的 Lambda 表达式到 Java 21 的虚拟线程，每个版本都带来了革命性的变化。

## Java 8 - 函数式编程革命

### Lambda 表达式
```java
// 传统匿名内部类
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello World");
    }
};

// Lambda 表达式
Runnable r2 = () -> System.out.println("Hello World");

// 带参数的 Lambda
Function<String, Integer> stringLength = s -> s.length();
BinaryOperation add = (a, b) -> a + b;
BinaryOperation multiply = (a, b) -> a * b;

@FunctionalInterface
interface BinaryOperation {
    int apply(int a, int b);
}
```

### Stream API
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

// Stream 操作
List<String> filteredNames = names.stream()
    .filter(name -> name.length() > 3)
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());

// 并行流
long count = names.parallelStream()
    .filter(name -> name.contains("a"))
    .count();
```

### Optional 类
```java
// 避免 NullPointerException
Optional<String> optionalName = Optional.ofNullable(getName());
String name = optionalName.orElse("Unknown");

// 函数式风格
optionalName.ifPresent(n -> System.out.println("Name: " + n));

// 链式调用
Optional<String> upperName = optionalName.map(String::toUpperCase);
```

### 新日期时间 API
```java
import java.time.*;

// 当前时间
LocalDate today = LocalDate.now();
LocalTime now = LocalTime.now();
LocalDateTime dateTime = LocalDateTime.now();

// 日期操作
LocalDate birthday = LocalDate.of(1990, 5, 15);
LocalDate nextBirthday = birthday.plusYears(1);

// 时间格式化
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
String formatted = dateTime.format(formatter);

// 时间间隔
Duration duration = Duration.between(startTime, endTime);
Period period = Period.between(startDate, endDate);
```

### CompletableFuture 异步编程
```java
// 创建异步任务
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(1000);
        return "Hello World";
    } catch (InterruptedException e) {
        return "Error";
    }
});

// 链式处理
CompletableFuture<String> result = future
    .thenApply(String::toUpperCase)
    .thenApply(s -> s + "!");

// 组合多个异步任务
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "World");
CompletableFuture<String> combined = future1.thenCombine(future2, (s1, s2) -> s1 + " " + s2);
```

## Java 11 - 现代化改进

### var 局部变量类型推断
```java
// Java 11 中的 var 使用
var name = "Alice";
var age = 25;
var list = Arrays.asList("A", "B", "C");
var map = Map.of("key1", "value1", "key2", "value2");

// Lambda 中的 var
BiFunction<String, Integer, Person> createPerson = (var name, var age) -> 
    new Person(name, age);

// 限制：不能用于字段、方法参数、返回类型
// private var field; // 编译错误
// public void method(var param) {} // 编译错误
```

### HTTP 客户端
```java
import java.net.http.*;
import java.net.URI;

// 创建 HTTP 客户端
HttpClient client = HttpClient.newHttpClient();

// 发送 GET 请求
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

// 异步请求
HttpResponse<String> asyncResponse = client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .join();

// POST 请求
HttpRequest postRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/submit"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString("{\"name\":\"Alice\"}"))
    .build();
```

### 新的字符串方法
```java
// isBlank()
String text = "  ";
boolean isBlank = text.isBlank(); // true

// strip(), stripLeading(), stripTrailing()
String padded = "  Hello  ";
String stripped = padded.strip(); // "Hello"

// repeat()
String repeated = "Hello ".repeat(3); // "Hello Hello Hello "

// lines()
String multiline = "Line1\nLine2\nLine3";
Stream<String> lines = multiline.lines();

// transform()
String transformed = "hello".transform(String::toUpperCase); // "HELLO"
```

### 集合工厂方法
```java
// 不可变集合
List<String> list = List.of("A", "B", "C");
Set<Integer> set = Set.of(1, 2, 3, 4);
Map<String, String> map = Map.of("key1", "value1", "key2", "value2");

// 多元素创建
List<String> list2 = List.of("A", "B", "C", "D", "E");
Map<String, Integer> map2 = Map.of(
    "Alice", 25,
    "Bob", 30,
    "Charlie", 35
);

// 不可变集合的特性
// list.add("F"); // UnsupportedOperationException
// map.put("new", "value"); // UnsupportedOperationException
```

## Java 14+ - Pattern Matching 和 Records

### instanceof 模式匹配（预览）
```java
// Java 14 之前的写法
Object obj = "Hello";
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// Java 14+ 模式匹配
if (obj instanceof String s) {
    System.out.println(s.length());
}

// 嵌套模式匹配
if (obj instanceof List<?> list && list.size() > 0) {
    Object first = list.get(0);
    if (first instanceof String str) {
        System.out.println(str.length());
    }
}
```

### Records（记录类）
```java
// 传统类
class Person {
    private final String name;
    private final int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() { return name; }
    public int getAge() { return age; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
    
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
}

// Record 类
record Person(String name, int age) {}

// 自动生成：
// - 私有 final 字段
// - 构造函数
// - getter 方法
// - equals, hashCode, toString
// - 实现 Serializable

// 使用
Person person = new Person("Alice", 25);
String name = person.name(); // getter
int age = person.age(); // getter
```

### Switch 表达式（预览和正式发布）
```java
// Java 14 之前的 switch 语句
int day = 2;
String dayType;
switch (day) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
        dayType = "Weekday";
        break;
    case 6:
    case 7:
        dayType = "Weekend";
        break;
    default:
        dayType = "Unknown";
}

// Java 14+ switch 表达式
String dayType2 = switch (day) {
    case 1, 2, 3, 4, 5 -> "Weekday";
    case 6, 7 -> "Weekend";
    default -> "Unknown";
};

// 带代码块的 switch 表达式
String result = switch (day) {
    case 1, 2, 3, 4, 5 -> {
        System.out.println("Weekday");
        yield "Weekday";
    }
    case 6, 7 -> {
        System.out.println("Weekend");
        yield "Weekend";
    }
    default -> "Unknown";
};
```

## Java 19+ - 虚拟线程和文本块

### 虚拟线程（Virtual Threads）
```java
// Java 19+ 虚拟线程示例
// 传统平台线程
ExecutorService platformExecutor = Executors.newFixedThreadPool(10);
for (int i = 0; i < 1000; i++) {
    platformExecutor.submit(() -> {
        System.out.println("Running on platform thread: " + Thread.currentThread());
    });
}

// 虚拟线程
ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();
for (int i = 0; i < 1000; i++) {
    virtualExecutor.submit(() -> {
        System.out.println("Running on virtual thread: " + Thread.currentThread());
    });
}

// Structured Concurrency (Java 19+)
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Future<String> user = scope.fork(() -> fetchUser());
    Future<List<Order>> orders = scope.fork(() -> fetchOrders());
    scope.join(); // 等待所有子任务完成
    String userName = user.resultNow();
    List<Order> userOrders = orders.resultNow();
}

private String fetchUser() throws InterruptedException {
    Thread.sleep(1000);
    return "Alice";
}

private List<Order> fetchOrders() throws InterruptedException {
    Thread.sleep(1500);
    return Arrays.asList(new Order("1"), new Order("2"));
}
```

### 文本块（Text Blocks）
```java
// 传统字符串
String json1 = "{\"name\":\"Alice\",\"age\":25,\"address\":{\"city\":\"New York\",\"country\":\"USA\"}}";

// 文本块（Java 15+）
String json2 = """
    {
        "name": "Alice",
        "age": 25,
        "address": {
            "city": "New York",
            "country": "USA"
        }
    }
    """;

// SQL 查询
String sql = """
    SELECT u.id, u.name, u.email, o.order_date, o.total_amount
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.status = 'active'
    ORDER BY u.name ASC
    LIMIT 10
    """;

// HTML 模板
String html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Example Page</title>
    </head>
    <body>
        <h1>Welcome to our site!</h1>
        <p>This is a paragraph.</p>
    </body>
    </html>
    """;

// 文本块特性
// - 自动处理换行和缩进
// - 可以插入转义字符
String escaped = """
    This line has \"""
    and \\n and \t
    """;
```

### Record 模式匹配（Java 19+）
```java
// Record 模式匹配
if (obj instanceof Person(String name, int age)) {
    System.out.println("Name: " + name + ", Age: " + age);
}

// 嵌套 record 模式
if (obj instanceof Person(String name, Address(String city, String country))) {
    System.out.println("Lives in " + city + ", " + country);
}

// 多层模式匹配
if (obj instanceof Person(String name, int age) && age > 18) {
    System.out.println("Adult: " + name);
}
```

## Java 21+ - 更强大的模式匹配

### 模式匹配 for switch（Java 21）
```java
// 传统 switch
Object obj = "Hello";
String result;
if (obj instanceof String) {
    result = "String: " + obj;
} else if (obj instanceof Integer) {
    result = "Integer: " + obj;
} else if (obj instanceof List) {
    result = "List with " + ((List<?>) obj).size() + " elements";
} else {
    result = "Unknown type";
}

// 模式匹配 switch (Java 21)
String result2 = switch (obj) {
    case String s -> "String: " + s;
    case Integer i -> "Integer: " + i;
    case List<?> list -> "List with " + list.size() + " elements";
    case null -> "Null value";
    default -> "Unknown type: " + obj.getClass().getSimpleName();
};
```

### Switch 的类型模式
```java
// 类型模式匹配
String typeDescription = switch (obj) {
    case String s -> "String of length " + s.length();
    case Integer i -> "Integer value " + i;
    case Double d -> "Double value " + d;
    case Long l -> "Long value " + l;
    case List<?> list -> "List containing " + list.size() + " items";
    default -> "Unknown type";
};

// 带守卫的类型模式
String result = switch (obj) {
    case String s when s.length() > 10 -> "Long string: " + s.substring(0, 10) + "...";
    case String s -> "Short string: " + s;
    case Integer i when i > 100 -> "Large integer: " + i;
    case Integer i -> "Small integer: " + i;
    default -> "Other type";
};
```

### Record 模式和类型模式的组合
```java
// 复杂的模式匹配
if (obj instanceof Person(String name, int age) && age >= 18) {
    System.out.println("Adult: " + name);
}

// 在 switch 中使用 record 模式
String message = switch (obj) {
    case Person(String name, int age) when age < 18 -> "Minor: " + name;
    case Person(String name, int age) when age >= 18 -> "Adult: " + name;
    case Employee(String name, double salary) -> "Employee: " + name + " earns " + salary;
    case null -> "Null value";
    default -> "Unknown";
};
```

## 版本演进对比表

| 版本 | 发布年份 | 主要特性 | 影响 |
|------|----------|----------|------|
| Java 8 | 2014 | Lambda, Stream, Optional, 新日期时间API | 革命性变化，现代化 Java |
| Java 9 | 2017 | 模块系统、JShell、不可变集合 | 平稳演进，基础改进 |
| Java 10 | 2018 | var 局部变量类型推断 | 代码简洁性提升 |
| Java 11 | 2019 | HTTP 客户端、新的字符串方法、集合工厂 | LTS 版本，重要功能 |
| Java 12 | 2019 | Switch 表达式（预览）、Records（预览） | 语法简化预览 |
| Java 13 | 2020 | Switch 表达式（预览改进）、Text Blocks（预览） | 语法继续优化 |
| Java 14 | 2020 | instanceof 模式匹配、Switch 表达式（预览） | 模式匹配开始 |
| Java 15 | 2020 | Text Blocks（预览）、Records（预览） | 文本块引入预览 |
| Java 16 | 2021 | Records（正式）、Sealed Classes（预览） | Records 正式发布 |
| Java 17 | 2021 | Sealed Classes（正式）、ZGC 改进 | LTS 版本，重要特性 |
| Java 18 | 2022 | Switch 表达式（正式）、虚拟线程（预览） | Switch 表达式正式 |
| Java 19 | 2022 | 虚拟线程（预览）、Record 模式匹配（预览） | 虚拟线程预览 |
| Java 20 | 2023 | 虚拟线程（第二次预览）、Pattern Matching（预览） | 继续完善预览特性 |
| Java 21 | 2023 | Pattern Matching for Switch（正式） | LTS 版本，模式匹配正式 |
| Java 22 | 2024 | 继续改进 | 轻量级发布 |
| Java 23+ | 2025+ | 更多新特性 | 持续演进 |

## 迁移指南

### 从 Java 8 迁移到 Java 11
```java
// 1. 使用新的字符串方法
// Java 8
if (name != null && !name.trim().isEmpty()) {
    // 处理逻辑
}

// Java 11
if (!name.isBlank()) {
    // 处理逻辑
}

// 2. 使用 HTTP 客户端
// Java 8 - 需要第三方库
HttpClient httpClient = HttpClientBuilder.create().build();
HttpGet request = new HttpGet("https://api.example.com");
HttpResponse response = httpClient.execute(request);

// Java 11 - 内置支持
HttpClient client = HttpClient.newHttpClient();
HttpRequest httpRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com"))
    .build();
HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

// 3. 使用集合工厂方法
// Java 8
List<String> list = Collections.unmodifiableList(Arrays.asList("A", "B", "C"));

// Java 11
List<String> list2 = List.of("A", "B", "C");
```

### 从 Java 11 迁移到 Java 17
```java
// 1. 使用 Sealed Classes
// Java 11 - 普通类
public class Shape {
    // 所有类都可以继承
}

// Java 17 - Sealed Classes
public sealed class Shape permits Circle, Rectangle, Triangle {
    // 只有 permits 的类可以继承
}

// 2. 使用新的日期时间 API 改进
// Java 11
LocalDate today = LocalDate.now();
LocalDate nextWeek = today.plus(1, ChronoUnit.WEEKS);

// Java 17
TemporalAdjuster nextWeek = TemporalAdjusters.ofDateAdjuster(
    date -> date.plusWeeks(1)
);
LocalDate nextWeekDate = today.with(nextWeek);
```

### 从 Java 17 迁移到 Java 21
```java
// 1. 使用虚拟线程
// Java 17 - 平台线程
ExecutorService executor = Executors.newFixedThreadPool(100);
for (int i = 0; i < 10000; i++) {
    executor.submit(() -> {
        // 处理任务
    });
}

// Java 21 - 虚拟线程
ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();
for (int i = 0; i < 10000; i++) {
    virtualExecutor.submit(() -> {
        // 处理任务
    });
}

// 2. 使用模式匹配
// Java 17
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// Java 21
if (obj instanceof String s) {
    System.out.println(s.length());
}
```

## 实际应用场景

### 场景1：Web API 开发
```java
// 使用 Java 11+ 的 HTTP 客户端
public class ApiService {
    private final HttpClient httpClient = HttpClient.newHttpClient();
    
    public User getUser(String userId) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.example.com/users/" + userId))
            .header("Accept", "application/json")
            .build();
        
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() == 200) {
            return parseJson(response.body());
        } else {
            throw new RuntimeException("Failed to get user: " + response.statusCode());
        }
    }
    
    public List<User> searchUsers(String query) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.example.com/users?query=" + query))
            .build();
        
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() == 200) {
            return parseJsonArray(response.body());
        } else {
            return Collections.emptyList();
        }
    }
}
```

### 场景2：数据处理
```java
// 使用 Stream API 和模式匹配进行数据处理
public class DataProcessor {
    public static void processData(List<Object> data) {
        // 使用 Stream API 处理数据
        Map<String, Long> typeCounts = data.stream()
            .collect(Collectors.groupingBy(
                obj -> obj.getClass().getSimpleName(),
                Collectors.counting()
            ));
        
        System.out.println("Type counts: " + typeCounts);
        
        // 使用模式匹配处理不同类型
        data.forEach(obj -> {
            switch (obj) {
                case String s when s.length() > 10 ->
                    System.out.println("Long string: " + s.substring(0, 10) + "...");
                case String s ->
                    System.out.println("String: " + s);
                case Integer i when i > 100 ->
                    System.out.println("Large number: " + i);
                case Integer i ->
                    System.out.println("Number: " + i);
                case List<?> list ->
                    System.out.println("List with " + list.size() + " items");
                default ->
                    System.out.println("Unknown type: " + obj.getClass().getSimpleName());
            }
        });
    }
}
```

### 场景3：并发编程
```java
// 使用虚拟线程进行高并发处理
public class ConcurrentProcessor {
    public void processRequests(List<Request> requests) {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<Response>> futures = requests.stream()
                .map(request -> executor.submit(() -> processRequest(request)))
                .collect(Collectors.toList());
            
            for (Future<Response> future : futures) {
                try {
                    Response response = future.get();
                    System.out.println("Processed: " + response);
                } catch (Exception e) {
                    System.err.println("Error processing request: " + e.getMessage());
                }
            }
        }
    }
    
    private Response processRequest(Request request) {
        // 模拟耗时操作
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return new Response(request.getId(), "Processed");
    }
}
```

## 最佳实践

### 1. 版本选择策略
```java
// 根据项目需求选择 Java 版本
// 新项目：建议使用 LTS 版本（如 Java 17、Java 21）
// 现有项目：逐步升级到 LTS 版本
// 遗留系统：保持稳定，谨慎升级

// 版本特性检查
if (Runtime.version().feature() >= 21) {
    // 使用 Java 21+ 特性
    useVirtualThreads();
    usePatternMatching();
} else if (Runtime.version().feature() >= 17) {
    // 使用 Java 17 特性
    useSealedClasses();
} else if (Runtime.version().feature() >= 11) {
    // 使用 Java 11 特性
    useHttpClient();
} else {
    // 使用 Java 8 特性
    useJava8Features();
}
```

### 2. 代码兼容性
```java
// 使用特性标记保持兼容性
@Target({ElementType.METHOD, ElementType.CONSTRUCTOR})
@Retention(RetentionPolicy.SOURCE)
public @interface SinceJava {
    int value();
}

@SinceJava(11)
public void useNewFeature() {
    // Java 11+ 特性
    var list = List.of("A", "B", "C");
}

@SinceJava(21)
public void useJava21Feature() {
    // Java 21+ 特性
    if (obj instanceof String s) {
        System.out.println(s.length());
    }
}

// 编译时检查
public void checkCompatibility() {
    int javaVersion = Runtime.version().feature();
    if (javaVersion < 11) {
        throw new UnsupportedOperationException("This feature requires Java 11+");
    }
}
```

### 3. 性能优化
```java
// 根据版本选择最优实现
public class OptimizedProcessor {
    public void process(List<String> data) {
        if (Runtime.version().feature() >= 21) {
            // 使用虚拟线程
            processWithVirtualThreads(data);
        } else {
            // 使用传统线程池
            processWithPlatformThreads(data);
        }
    }
    
    private void processWithVirtualThreads(List<String> data) {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            data.parallelStream()
                .forEach(item -> executor.submit(() -> processItem(item)));
        }
    }
    
    private void processWithPlatformThreads(List<String> data) {
        ExecutorService executor = Executors.newFixedThreadPool(
            Math.min(data.size(), Runtime.getRuntime().availableProcessors())
        );
        data.forEach(item -> executor.submit(() -> processItem(item)));
        executor.shutdown();
    }
    
    private void processItem(String item) {
        // 处理单个项目
        try {
            Thread.sleep(100); // 模拟处理时间
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 4. 测试策略
```java
// 版本特定的测试
public class FeatureTest {
    @Test
    public void testJava11Features() {
        // 测试 Java 11 特性
        String json = "{\"name\":\"Alice\"}";
        Map<String, Object> map = Map.of("key", "value");
        List<String> immutableList = List.of("A", "B", "C");
        
        assertEquals("Alice", map.get("name"));
        assertTrue(immutableList.contains("A"));
    }
    
    @Test
    @EnabledOnJava(min = JavaVersion.JAVA_17)
    public void testJava17Features() {
        // 测试 Java 17 特性
        sealed class Shape permits Circle, Rectangle {
            abstract double area();
        }
        
        Circle circle = new Circle(5.0);
        assertTrue(circle.area() > 0);
    }
    
    @Test
    @EnabledOnJava(min = JavaVersion.JAVA_21)
    public void testJava21Features() {
        // 测试 Java 21 特性
        Object obj = "Hello";
        String result = switch (obj) {
            case String s -> "String: " + s;
            default -> "Other";
        };
        
        assertEquals("String: Hello", result);
    }
}
```

## 面试高频题

**Q1：Java 8 最重要的新特性是什么？**
A：
- Lambda 表达式：提供函数式编程支持
- Stream API：简化集合操作和并行处理
- Optional 类：优雅处理空值
- 新日期时间 API：解决原有日期时间类的线程安全问题
- CompletableFuture：改进异步编程

**Q2：var 关键字有什么限制？**
A：
- 只能用于局部变量
- 不能用于字段、方法参数、方法返回类型
- 必须初始化
- 不能用于 null 初始化（除非有类型推断）
- 不能用于数组初始化（如 var arr = {1, 2, 3} 编译错误）

**Q3：Record 类和普通类的区别？**
A：
- Record 自动生成 equals, hashCode, toString, getter 方法
- Record 的字段是 final 的
- Record 不能扩展其他类（但可以实现接口）
- Record 适合作为简单的数据载体（DTO）
- Record 比 Lombok @Data 注解更简洁，但功能更少

**Q4：虚拟线程和平台线程的区别？**
A：
- 虚拟线程是轻量级的，由 JVM 管理
- 平台线程是 OS 线程，重量级，数量有限
- 虚拟线程可以创建数百万个，平台线程通常几千个
- 虚拟线程适合 IO 密集型任务，平台线程适合 CPU 密集型任务
- 虚拟线程使用 Project Loom 技术实现

**Q5：模式匹配的好处是什么？**
A：
- 减少 instanceof 和类型转换的样板代码
- 提高代码可读性和安全性
- 支持 null 检查和类型检查
- 可以在 switch 表达式中使用
- 支持嵌套模式匹配和条件守卫

## 延伸阅读

- 上一篇：[Lambda 与 Stream](./lambda-stream.md)
- 下一篇：[异常处理](./exception.md)