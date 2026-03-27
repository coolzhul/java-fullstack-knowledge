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

> 微服务不是银弹——拆分后分布式问题的复杂度远超单体。服务怎么发现？配置怎么统一？调用链路怎么追踪？一个服务挂了会不会拖垮整个系统？Spring Cloud 提供了一套完整的解决方案，但更重要的是理解每个组件解决什么问题、什么时候该用。

## 基础入门：微服务为什么需要 Spring Cloud？

### 单体应用 vs 微服务

```
单体应用：所有功能在一个应用里
  优点：简单、容易开发、容易部署
  缺点：代码量大、发布慢、扩展困难、技术栈统一

微服务：按业务拆分成独立服务
  优点：独立开发、独立部署、独立扩展、技术栈灵活
  缺点：分布式复杂性（服务发现、配置管理、链路追踪...）

Spring Cloud 提供了一站式微服务解决方案
```

### Spring Cloud 核心组件

| 组件 | 作用 | 常用实现 |
|------|------|----------|
| 注册中心 | 服务注册与发现 | Nacos、Consul |
| 配置中心 | 统一管理配置 | Nacos Config、Apollo |
| API 网关 | 统一入口、路由、限流 | Spring Cloud Gateway |
| 服务调用 | 服务间通信 | OpenFeign、gRPC |
| 熔断降级 | 防止雪崩 | Sentinel、Resilience4j |
| 链路追踪 | 请求链路可视化 | SkyWalking、Zipkin |
| 分布式事务 | 跨服务事务一致性 | Seata |

---

## 微服务架构全景

```
                        客户端
                          │
                    ┌─────▼─────┐
                    │   网关     │  ← 统一入口、路由、限流、鉴权
                    │  Gateway  │
                    └─────┬─────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ 用户服务  │   │ 订单服务  │   │ 商品服务  │
     └────┬─────┘   └────┬─────┘   └────┬─────┘
          │              │              │
     ┌────▼──────────────▼──────────────▼────┐
     │  Nacos（注册中心 + 配置中心）          │
     │  Sentinel（限流熔断）                  │
     │  Seata（分布式事务）                    │
     │  SkyWalking（链路追踪）                │
     └───────────────────────────────────────┘
```

## 服务注册与发现——Nacos

### 为什么需要注册中心？

```java
// 单体应用：服务地址写死
String userUrl = "http://localhost:8081/api/users";

// 微服务：用户服务可能有 3 个实例（8081、8082、8083）
// 哪个实例挂了？新实例在哪？手动维护不可能
// → 注册中心自动管理：服务启动时注册，消费者自动发现
```

```java
// 服务调用方式演进：

// 1. RestTemplate + @LoadBalanced（基础方式）
@LoadBalanced
@Bean
public RestTemplate restTemplate() {
    return new RestTemplate();
}
// 用服务名代替 IP:port
restTemplate.getForObject("http://user-service/api/users/1", User.class);

// 2. OpenFeign（推荐，声明式调用）
@FeignClient(name = "user-service", fallbackFactory = UserClientFallbackFactory.class)
public interface UserClient {
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
}
// 像调用本地方法一样调用远程服务
```

::: warning 服务发现的陷阱
服务名不要包含环境信息（如 `user-service-dev`），应该通过 namespace 或 group 隔离环境。否则切换环境时需要改代码。服务名的变更会影响所有调用方——改名要慎重。
:::

## 网关——Spring Cloud Gateway

网关是微服务的"大门"，所有外部请求都通过网关进入：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service          # lb:// 表示负载均衡
          predicates:
            - Path=/api/users/**          # 路径匹配
          filters:
            - StripPrefix=1              # 去掉路径前缀
            - name: RequestRateLimiter   # 限流
              args:
                redis-rate-limiter.replenishRate: 10    # 每秒10个
                redis-rate-limiter.burstCapacity: 20    # 突发上限20
```

**网关的核心职责：**

| 职责 | 说明 |
|------|------|
| 路由 | 根据路径将请求转发到对应服务 |
| 负载均衡 | 多个服务实例之间分配流量 |
| 限流 | 防止下游服务被压垮 |
| 鉴权 | 统一在网关做 Token 校验，业务服务不用重复做 |
| 灰度发布 | 根据规则将部分流量导向新版本 |

## 熔断降级——Sentinel

### 为什么需要熔断？

```java
// 灾难场景：
// 用户服务挂了 → 订单服务调用超时 → 订单服务的线程池被占满
// → 更多请求堆积 → 整个系统雪崩

// 熔断：当下游服务连续失败率超过阈值时，直接"断开"
// 后续请求不再发起远程调用，而是走降级逻辑
// → 保护上游服务不被拖垮
// → 给下游服务恢复时间

@SentinelResource(value = "getUser",
    blockHandler = "handleBlock",     // 限流/熔断时执行
    fallback = "handleFallback")       // 异常时执行
public User getUser(Long id) {
    return userClient.getUser(id);  // 远程调用
}

// 降级逻辑
public User handleBlock(Long id, BlockException ex) {
    return new User(id, "降级用户", "默认");  // 返回兜底数据
}
```

## 面试高频题

**Q1：微服务怎么保证事务一致性？**

CAP 定理决定了分布式系统无法同时满足一致性、可用性、分区容错性。常见方案：1) Seata（AT 模式，自动补偿，侵入小）；2) 本地消息表 + 定时任务（最终一致性，最可靠）；3) TCC（Try-Confirm-Cancel，侵入大但灵活）；4) Saga（长事务编排）。大多数场景推荐 Seata AT 或本地消息表。

**Q2：服务雪崩怎么防止？**

三级防线：1) 限流（Sentinel，控制入口流量）；2) 熔断（下游故障时快速失败，不拖垮上游）；3) 降级（熔断后返回兜底数据，保证基本可用）。加上超时设置、重试机制（注意重试次数，幂等性）和线程池隔离。

## 延伸阅读

- 上一篇：[Spring MVC](mvc.md) — RESTful API、参数校验
- 下一篇：[Spring Security](security.md) — JWT 认证、权限控制
- [高并发架构](../architecture/high-concurrency.md) — 缓存、限流、降级
