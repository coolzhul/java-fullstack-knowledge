---
title: Lambda 与 Stream 函数式编程
icon: code
order: 7
category:
  - Java
tag:
  - Java基础
  - 函数式编程
  - Stream
  - Lambda
---

# Lambda 与 Stream 函数式编程

> Lambda 表达式和 Stream API 是 Java 8 引入的两个革命性特性，它们彻底改变了 Java 编程的方式。让代码更简洁、更函数化、更易于并行处理。

## 基础入门：Lambda 表达式

### 核心概念
Lambda 表达式是 Java 8 引入的最重要的特性之一，它允许我们将函数作为方法参数，或者将代码作为数据来处理。

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

// 函数式接口示例
Function<String, Integer> strLength = s -> s.length();
Predicate<String> isEmpty = s -> s.isEmpty();
Consumer<String> print = s -> System.out.println(s);
```

### 函数式接口详解

#### Consumer<T> - 消费者
```java
// 消费一个参数，无返回值
Consumer<String> printConsumer = s -> System.out.println("消费: " + s);
printConsumer.accept("Hello Lambda");
```

#### Supplier<T> - 供给者
```java
// 无参数，返回一个值
Supplier<String> helloSupplier = () -> "Hello from Supplier";
System.out.println(helloSupplier.get());
```

#### Function<T,R> - 函数
```java
// 一个参数，返回一个值
Function<String, Integer> lengthFunc = String::length;
Function<String, String> upperFunc = String::toUpperCase;
```

#### Predicate<T> - 断言
```java
// 一个参数，返回布尔值
Predicate<String> nonEmpty = s -> !s.isEmpty();
Predicate<String> longString = s -> s.length() > 5;
```

### Lambda 表达式语法

```java
// 无参数，无返回值
() -> System.out.println("Hello")

// 单参数，可省略括号
x -> x * 2

// 多参数，必须有括号
(x, y) -> x + y

// 代码块，需要return
(x, y) -> {
    int sum = x + y;
    return sum;
}

// 方法引用
String::length       // 等价于 s -> s.length()
String::toUpperCase  // 等价于 s -> s.toUpperCase()
System.out::println   // 等价于 s -> System.out.println(s)
```

## Stream API 基础

### Stream 是什么
Stream 是 Java 8 引入的新抽象，表示一个元素序列，支持链式操作和聚合操作。

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Eve");

// Stream 操作示例
List<String> result = names.stream()
    .filter(name -> name.length() > 3)        // 过滤
    .map(String::toUpperCase)                 // 转换
    .sorted()                                // 排序
    .collect(Collectors.toList());            // 收集

// 结果: [ALICE, CHARLIE, DAVID]
```

### Stream 的创建方式

```java
// 1. 集合.stream()
List<String> list = Arrays.asList("A", "B", "C");
Stream<String> stream1 = list.stream();

// 2. 数组.stream()
String[] array = {"A", "B", "C"};
Stream<String> stream2 = Arrays.stream(array);

// 3. Stream.of()
Stream<String> stream3 = Stream.of("A", "B", "C");

// 4. Stream.iterate()
Stream<Integer> numbers = Stream.iterate(1, n -> n + 1);

// 5. Stream.generate()
Stream<Double> random = Stream.generate(Math::random);
```

### Stream 的操作类型

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 中间操作（Intermediate Operations）
Stream<Integer> filtered = numbers.stream()
    .filter(n -> n % 2 == 0);      // 过滤偶数

Stream<Integer> mapped = filtered
    .map(n -> n * n);              // 平方

// 终止操作（Terminal Operations）
List<Integer> result = mapped
    .collect(Collectors.toList()); // 收集结果

System.out.println(result); // [4, 16, 36, 64, 100]
```

## Stream 中间操作

### filter() - 过滤
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Eve");

// 过滤长度大于4的名字
List<String> longNames = names.stream()
    .filter(name -> name.length() > 4)
    .collect(Collectors.toList());

// 多条件过滤
List<String> filteredNames = names.stream()
    .filter(name -> name.length() > 3 && name.startsWith("A"))
    .collect(Collectors.toList());
```

### map() - 转换
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

// 转换为大写
List<String> upperNames = names.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// 转换为长度
List<Integer> nameLengths = names.stream()
    .map(String::length)
    .collect(Collectors.toList());

