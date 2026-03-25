---
title: Spring Cloud
icon: cloud
order: 5
category:
  - Spring
tag:
  - Spring
  - Spring Cloud
  - 微服务
---

# Spring Cloud

Spring Cloud为分布式系统开发提供了一整套工具集，包括服务发现、配置管理、熔断器等。

## 微服务架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                                │
│                     (Spring Cloud Gateway)                      │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  服务A      │  │  服务B      │  │  服务C      │  │  服务D      │
│             │  │             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
       ↓                ↓                ↓                ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Nacos (服务发现 + 配置中心)                    │
└─────────────────────────────────────────────────────────────────┘
```

## 服务注册与发现

### Nacos

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

```yaml
spring:
  application:
    name: user-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
```

```java
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

### 服务调用

```java
// RestTemplate + @LoadBalanced
@Configuration
public class RestTemplateConfig {
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class OrderService {
    @Autowired
    private RestTemplate restTemplate;

    public User getUser(Long id) {
        return restTemplate.getForObject(
            "http://user-service/api/users/" + id, User.class);
    }
}

// OpenFeign
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
}

@Service
public class OrderService {
    @Autowired
    private UserClient userClient;

    public User getUser(Long id) {
        return userClient.getUser(id);
    }
}
```

## 配置中心

### Nacos Config

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

```yaml
# bootstrap.yml
spring:
  application:
    name: user-service
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        shared-configs:
          - data-id: common.yaml
            refresh: true
```

```java
@RefreshScope  // 支持配置动态刷新
@RestController
public class ConfigController {
    @Value("${app.config.value}")
    private String configValue;

    @GetMapping("/config")
    public String getConfig() {
        return configValue;
    }
}
```

## 网关

### Spring Cloud Gateway

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

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

        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

```java
// 自定义过滤器
@Component
public class AuthFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (token == null) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
```

## 熔断降级

### Sentinel

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
```

```java
@RestController
public class DemoController {

    @SentinelResource(value = "hello", blockHandler = "handleBlock")
    @GetMapping("/hello")
    public String hello() {
        return "Hello";
    }

    // 降级处理
    public String handleBlock(BlockException ex) {
        return "系统繁忙，请稍后重试";
    }
}

// 流量控制规则
@Configuration
public class SentinelConfig {
    @PostConstruct
    public void init() {
        List<FlowRule> rules = new ArrayList<>();
        FlowRule rule = new FlowRule();
        rule.setResource("hello");
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        rule.setCount(10);  // QPS限制为10
        rules.add(rule);
        FlowRuleManager.loadRules(rules);
    }
}
```

## 分布式事务

### Seata

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

```java
@Service
public class OrderService {

    @GlobalTransactional  // 分布式事务
    public void createOrder(OrderDTO dto) {
        // 创建订单
        orderMapper.insert(order);

        // 扣减库存（远程服务）
        inventoryClient.deduct(dto.getProductId(), dto.getQuantity());

        // 扣减余额（远程服务）
        accountClient.debit(dto.getUserId(), dto.getAmount());
    }
}
```

## 链路追踪

### SkyWalking / Zipkin

```yaml
# SkyWalking Agent
java -javaagent:skywalking-agent.jar \
     -Dskywalking.agent.service_name=user-service \
     -Dskywalking.collector.backend_service=localhost:11800 \
     -jar app.jar

# Zipkin
spring:
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
      probability: 1.0
```

## 消息驱动

### Spring Cloud Stream

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-kafka</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    stream:
      bindings:
        orderOutput:
          destination: orders
          content-type: application/json
        orderInput:
          destination: orders
          group: order-group
```

```java
// 生产者
@Service
public class OrderProducer {
    @Autowired
    private StreamBridge streamBridge;

    public void sendOrder(Order order) {
        streamBridge.send("orderOutput", order);
    }
}

// 消费者
@Service
public class OrderConsumer {
    @Bean
    public Consumer<Order> orderInput() {
        return order -> {
            System.out.println("收到订单: " + order);
        };
    }
}
```

## 小结

| 组件 | 说明 |
|------|------|
| Nacos | 服务发现 + 配置中心 |
| Gateway | API网关 |
| OpenFeign | 声明式服务调用 |
| Sentinel | 流量控制 + 熔断降级 |
| Seata | 分布式事务 |
| Stream | 消息驱动 |
