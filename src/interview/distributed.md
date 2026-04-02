# 分布式面试题

> 持续更新中 | 最后更新：2026-04-02

---

## ⭐ 分布式锁有哪些实现方式？Redis 和 ZooKeeper 实现分布式锁的区别？

**简要回答：** 常见实现方式有 Redis（SETNX + Lua 脚本 / Redisson）、ZooKeeper（临时顺序节点）、MySQL（行锁/唯一索引）。Redis 性能高但可靠性依赖主从切换；ZooKeeper 可靠性强（CP）但性能较低。

**深度分析：**

```java
// Redis 分布式锁 — Redisson 实现（推荐）
RLock lock = redisson.getLock("order:lock:" + orderId);
try {
    // 尝试加锁：等待 5 秒，锁自动过期 30 秒
    if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
        // 看门狗机制：每 10 秒续期到 30 秒（防止业务未执行完锁就过期）
        doBusiness();
    }
} finally {
    lock.unlock();  // Lua 脚本保证：只有锁的持有者才能释放
}

// Redisson 加锁 Lua 脚本（原子性保证）
// KEYS[1] = lockKey, ARGV[1] = expireTime, ARGV[2] = uniqueId
if (redis.call('exists', KEYS[1]) == 0) then          // 锁不存在
    redis.call('hset', KEYS[1], ARGV[2], 1);          // 加锁
    redis.call('pexpire', KEYS[1], ARGV[1]);           // 设置过期
    return nil;
end;
if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then  // 重入
    redis.call('hincrby', KEYS[1], ARGV[2], 1);
    redis.call('pexpire', KEYS[1], ARGV[1]);
    return nil;
end;
return redis.call('pttl', KEYS[1]);                     // 返回剩余时间
```

```
ZooKeeper 分布式锁 — 临时顺序节点：

/locks/order-lock/
├── lock-0000000001  (临时顺序节点，客户端1创建)
├── lock-0000000002  (临时顺序节点，客户端2创建)
└── lock-0000000003  (临时顺序节点，客户端3创建)

流程：
1. 每个客户端在 /locks 路径下创建临时顺序节点
2. 获取子节点列表并排序
3. 判断自己是否是最小编号 → 是则获取锁
4. 否则监听（watch）前一个节点的删除事件
5. 前一个节点删除 → 收到通知 → 重新判断 → 获取锁
```

**关键细节：**

| 特性 | Redis (Redisson) | ZooKeeper |
|------|-----------------|-----------|
| 实现原理 | SETNX + Lua + 看门狗 | 临时顺序节点 + Watch |
| 性能 | 高（内存操作，10万+ QPS） | 较低（磁盘同步，数万 QPS） |
| 可靠性 | AP（主从切换可能丢锁） | CP（ZAB 协议保证强一致） |
| 锁释放 | 过期时间 + 看门狗续期 | 临时节点（Session 断开自动删除） |
| 公平性 | 非公平（争抢式） | 公平（顺序节点排队） |
| 阻塞等待 | 自旋重试 | Watch 事件通知（无轮询） |
| 适用场景 | 高并发、允许极小概率丢锁 | 强一致性要求高（如金融） |

:::danger 面试追问
- Redis 主从切换时锁会丢失吗？→ 是的，Master 加锁后还未同步给 Slave 就宕机，Slave 提升为 Master 后锁丢失。Redlock 算法通过多个独立 Redis 实例解决，但争议较大
- Redisson 的看门狗机制？→ 加锁时不指定 leaseTime 则默认 30 秒，看门狗每 10 秒检查锁是否还被持有，是则续期到 30 秒，防止业务没执行完锁就过期
- 数据库能做分布式锁吗？→ 可以（SELECT ... FOR UPDATE 或唯一索引），但性能差、死锁处理复杂，一般不推荐
:::

---

## ⭐ 如何选型消息队列？Kafka、RocketMQ、RabbitMQ 各自的优缺点？

**简要回答：** Kafka 适合大数据/日志场景（高吞吐、持久化强）；RocketMQ 适合业务消息（事务消息、顺序消息、延迟消息）；RabbitMQ 适合中小规模业务（路由灵活、协议丰富、管理界面友好）。

**深度分析：**

```
三大 MQ 定位对比：

Kafka：        日志采集、流处理、大数据    →  吞吐量之王
RocketMQ：     电商交易、金融支付          →  功能最全面
RabbitMQ：     中小规模业务、微服务解耦     →  易用性最佳
```

**关键细节：**

| 特性 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 开发语言 | Scala/Java | Java | Erlang |
| 吞吐量 | 百万级/秒 | 十万级/秒 | 万级/秒 |
| 延迟 | ms 级 | ms 级 | μs 级（Erlang VM） |
| 消息可靠性 | 同步/异步刷盘 | 同步刷盘 | 消息持久化 + ACK |
| 事务消息 | 不支持（幂等替代） | ✅ 支持 | 不支持 |
| 延迟消息 | 不支持 | ✅ 18 个延迟级别 | ✅ 死信队列 + 插件 |
| 顺序消息 | ✅ 分区内有序 | ✅ 严格顺序 | ❌ 不保证 |
| 消息回溯 | ✅ offset 重置 | ✅ 时间戳回溯 | ❌ 不支持 |
| 消息堆积 | ✅ 磁盘存储，PB 级 | ✅ 磁盘存储 | ❌ 内存为主，堆积能力弱 |
| 运维复杂度 | 中（依赖 ZooKeeper/KRaft） | 中 | 低（单机友好） |
| 社区生态 | 最强（大数据生态） | 国内活跃 | 国际活跃 |

**选型决策树：**

```
日处理数据量 > 亿级？
├── 是 → Kafka（日志、流处理、大数据）
└── 否
    ├── 需要事务消息/顺序消息？
    │   ├── 是 → RocketMQ（电商、金融）
    │   └── 否
    │       ├── 团队规模小/快速上手？→ RabbitMQ
    │       └── 消息堆积要求高？→ RocketMQ
```

:::danger 面试追问
- Kafka 如何保证消息不丢失？→ Producer: acks=all + retries; Broker: min.insync.replicas ≥ 2 + 同步刷盘; Consumer: 手动提交 offset
- RocketMQ 事务消息的实现原理？→ 半消息 + 本地事务执行 + 回查机制（Broker 定时回查 Producer 事务状态）
- 如何保证消息的幂等消费？→ 全局唯一消息 ID + Redis/数据库去重表，消费前先查重
:::