// 自定义转换
List<String> greetingNames = names.stream()
    .map(name -> "Hello, " + name)
    .collect(Collectors.toList());
```

### flatMap() - 扁平化映射
```java
List<List<String>> listOfLists = Arrays.asList(
    Arrays.asList("A", "B"),
    Arrays.asList("C", "D"),
    Arrays.asList("E", "F")
);

// 将List<List<String>>转换为List<String>
List<String> flattened = listOfLists.stream()
    .flatMap(List::stream)
    .collect(Collectors.toList());

// 实际应用：处理每个单词的字母
List<String> words = Arrays.asList("Hello", "World");

List<String> letters = words.stream()
    .flatMap(word -> word.chars().mapToObj(c -> String.valueOf((char)c)))
    .collect(Collectors.toList());
```

### distinct() - 去重
```java
List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 4, 4, 5, 5);

List<Integer> uniqueNumbers = numbers.stream()
    .distinct()
    .collect(Collectors.toList());

// 结果: [1, 2, 3, 4, 5]
```

### sorted() - 排序
```java
List<String> names = Arrays.asList("Charlie", "Alice", "Eve", "Bob");

// 自然排序
List<String> naturalSorted = names.stream()
    .sorted()
    .collect(Collectors.toList());

// 自定义排序
List<String> customSorted = names.stream()
    .sorted((a, b) -> b.compareTo(a))  // 逆序
    .collect(Collectors.toList());

// 按长度排序
List<String> lengthSorted = names.stream()
    .sorted(Comparator.comparing(String::length))
    .collect(Collectors.toList());
```

### limit() 和 skip() - 限制和跳过
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 限制前5个
List<Integer> limited = numbers.stream()
    .limit(5)
    .collect(Collectors.toList());

// 跳过前3个
List<Integer> skipped = numbers.stream()
    .skip(3)
    .collect(Collectors.toList());

// 组合使用：跳过前3个，取接下来的2个
List<Integer> subset = numbers.stream()
    .skip(3)
    .limit(2)
    .collect(Collectors.toList());
```

### peek() - 调试
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

List<String> result = names.stream()
    .peek(name -> System.out.println("Processing: " + name))
    .filter(name -> name.length() > 3)
    .peek(name -> System.out.println("Filtered: " + name))
    .collect(Collectors.toList());
```

## Stream 终止操作

### collect() - 收集
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

// 收集到List
List<String> nameList = names.stream().collect(Collectors.toList());

// 收集到Set
Set<String> nameSet = names.stream().collect(Collectors.toSet());

// 收集到特定集合
LinkedHashSet<String> linkedSet = names.stream()
    .collect(Collectors.toCollection(LinkedHashSet::new));

// 收集到Map
Map<String, Integer> nameLengthMap = names.stream()
    .collect(Collectors.toMap(
        Function.identity(),
        String::length
    ));

// 分组收集
Map<Character, List<String>> groupedByName = names.stream()
    .collect(Collectors.groupingBy(name -> name.charAt(0)));
```

### forEach() - 遍历
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

// 顺序遍历
names.stream()
    .forEach(name -> System.out.println(name));

// 并行遍历
names.parallelStream()
    .forEach(name -> System.out.println(name));

// 并行遍历（保证处理顺序）
names.parallelStream()
    .forEachOrdered(name -> System.out.println(name));
```

### reduce() - 归约
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 求和
Optional<Integer> sum = numbers.stream()
    .reduce(Integer::sum);

// 求积
Optional<Integer> product = numbers.stream()
    .reduce((a, b) -> a * b);

// 带初始值的归约
int sumWithDefault = numbers.stream()
    .reduce(0, Integer::sum);

// 字符串拼接
String concatenated = names.stream()
    .reduce("", (acc, name) -> acc + name);
```

### count() - 计数
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

long count = names.stream()
    .count();

// 条件计数
long longNameCount = names.stream()
    .filter(name -> name.length() > 3)
    .count();
```

### anyMatch(), allMatch(), noneMatch() - 匹配
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

// 任意匹配
boolean hasLongName = names.stream()
    .anyMatch(name -> name.length() > 4);

// 全部匹配
boolean allLongNames = names.stream()
    .allMatch(name -> name.length() > 2);

// 无匹配
boolean noEmptyNames = names.stream()
    .noneMatch(String::isEmpty);
```

