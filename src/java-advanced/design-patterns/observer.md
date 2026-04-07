---
title: 观察者 Observer
icon: design
order: 14
category:
  - Java
tag:
  - Java
  - 设计模式
---

# 观察者 Observer

> 定义对象间的一对多依赖关系，当一个对象状态改变时，所有依赖它的对象都会收到通知。

## 意图

观察者模式建立了一种"发布-订阅"机制。被观察者（主题）维护一个观察者列表，当自身状态变化时，自动通知所有观察者。观察者不需要主动轮询主题的状态变化，实现了松耦合的通信。

:::tip 通俗比喻
就像微信公众号——你关注了一个公众号（订阅），它发布新文章时你会收到推送通知。你可以随时关注或取消关注，公众号不需要知道你是谁，你也不需要知道公众号怎么运作的。

再比如追剧——你在视频平台上点"追剧"，新的一集更新时你会收到通知。平台（被观察者）发布新内容，你（观察者）收到通知，两者之间松耦合。
:::

从 GoF 的定义来看，观察者模式属于**行为型模式**，它的核心目的是：
- **实现对象间的松耦合**——被观察者不知道观察者的具体实现
- **支持广播通信**——一个通知可以同时发给多个观察者
- **运行时动态管理**——可以随时添加和移除观察者

:::warning 在 Java 中，观察者模式有两个经典实现：
1. **Java 原生**：`java.util.Observable` 和 `java.util.Observer`（Java 9 已标记为废弃，推荐自己实现）
2. **Guava EventBus**：基于注解的事件总线实现
3. **Spring Event**：Spring 框架提供的事件机制
:::

## 适用场景

- 一个对象的变化需要通知其他对象，且不知道有多少个对象需要通知时
- 一个抽象模型有两个方面，其中一方面依赖另一方面时
- 需要实现事件驱动系统时
- MVC 架构中 Model 和 View 的同步
- 消息队列、事件总线的底层实现

## UML 类图

```mermaid
classDiagram
    class "Subject" as Subject {
        <<interface>>
        +attach(Observer observer) void
        +detach(Observer observer) void
        +notifyObservers() void
    }

    class "Observer" as Observer {
        <<interface>>
        +update(Object data) void
    }

    class "ConcreteSubject" as ConcreteSubject {
        -List~Observer~ observers
        -Object state
        +attach(Observer observer) void
        +detach(Observer observer) void
        +notifyObservers() void
        +getState() Object
        +setState(Object state) void
    }

    class "ConcreteObserverA" as ConcreteObserverA {
        +update(Object data) void
    }

    class "ConcreteObserverB" as ConcreteObserverB {
        +update(Object data) void
    }

    class "ConcreteObserverC" as ConcreteObserverC {
        +update(Object data) void
    }

    Subject <|.. ConcreteSubject
    Observer <|.. ConcreteObserverA
    Observer <|.. ConcreteObserverB
    Observer <|.. ConcreteObserverC
    ConcreteSubject o-- Observer : notifies
```

## 代码示例

### ❌ 没有使用该模式的问题

```java
// 紧耦合：气象站每次更新都要手动通知所有显示器
// 每新增一个显示器都要修改 WeatherData 类
public class WeatherData {
    private float temperature;
    private float humidity;
    private float pressure;

    // 硬编码依赖——每个显示器都要在这里声明
    private CurrentConditionDisplay display1;
    private StatisticsDisplay display2;
    private ForecastDisplay display3;
    // 明天要加一个 HeatIndexDisplay？改这里
    // 后天要加一个 AirQualityDisplay？再改这里

    public WeatherData() {
        this.display1 = new CurrentConditionDisplay();
        this.display2 = new StatisticsDisplay();
        this.display3 = new ForecastDisplay();
    }

    // 数据更新时，手动逐个通知
    public void measurementsChanged() {
        float temp = getTemperature();
        float humidity = getHumidity();
        float pressure = getPressure();

        // 手动通知每一个显示器——改一个忘一个就出 bug
        display1.update(temp, humidity, pressure);
        display2.update(temp, humidity, pressure);
        display3.update(temp, humidity, pressure);
        // 新增的显示器要记得在这里加上...
    }

    // getter 方法
    public float getTemperature() { return temperature; }
    public float getHumidity() { return humidity; }
    public float getPressure() { return pressure; }

    public void setMeasurements(float temperature, float humidity, float pressure) {
        this.temperature = temperature;
        this.humidity = humidity;
        this.pressure = pressure;
        measurementsChanged();
    }
}

// 显示器类
public class CurrentConditionDisplay {
    public void update(float temp, float humidity, float pressure) {
        System.out.println("当前状况: 温度=" + temp + "℃, 湿度=" + humidity + "%");
    }
}

public class StatisticsDisplay {
    public void update(float temp, float humidity, float pressure) {
        System.out.println("统计信息: 温度=" + temp + "℃, 气压=" + pressure + "hPa");
    }
}
```

