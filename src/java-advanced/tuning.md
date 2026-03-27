---
title: 性能调优
icon: speed
order: 3
category:
  - Java
tag:
  - Java
  - 性能调优
  - JVM
---

# Java 性能调优

> 性能调优不是"把 JVM 参数调到极致"，而是"找到瓶颈，针对性解决"。80% 的性能问题来自代码层面（N+1 查询、大对象、锁竞争），而不是 JVM 参数。这篇文章从"怎么发现问题"到"怎么解决问题"，建立系统的调优方法论。

## 调优方法论

```
1. 发现问题：监控告警、用户反馈、日志分析
2. 定位瓶颈：是 CPU？内存？IO？网络？数据库？
3. 分析原因：工具辅助（Arthas、jstack、jmap、GC 日志）
4. 针对优化：改代码 > 改配置 > 改 JVM 参数
5. 验证效果：压测对比，确保优化有效且没有副作用

核心原则：
  - 先监控后优化（不要凭感觉）
  - 先改代码后改参数（代码问题参数补不了）
  - 不要过早优化（先让功能正确，再让功能快）
  - 不要过度优化（维护成本可能超过收益）
```

## 常见性能问题排查

### CPU 飙高

```bash
# Step 1: 找到占用 CPU 最高的 Java 进程
top

# Step 2: 找到进程中 CPU 最高的线程
top -H -p <pid>

# Step 3: 线程 ID 转 16 进制
printf "%x\n" <thread-id>

# Step 4: 查看线程栈
jstack <pid> | grep <hex-id> -A 30

# 常见原因：
# - 死循环（业务逻辑 bug）
# - 正则表达式回溯（如复杂的正则匹配超长字符串）
# - GC 频繁（Minor GC + Full GC 交替，CPU 全在 GC）
# - 加密计算（大量 SSL 握手、加密解密）
```

### 内存泄漏

```bash
# Step 1: 看堆使用趋势（持续上升不下降 = 可能有泄漏）
jstat -gcutil <pid> 5000  # 每 5 秒看一次

# Step 2: 生成堆转储
jmap -dump:format=b,file=/tmp/heap.hprof <pid>
# 或 OOM 时自动生成（推荐加上这个参数）：
# -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/

# Step 3: 用 MAT (Memory Analyzer Tool) 分析
# 看 "Dominator Tree" 找到占用最大的对象
# 看 "Leak Suspects" 自动分析可疑泄漏

# 常见泄漏场景：
# - ThreadLocal 忘记 remove（线程池中线程复用，ThreadLocal 不会自动清理）
# - 静态集合不断添加不清理（如缓存没有淘汰策略）
# - 监听器/回调没有注销
# - 数据库连接/IO 流没有关闭
# - 内部类持有外部类引用导致外部类无法回收
```

### 频繁 GC

```bash
# 分析 GC 日志
-Xlog:gc*:file=gc.log:time,uptime,level,tags

# 看什么？
# 1. Full GC 频率 → 如果每小时好几次，要排查内存泄漏或堆太小
# 2. Minor GC 耗时 → 如果每次 > 100ms，可能年轻代太大或对象太多
# 3. 老年代占用趋势 → 持续接近阈值，说明对象晋升太快

# 常见原因：
# - 堆太小（-Xms = -Xmx，避免动态扩容带来的 Full GC）
# - 大对象太多（大数组、大字符串直接进老年代）
# - 内存泄漏（老年代被无用对象填满）
# - 元空间不足（动态代理类太多）
```

### 死锁

```bash
# Step 1: 查看死锁信息
jstack <pid> | grep -A 20 "deadlock"

# 或用 Arthas
thread -b

# Step 2: 分析死锁链
# 看清楚哪些线程在等哪些锁，形成循环等待

# 预防方法：
# - 锁的获取顺序一致（所有线程按固定顺序获取锁）
# - 使用 tryLock(timeout) 设置超时
# - 减小锁的粒度（锁尽量少的代码）
# - 使用并发容器代替加锁
```