### findFirst(), findAny() - 查找
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

// 查找第一个
Optional<String> first = names.stream()
    .findFirst();

// 查找任意一个（并行流更有效）
Optional<String> any = names.stream()
    .findAny();

// 条件查找
Optional<String> longName = names.stream()
    .filter(name -> name.length() > 4)
    .findFirst();
```

## 高级 Stream 操作

### 自定义收集器
```java
// 自定义收集器：收集到自定义集合
public class CustomCollector {
    public static <T> Collector<T, ?, List<T>> toCustomList() {
        return Collectors.toList();
    }
}

List<String> customList = names.stream()
    .collect(CustomCollector.toCustomList());

// 自定义收集器：统计
public class Statistics {
    private long count;
    private double sum;
    private double min = Double.MAX_VALUE;
    private double max = Double.MIN_VALUE;
    
    // 添加方法
    public void accept(double value) {
        count++;
        sum += value;
        min = Math.min(min, value);
        max = Math.max(max, value);
    }
    
    // 合并方法
    public Statistics combine(Statistics other) {
        count += other.count;
        sum += other.sum;
        min = Math.min(min, other.min);
        max = Math.max(max, other.max);
        return this;
    }
    
    // 获取结果
    public double getAverage() {
        return count == 0 ? 0 : sum / count;
    }
}

DoubleStatistics stats = numbers.stream()
    .collect(Collectors.collectingAndThen(
        Collectors.summarizingDouble(Double::doubleValue),
        s -> new DoubleStatistics(s.getCount(), s.getSum(), s.getMin(), s.getMax(), s.getAverage())
    ));
```

### 复杂的聚合操作
```java
List<Person> people = Arrays.asList(
    new Person("Alice", 25, "Engineer"),
    new Person("Bob", 30, "Designer"),
    new Person("Charlie", 25, "Engineer"),
    new Person("David", 35, "Manager")
);

// 分组并统计
Map<String, Long> jobCount = people.stream()
    .collect(Collectors.groupingBy(
        Person::getJob,
        Collectors.counting()
    ));

// 分组并计算平均年龄
Map<String, Double> avgAgeByJob = people.stream()
    .collect(Collectors.groupingBy(
        Person::getJob,
        Collectors.averagingDouble(Person::getAge)
    ));

// 多级分组
Map<String, Map<Integer, List<Person>>> peopleByJobAndAge = people.stream()
    .collect(Collectors.groupingBy(
        Person::getJob,
        Collectors.groupingBy(Person::getAge)
    ));

// 分组到自定义类型
Map<String, List<String>> namesByJob = people.stream()
    .collect(Collectors.groupingBy(
        Person::getJob,
        Collectors.mapping(Person::getName, Collectors.toList())
    ));
```

### 收集到不可变集合
```java
List<String> immutableList = names.stream()
    .collect(Collectors.collectingAndThen(
        Collectors.toList(),
        Collections::unmodifiableList
    ));

Set<String> immutableSet = names.stream()
    .collect(Collectors.collectingAndThen(
        Collectors.toSet(),
        Collections::unmodifiableSet
    ));

Map<String, Integer> immutableMap = names.stream()
    .collect(Collectors.collectingAndThen(
        Collectors.toMap(
            Function.identity(),
            String::length
        ),
        Collections::unmodifiableMap
    ));
```

## 并行流处理

### parallelStream() 基础
```java
List<Integer> numbers = IntStream.range(1, 1000000).boxed().collect(Collectors.toList());

// 顺序流
long sequentialSum = numbers.stream()
    .mapToInt(Integer::intValue)
    .sum();

// 并行流
long parallelSum = numbers.parallelStream()
    .mapToInt(Integer::intValue)
    .sum();

System.out.println("Sequential: " + sequentialSum);
System.out.println("Parallel: " + parallelSum);
```

### 并行流性能对比
```java
import java.util.concurrent.TimeUnit;

