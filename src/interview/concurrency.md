# 并发编程面试题

> 持续更新中 | 最后更新：2026-04-02

---

## ⭐ 线程池的核心参数与拒绝策略？

**简要回答：** 7 个核心参数：corePoolSize、maximumPoolSize、keepAliveTime、unit、workQueue、threadFactory、handler。4 种拒绝策略。

**深度分析：**

```java
public ThreadPoolExecutor(
    int corePoolSize,      // 核心线程数
    int maximumPoolSize,   // 最大线程数
    long keepAliveTime,    // 空闲线程存活时间
    TimeUnit unit,         // 时间单位
    BlockingQueue<Runnable> workQueue,  // 任务队列
    ThreadFactory threadFactory,        // 线程工厂
    RejectedExecutionHandler handler    // 拒绝策略
)
```

**任务提交执行顺序：**

```mermaid
flowchart TD
    A[提交任务] --> B{核心线程数未满?}
    B -->|是| C[创建核心线程执行]
    B -->|否| D{队列未满?}
    D -->|是| E[加入队列等待]
    D -->|否| F{最大线程数未满?}
    F -->|是| G[创建非核心线程执行]
    F -->|否| H[执行拒绝策略]
```

**4 种拒绝策略：**

| 策略 | 行为 | 适用场景 |
|------|------|----------|
| AbortPolicy | 抛 RejectedExecutionException | 默认，需要感知失败 |
| CallerRunsPolicy | 提交线程自己执行 | 不丢失任务，适合非异步场景 |
| DiscardPolicy | 静默丢弃 | 可容忍丢失 |
| DiscardOldestPolicy | 丢弃队列最老任务 | 优先处理新任务 |

:::tip 实践建议
- CPU 密集型：corePoolSize = CPU 核数 + 1
- IO 密集型：corePoolSize = CPU 核数 × 2（或更多）
- **禁止使用 Executors 创建线程池**（无界队列可能导致 OOM）
:::

---

## ⭐ volatile 关键字的作用？

**简要回答：** 保证可见性 + 禁止指令重排序，但不保证原子性。

**深度分析：**

```java
// 可见性示例
private volatile boolean flag = false;

// 线程A
flag = true;  // 立刻对其他线程可见

// 线程B
while (!flag) { ... }  // 能感知到变化

// 典型用途：DCL 双重检查锁
private static volatile Singleton instance;

public static Singleton getInstance() {
    if (instance == null) {                    // 第一次检查
        synchronized (Singleton.class) {
            if (instance == null) {            // 第二次检查
                instance = new Singleton();    // volatile 防止指令重排
            }
        }
    }
    return instance;
}
```

**为什么不保证原子性？**

```java
volatile int count = 0;

// 两个线程同时执行 count++，实际是 3 步操作：
// 1. 读取 count 值
// 2. 加 1
// 3. 写回 count
// volatile 只保证读/写本身可见，不保证复合操作的原子性
```

**底层原理：** 使用内存屏障（Memory Barrier），JVM 层面对应 `lock` 前缀指令 + 缓存一致性协议（MESI）。

---

## ⭐ ThreadLocal 的原理是什么？为什么会发生内存泄漏？怎么避免？

**简要回答：** ThreadLocal 通过每个线程维护一个 `ThreadLocalMap`（key 是 ThreadLocal 的弱引用，value 是强引用）实现线程隔离。内存泄漏发生在 ThreadLocal 外部强引用被置 null 后，key 被 GC 回收变成 null，但 value 仍然强引用存在无法回收。解决方案是使用后调用 `remove()`。

**深度分析：**

```
ThreadLocal 内存模型：

Thread 对象
├── ThreadLocalMap threadLocals
│   ├── Entry[0]: key(WeakReference) → ThreadLocal@A, value → Object (强引用)
│   ├── Entry[1]: key(WeakReference) → ThreadLocal@B, value → Object (强引用)
│   └── Entry[n]: key(null)           → value → Object (强引用) ⚠️ 泄漏！
│
└── ThreadLocalMap inheritableThreadLocals

内存泄漏过程：
1. ThreadLocal ref 被置为 null（外部强引用断开）
2. ThreadLocalMap 中 key 是 WeakReference → GC 时 key 被回收，变成 null
3. value 仍然是强引用 → 无法被 GC → 内存泄漏
4. 线程长期存活（如线程池）→ 泄漏的 value 一直占用内存
```