**运行结果：**

```
当前状况: 温度=25.5℃, 湿度=65.0%
统计信息: 温度=25.5℃, 气压=1013.0hPa
```

:::danger 问题总结
1. **紧耦合**：`WeatherData` 直接依赖所有显示器类
2. **违反开闭原则**：新增显示器必须修改 `WeatherData`
3. **不可动态管理**：无法在运行时添加/移除显示器
4. **通知遗漏风险**：手动通知容易漏掉某个显示器
5. **无法广播**：其他系统也想接收天气数据怎么办？
:::

### ✅ 使用该模式后的改进

```java
// ===== 观察者接口：定义统一的更新方法 =====
public interface Observer {
    // 当被观察者状态变化时，这个方法会被调用
    // 参数是被观察者传过来的数据
    void update(float temperature, float humidity, float pressure);
}

// ===== 被观察者接口：定义订阅/取消/通知的方法 =====
public interface Subject {
    void attach(Observer observer);      // 订阅
    void detach(Observer observer);      // 取消订阅
    void notifyObservers();              // 通知所有观察者
}

// ===== 具体被观察者：气象站 =====
public class WeatherData implements Subject {
    // 用 List 维护观察者列表——动态添加/删除
    private final List<Observer> observers = new ArrayList<>();
    private float temperature;
    private float humidity;
    private float pressure;

    @Override
    public void attach(Observer observer) {
        // 防止重复订阅
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }

    @Override
    public void detach(Observer observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers() {
        // 遍历通知所有观察者——新增观察者不需要改这里的代码
        for (Observer observer : observers) {
            observer.update(temperature, humidity, pressure);
        }
    }

    // 模拟气象站获取最新数据
    public void setMeasurements(float temperature, float humidity, float pressure) {
        this.temperature = temperature;
        this.humidity = humidity;
        this.pressure = pressure;
        // 数据更新后自动通知所有观察者
        notifyObservers();
    }

    // getter 方法
    public float getTemperature() { return temperature; }
    public float getHumidity() { return humidity; }
    public float getPressure() { return pressure; }
}

// ===== 具体观察者1：当前状况显示器 =====
public class CurrentConditionDisplay implements Observer {
    @Override
    public void update(float temperature, float humidity, float pressure) {
        System.out.println("【当前状况】温度=" + temperature + "℃, 湿度=" + humidity + "%, 气压=" + pressure + "hPa");
    }
}

// ===== 具体观察者2：统计显示器 =====
public class StatisticsDisplay implements Observer {
    // 统计数据需要自己维护
    private final List<Float> temperatures = new ArrayList<>();

    @Override
    public void update(float temperature, float humidity, float pressure) {
        temperatures.add(temperature);
        float avg = temperatures.stream()
            .reduce(0f, Float::sum) / temperatures.size();
        float max = temperatures.stream().max(Float::compare).orElse(0f);
        float min = temperatures.stream().min(Float::compare).orElse(0f);
        System.out.println("【统计】平均温度=" + String.format("%.1f", avg) + "℃, 最高=" + max + "℃, 最低=" + min + "℃");
    }
}

// ===== 具体观察者3：天气预报显示器 =====
public class ForecastDisplay implements Observer {
    private float lastPressure;

    @Override
    public void update(float temperature, float humidity, float pressure) {
        String trend;
        if (lastPressure == 0) {
            trend = "暂无趋势数据";
        } else if (pressure > lastPressure) {
            trend = "天气好转，气压上升";
        } else if (pressure < lastPressure) {
            trend = "天气转坏，气压下降";
        } else {
            trend = "气压稳定，天气不变";
        }
        System.out.println("【预报】" + trend);
        lastPressure = pressure;
    }
}

// ===== 使用示例 =====
public class ObserverDemo {
    public static void main(String[] args) {
        // 创建被观察者
        WeatherData weatherData = new WeatherData();

        // 创建观察者并订阅
        Observer currentDisplay = new CurrentConditionDisplay();
        Observer statsDisplay = new StatisticsDisplay();
        Observer forecastDisplay = new ForecastDisplay();

        weatherData.attach(currentDisplay);
        weatherData.attach(statsDisplay);
        weatherData.attach(forecastDisplay);

        System.out.println("=== 第一次数据更新 ===");
        weatherData.setMeasurements(25.5f, 65.0f, 1013.0f);

        System.out.println("\n=== 第二次数据更新 ===");
        weatherData.setMeasurements(27.0f, 70.0f, 1015.0f);

        // 动态取消订阅
        System.out.println("\n=== 取消统计显示器订阅 ===");
        weatherData.detach(statsDisplay);

        System.out.println("\n=== 第三次数据更新 ===");
        weatherData.setMeasurements(23.0f, 80.0f, 1010.0f);
    }
}
```

