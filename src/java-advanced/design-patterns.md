---
title: 设计模式
icon: design
order: 4
category:
  - Java
tag:
  - Java
  - 设计模式
---

# Java设计模式

设计模式是软件开发中经过验证的解决方案，掌握设计模式有助于编写可维护、可扩展的代码。

## 设计模式分类

| 类型 | 模式数量 | 说明 |
|------|----------|------|
| 创建型 | 5种 | 对象创建机制 |
| 结构型 | 7种 | 对象组合方式 |
| 行为型 | 11种 | 对象通信方式 |

## 创建型模式

### 1. 单例模式

```java
// 饿汉式（线程安全）
public class EagerSingleton {
    private static final EagerSingleton INSTANCE = new EagerSingleton();

    private EagerSingleton() {}

    public static EagerSingleton getInstance() {
        return INSTANCE;
    }
}

// 懒汉式（双重检查锁）
public class LazySingleton {
    private static volatile LazySingleton instance;

    private LazySingleton() {}

    public static LazySingleton getInstance() {
        if (instance == null) {
            synchronized (LazySingleton.class) {
                if (instance == null) {
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}

// 静态内部类（推荐）
public class StaticInnerSingleton {
    private StaticInnerSingleton() {}

    private static class Holder {
        static final StaticInnerSingleton INSTANCE = new StaticInnerSingleton();
    }

    public static StaticInnerSingleton getInstance() {
        return Holder.INSTANCE;
    }
}

// 枚举（最佳实践）
public enum EnumSingleton {
    INSTANCE;

    public void doSomething() {
        System.out.println("Singleton method");
    }
}
```

### 2. 工厂模式

```java
// 简单工厂
interface Product {
    void use();
}

class ProductA implements Product {
    @Override
    public void use() {
        System.out.println("Using Product A");
    }
}

class ProductB implements Product {
    @Override
    public void use() {
        System.out.println("Using Product B");
    }
}

class SimpleFactory {
    public static Product create(String type) {
        return switch (type) {
            case "A" -> new ProductA();
            case "B" -> new ProductB();
            default -> throw new IllegalArgumentException("Unknown type");
        };
    }
}

// 工厂方法
interface Factory {
    Product create();
}

class FactoryA implements Factory {
    @Override
    public Product create() {
        return new ProductA();
    }
}

class FactoryB implements Factory {
    @Override
    public Product create() {
        return new ProductB();
    }
}

// 抽象工厂
interface AbstractFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class WindowsFactory implements AbstractFactory {
    @Override
    public Button createButton() {
        return new WindowsButton();
    }

    @Override
    public Checkbox createCheckbox() {
        return new WindowsCheckbox();
    }
}

class MacFactory implements AbstractFactory {
    @Override
    public Button createButton() {
        return new MacButton();
    }

    @Override
    public Checkbox createCheckbox() {
        return new MacCheckbox();
    }
}
```

### 3. 建造者模式

```java
public class Computer {
    private final String cpu;
    private final String ram;
    private final String storage;
    private final String gpu;

    private Computer(Builder builder) {
        this.cpu = builder.cpu;
        this.ram = builder.ram;
        this.storage = builder.storage;
        this.gpu = builder.gpu;
    }

    public static class Builder {
        private String cpu;
        private String ram;
        private String storage;
        private String gpu;

        public Builder cpu(String cpu) {
            this.cpu = cpu;
            return this;
        }

        public Builder ram(String ram) {
            this.ram = ram;
            return this;
        }

        public Builder storage(String storage) {
            this.storage = storage;
            return this;
        }

        public Builder gpu(String gpu) {
            this.gpu = gpu;
            return this;
        }

        public Computer build() {
            return new Computer(this);
        }
    }
}

// 使用
Computer computer = new Computer.Builder()
    .cpu("Intel i7")
    .ram("16GB")
    .storage("512GB SSD")
    .gpu("RTX 3080")
    .build();
```

### 4. 原型模式

```java
public class Prototype implements Cloneable {
    private String name;
    private List<String> items;

    public Prototype(String name) {
        this.name = name;
        this.items = new ArrayList<>();
    }

    // 浅拷贝
    @Override
    public Prototype clone() {
        try {
            return (Prototype) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }

    // 深拷贝
    public Prototype deepClone() {
        Prototype clone = this.clone();
        clone.items = new ArrayList<>(this.items);
        return clone;
    }
}
```

## 结构型模式

### 1. 适配器模式

```java
// 目标接口
interface Target {
    void request();
}

// 被适配者
class Adaptee {
    public void specificRequest() {
        System.out.println("Specific request");
    }
}

// 类适配器
class ClassAdapter extends Adaptee implements Target {
    @Override
    public void request() {
        specificRequest();
    }
}

// 对象适配器（推荐）
class ObjectAdapter implements Target {
    private final Adaptee adaptee;

    public ObjectAdapter(Adaptee adaptee) {
        this.adaptee = adaptee;
    }

    @Override
    public void request() {
        adaptee.specificRequest();
    }
}
```

### 2. 装饰器模式

```java
interface Coffee {
    double cost();
    String description();
}

class SimpleCoffee implements Coffee {
    @Override
    public double cost() {
        return 10;
    }

    @Override
    public String description() {
        return "Simple Coffee";
    }
}

abstract class CoffeeDecorator implements Coffee {
    protected final Coffee coffee;

    public CoffeeDecorator(Coffee coffee) {
        this.coffee = coffee;
    }
}

class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public double cost() {
        return coffee.cost() + 2;
    }

    @Override
    public String description() {
        return coffee.description() + " + Milk";
    }
}

class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public double cost() {
        return coffee.cost() + 1;
    }

    @Override
    public String description() {
        return coffee.description() + " + Sugar";
    }
}

// 使用
Coffee coffee = new SimpleCoffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
System.out.println(coffee.description() + ": $" + coffee.cost());
// Simple Coffee + Milk + Sugar: $13
```