```java
// ThreadLocal 核心源码
public class ThreadLocal<T> {
    public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = t.threadLocals;
        if (map != null) {
            map.set(this, value);  // this 作为 key
        } else {
            createMap(t, value);   // 首次使用创建 ThreadLocalMap
        }
    }

    public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = t.threadLocals;
        if (map != null) {
            Entry e = map.getEntry(this);
            if (e != null) return (T) e.value;
        }
        return setInitialValue();  // 返回 initialValue() 的值
    }

    public void remove() {
        ThreadLocalMap m = Thread.currentThread().threadLocals;
        if (m != null) m.remove(this);  // ✅ 手动清理
    }
}

// ThreadLocalMap.Entry — WeakReference
static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;  // 强引用
    Entry(ThreadLocal<?> k, Object v) {
        super(k);  // key 是弱引用
        value = v;  // value 是强引用
    }
}
```

**为什么 key 设计为弱引用？**
- 如果 key 是强引用，ThreadLocal 对象永远不会被回收（即使外部已置 null）
- 弱引用保证 ThreadLocal 对象能被 GC 回收，但引入了 value 泄漏问题
- 这是权衡设计：key 泄漏比 key+value 都泄漏要好

**最佳实践：**

```java
// ❌ 错误写法
public void process() {
    threadLocal.set(new SimpleDateFormat("yyyy-MM-dd"));
    // ... 使用
    // 忘记 remove → 线程池场景下 value 泄漏
}

// ✅ 正确写法：try-finally 保证 remove
public void process() {
    try {
        threadLocal.set(userContext);
        // ... 业务逻辑
    } finally {
        threadLocal.remove();  // 必须！
    }
}
```

**关键细节：**

| 特性 | 说明 |
|------|------|
| 存储位置 | 每个线程的 ThreadLocalMap，非 ThreadLocal 本身 |
| key 类型 | WeakReference（ThreadLocal 对象） |
| value 类型 | 强引用（实际存储的对象） |
| 泄漏条件 | ThreadLocal 被回收 + 线程长期存活 + 未调用 remove |
| 预防措施 | 每次 use 后 finally 中调用 remove() |

:::danger 面试追问
- InheritableThreadLocal 是什么？→ 子线程可以继承父线程的 ThreadLocal 值，但线程池中父子线程关系不确定，推荐使用 Alibaba TTL（TransmittableThreadLocal）
- 线程池场景下 ThreadLocal 有什么坑？→ 线程被复用，上一次的 ThreadLocal 值会被带到下一次任务，必须在 finally 中 remove
- Spring 中哪里用到了 ThreadLocal？→ RequestContextHolder（保存当前请求）、TransactionSynchronizationManager（事务资源绑定）、@Scope("request")
:::

---

## ⭐ StampedLock 是什么？和 ReentrantReadWriteLock 有什么区别？

**简要回答：** StampedLock 是 JDK 8 引入的乐观读锁，支持乐观读、悲观读、写三种模式。相比 ReentrantReadWriteLock，它的读锁不会阻塞写锁（乐观模式下），适合读多写少且读操作很快的场景。

**深度分析：**

```java
// StampedLock 的三种模式
StampedLock lock = new StampedLock();

// 1. 写锁（独占）
long writeStamp = lock.writeLock();
try {
    // 修改共享数据
    value = computeValue();
} finally {
    lock.unlockWrite(writeStamp);
}

// 2. 乐观读（不阻塞写锁！）
long readStamp = lock.tryOptimisticRead();
// 先读数据（不加锁）
int currentValue = value;
// 验证读期间是否有写操作
if (!lock.validate(readStamp)) {
    // 验证失败，升级为悲观读锁
    readStamp = lock.readLock();
    try {
        currentValue = value;
    } finally {
        lock.unlockRead(readStamp);
    }
}

// 3. 悲观读锁（共享锁）
long readStamp = lock.readLock();
try {
    // 读取数据
} finally {
    lock.unlockRead(readStamp);
}
```

**与 ReentrantReadWriteLock 对比：**

| 维度 | ReentrantReadWriteLock | StampedLock |
|------|:---:|:---:|
| 读锁类型 | 悲观读 | 乐观读 + 悲观读 |
| 读-写互斥 | 是（读锁阻塞写锁） | 否（乐观读不阻塞写锁） |
| 写-写互斥 | 是 | 是 |
| 支持条件变量 | ✅ newCondition() | ❌ |
| 可重入 | ✅ | ❌ |
| 支持锁降级 | ✅ 写→读 | ✅ 写→读 |
| 性能 | 中等 | 高（乐观读零开销） |