public class ParallelStreamPerformance {
    public static void main(String[] args) {
        List<Integer> largeList = IntStream.range(1, 10000000).boxed().collect(Collectors.toList());
        
        // 顺序流性能测试
        long startTime = System.nanoTime();
        long sequentialResult = largeList.stream()
            .mapToInt(Integer::intValue)
            .sum();
        long sequentialTime = System.nanoTime() - startTime;
        
        // 并行流性能测试
        startTime = System.nanoTime();
        long parallelResult = largeList.parallelStream()
            .mapToInt(Integer::intValue)
            .sum();
        long parallelTime = System.nanoTime() - startTime;
        
        System.out.println("Sequential result: " + sequentialResult);
        System.out.println("Sequential time: " + TimeUnit.NANOSECONDS.toMillis(sequentialTime) + "ms");
        
        System.out.println("Parallel result: " + parallelResult);
        System.out.println("Parallel time: " + TimeUnit.NANOSECONDS.toMillis(parallelTime) + "ms");
        
        System.out.println("Speedup: " + (double)sequentialTime / parallelTime + "x");
    }
}
```

### 并行流的注意事项
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 并行流的操作顺序可能不确定
List<Integer> parallelResult = numbers.parallelStream()
    .map(n -> n * 2)
    .collect(Collectors.toList());

// 如果需要保持顺序，使用forEachOrdered
List<Integer> orderedResult = numbers.parallelStream()
    .map(n -> n * 2)
    .collect(Collectors.toList());
```

## Stream 与 Optional

### Optional 基础
```java
import java.util.Optional;

// 创建Optional
Optional<String> empty = Optional.empty();
Optional<String> nullable = Optional.ofNullable(null);
Optional<String> nonNull = Optional.of("Hello");

// 检查值是否存在
if (nonNull.isPresent()) {
    System.out.println(nonNull.get());
}

// 安全获取值
String value = nonNull.orElse("Default");
String value2 = nonNull.orElseGet(() -> "Default");
String value3 = nonNull.orElseThrow(() -> new RuntimeException("Value not found"));

// 转换
Optional<Integer> length = nonNull.map(String::length);
Optional<String> upper = nonNull.map(String::toUpperCase);

// 链式调用
Optional<String> processed = nonNull
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .filter(s -> s.startsWith("H"));
```

### Optional 与 Stream 结合
```java
List<Optional<String>> optionalList = Arrays.asList(
    Optional.of("Hello"),
    Optional.empty(),
    Optional.of("World"),
    Optional.empty()
);

// 过滤掉空的Optional
List<String> values = optionalList.stream()
    .filter(Optional::isPresent)
    .map(Optional::get)
    .collect(Collectors.toList());

// 使用flatMap展平Optional
List<String> flatValues = optionalList.stream()
    .flatMap(Optional::stream)
    .collect(Collectors.toList());

// 从Stream创建Optional
Optional<List<String>> firstNonEmpty = optionalList.stream()
    .filter(Optional::isPresent)
    .map(Optional::get)
    .findFirst();
```

## 实际应用场景

### 数据处理流水线
```java
public class DataProcessor {
    public static void main(String[] args) {
        List<User> users = Arrays.asList(
            new User("Alice", 25, "Engineer", "alice@example.com"),
            new User("Bob", 30, "Designer", "bob@example.com"),
            new User("Charlie", 25, "Engineer", "charlie@example.com"),
            new User("David", 35, "Manager", "david@example.com"),
            new User("Eve", 28, "Designer", null)
        );

        // 处理流水线：过滤、转换、分组、统计
        Map<String, Long> jobStats = users.stream()
            .filter(user -> user.getEmail() != null)           // 过滤掉邮箱为空的用户
            .filter(user -> user.getAge() > 25)                // 只保留25岁以上的用户
            .collect(Collectors.groupingBy(
                User::getJob,                                   // 按职位分组
                Collectors.counting()                           // 统计数量
            ));

        // 计算平均年龄
        double averageAge = users.stream()
            .filter(user -> user.getEmail() != null)
            .mapToInt(User::getAge)
            .average()
            .orElse(0.0);

        // 获取最年轻的用户
        Optional<User> youngest = users.stream()
            .filter(user -> user.getEmail() != null)
            .min(Comparator.comparing(User::getAge));

        // 生成报告
        System.out.println("Job statistics: " + jobStats);
        System.out.println("Average age: " + averageAge);
        youngest.ifPresent(user -> 
            System.out.println("Youngest user: " + user.getName())
        );
    }
}
```

