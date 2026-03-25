---
title: RPC框架
icon: connection
order: 2
category:
  - 分布式
tag:
  - RPC
  - Dubbo
  - gRPC
---

# RPC框架

RPC（Remote Procedure Call）远程过程调用，像调用本地方法一样调用远程服务。

## RPC原理

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │ ──→ │  Stub    │ ──→ │  Network │ ──→ │  Server  │
│          │     │  代理    │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      ↓                                   ↓
                 序列化请求                          反序列化
                 发送网络                           调用服务
```

## Dubbo

### 架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Dubbo架构                               │
├─────────────────────────────────────────────────────────────┤
│  Provider ←→ Registry ←→ Consumer                           │
│      ↓            ↓           ↓                             │
│  Container    Monitor    Container                          │
└─────────────────────────────────────────────────────────────┘
```

### Spring Boot集成

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-registry-nacos</artifactId>
</dependency>
```

```yaml
dubbo:
  application:
    name: user-service
  registry:
    address: nacos://localhost:8848
  protocol:
    name: dubbo
    port: 20880
```

```java
// 服务接口
public interface UserService {
    User getById(Long id);
}

// 服务提供者
@DubboService
public class UserServiceImpl implements UserService {
    @Override
    public User getById(Long id) {
        return userDao.findById(id);
    }
}

// 服务消费者
@Service
public class OrderService {
    @DubboReference
    private UserService userService;

    public Order createOrder(Long userId) {
        User user = userService.getById(userId);
        // ...
    }
}
```

### 负载均衡

| 策略 | 说明 |
|------|------|
| random | 随机（默认） |
| roundrobin | 轮询 |
| leastactive | 最少活跃调用数 |
| consistenthash | 一致性哈希 |

```java
@DubboReference(loadbalance = "roundrobin")
private UserService userService;
```

### 集群容错

| 模式 | 说明 |
|------|------|
| Failover | 失败重试（默认） |
| Failfast | 快速失败 |
| Failsafe | 失败安全，忽略异常 |
| Failback | 失败自动恢复 |
| Forking | 并行调用 |

## gRPC

### 定义Proto

```protobuf
// user.proto
syntax = "proto3";

package com.example;

service UserService {
    rpc GetUser (GetUserRequest) returns (GetUserResponse);
}

message GetUserRequest {
    int64 id = 1;
}

message GetUserResponse {
    int64 id = 1;
    string name = 2;
    int32 age = 3;
}
```

### Spring Boot集成

```xml
<dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-server-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-client-spring-boot-starter</artifactId>
</dependency>
```

```java
// 服务端
@GrpcService
public class UserServiceImpl extends UserServiceGrpc.UserServiceImplBase {
    @Override
    public void getUser(GetUserRequest request,
            StreamObserver<GetUserResponse> responseObserver) {
        GetUserResponse response = GetUserResponse.newBuilder()
            .setId(request.getId())
            .setName("张三")
            .setAge(25)
            .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}

// 客户端
@Service
@RequiredArgsConstructor
public class UserClient {
    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    public User getUser(Long id) {
        GetUserResponse response = userStub.getUser(
            GetUserRequest.newBuilder().setId(id).build()
        );
        return new User(response.getId(), response.getName(), response.getAge());
    }
}
```

## 序列化

| 方式 | 性能 | 体积 | 跨语言 |
|------|------|------|--------|
| Java原生 | 低 | 大 | 仅Java |
| JSON | 中 | 大 | 是 |
| Protobuf | 高 | 小 | 是 |
| Hessian2 | 中 | 中 | 是 |
| Kryo | 高 | 小 | 仅Java |

## 小结

| 特性 | 说明 |
|------|------|
| 透明调用 | 像本地方法一样调用远程服务 |
| 序列化 | 对象与字节序列转换 |
| 网络传输 | TCP/HTTP协议 |
| 负载均衡 | 多服务实例分发 |
| 容错 | 服务调用失败处理 |
