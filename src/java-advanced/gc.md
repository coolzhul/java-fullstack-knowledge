---
title: 垃圾回收
icon: recycle
order: 2
category:
  - Java
tag:
  - Java
  - GC
  - 垃圾回收
---

# 垃圾回收（GC）

> GC 不是"垃圾"回收，是"不可达对象"回收。Java 程序员不用手动 free 内存，但如果你不理解 GC 的工作原理，就无法定位线上频繁 Full GC、OOM、停顿超时等问题。这篇文章从"怎么判断对象该回收"到"怎么选 GC 收集器"，建立完整的知识体系。

## 对象怎么判断"该死了"？

### 可达性分析——GC 的判定标准

```
从 GC Roots 出发，沿着引用链遍历
能到达的对象 → 存活
不可达的对象 → 可回收

GC Roots 包括：
- 虚拟机栈中的局部变量
- 方法区中的静态变量
- 方法区中的常量
- 本地方法栈中的 JNI 引用
```

::: tip 为什么 Java 不用引用计数？
引用计数法有一个致命问题：循环引用。A 引用 B，B 引用 A，两者的计数器都不为 0，但实际上它们已经不可达了。Python 用引用计数 + 弱引用来解决，Java 直接用可达性分析，天然没有循环引用问题。
:::

### 四种引用强度

```java
// 强引用：绝对不会被回收（只要引用还在）
Object strong = new Object();

// 软引用（SoftReference）：内存不足时才回收
// 适合做缓存
SoftReference<byte[]> cache = new SoftReference<>(new byte[1024 * 1024]);

// 弱引用（WeakReference）：下次 GC 时就回收
// 适合做 ThreadLocal 的 key、WeakHashMap
WeakReference<Object> weak = new WeakReference<>(new Object());

// 虚引用（PhantomReference）：不影响对象生命周期
// 唯一用途：对象被 GC 回收时收到通知（通过 ReferenceQueue）
// 用于管理堆外内存（DirectByteBuffer 的清理）
```

## GC 算法——三种基础算法

```mermaid
graph LR
    subgraph MS["标记-清除 Mark-Sweep"]
        MS1["✅ 简单"]
        MS2["❌ 产生内存碎片"]
    end
    subgraph CP["复制 Copying"]
        CP1["✅ 无碎片"]
        CP2["❌ 浪费 50% 内存"]
    end
    subgraph MC["标记-整理 Mark-Compact"]
        MC1["✅ 无碎片"]
        MC2["✅ 利用率高"]
        MC3["❌ 移动开销大"]
    end
    MS -->|"年轻代"| CP
    CP -->|"老年代"| MC
```

```
标记-清除（Mark-Sweep）：
  ✅ 简单
  ❌ 产生内存碎片 → 大对象可能分配失败

复制（Copying）：
  ✅ 无碎片，分配快（指针碰撞）
  ❌ 浪费一半内存
  → 年轻代用的就是复制算法（Eden + 2 个 Survivor）

标记-整理（Mark-Compact）：
  ✅ 无碎片，不浪费内存
  ❌ 移动对象开销大（要更新所有引用）
  → 老年代用的就是标记-整理
```

## 分代收集——为什么要把堆分成年轻代和老年代？

```
绝大多数对象都是"朝生夕死"的：
  - 90%+ 的对象在创建后很快就不可达
  - 存活越久的对象，越可能继续存活

所以分代：
  - 年轻代：用复制算法，GC 频率高但每次很快
  - 老年代：用标记-整理，GC 频率低但每次可能较慢

对象生命周期：
  new → Eden → Minor GC → Survivor → 再 Minor GC → Survivor → ...
  → 年龄达到阈值（默认15） → 晋升到老年代
  → 或大对象直接进老年代（-XX:PretenureSizeThreshold）
```

## GC 收集器——怎么选？

### 一张图看懂收集器演进

```
Serial（单线程）
    → Parallel（多线程，吞吐量优先）
    → CMS（并发标记清除，低延迟）→ 已废弃
    → G1（分区收集，平衡吞吐和延迟）→ JDK 9+ 默认
    → ZGC（超低延迟 < 1ms）→ JDK 15+ 正式
```

