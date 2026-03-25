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

# Java泛型与注解

## 泛型

泛型是Java 5引入的特性，提供了编译时类型安全检测机制。

### 泛型类

```java
// 泛型类定义
public class Box<T> {
    private T value;

    public void set(T value) {
        this.value = value;
    }

    public T get() {
        return value;
    }
}

// 使用
Box<String> stringBox = new Box<>();
stringBox.set("Hello");
String value = stringBox.get();

Box<Integer> intBox = new Box<>();
intBox.set(100);
Integer num = intBox.get();
```

### 泛型接口

```java
// 泛型接口
public interface Generator<T> {
    T generate();
}

// 实现类指定具体类型
public class StringGenerator implements Generator<String> {
    @Override
    public String generate() {
        return "Generated String";
    }
}

// 实现类保留泛型
public class GenericGenerator<T> implements Generator<T> {
    @Override
    public T generate() {
        return null;
    }
}
```

### 泛型方法

```java
public class GenericMethodDemo {
    // 泛型方法
    public <T> T getFirst(List<T> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        return list.get(0);
    }

    // 静态泛型方法
    public static <T> void printArray(T[] array) {
        for (T element : array) {
            System.out.println(element);
        }
    }

    // 多个类型参数
    public <K, V> void printPair(K key, V value) {
        System.out.println(key + " = " + value);
    }

    // 使用
    public static void main(String[] args) {
        GenericMethodDemo demo = new GenericMethodDemo();

        List<String> names = Arrays.asList("A", "B", "C");
        String first = demo.<String>getFirst(names);  // 显式指定类型
        String first2 = demo.getFirst(names);          // 类型推断

        Integer[] nums = {1, 2, 3};
        GenericMethodDemo.printArray(nums);

        demo.printPair("name", 100);
    }
}
```

### 类型通配符

```java
import java.util.*;

public class WildcardDemo {
    // 无界通配符 ?
    public static void printList(List<?> list) {
        for (Object item : list) {
            System.out.println(item);
        }
        // list.add("new item");  // 编译错误，不能添加（除null外）
    }

    // 上界通配符 <? extends T>
    public static double sum(List<? extends Number> list) {
        double sum = 0;
        for (Number num : list) {
            sum += num.doubleValue();
        }
        return sum;
        // list.add(10);  // 编译错误
    }

    // 下界通配符 <? super T>
    public static void addNumbers(List<? super Integer> list) {
        list.add(10);
        list.add(20);
        // Integer i = list.get(0);  // 编译错误，只能用Object接收
    }

    public static void main(String[] args) {
        // 上界通配符
        List<Integer> ints = Arrays.asList(1, 2, 3);
        List<Double> doubles = Arrays.asList(1.1, 2.2, 3.3);
        System.out.println(sum(ints));
        System.out.println(sum(doubles));

        // 下界通配符
        List<Number> numbers = new ArrayList<>();
        addNumbers(numbers);
        System.out.println(numbers);

        // PECS原则
        // Producer - Extends（生产者用extends）
        // Consumer - Super（消费者用super）
    }
}
```

### 类型擦除

```java
public class TypeErasureDemo {
    // 编译后，泛型类型被擦除为Object（或上界）

    // 原始代码
    public class Box<T> {
        private T value;
        public void set(T value) { this.value = value; }
        public T get() { return value; }
    }

    // 擦除后
    public class Box {
        private Object value;
        public void set(Object value) { this.value = value; }
        public Object get() { return value; }
    }

    // 桥接方法示例
    public class StringBox extends Box<String> {
        @Override
        public void set(String value) { super.set(value); }

        // 编译器生成的桥接方法
        public void set(Object value) { set((String) value); }
    }
}
```

### 泛型限制

```java
public class GenericRestrictions {
    // 不能用基本类型实例化泛型
    // Box<int> box;  // 编译错误
    Box<Integer> box;  // 正确

    // 运行时类型检查
    public void checkType() {
        List<String> strings = new ArrayList<>();
        List<Integer> integers = new ArrayList<>();

        // 运行时类型相同
        System.out.println(strings.getClass() == integers.getClass());  // true

        // 不能使用instanceof检查泛型类型
        // if (strings instanceof List<String>) {}  // 编译错误
        if (strings instanceof List) {}  // 正确
    }

    // 不能创建泛型数组
    // T[] array = new T[10];  // 编译错误
    @SuppressWarnings("unchecked")
    public <T> T[] createArray(Class<T> componentType, int size) {
        return (T[]) java.lang.reflect.Array.newInstance(componentType, size);
    }

    // 不能实例化类型参数
    // public <T> T create() { return new T(); }  // 编译错误
    public <T> T create(Class<T> clazz) throws Exception {
        return clazz.getDeclaredConstructor().newInstance();
    }

    // 不能重载相同擦除签名的方法
    // public void method(List<String> list) {}
    // public void method(List<Integer> list) {}  // 编译错误：方法签名冲突
}
```

## 注解

### 内置注解

```java
import java.lang.annotation.*;
import java.util.*;

public class BuiltInAnnotations {
    // @Override - 重写方法
    @Override
    public String toString() {
        return "BuiltInAnnotations";
    }

    // @Deprecated - 过时方法
    @Deprecated
    public void oldMethod() {
        System.out.println("This method is deprecated");
    }

    // @SuppressWarnings - 抑制警告
    @SuppressWarnings("unchecked")
    public void suppressWarnings() {
        List rawList = new ArrayList();
        rawList.add("item");
    }

    // @FunctionalInterface - 函数式接口
    @FunctionalInterface
    interface Calculator {
        int calculate(int a, int b);
    }

    // @SafeVarargs - 安全可变参数
    @SafeVarargs
    public final <T> void printAll(T... items) {
        for (T item : items) {
            System.out.println(item);
        }
    }
}
```