### 3. 代理模式

```java
interface Subject {
    void request();
}

class RealSubject implements Subject {
    @Override
    public void request() {
        System.out.println("Real request");
    }
}

class Proxy implements Subject {
    private RealSubject realSubject;

    @Override
    public void request() {
        if (realSubject == null) {
            realSubject = new RealSubject();
        }
        preRequest();
        realSubject.request();
        postRequest();
    }

    private void preRequest() {
        System.out.println("Pre-processing");
    }

    private void postRequest() {
        System.out.println("Post-processing");
    }
}

// 动态代理
class DynamicProxyHandler implements InvocationHandler {
    private final Object target;

    public DynamicProxyHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("Before: " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("After: " + method.getName());
        return result;
    }
}

// 使用动态代理
Subject proxy = (Subject) Proxy.newProxyInstance(
    RealSubject.class.getClassLoader(),
    new Class<?>[]{Subject.class},
    new DynamicProxyHandler(new RealSubject())
);
proxy.request();
```

### 4. 策略模式

```java
interface Strategy {
    int execute(int a, int b);
}

class AddStrategy implements Strategy {
    @Override
    public int execute(int a, int b) {
        return a + b;
    }
}

class SubtractStrategy implements Strategy {
    @Override
    public int execute(int a, int b) {
        return a - b;
    }
}

class Context {
    private Strategy strategy;

    public void setStrategy(Strategy strategy) {
        this.strategy = strategy;
    }

    public int execute(int a, int b) {
        return strategy.execute(a, b);
    }
}

// 使用
Context context = new Context();
context.setStrategy(new AddStrategy());
System.out.println(context.execute(5, 3));  // 8

context.setStrategy(new SubtractStrategy());
System.out.println(context.execute(5, 3));  // 2
```

## 行为型模式

### 1. 观察者模式

```java
interface Observer {
    void update(String message);
}

interface Subject {
    void attach(Observer observer);
    void detach(Observer observer);
    void notifyObservers();
}

class ConcreteSubject implements Subject {
    private final List<Observer> observers = new ArrayList<>();
    private String state;

    @Override
    public void attach(Observer observer) {
        observers.add(observer);
    }

    @Override
    public void detach(Observer observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(state);
        }
    }

    public void setState(String state) {
        this.state = state;
        notifyObservers();
    }
}

class ConcreteObserver implements Observer {
    private final String name;

    public ConcreteObserver(String name) {
        this.name = name;
    }

    @Override
    public void update(String message) {
        System.out.println(name + " received: " + message);
    }
}
```

### 2. 模板方法模式

```java
abstract class DataProcessor {
    // 模板方法
    public final void process() {
        loadData();
        if (validate()) {
            processData();
            saveData();
        }
    }

    protected abstract void loadData();
    protected abstract void processData();
    protected abstract void saveData();

    // 钩子方法
    protected boolean validate() {
        return true;
    }
}

class CsvProcessor extends DataProcessor {
    @Override
    protected void loadData() {
        System.out.println("Loading CSV data");
    }

    @Override
    protected void processData() {
        System.out.println("Processing CSV data");
    }

    @Override
    protected void saveData() {
        System.out.println("Saving CSV data");
    }
}
```

### 3. 责任链模式

```java
abstract class Handler {
    protected Handler next;

    public Handler setNext(Handler next) {
        this.next = next;
        return next;
    }

    public abstract void handle(Request request);
}

class AuthHandler extends Handler {
    @Override
    public void handle(Request request) {
        if (request.isAuthenticated()) {
            System.out.println("Authentication passed");
            if (next != null) {
                next.handle(request);
            }
        } else {
            System.out.println("Authentication failed");
        }
    }
}

class AuthzHandler extends Handler {
    @Override
    public void handle(Request request) {
        if (request.isAuthorized()) {
            System.out.println("Authorization passed");
            if (next != null) {
                next.handle(request);
            }
        } else {
            System.out.println("Authorization failed");
        }
    }
}

// 使用
Handler auth = new AuthHandler();
Handler authz = new AuthzHandler();
auth.setNext(authz);
auth.handle(request);
```

## 设计模式速查表

| 模式 | 类型 | 用途 |
|------|------|------|
| 单例 | 创建型 | 全局唯一实例 |
| 工厂 | 创建型 | 创建对象 |
| 建造者 | 创建型 | 复杂对象构建 |
| 原型 | 创建型 | 对象复制 |
| 适配器 | 结构型 | 接口转换 |
| 装饰器 | 结构型 | 动态添加功能 |
| 代理 | 结构型 | 控制访问 |
| 策略 | 行为型 | 算法切换 |
| 观察者 | 行为型 | 事件通知 |
| 模板方法 | 行为型 | 算法骨架 |
| 责任链 | 行为型 | 请求处理链 |

## 小结

设计模式是软件设计的最佳实践，但不应过度使用：

1. **理解问题**：先理解问题，再选择模式
2. **适度使用**：不要为了模式而模式
3. **组合使用**：多种模式可以组合
4. **持续学习**：在实践中加深理解