### 日志处理示例
```java
public class LogProcessor {
    public static void main(String[] args) {
        List<String> logs = Arrays.asList(
            "2024-01-01 10:00:00 INFO User logged in",
            "2024-01-01 10:01:00 ERROR Database connection failed",
            "2024-01-01 10:02:00 INFO User logged out",
            "2024-01-01 10:03:00 WARN Memory usage high",
            "2024-01-01 10:04:00 ERROR Network timeout",
            "2024-01-01 10:05:00 INFO User logged in"
        );

        // 分析日志级别分布
        Map<String, Long> levelCounts = logs.stream()
            .map(log -> log.split(" ")[2])                     // 提取日志级别
            .collect(Collectors.groupingBy(
                level -> level,
                Collectors.counting()
            ));

        // 统计错误日志数量
        long errorCount = logs.stream()
            .filter(log -> log.contains("ERROR"))
            .count();

        // 获取最近的5个INFO日志
        List<String> recentInfoLogs = logs.stream()
            .filter(log -> log.contains("INFO"))
            .limit(5)
            .collect(Collectors.toList());

        System.out.println("Log level counts: " + levelCounts);
        System.out.println("Error count: " + errorCount);
        System.out.println("Recent INFO logs: " + recentInfoLogs);
    }
}
```

### 文件处理示例
```java
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Stream;

public class FileProcessor {
    public static void main(String[] args) throws Exception {
        // 处理文本文件
        try (Stream<String> lines = Files.lines(Paths.get("input.txt"))) {
            
            // 统计行数
            long lineCount = lines.count();
            
            // 处理文件内容
            try (Stream<String> lines2 = Files.lines(Paths.get("input.txt"))) {
                // 过滤空行
                List<String> nonEmptyLines = lines2
                    .filter(line -> !line.trim().isEmpty())
                    .collect(Collectors.toList());
                
                // 统计每行的单词数
                Map<Integer, Long> wordCountByLine = nonEmptyLines.stream()
                    .collect(Collectors.groupingBy(
                        line -> line.split("\\s+").length,
                        Collectors.counting()
                    ));
                
                System.out.println("Total lines: " + lineCount);
                System.out.println("Non-empty lines: " + nonEmptyLines.size());
                System.out.println("Word count distribution: " + wordCountByLine);
            }
        }
    }
}
```

## 性能优化与最佳实践

### Stream 性能优化
```java
List<Integer> numbers = IntStream.range(1, 1000000).boxed().collect(Collectors.toList());

// 错误示例：在中间操作中使用复杂计算
// 性能较差，因为每个元素都要执行复杂计算
List<Integer> result1 = numbers.stream()
    .filter(n -> {
        // 复杂计算
        boolean isPrime = true;
        for (int i = 2; i <= Math.sqrt(n); i++) {
            if (n % i == 0) {
                isPrime = false;
                break;
            }
        }
        return isPrime;
    })
    .collect(Collectors.toList());

// 优化：使用并行流
List<Integer> result2 = numbers.parallelStream()
    .filter(n -> {
        // 复杂计算
        boolean isPrime = true;
        for (int i = 2; i <= Math.sqrt(n); i++) {
            if (n % i == 0) {
                isPrime = false;
                break;
            }
        }
        return isPrime;
    })
    .collect(Collectors.toList());

// 优化：使用预计算的数据结构
Set<Integer> smallNumbers = new HashSet<>(Arrays.asList(2, 3, 5, 7, 11, 13, 17, 19, 23, 29));
List<Integer> result3 = numbers.stream()
    .filter(smallNumbers::contains)
    .collect(Collectors.toList());
```

### 避免的常见陷阱
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Eve");

// 陷阱1：在filter中使用外部变量（可能导致问题）
List<String> filtered1 = names.stream()
    .filter(name -> {
        // 使用外部变量可能导致问题
        String prefix = "A";
        return name.startsWith(prefix);
    })
    .collect(Collectors.toList());

// 正确做法：避免依赖外部状态
List<String> filtered2 = names.stream()
    .filter(name -> name.startsWith("A"))
    .collect(Collectors.toList());