### 自定义注解

```java
import java.lang.annotation.*;

// 定义注解
@Retention(RetentionPolicy.RUNTIME)  // 运行时保留
@Target(ElementType.METHOD)          // 用于方法
public @interface MyAnnotation {
    String value() default "";

    int priority() default 0;

    String[] tags() default {};

    Class<?> type() default Object.class;
}

// 使用注解
public class AnnotationUsage {
    @MyAnnotation(value = "test", priority = 1, tags = {"a", "b"})
    public void annotatedMethod() {
        System.out.println("Annotated method");
    }

    @MyAnnotation("simple value")  // value可省略
    public void simpleAnnotation() {
    }
}
```

### 元注解

```java
import java.lang.annotation.*;

// @Retention - 保留策略
@Retention(RetentionPolicy.SOURCE)   // 源码保留（编译时丢弃）
@Retention(RetentionPolicy.CLASS)    // 字节码保留（默认）
@Retention(RetentionPolicy.RUNTIME)  // 运行时保留（反射可获取）

// @Target - 使用目标
@Target(ElementType.TYPE)        // 类、接口、枚举
@Target(ElementType.FIELD)       // 字段
@Target(ElementType.METHOD)      // 方法
@Target(ElementType.PARAMETER)   // 参数
@Target(ElementType.CONSTRUCTOR) // 构造函数
@Target(ElementType.LOCAL_VARIABLE) // 局部变量
@Target(ElementType.ANNOTATION_TYPE) // 注解类型
@Target(ElementType.PACKAGE)     // 包
@Target(ElementType.TYPE_USE)    // 类型使用（Java 8+）
@Target(ElementType.TYPE_PARAMETER) // 类型参数（Java 8+）

// @Documented - 文档化
@Documented
public @interface DocumentedAnnotation {}

// @Inherited - 继承
@Inherited
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface InheritedAnnotation {}

// @Repeatable - 可重复（Java 8+）
@Repeatable(Schedules.class)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Schedule {
    String day();
    int hour() default 0;
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Schedules {
    Schedule[] value();
}

// 使用可重复注解
public class RepeatableExample {
    @Schedule(day = "Monday", hour = 9)
    @Schedule(day = "Friday", hour = 17)
    public void doTask() {}
}
```

### 注解处理

```java
import java.lang.annotation.*;
import java.lang.reflect.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Log {
    String value() default "";
}

class AnnotationProcessor {
    public static void processAnnotations(Object obj) {
        Class<?> clazz = obj.getClass();

        // 获取类上的注解
        if (clazz.isAnnotationPresent(Deprecated.class)) {
            System.out.println("类已过时");
        }

        // 遍历方法
        for (Method method : clazz.getDeclaredMethods()) {
            // 检查是否有注解
            if (method.isAnnotationPresent(Log.class)) {
                Log log = method.getAnnotation(Log.class);
                System.out.println("方法 " + method.getName() + " 有日志注解: " + log.value());
            }

            // 获取所有注解
            Annotation[] annotations = method.getAnnotations();
            for (Annotation ann : annotations) {
                System.out.println("注解: " + ann.annotationType().getSimpleName());
            }
        }

        // 字段注解
        for (Field field : clazz.getDeclaredFields()) {
            Annotation[] fieldAnnotations = field.getAnnotations();
            // 处理字段注解...
        }
    }
}

// 示例类
class Service {
    @Log("执行任务")
    public void execute() {
        System.out.println("Executing...");
    }

    @Log
    public void process() {
        System.out.println("Processing...");
    }
}

public class AnnotationDemo {
    public static void main(String[] args) {
        AnnotationProcessor.processAnnotations(new Service());
    }
}
```

### 常用框架注解示例

```java
// Spring注解示例
@org.springframework.stereotype.Component
@org.springframework.context.annotation.Scope("prototype")
class SpringBean {
    @org.springframework.beans.factory.annotation.Autowired
    private Dependency dependency;

    @org.springframework.beans.factory.annotation.Value("${app.name}")
    private String appName;

    @org.springframework.transaction.annotation.Transactional
    public void save() {}
}

// JPA注解示例
@javax.persistence.Entity
@javax.persistence.Table(name = "users")
class User {
    @javax.persistence.Id
    @javax.persistence.GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
    private Long id;

    @javax.persistence.Column(nullable = false, length = 100)
    private String name;

    @javax.persistence.Temporal(javax.persistence.TemporalType.TIMESTAMP)
    private Date createdAt;
}

// Lombok注解示例
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class LombokExample {
    private String name;
    private int age;
}

// Jackson注解示例
class JsonExample {
    @com.fasterxml.jackson.annotation.JsonProperty("user_name")
    private String userName;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private Date birthday;
}
```

## 小结

### 泛型要点

| 概念 | 说明 |
|------|------|
| `<T>` | 类型参数 |
| `<?>` | 无界通配符 |
| `<? extends T>` | 上界通配符（只读） |
| `<? super T>` | 下界通配符（只写） |
| PECS | Producer-Extends, Consumer-Super |

### 注解要点

| 元注解 | 说明 |
|--------|------|
| @Retention | 保留策略（SOURCE/CLASS/RUNTIME） |
| @Target | 使用目标 |
| @Documented | 包含在文档中 |
| @Inherited | 子类继承 |
| @Repeatable | 可重复使用 |
