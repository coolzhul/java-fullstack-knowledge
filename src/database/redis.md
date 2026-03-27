---
title: Redis
icon: redis
order: 2
category:
  - 数据库
tag:
  - Redis
  - 缓存
---

# Redis

> Redis 是 Java 后端开发中用得最多的中间件，没有之一。但多数人对 Redis 的理解停留在 `SET` / `GET` / `DEL`。Redis 为什么这么快？持久化会不会丢数据？集群怎么工作？分布式锁怎么实现？这些问题在实际开发中天天遇到。

## 基础入门：Redis 5 分钟上手

### 为什么用 Redis？

```
MySQL 查询：磁盘 IO，毫秒级
Redis 查询：内存操作，微秒级（快 100-1000 倍）

适用场景：
- 热点数据缓存
- 排行榜（ZSet）
- 计数器（INCR）
- 分布式锁（SETNX）
- 消息队列（List / Stream）
```

### 基本操作

```bash
# 启动 Redis
redis-server

# 连接
redis-cli

# 基本命令
SET key value           # 设置值
GET key                 # 获取值
DEL key                 # 删除
EXPIRE key 3600         # 设置过期时间（秒）
TTL key                 # 查看剩余过期时间
INCR counter            # 计数器 +1
```

---


## 为什么 Redis 这么快？

```
1. 内存操作：数据存在内存中，读写延迟 ~100ns（磁盘 ~10ms）
2. 单线程模型：没有线程切换和锁竞争的开销
3. IO 多路复用：一个线程处理大量连接
4. 高效的数据结构：每种数据结构都针对特定场景优化

注意：Redis 6.0 引入了多线程 IO（网络读写多线程），命令执行仍然是单线程
```

## 五种核心数据结构

```
String：最常用，缓存、计数器、分布式锁
  SET key value
  INCR counter
  SET key value EX 3600    # 带 TTL
  SETNX key value           # 分布式锁（SET key value NX EX 30）

Hash：对象属性缓存（如用户信息）
  HSET user:1 name "张三" age 25
  HGET user:1 name
  HGETALL user:1

List：消息队列、最新列表
  LPUSH queue task1
  RPOP queue               # 阻塞获取：BRPOP queue 30

Set：去重、标签、交集运算
  SADD tags:1 java spring redis
  SISMEMBER tags:1 java
  SINTER tags:1 tags:2      # 共同标签

ZSet（有序集合）：排行榜、延时队列
  ZADD leaderboard 100 "user1"
  ZADD leaderboard 200 "user2"
  ZREVRANGE leaderboard 0 9 WITHSCORES  # Top 10
```

## 缓存实战

### 缓存与数据库一致性

```
常用方案：Cache Aside（旁路缓存）

读：
  1. 先查缓存
  2. 命中 → 返回
  3. 未命中 → 查数据库 → 写入缓存 → 返回

写：
  1. 先更新数据库
  2. 再删除缓存（不是更新缓存！）

为什么删除而不是更新？
  - 如果更新缓存，但数据库更新失败了 → 数据不一致
  - 如果删除缓存，下次读取时自然回填 → 最终一致
  - 频繁更新的数据，更新缓存大部分是浪费（写多读少时）

极端情况：数据库更新成功，删除缓存失败
  → 用消息队列重试删除（可靠性更高）
  → 或用 Canal 监听 binlog 异步删除
```

### 分布式锁

```java
// Redis 分布式锁（Redisson 实现）
RLock lock = redisson.getLock("order:lock:" + orderId);
try {
    if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {  // 等待5秒，锁30秒
        // 执行业务
    }
} finally {
    lock.unlock();
}

// 为什么不用 SETNX + EXPIRE？
// SETNX 和 EXPIRE 不是原子操作
// 如果 SETNX 成功但 EXPIRE 失败（进程崩溃），锁永远不会释放
// 解决：SET key value NX EX 30（原子操作）+ Redisson 的看门狗续期

// Redisson 的看门狗（Watchdog）：
// 如果锁设置了 30 秒过期，但业务没执行完
// 看门狗每 10 秒自动续期到 30 秒
// 持有锁的进程崩溃 → 看门狗停止续期 → 锁自动过期释放
```

## 持久化——会不会丢数据？

```
RDB（快照）：
  - 定时把内存数据 dump 到磁盘
  - 恢复快，但可能丢失最后一次快照后的数据
  - 适合做备份

AOF（追加日志）：
  - 每条写命令追加到日志文件
  - 丢失数据少（最多丢 1 秒）
  - 文件体积大，恢复慢

Redis 4.0+ 混合持久化：
  - RDB + AOF 结合
  - RDB 做基础快照，增量用 AOF 记录
  - 既有 RDB 的快速恢复，又有 AOF 的少量丢失
```

## 面试高频题

**Q1：Redis 和 Memcached 的区别？**

Redis 支持丰富数据结构（String/Hash/List/Set/ZSet），支持持久化（RDB/AOF），支持主从复制和集群，单线程（6.0 多线程 IO）。Memcached 只支持 String，不支持持久化，不支持集群，多线程模型。实际开发中几乎都用 Redis。

**Q2：Redis 集群方案有哪些？**

主从复制（读写分离）、哨兵模式（Sentinel，自动故障转移）、Cluster 模式（官方集群方案，数据分片，水平扩展）。小规模用主从+哨兵，大规模用 Cluster。

## 延伸阅读

- 上一篇：[MySQL](mysql.md) — 索引、事务、MVCC
- 下一篇：[Elasticsearch](es.md) — 全文搜索、日志分析
- [高并发架构](../architecture/high-concurrency.md) — 缓存策略、限流降级