// 陷阱2：在流中修改集合
List<String> result = new ArrayList<>(names);
result.stream()
    .filter(name -> name.length() > 3)
    .forEach(name -> result.add(name + " Modified")); // 错误：在遍历中修改集合

// 正确做法：避免在流中修改源集合
List<String> modified = names.stream()
    .filter(name -> name.length() > 3)
    .map(name -> name + " Modified")
    .collect(Collectors.toList());
```

### 内存优化
```java
// 错误示例：创建大中间集合
List<Integer> largeList = IntStream.range(0, 1000000).boxed().collect(Collectors.toList());
List<Integer> squared1 = largeList.stream()
    .map(n -> n * n)
    .collect(Collectors.toList()); // 创建中间大集合

// 优化：使用链式操作，避免中间集合
List<Integer> squared2 = IntStream.range(0, 1000000)
    .map(n -> n * n)
    .boxed()
    .collect(Collectors.toList());

// 进一步优化：使用原生类型流
int[] squared3 = IntStream.range(0, 1000000)
    .map(n -> n * n)
    .toArray();
```

## Stream API 与传统循环对比

### 代码可读性对比
```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Eve");

// 传统循环
List<String> traditionalResult = new ArrayList<>();
for (String name : names) {
    if (name.length() > 3) {
        String upperName = name.toUpperCase();
        traditionalResult.add(upperName);
    }
}

// Stream API
List<String> streamResult = names.stream()
    .filter(name -> name.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// 对比结论：Stream API 更简洁，更声明式
```

### 性能对比
```java
List<Integer> numbers = IntStream.range(0, 1000000).boxed().collect(Collectors.toList());

// 传统循环
long traditionalStart = System.nanoTime();
long traditionalSum = 0;
for (int num : numbers) {
    if (num % 2 == 0) {
        traditionalSum += num * num;
    }
}
long traditionalTime = System.nanoTime() - traditionalStart;

// Stream API
long streamStart = System.nanoTime();
long streamSum = numbers.stream()
    .filter(n -> n % 2 == 0)
    .mapToLong(n -> n * n)
    .sum();
long streamTime = System.nanoTime() - streamStart;

// 并行流
long parallelStart = System.nanoTime();
long parallelSum = numbers.parallelStream()
    .filter(n -> n % 2 == 0)
    .mapToLong(n -> n * n)
    .sum();
long parallelTime = System.nanoTime() - parallelStart;

System.out.println("Traditional: " + traditionalTime + "ns");
System.out.println("Stream: " + streamTime + "ns");
System.out.println("Parallel: " + parallelTime + "ns");
```

## 面试高频题

**Q1：Lambda 表达式和匿名内部类的区别是什么？**

**简要回答：** Lambda 表达式是匿名内部类的语法糖，编译器会根据目标类型自动推断。Lambda 不能访问局部变量（只能访问 final 或 effectively final 变量），而匿名内部类可以访问 final 变量。

**深度分析：**

```java
// 匿名内部类
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello from anonymous class");
    }
};

// Lambda 表达式（语法糖）
Runnable r2 = () -> System.out.println("Hello from lambda");

// 区别1：变量访问
final String message = "Hello";
Runnable r3 = () -> System.out.println(message); // 可以访问

String message2 = "Hello";
Runnable r4 = new Runnable() {
    @Override
    public void run() {
        System.out.println(message2); // 可以访问
    }
};

// Lambda 会报错：Variable used in lambda expression should be final or effectively final
// String message3 = "Hello";
// Runnable r5 = () -> System.out.println(message3);

