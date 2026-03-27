---
title: 分布式技术
icon: mdi:network
order: 5
category:
  - 分布式
tag:
  - 分布式
  - 微服务
---

# 分布式技术

分布式系统是由多台计算机组成的系统，协同工作完成共同目标。

## 模块概览

| 章节 | 描述 |
|------|------|
| [消息队列](./mq.md) | 异步通信，解耦系统 |
| [RPC框架](./rpc.md) | 远程过程调用 |
| [分布式事务](./transaction.md) | 跨服务事务一致性 |

## 分布式理论基础

### CAP定理

| 特性 | 说明 |
|------|------|
| Consistency | 一致性，所有节点同时看到相同数据 |
| Availability | 可用性，每个请求都能得到响应 |
| Partition Tolerance | 分区容错，网络分区时系统继续运行 |

**只能同时满足两个**：
- CP：一致性 + 分区容错（如Zookeeper）
- AP：可用性 + 分区容错（如Eureka）

### BASE理论

| 特性 | 说明 |
|------|------|
| Basically Available | 基本可用 |
| Soft State | 软状态 |
| Eventually Consistent | 最终一致性 |
