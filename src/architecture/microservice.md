---
title: 微服务架构
icon: services
order: 2
category:
  - 架构
tag:
  - 微服务
  - 架构设计
---

# 微服务架构

微服务架构是将单体应用拆分为一组小型服务的架构风格。

## 单体 vs 微服务

| 对比项 | 单体架构 | 微服务架构 |
|--------|----------|------------|
| 部署 | 整体部署 | 独立部署 |
| 扩展 | 整体扩展 | 按需扩展 |
| 技术栈 | 统一 | 可多样化 |
| 开发 | 简单 | 复杂 |
| 运维 | 简单 | 复杂 |
| 故障影响 | 全局 | 局部 |

## 微服务架构

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│              (Kong / Spring Cloud Gateway)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  用户服务   │  │  订单服务   │  │  商品服务   │  │  支付服务   │
│  User Svc   │  │  Order Svc  │  │ Product Svc │  │ Payment Svc │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
       ↓                ↓                ↓                ↓
┌─────────────────────────────────────────────────────────────┐
│                    基础设施层                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐│
│  │ 服务发现 │  │ 配置中心 │  │ 消息队列 │  │   链路追踪     ││
│  │  Nacos  │  │  Nacos  │  │ Kafka   │  │  SkyWalking   ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 服务拆分原则

### 按业务能力拆分

```
用户服务 - 用户注册、登录、信息管理
订单服务 - 订单创建、查询、状态管理
商品服务 - 商品管理、库存管理
支付服务 - 支付处理、退款
通知服务 - 短信、邮件、推送
```

### 拆分原则

| 原则 | 说明 |
|------|------|
| 单一职责 | 每个服务只做一件事 |
| 高内聚 | 服务内部功能相关 |
| 低耦合 | 服务间依赖最小 |
| 独立部署 | 可独立开发部署 |

## 服务通信

### 同步通信

```java
// REST API
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return restTemplate.getForObject(
        "http://user-service/api/users/" + id, User.class);
}

// OpenFeign
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
}

// gRPC
public User getUser(Long id) {
    GetUserRequest request = GetUserRequest.newBuilder()
        .setId(id)
        .build();
    return userStub.getUser(request);
}
```

### 异步通信

```java
// 事件驱动
@Service
public class OrderService {

    @Autowired
    private KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public void createOrder(OrderDTO dto) {
        // 创建订单
        Order order = orderDao.save(new Order(dto));

        // 发布事件
        OrderEvent event = new OrderEvent(order.getId(), "CREATED");
        kafkaTemplate.send("order-events", event);
    }
}

// 订阅事件
@KafkaListener(topics = "order-events")
public void handleOrderEvent(OrderEvent event) {
    if ("CREATED".equals(event.getType())) {
        // 扣减库存
        inventoryService.deduct(event.getProductId(), event.getQuantity());
    }
}
```

## 服务治理

### 服务注册发现

```yaml
# Nacos配置
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
```

### 负载均衡

```java
@Configuration
public class LoadBalancerConfig {

    @Bean
    ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment, LoadBalancerClientFactory factory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            factory.getLazyProvider(name, ServiceInstanceListSupplier.class), name);
    }
}

// 使用
@LoadBalanced
@Bean
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

### 熔断降级

```java
// Sentinel
@SentinelResource(
    value = "getUser",
    fallback = "getUserFallback",
    blockHandler = "handleBlock"
)
public User getUser(Long id) {
    return userClient.getUser(id);
}

public User getUserFallback(Long id, Throwable ex) {
    return User.builder()
        .id(id)
        .name("默认用户")
        .build();
}
```

### 限流

```java
// 接口限流
@RestController
public class ApiController {

    @GetMapping("/api/data")
    @SentinelResource(value = "getData", blockHandler = "handleBlock")
    public Result getData() {
        return Result.success(dataService.getData());
    }

    public Result handleBlock(BlockException ex) {
        return Result.error("系统繁忙，请稍后重试");
    }
}

// 网关限流
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

## 分布式事务

### Saga模式

```java
// 订单创建Saga
public class CreateOrderSaga {

    public void execute(OrderDTO dto) {
        // 步骤1：创建订单
        Order order = orderService.create(dto);

        try {
            // 步骤2：扣减库存
            inventoryService.deduct(dto.getProductId(), dto.getQuantity());

            // 步骤3：扣减余额
            accountService.debit(dto.getUserId(), dto.getAmount());

        } catch (Exception e) {
            // 补偿操作
            compensate(order);
            throw e;
        }
    }

    private void compensate(Order order) {
        // 恢复库存
        inventoryService.restore(order.getProductId(), order.getQuantity());
        // 取消订单
        orderService.cancel(order.getId());
    }
}
```

## 配置管理

### 配置中心

```yaml
# Nacos配置
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        shared-configs:
          - data-id: common.yaml
            refresh: true
```

### 动态刷新

```java
@RefreshScope
@RestController
public class ConfigController {

    @Value("${app.config.feature-enabled:false}")
    private boolean featureEnabled;

    @GetMapping("/config")
    public boolean getConfig() {
        return featureEnabled;
    }
}
```

## 链路追踪

### SkyWalking

```bash
# 启动Agent
java -javaagent:skywalking-agent.jar \
     -Dskywalking.agent.service_name=user-service \
     -Dskywalking.collector.backend_service=localhost:11800 \
     -jar app.jar
```

### Sleuth + Zipkin

```yaml
spring:
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
      probability: 1.0
```

## API网关

### Spring Cloud Gateway

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 100
                redis-rate-limiter.burstCapacity: 200
```

## 小结

| 组件 | 说明 |
|------|------|
| 服务注册 | Nacos/Eureka/Consul |
| 配置中心 | Nacos/Spring Cloud Config |
| 服务调用 | OpenFeign/Dubbo/gRPC |
| 熔断降级 | Sentinel/Hystrix/Resilience4j |
| 链路追踪 | SkyWalking/Zipkin/Jaeger |
| API网关 | Spring Cloud Gateway/Kong |
| 消息队列 | Kafka/RabbitMQ/RocketMQ |