:::danger 面试追问
- StampedLock 为什么不支持条件变量？→ 因为乐观读不持有锁，无法与 Condition 配合
- StampedLock 为什么不可重入？→ 不可重入是设计选择，避免死锁复杂度。嵌套调用会死锁
- 什么场景用 StampedLock？→ 读多写少、读操作很快（如缓存读取坐标点），不适合长时间持有锁
:::

---

## ⭐ CompletableFuture 的核心 API 和异常处理？

**简要回答：** CompletableFuture 是 Java 8 引入的异步编程工具，支持链式调用、组合多个异步任务、统一异常处理。核心方法：`supplyAsync()`、`thenApply()`、`thenCompose()`、`exceptionally()`、`allOf()`、`anyOf()`。

**深度分析：**

```java
// 基本用法
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return fetchDataFromRemote();  // 异步执行
}, executor);

// 链式转换（thenApply）
future.thenApply(data -> parse(data))
      .thenApply(parsed -> transform(parsed))
      .thenAccept(result -> System.out.println(result));

// 组合两个异步任务（thenCompose - 扁平化）
future.thenCompose(data -> CompletableFuture.supplyAsync(() -> enrich(data)))
      .thenAccept(enriched -> save(enriched));

// 并行执行多个任务
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> fetchUser());
CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> fetchOrder());
CompletableFuture<String> f3 = CompletableFuture.supplyAsync(() -> fetchPayment());

// allOf：等待所有完成
CompletableFuture.allOf(f1, f2, f3).join();

// anyOf：任一完成即可
CompletableFuture<Object> any = CompletableFuture.anyOf(f1, f2, f3);

// 异常处理
future.exceptionally(ex -> {
    log.error("异步任务失败", ex);
    return defaultValue;  // 降级返回
});

// handle：同时处理正常和异常
future.handle((result, ex) -> {
    if (ex != null) {
        return fallbackValue;
    }
    return result;
});
```

:::danger 面试追问
- `thenApply` vs `thenCompose` 的区别？→ `thenApply` 接收同步函数（T→U），`thenCompose` 接收返回 CompletableFuture 的函数（T→CompletableFuture&lt;U&gt;），类似 `map` vs `flatMap`
- `supplyAsync` 默认用什么线程池？→ `ForkJoinPool.commonPool()`，建议自定义线程池避免阻塞公共池
- `join()` vs `get()` 的区别？→ `join()` 抛 unchecked 异常，`get()` 抛 checked 异常（需 try-catch）
:::

---

## ⭐ CAS 和 ABA 问题？

**简要回答：** CAS（Compare-And-Swap）是一种无锁并发原语，通过 CPU 指令原子性地比较并更新值。ABA 问题是 CAS 的经典缺陷——值从 A→B→A，CAS 误认为没变。

**深度分析：**

```java
// CAS 原理：V(内存值) == A(期望值) ? V = B : 失败重试
// Java 通过 Unsafe 类调用 CPU 的 cmpxchg 指令实现

// ABA 问题演示
AtomicInteger ref = new AtomicInteger(100);
// 线程1：准备 CAS(100 → 200)
// 线程2：CAS(100 → 101) → CAS(101 → 100)  // ABA!
// 线程1执行 CAS：发现值还是 100，成功改为 200
// 但实际上值已经被修改过了！

// 解决方案：AtomicStampedReference（加版本号）
AtomicStampedReference<Integer> stampedRef = new AtomicStampedReference<>(100, 0);
int stamp = stampedRef.getStamp();
stampedRef.compareAndSet(100, 200, stamp, stamp + 1);  // 同时比较值和版本号
// 线程2修改后版本号变了，线程1的 CAS 失败
```

**CAS 三大问题总结：**

| 问题 | 描述 | 解决方案 |
|------|------|----------|
| ABA | 值被改回原值 | `AtomicStampedReference` |
| 自旋开销 | 长时间失败空转 | 限制自旋次数，用 `LongAdder` |
| 单变量限制 | 无法原子操作多个变量 | `AtomicReference` 封装对象 |

:::tip 面试追问
- CAS 底层通过 `Unsafe.compareAndSwapInt` 调用 CPU 的 `LOCK CMPXCHG` 指令
- Java 9+ 推荐使用 `VarHandle` 替代 `Unsafe`
- `LongAdder` 在高竞争场景比 `AtomicLong` 性能好（分段 CAS，减少竞争）
:::

---

## ⭐ synchronized 锁升级过程？

**简要回答：** JDK 6+ 的 synchronized 有锁升级机制：无锁 → 偏向锁 → 轻量级锁 → 重量级锁。根据竞争程度自动升级，不可降级（除 GC 外）。

