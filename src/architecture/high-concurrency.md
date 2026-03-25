---
title: 高并发架构
icon: flash
order: 1
category:
  - 架构
tag:
  - 高并发
  - 系统设计
---

# 高并发架构

高并发架构设计目标是处理大量并发请求，保证系统稳定性和响应速度。

## 核心指标

| 指标 | 说明 | 目标 |
|------|------|------|
| QPS | 每秒请求数 | 根据业务定 |
| RT | 响应时间 | < 200ms |
| 并发数 | 同时处理请求数 | 根据业务定 |
| 成功率 | 请求成功比例 | > 99.9% |

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端层                                │
│                   (Web/App/小程序)                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      网关层                                  │
│           (Nginx / Kong / Spring Cloud Gateway)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      应用层                                  │
│                   (微服务集群)                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据层                                  │
│              (MySQL / Redis / Elasticsearch)               │
└─────────────────────────────────────────────────────────────┘
```

## 缓存策略

### 多级缓存

```
请求 → 本地缓存 → Redis → 数据库
        (Caffeine)   ↓
                  分布式缓存
```

### 缓存模式

```java
// Cache-Aside（旁路缓存）
public User getUser(Long id) {
    // 1. 先查缓存
    User user = redis.get("user:" + id);
    if (user != null) {
        return user;
    }

    // 2. 查数据库
    user = userDao.findById(id);
    if (user != null) {
        // 3. 写入缓存
        redis.setex("user:" + id, 3600, user);
    }
    return user;
}

// Write-Through（写穿透）
public void updateUser(User user) {
    // 同时更新缓存和数据库
    userDao.update(user);
    redis.set("user:" + user.getId(), user);
}
```

## 限流策略

### 算法

```java
// 1. 固定窗口
public class FixedWindow {
    private int count = 0;
    private long startTime = System.currentTimeMillis();
    private int limit = 100;
    private long windowSize = 1000;  // 1秒

    public boolean allow() {
        long now = System.currentTimeMillis();
        if (now - startTime > windowSize) {
            count = 0;
            startTime = now;
        }
        return ++count <= limit;
    }
}

// 2. 滑动窗口
public class SlidingWindow {
    private LinkedList<Long> queue = new LinkedList<>();
    private int limit = 100;
    private long windowSize = 1000;

    public boolean allow() {
        long now = System.currentTimeMillis();
        while (!queue.isEmpty() && queue.peek() < now - windowSize) {
            queue.poll();
        }
        if (queue.size() < limit) {
            queue.offer(now);
            return true;
        }
        return false;
    }
}

// 3. 令牌桶
public class TokenBucket {
    private long capacity = 100;
    private long tokens = 0;
    private long rate = 10;  // 每秒生成10个令牌
    private long lastTime = System.currentTimeMillis();

    public boolean allow() {
        long now = System.currentTimeMillis();
        tokens = Math.min(capacity, tokens + (now - lastTime) / 1000 * rate);
        lastTime = now;
        if (tokens > 0) {
            tokens--;
            return true;
        }
        return false;
    }
}

// 4. 漏桶
public class LeakyBucket {
    private long capacity = 100;
    private long water = 0;
    private long rate = 10;  // 每秒漏出10个
    private long lastTime = System.currentTimeMillis();

    public boolean allow() {
        long now = System.currentTimeMillis();
        water = Math.max(0, water - (now - lastTime) / 1000 * rate);
        lastTime = now;
        if (water < capacity) {
            water++;
            return true;
        }
        return false;
    }
}
```

### Sentinel限流

```java
// 注解方式
@SentinelResource(value = "getUser", blockHandler = "handleBlock")
public User getUser(Long id) {
    return userDao.findById(id);
}

public User handleBlock(Long id, BlockException ex) {
    return new User();  // 返回默认值
}

// 规则配置
FlowRule rule = new FlowRule();
rule.setResource("getUser");
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(100);  // QPS限制为100
FlowRuleManager.loadRules(Collections.singletonList(rule));
```

## 熔断降级

### Hystrix/Sentinel/Resilience4j

```java
// Sentinel熔断
@SentinelResource(
    value = "getUser",
    fallback = "fallback",      // 业务异常
    blockHandler = "handleBlock" // 限流/熔断
)
public User getUser(Long id) {
    if (id == null) {
        throw new IllegalArgumentException("id不能为空");
    }
    return userDao.findById(id);
}

public User fallback(Long id, Throwable ex) {
    return new User(-1L, "默认用户");
}

// 熔断规则
DegradeRule rule = new DegradeRule();
rule.setResource("getUser");
rule.setGrade(CircuitBreakerStrategy.ERROR_RATIO.getType());
rule.setCount(0.5);  // 错误比例50%
rule.setTimeWindow(10);  // 熔断持续10秒
rule.setMinRequestAmount(10);  // 最小请求数
DegradeRuleManager.loadRules(Collections.singletonList(rule));
```

## 异步处理

### 消息队列削峰

```java
// 下单场景
@Service
public class OrderService {

    @Autowired
    private KafkaTemplate<String, Order> kafkaTemplate;

    // 接收请求，快速返回
    public String createOrder(OrderDTO dto) {
        String orderId = UUID.randomUUID().toString();
        dto.setOrderId(orderId);

        // 发送到消息队列
        kafkaTemplate.send("order-topic", orderId, dto);

        return orderId;  // 立即返回订单ID
    }
}

// 异步处理
@KafkaListener(topics = "order-topic")
public void processOrder(OrderDTO dto) {
    // 扣减库存
    inventoryService.deduct(dto.getProductId(), dto.getQuantity());

    // 创建订单
    orderDao.insert(new Order(dto));

    // 发送通知
    notificationService.send(dto.getUserId(), "订单创建成功");
}
```

## 数据库优化

### 读写分离

```
┌─────────────┐
│   写请求    │ → Master
└─────────────┘
┌─────────────┐
│   读请求    │ → Slave1 / Slave2 / Slave3
└─────────────┘
```

### 分库分表

```java
// 水平分表
orders_202401, orders_202402, orders_202403

// 垂直分库
user_db, order_db, product_db

// ShardingSphere配置
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/db0
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/db1
    rules:
      sharding:
        tables:
          t_order:
            actual-data-nodes: ds$->{0..1}.t_order_$->{0..1}
            table-strategy:
              standard:
                sharding-column: order_id
                sharding-algorithm-name: t_order_inline
```

## CDN加速

```
用户 → CDN边缘节点 → 源站
       (就近访问)
```

## 小结

| 策略 | 说明 |
|------|------|
| 缓存 | 多级缓存，减少数据库压力 |
| 限流 | 保护系统，防止过载 |
| 熔断 | 快速失败，防止雪崩 |
| 异步 | 消息队列，削峰填谷 |
| 分库分表 | 数据分片，水平扩展 |
| CDN | 静态资源加速 |