## 代码层面的优化

### Top 10 最常见的性能问题

```java
// 1. N+1 查询（最常见的性能杀手）
// ❌ 查 100 个订单，每个订单查一次用户信息 = 101 次 SQL
List<Order> orders = orderMapper.findAll();
for (Order order : orders) {
    User user = userMapper.findById(order.getUserId());  // N 次！
}
// ✅ 批量查询 = 2 次 SQL
List<Long> userIds = orders.stream().map(Order::getUserId).toList();
Map<Long, User> userMap = userMapper.findByIds(userIds);

// 2. 大集合操作
// ❌ 把 100 万条数据全部加载到内存
List<Order> all = orderMapper.findAll();  // OOM 风险
// ✅ 分页查询
List<Order> page = orderMapper.findPage(pageNum, pageSize);

// 3. String 拼接在循环中
// ❌ 循环中用 + 拼接
String s = "";
for (int i = 0; i < 10000; i++) s += i;
// ✅ 用 StringBuilder
StringBuilder sb = new StringBuilder(10000 * 5);  // 预估大小
for (int i = 0; i < 10000; i++) sb.append(i);

// 4. ArrayList 没有初始容量（已多次提到）
// 5. HashMap 没有初始容量
Map<String, User> map = new HashMap<>(expectedSize * 4 / 3 + 1);  // 避免扩容

// 6. 同步范围太大
// ❌ 整个方法加 synchronized
// ✅ 只锁必要的代码块

// 7. 数据库连接未关闭
// ❌ 获取连接后忘了 close
// ✅ try-with-resources

// 8. 不必要的序列化/反序列化
// ❌ 频繁 JSON 序列化大对象
// ✅ 只序列化需要的字段

// 9. 过度使用反射
// ❌ 高频调用路径上用反射
// ✅ 缓存 Method 对象，或用 MethodHandle

// 10. 日志级别不当
// ❌ debug 级别的日志字符串拼接在生产环境
log.debug("User: " + user + ", orders: " + orders);  // 字符串拼接了但日志不输出
// ✅ 用参数化日志
log.debug("User: {}, orders: {}", user, orders);  // 只有 debug 开启时才拼接
```

## JVM 参数——实战推荐

```bash
# 生产环境推荐配置（G1 收集器，4-8GB 堆）
java -server \
  -Xms4g -Xmx4g \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/tmp/heap.hprof \
  -Xlog:gc*:file=/var/log/app/gc.log:time,uptime,level,tags:filecount=5,filesize=20m \
  -Djava.security.egd=file:/dev/./urandom \  # 加速随机数生成
  -jar app.jar
```

::: tip JVM 参数调优原则
1. `-Xms` = `-Xmx`：避免运行时动态扩容
2. 堆不要太大：不是越大越好，大堆 = GC 扫描范围大 = 停顿长
3. 监控优先：先加监控（GC 日志、Metrics），观察一段时间再调
4. 一次只调一个参数：否则不知道哪个参数生效了
:::

## 面试高频题

**Q1：CPU 100% 怎么排查？**

`top` 找进程 → `top -H -p pid` 找线程 → `printf "%x" tid` 转 16 进制 → `jstack pid | grep hex` 看线程栈。常见原因：死循环、正则回溯、GC 频繁。

**Q2：如何判断是内存泄漏还是堆太小？**

看老年代使用趋势：如果老年代在 Full GC 后仍然接近 100%，且持续上升不回落 → 内存泄漏。如果 Full GC 后老年代降到很低，但很快又满了 → 堆太小或对象创建太快。

## 延伸阅读

- 上一篇：[垃圾回收](gc.md) — GC 算法、收集器选择
- [JVM 原理](jvm.md) — 运行时数据区、类加载、JIT
- [高并发架构](../architecture/high-concurrency.md) — 缓存、限流、降级