**深度分析：**

```mermaid
stateDiagram-v2
    [*] --> 无锁: 对象刚创建
    无锁 --> 偏向锁: 第一个线程访问，CAS 写入 ThreadID
    偏向锁 --> 轻量级锁: 第二个线程竞争，撤销偏向锁
    轻量级锁 --> 重量级锁: 自旋失败（超过阈值）
    
    note right of 无锁: Mark Word 存储 hashCode\n锁标志 = 01
    note right of 偏向锁: Mark Word 存储线程 ID\n零额外开销
    note right of 轻量级锁: 线程栈 Lock Record\nCAS + 自旋
    note right of 重量级锁: Monitor 对象\nOS 互斥量，阻塞
```

| 锁级别 | 实现方式 | 适用场景 | 开销 |
|--------|---------|---------|------|
| 偏向锁 | CAS 写 ThreadID 到 Mark Word | 几乎无竞争 | 零（不额外加锁） |
| 轻量级锁 | CAS + 自旋 | 少量线程短时间竞争 | 中（自旋消耗 CPU） |
| 重量级锁 | Monitor + OS 互斥量 | 高竞争 | 高（线程阻塞/唤醒） |

```java
// 锁对象头 Mark Word 结构（64 位 JVM）
// |------------------------------------------------------|
// | Mark Word (64 bits)                                   |
// |------------------------------------------------------|
// | unused:25 | identity_hashcode:31 | unused:1 | age:4  | biased_lock:1 | lock:2 |
// 锁标志位：01=无锁/偏向锁, 00=轻量级锁, 10=重量级锁, 11=GC 标记
```

:::tip 面试追问
- **偏向锁在 JDK 15+ 被废弃**：因为维护偏向锁的成本超过了收益，默认 `-XX:-UseBiasedLocking`
- **自旋优化**：自适应自旋（JIT 根据上次自旋成功率决定本次自旋次数）
- **批量重偏向/撤销**：当类级别的偏向锁撤销达到阈值（20次），JVM 会批量重偏向到最新线程
:::

---

## ⭐ AQS 原理是什么？哪些工具基于 AQS？

**简要回答：** AQS（AbstractQueuedSynchronizer）是 JUC 并发工具的核心框架，内部维护一个 `volatile int state` 和一个 CLH 双向队列。提供独占/共享两种模式，ReentrantLock、Semaphore、CountDownLatch、ReentrantReadWriteLock 都基于它。

**深度分析：**

```mermaid
flowchart TB
    subgraph "AQS 核心"
        A["state (volatile int)<br/>同步状态"]
        B["CLH 双向队列<br/>FIFO 等待线程"]
        C["exclusiveOwnerThread<br/>独占持有线程"]
    end
    
    subgraph "独占模式 Exclusive"
        D["ReentrantLock"]
        E["ReentrantReadWriteLock.WriteLock"]
    end
    
    subgraph "共享模式 Shared"
        F["Semaphore"]
        G["CountDownLatch"]
        H["ReentrantReadWriteLock.ReadLock"]
    end
    
    D --> A
    E --> A
    F --> A
    G --> A
    H --> A
```

**核心方法：**

| 方法 | 模式 | 作用 |
|------|------|------|
| `tryAcquire(int)` | 独占 | 尝试获取锁（CAS 修改 state） |
| `tryRelease(int)` | 独占 | 释放锁（CAS 修改 state + 唤醒后继） |
| `tryAcquireShared(int)` | 共享 | 尝试获取共享资源（state-1） |
| `tryReleaseShared(int)` | 共享 | 释放共享资源（state+1） |

```java
// ReentrantLock 的公平锁 tryAcquire 逻辑（简化）
protected final boolean tryAcquire(int acquires) {
    if (hasQueuedPredecessors() &&  // 公平锁：检查队列中是否有等待者
        compareAndSetState(0, acquires)) {  // CAS 修改 state 0→1
        setExclusiveOwnerThread(Thread.currentThread());
        return true;
    }
    return false;
}
```

:::tip 面试追问
- **独占 vs 共享的区别**：独占同一时刻只有一个线程持有（state=0/1），共享可以多个线程同时持有（state=permits 数量）
- **CLH 队列**：每个节点记录前驱节点的等待状态（SIGNAL/CANCELLED），释放锁时唤醒后继节点
- **可重入**：ReentrantLock 通过 `state` 累加实现，每次 lock() state+1，unlock() state-1，state=0 完全释放
:::