**运行结果：**

```
=== 第一次数据更新 ===
【当前状况】温度=25.5℃, 湿度=65.0%, 气压=1013.0hPa
【统计】平均温度=25.5℃, 最高=25.5℃, 最低=25.5℃
【预报】暂无趋势数据

=== 第二次数据更新 ===
【当前状况】温度=27.0℃, 湿度=70.0%, 气压=1015.0hPa
【统计】平均温度=26.2℃, 最高=27.0℃, 最低=25.5℃
【预报】天气好转，气压上升

=== 取消统计显示器订阅 ===

=== 第三次数据更新 ===
【当前状况】温度=23.0℃, 湿度=80.0%, 气压=1010.0hPa
【预报】天气转坏，气压下降
```

### 变体与扩展

**1. 推模式 vs 拉模式**

上面的代码是**推模式**（Push）：被观察者主动把数据推给观察者。

```java
// 拉模式（Pull）：观察者主动从被观察者拉取数据
public interface PullObserver {
    // 只传被观察者引用，观察者自己决定拉什么数据
    void update(Subject subject);
}

public class CurrentConditionDisplay implements PullObserver {
    @Override
    public void update(Subject subject) {
        // 观察者自己拉取需要的数据
        if (subject instanceof WeatherData wd) {
            float temp = wd.getTemperature();
            float humidity = wd.getHumidity();
            System.out.println("温度=" + temp + "℃, 湿度=" + humidity + "%");
        }
    }
}
```

| 模式 | 优点 | 缺点 |
|------|------|------|
| 推模式 | 观察者不需要了解被观察者 | 数据量大时浪费带宽 |
| 拉模式 | 观察者按需获取数据 | 观察者需要依赖被观察者接口 |

**2. 异步观察者**

在高并发场景下，同步通知可能阻塞被观察者。可以用异步方式：

```java
// 使用线程池实现异步通知
public class AsyncWeatherData implements Subject {
    private final List<Observer> observers = new CopyOnWriteArrayList<>();
    private final ExecutorService executor = Executors.newFixedThreadPool(4);

    @Override
    public void notifyObservers() {
        // 每个观察者在独立线程中执行
        for (Observer observer : observers) {
            executor.submit(() -> {
                try {
                    observer.update(temperature, humidity, pressure);
                } catch (Exception e) {
                    // 异常不影响其他观察者
                    System.err.println("观察者通知失败: " + e.getMessage());
                }
            });
        }
    }
}
```

:::warning 异步通知需要注意：观察者的执行顺序不再确定，且如果观察者依赖共享状态，需要考虑线程安全问题。Spring 的 `@Async @EventListener` 就是一个开箱即用的异步观察者实现。
:::

### 运行结果

完整的 ObserverDemo 运行输出已在上方展示。注意第三次数据更新时，统计显示器已经被取消订阅，所以没有收到通知。

## Spring/JDK 中的应用

### Spring 框架中的观察者模式

**1. Spring Event 事件机制**

Spring 的 `ApplicationEvent` + `@EventListener` 是观察者模式的最佳实践：