### G1 收集器——现代 Java 的默认选择

```
G1 把堆分成多个大小相等的 Region（默认约 2048 个）：
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│  E  │  E  │  S  │  O  │  O  │  H  │  E  │  O  │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
E = Eden, S = Survivor, O = Old, H = Humongous（大对象）
```

特点：
1. 可预测停顿：-XX:MaxGCPauseMillis=200（默认 200ms）
2. 无内存碎片：大部分用复制算法
3. 优先回收垃圾最多的 Region（Garbage First）
4. 适合大堆（6GB+），堆越大优势越明显

G1 的回收过程：
  1. 初始标记（STW）→ 标记 GC Roots 直接关联的对象
  2. 并发标记 → 遍历对象图，和用户线程并发执行
  3. 最终标记（STW）→ 处理并发标记期间变化的部分
  4. 筛选回收（STW）→ 选择垃圾最多的 Region 回收

什么时候触发？
  -XX:InitiatingHeapOccupancyPercent=45
  堆占用达到 45% 时触发并发标记
```

### ZGC——超低延迟的未来

```
目标：GC 停顿时间 < 1ms（实际通常在亚毫秒级）
适用：大堆（16GB+）、低延迟要求高的场景（金融、交易）

核心特性：
- 并发标记、并发整理（几乎全程和用户线程并发）
- 染色指针（Colored Pointers）：在指针中存储 GC 信息
- 读屏障（Load Barrier）：在读取引用时检查并处理

JDK 21+：分代 ZGC 成为默认，进一步降低延迟
```

::: tip 收集器选择建议
- 小应用（< 2GB 堆）：G1 足够
- 大应用（2-16GB 堆）：G1
- 大堆 + 超低延迟要求（> 16GB 堆，要求 < 10ms 停顿）：ZGC
- 不要纠结 CMS，已经废弃了
:::

## GC 日志——排查问题的第一手资料

```bash
# JDK 9+ 统一日志参数
-Xlog:gc*:file=gc.log:time,uptime,level,tags:filecount=5,filesize=20m

# 关键日志格式：
[2024-01-01T10:00:00.123+0800] GC pause (G1 Evacuation Pause) (young)
  [Eden: 256.0M(256.0M)->0.0B(224.0M)
   Survivors: 32.0M->32.0M
   Heap: 384.0M(4096.0M)->160.0M(4096.0M)]
  [Times: user=0.05 sys=0.00, real=0.01 secs]

# 重点看：
# 1. GC 原因（Allocation Failure / System.gc() / Metadata GC Threshold）
# 2. 各区域变化（Eden、Survivor、Heap 的大小变化）
# 3. 耗时（real = 实际停顿时间）
```

## 面试高频题

**Q1：Minor GC 和 Full GC 的区别？**

Minor GC 回收年轻代（Eden + Survivor），频率高、速度快（通常 < 100ms）。Full GC 回收整个堆（包括老年代），频率低但慢（可能数秒），会触发 STW（Stop-The-World），所有用户线程暂停。线上要尽量避免频繁 Full GC。

**Q2：什么情况下对象会直接进入老年代？**

1. 大对象（`-XX:PretenureSizeThreshold`，超过这个大小的对象直接进老年代）；2. 长期存活的对象（年龄达到 `MaxTenuringThreshold`，默认 15）；3. 动态年龄判断（Survivor 中相同年龄的对象大小总和超过 Survivor 空间的一半，大于等于该年龄的对象直接晋升）。

**Q3：G1 和 CMS 的区别？**

CMS 用标记-清除，有内存碎片，无法预测停顿时间，老年代使用。G1 用分区+复制算法，无碎片，可预测停顿时间，全堆收集。G1 是 CMS 的替代品，JDK 9 开始 CMS 被标记为废弃，JDK 14 正式移除。

## 延伸阅读

- 上一篇：[JVM 原理](jvm.md) — 运行时数据区、类加载、JIT
- 下一篇：[性能调优](tuning.md) — JVM 参数、诊断工具、常见问题
- [并发编程](../java-basic/concurrency.md) — 线程安全、锁机制