// 区别2：this 关键字
class Example {
    public void test() {
        Runnable r1 = new Runnable() {
            @Override
            public void run() {
                System.out.println(this); // 指向匿名内部类
            }
        };
        
        Runnable r2 = () -> System.out.println(this); // 指向 Example 实例
    }
}
```

::: danger 面试追问
1. Lambda 表达式会被编译成什么？
2. 函数式接口的定义是什么？
3. 方法引用和 Lambda 表达式的区别？
4. Stream API 的中间操作和终止操作有什么区别？
5. 并行流的线程池是如何配置的？
:::

**Q2：Stream API 的短路操作有哪些？它们有什么特点？**

**简要回答：** 短路操作包括 `limit()`、`skip()`、`findFirst()`、`findAny()`、`anyMatch()`、`allMatch()`、`noneMatch()`。这些操作可以在处理完部分元素后就确定结果，不需要遍历整个流。

**深度分析：**

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// limit() - 限制元素数量
List<Integer> limited = numbers.stream()
    .limit(3) // 只处理前3个元素
    .collect(Collectors.toList()); // [1, 2, 3]

// skip() - 跳过元素
List<Integer> skipped = numbers.stream()
    .skip(5) // 跳过前5个元素
    .collect(Collectors.toList()); // [6, 7, 8, 9, 10]

// findFirst() - 查找第一个元素
Optional<Integer> first = numbers.stream()
    .findFirst(); // 立即返回，不需要遍历整个流

// anyMatch() - 任意匹配
boolean hasEven = numbers.stream()
    .anyMatch(n -> n % 2 == 0); // 找到第一个偶数就返回true

// allMatch() - 全部匹配
boolean allPositive = numbers.stream()
    .allMatch(n -> n > 0); // 遇到第一个非正数就返回false

// noneMatch() - 无匹配
boolean noNegative = numbers.stream()
    .noneMatch(n -> n < 0); // 遇到第一个负数就返回false
```

::: danger 面试追问
1. 短路操作对并行流有什么影响？
2. `findFirst()` 和 `findAny()` 在并行流中的区别？
3. 如何实现自定义的短路操作？
4. 短路操作的性能优势体现在哪里？
5. 在什么情况下应该避免使用短路操作？
:::

**Q3：如何实现 Stream 的自定义收集器？**

**简要回答：** 通过实现 `Collector<T,A,R>` 接口，其中 T 是流元素类型，A 是累加器类型，R 是结果类型。需要实现 `supplier()`、`accumulator()`、`combiner()`、`finisher()` 和 `characteristics()` 方法。

**深度分析：**

```java
// 自定义收集器：收集字符串并统计元音数量
public class StringCollector {
    public static Collector<String, Map<String, Integer>, Map<String, Integer>> create() {
        return Collector.of(
            // supplier: 创建累加器
            HashMap::new,
            
            // accumulator: 累加操作
            (map, str) -> {
                map.put(str, str.length());
                // 统计元音
                long vowels = str.chars()
                    .filter(c -> "aeiouAEIOU".indexOf(c) != -1)
                    .count();
                map.put(str + "_vowels", (int)vowels);
            },
            
            // combiner: 合并两个累加器
            (map1, map2) -> {
                map1.putAll(map2);
                return map1;
            },
            
            // finisher: 完成操作
            Function.identity(),
            
            // characteristics: 收集器特征
            Collectors.Characteristics.IDENTITY_FINISH
        );
    }
}

// 使用自定义收集器
List<String> words = Arrays.asList("hello", "world", "java", "stream");
Map<String, Integer> result = words.stream()
    .collect(StringCollector.create());

// 另一个示例：分组并计算统计信息
public class StatisticsCollector {
    public static <T> Collector<T, ?, DoubleStatistics> statistics() {
        return Collector.of(
            Statistics::new,
            Statistics::accept,
            Statistics::combine,
            Statistics::getStatistics
        );
    }
}

// 使用统计收集器
DoubleStatistics stats = numbers.stream()
    .collect(StatisticsCollector.statistics());
```

::: danger 面试追问
1. `Collector.Characteristics` 有哪些枚举值？
2. 如何处理并发情况下的自定义收集器？
3. 自定义收集器的性能如何优化？
4. 什么情况下需要自定义收集器？
5. 如何调试自定义收集器的问题？
:::

## 总结

Lambda 和 Stream API 是 Java 8 最重要的特性之一，它们极大地提高了 Java 代码的表达能力和开发效率：

1. **Lambda 表达式**：提供了简洁的函数式编程语法
2. **Stream API**：提供了强大的集合操作能力
3. **并行流**：充分利用多核 CPU 提高性能
4. **Optional**：优雅处理可能为 null 的值

这些特性不仅让代码更简洁，也让开发者能够更好地利用函数式编程的优势。在实际开发中，合理使用 Stream API 可以显著减少样板代码，提高代码的可读性和可维护性。

## 延伸阅读

- 上一篇：[异常体系](./exception.md)
- 下一篇：[Java 新特性](./java-new-features.md)