```java
// 1. 定义事件（继承 ApplicationEvent）
public class OrderCreatedEvent extends ApplicationEvent {
    private final Order order;

    public OrderCreatedEvent(Object source, Order order) {
        super(source);
        this.order = order;
    }

    public Order getOrder() {
        return order;
    }
}

// 2. 发布事件（被观察者）
@Service
public class OrderService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public void createOrder(Order order) {
        // 核心业务：保存订单
        System.out.println("保存订单: " + order.getId());
        orderRepository.save(order);

        // 发布事件——通知所有观察者
        // 发布者和监听者完全解耦
        eventPublisher.publishEvent(new OrderCreatedEvent(this, order));
    }
}

// 3. 监听事件（观察者1：发送邮件）
@Component
public class EmailNotificationListener {
    @EventListener
    @Order(1)  // 控制执行顺序
    public void onOrderCreated(OrderCreatedEvent event) {
        Order order = event.getOrder();
        System.out.println("[邮件] 发送订单确认邮件给: " + order.getCustomerEmail());
    }
}

// 4. 监听事件（观察者2：扣减库存）
@Component
public class InventoryListener {
    @EventListener
    @Order(2)
    public void onOrderCreated(OrderCreatedEvent event) {
        Order order = event.getOrder();
        System.out.println("[库存] 扣减商品库存: " + order.getProductId());
    }
}

// 5. 异步监听（观察者3：积分奖励）
@Component
public class PointsListener {
    @Async  // 异步执行，不阻塞主流程
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        System.out.println("[积分] 异步处理: 为用户增加积分");
    }
}
```

**运行结果：**

```
保存订单: ORDER-001
[邮件] 发送订单确认邮件给: zhangsan@example.com
[库存] 扣减商品库存: PROD-100
[积分] 异步处理: 为用户增加积分
```

**2. Spring Bean 生命周期事件**

```java
// Spring Bean 的生命周期回调也是观察者模式
@Component
public class MyBean {

    @PostConstruct
    public void init() {
        System.out.println("Bean 初始化完成");
    }

    @PreDestroy
    public void destroy() {
        System.out.println("Bean 即将销毁");
    }
}

// 也可以监听 Context 事件
@Component
public class ContextRefreshListener implements ApplicationListener<ContextRefreshedEvent> {
    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        System.out.println("Spring 容器刷新完成，共加载 " +
            event.getApplicationContext().getBeanDefinitionCount() + " 个 Bean");
    }
}
```

### JDK 中的观察者模式

**1. PropertyChangeListener**

JavaBeans 规范中的属性变化监听就是观察者模式：

```java
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

public class User {
    private String name;
    // PropertyChangeSupport 封装了观察者管理逻辑
    private final PropertyChangeSupport pcs = new PropertyChangeSupport(this);

    public void addPropertyChangeListener(PropertyChangeListener listener) {
        pcs.addPropertyChangeListener(listener);
    }

    public void removePropertyChangeListener(PropertyChangeListener listener) {
        pcs.removePropertyChangeListener(listener);
    }

    public void setName(String newName) {
        String oldName = this.name;
        this.name = newName;
        // 属性变化时，通知所有监听者
        pcs.firePropertyChange("name", oldName, newName);
    }
}

// 使用
public class Main {
    public static void main(String[] args) {
        User user = new User();
        user.addPropertyChangeListener(event -> {
            System.out.println("属性 '" + event.getPropertyName() +
                "' 从 '" + event.getOldValue() +
                "' 变为 '" + event.getNewValue() + "'");
        });

        user.setName("张三");
        user.setName("李四");
    }
}
```

**运行结果：**

```
属性 'name' 从 'null' 变为 '张三'
属性 'name' 从 '张三' 变为 '李四'
```

## 优缺点

### 优点

| 优点 | 详细说明 |
|------|----------|
| 松耦合 | 被观察者和观察者之间没有直接依赖 |
| 支持广播通信 | 一个通知可以同时发给多个观察者 |
| 符合开闭原则 | 新增观察者无需修改被观察者 |
| 动态管理 | 运行时可以自由添加/删除观察者 |
| 分离关注点 | 被观察者只负责状态管理，观察者只负责响应 |

### 缺点

| 缺点 | 详细说明 | 应对方案 |
|------|----------|----------|
| 通知顺序不可控 | 观察者的执行顺序不确定 | 使用 `@Order` 或有序集合 |
| 性能问题 | 观察者过多时通知耗时 | 异步通知 + 分组 |
| 内存泄漏 | 观察者未取消订阅导致无法回收 | 使用 WeakReference 或提供注销方法 |
| 异常传播 | 一个观察者异常可能影响其他观察者 | try-catch 隔离每个观察者 |
| 循环依赖 | 观察者互相通知导致无限循环 | 检测循环 + 通知去重 |
| 调试困难 | 通知链路长，问题不好定位 | 记录通知日志 + 事件溯源 |

## 面试追问

### Q1: 观察者模式和发布-订阅模式的区别？

| 维度 | 观察者模式 | 发布-订阅模式 |
|------|------------|--------------|
| **耦合度** | Subject 和 Observer 有直接依赖 | 发布者和订阅者完全解耦 |
| **通信方式** | Subject 直接调用 Observer | 通过事件总线/消息中间件 |
| **通知范围** | 进程内 | 可以跨进程 |
| **典型实现** | Java Observer、Spring Event | Kafka、RabbitMQ、Redis Pub/Sub |

:::tip 一句话总结：观察者模式是"直接通知"，发布-订阅模式是"通过中间人通知"。Spring 的 `@EventListener` 默认是观察者模式，集成 RabbitMQ/Kafka 后就升级为发布-订阅模式。
:::

### Q2: 如何避免观察者通知时的异常传播？

```java
// 方案1：在 notify 方法中隔离每个观察者的异常
@Override
public void notifyObservers() {
    for (Observer observer : observers) {
        try {
            observer.update(temperature, humidity, pressure);
        } catch (Exception e) {
            // 记录日志，但不影响其他观察者
            System.err.println("观察者通知失败: " + e.getMessage());
        }
    }
}

// 方案2：Spring 中使用 @Async 异步执行
@Component
public class OrderListener {
    @Async
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        // 异步执行，异常不会传播到发布者
        sendEmail(event.getOrder());
    }
}

// 方案3：使用 ErrorHandler 统一处理
@Configuration
public class EventConfig implements ApplicationEventMulticaster {
    @Override
    public void multicastEvent(ApplicationEvent event) {
        // 自定义异常处理逻辑
    }
}
```

### Q3: Spring 中 `@EventListener` 的执行顺序怎么控制？

```java
// 方式1：@Order 注解（推荐）
@Component
public class Listener1 {
    @EventListener
    @Order(1)  // 数值越小，优先级越高
    public void onEvent(OrderCreatedEvent event) {
        System.out.println("第一个执行");
    }
}

@Component
public class Listener2 {
    @EventListener
    @Order(2)
    public void onEvent(OrderCreatedEvent event) {
        System.out.println("第二个执行");
    }
}

// 方式2：实现 Ordered 接口
@Component
public class PriorityListener implements Ordered {
    @EventListener
    public void onEvent(OrderCreatedEvent event) {
        System.out.println("高优先级");
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}

// 方式3：@Async 将监听器改为异步执行（不参与顺序排序）
@Async
@EventListener
public void asyncHandle(OrderCreatedEvent event) {
    System.out.println("异步执行，不阻塞其他监听器");
}
```

### Q4: 观察者模式如何避免内存泄漏？

内存泄漏是观察者模式的经典问题。如果观察者被注册到被观察者中，但观察者本身不再被使用，由于被观察者还持有它的引用，导致观察者无法被 GC 回收。

```java
// 方案1：确保取消订阅
public class MyController {
    @Autowired
    private WeatherData weatherData;

    private Observer myObserver;

    @PostConstruct
    public void init() {
        myObserver = new MyObserver();
        weatherData.attach(myObserver);
    }

    @PreDestroy
    public void cleanup() {
        // 关键：在销毁时取消订阅！
        weatherData.detach(myObserver);
    }
}

// 方案2：使用 WeakReference
public class WeakObservable {
    // 用弱引用持有观察者，不影响 GC
    private final List<WeakReference<Observer>> observers = new ArrayList<>();

    public void attach(Observer observer) {
        observers.add(new WeakReference<>(observer));
    }

    public void notifyObservers() {
        // 遍历时清理已经被 GC 的弱引用
        observers.removeIf(ref -> ref.get() == null);
        for (WeakReference<Observer> ref : observers) {
            ref.get().update(data);
        }
    }
}
```

## 相关模式

- **中介者模式**：观察者直接通信，中介者通过中间人协调
- **状态模式**：状态模式是特殊观察者，对象自身状态变化触发行为变化
- **责任链模式**：责任链处理请求，观察者广播通知
- **命令模式**：命令封装请求，观察者广播通知
- **发布-订阅模式**：观察者模式的分布式版本，通过消息中间件解耦
