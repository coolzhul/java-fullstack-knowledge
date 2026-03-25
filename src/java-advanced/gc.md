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

# 垃圾回收

垃圾回收（Garbage Collection）是JVM自动管理内存的机制，理解GC对于性能优化至关重要。

## 对象存活判定

### 引用计数法

```java
// 引用计数法（Python使用，Java不使用）
// 问题：循环引用无法回收
class ReferenceCountingGC {
    public Object instance = null;
}

public void test() {
    ReferenceCountingGC a = new ReferenceCountingGC();
    ReferenceCountingGC b = new ReferenceCountingGC();
    a.instance = b;
    b.instance = a;
    a = null;
    b = null;
    // 循环引用，但应该被回收
}
```

### 可达性分析

JVM使用可达性分析来判断对象是否存活。

```java
// GC Roots包括：
// 1. 虚拟机栈中引用的对象
// 2. 方法区中类静态属性引用的对象
// 3. 方法区中常量引用的对象
// 4. 本地方法栈中JNI引用的对象

public class GCRootsDemo {
    private static Object staticVar;       // GC Root
    private static final Object CONST = new Object();  // GC Root

    public void method() {
        Object localVar = new Object();    // GC Root（栈帧中）
    }
}
```

### 引用类型

```java
import java.lang.ref.*;

public class ReferenceTypesDemo {
    public static void main(String[] args) {
        // 强引用 - 不会被回收
        Object strongRef = new Object();

        // 软引用 - 内存不足时回收
        SoftReference<byte[]> softRef = new SoftReference<>(new byte[1024 * 1024]);

        // 弱引用 - 下次GC时回收
        WeakReference<Object> weakRef = new WeakReference<>(new Object());

        // 虚引用 - 无法通过虚引用获取对象，用于跟踪GC
        ReferenceQueue<Object> queue = new ReferenceQueue<>();
        PhantomReference<Object> phantomRef = new PhantomReference<>(new Object(), queue);

        // 测试弱引用
        Object obj = new Object();
        WeakReference<Object> ref = new WeakReference<>(obj);
        System.out.println(ref.get());  // 对象
        obj = null;
        System.gc();
        System.out.println(ref.get());  // 可能是null
    }
}
```

## GC算法

### 标记-清除算法

```
标记前：
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ A │ B │ C │ D │ E │ F │ G │ H │
└───┴───┴───┴───┴───┴───┴───┴───┘

标记后（A、C、E、G存活）：
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ A │ × │ C │ × │ E │ × │ G │ × │
└───┴───┴───┴───┴───┴───┴───┴───┘

清除后：
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ A │   │ C │   │ E │   │ G │   │
└───┴───┴───┴───┴───┴───┴───┴───┘

缺点：内存碎片
```

### 复制算法

```
复制前（From区）：
┌───┬───┬───┬───┬───┬───┬───┬───┐     ┌───┬───┬───┬───┬───┬───┬───┬───┐
│ A │ × │ C │ × │ E │ × │ G │ × │     │   │   │   │   │   │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┘     └───┴───┴───┴───┴───┴───┴───┴───┘
        From区                                   To区

复制后（To区）：
┌───┬───┬───┬───┬───┬───┬───┬───┐     ┌───┬───┬───┬───┬───┬───┬───┬───┐
│   │   │   │   │   │   │   │   │     │ A │ C │ E │ G │   │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┘     └───┴───┴───┴───┴───┴───┴───┴───┘
        From区                                   To区

优点：无碎片
缺点：内存利用率低（需要保留一半空间）
```

### 标记-整理算法

```
标记后：
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ A │ × │ C │ × │ E │ × │ G │ × │
└───┴───┴───┴───┴───┴───┴───┴───┘

整理后：
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ A │ C │ E │ G │   │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┘

优点：无碎片，内存利用率高
缺点：移动对象成本高
```

## 分代收集

```java
// 堆内存分代结构
┌────────────────────────────────────────────────────────┐
│                       堆内存                           │
├─────────────────────────────┬──────────────────────────┤
│          年轻代             │         老年代           │
│  ┌────────────────────────┐ │                          │
│  │    Eden   S1    S0     │ │                          │
│  │   (8)    (1)   (1)     │ │                          │
│  └────────────────────────┘ │                          │
│        (1/3 堆大小)         │     (2/3 堆大小)         │
└─────────────────────────────┴──────────────────────────┘
```

### 对象晋升规则

```java
// 对象在Eden区创建
// Minor GC时，存活对象复制到Survivor区
// 年龄达到阈值（默认15），晋升到老年代
// 大对象直接进入老年代

public class ObjectAgingDemo {
    public static void main(String[] args) {
        // VM参数：-XX:MaxTenuringThreshold=15 -XX:+PrintTenuringDistribution

        byte[] allocation1 = new byte[1024 * 1024];  // Eden

        // 触发Minor GC后，对象年龄+1
        // 年龄达到阈值后晋升老年代
    }
}
```

## 垃圾收集器

### Serial收集器

```bash
# 单线程收集器，简单高效
# 适合客户端模式、小内存应用
-XX:+UseSerialGC
```

### Parallel收集器

```bash
# 多线程收集器，关注吞吐量
# JDK 8默认收集器
-XX:+UseParallelGC
-XX:ParallelGCThreads=4  # GC线程数
```

### CMS收集器

```bash
# 并发收集器，关注低延迟
# 已废弃（JDK 14移除）
-XX:+UseConcMarkSweepGC
-XX:CMSInitiatingOccupancyFraction=75  # 老年代占用比例触发GC
```

### G1收集器

```bash
# 面向服务端的收集器，JDK 9+默认
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200  # 目标停顿时间
-XX:G1HeapRegionSize=4m   # Region大小
```

```java
// G1将堆划分为多个Region
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│  E  │  E  │  S  │  O  │  O  │  H  │  E  │  O  │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
E = Eden, S = Survivor, O = Old, H = Humongous

// 特点：
// 1. 可预测停顿时间
// 2. 无内存碎片
// 3. 整体标记-整理 + 局部复制算法
```

### ZGC收集器

```bash
# 低延迟收集器（JDK 15+正式可用）
# 目标停顿时间不超过10ms
-XX:+UseZGC
-XX:ZCollectionInterval=5  # GC间隔（秒）
```

### Shenandoah收集器

```bash
# 低延迟收集器
# 目标停顿时间不超过10ms
-XX:+UseShenandoahGC
```

## GC日志分析

### 启用GC日志

```bash
# JDK 8
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log

# JDK 9+
-Xlog:gc*:file=gc.log:time,uptime,level,tags
```

### 日志示例分析

```
# Minor GC
[GC (Allocation Failure) [PSYoungGen: 8192K->1024K(9216K)] 8192K->2048K(19456K), 0.0051234 secs]

# 解析：
# GC原因：Allocation Failure（分配失败）
# 年轻代：8192K -> 1024K，总大小9216K
# 整个堆：8192K -> 2048K，总大小19456K
# 耗时：0.0051234秒

# Full GC
[Full GC (Metadata GC Threshold) [PSYoungGen: 1024K->0K(9216K)] [ParOldGen: 1024K->1024K(10240K)] 2048K->1024K(19456K), [Metaspace: 8192K->8192K(1056768K)], 0.05 secs]

# G1 GC
[GC pause (G1 Evacuation Pause) (young), 0.0051234 secs]
   [Eden: 4096.0M(4096.0M)->0.0B(3584.0M) Survivors: 512.0M->1024.0M Heap: 8192.0M(16384.0M)->4608.0M(16384.0M)]
```

## GC调优

### 常用调优策略

```bash
# 1. 合理设置堆大小
-Xms4g -Xmx4g  # 初始和最大堆相同，避免动态扩展

# 2. 选择合适的收集器
# 吞吐量优先：Parallel GC
# 延迟优先：G1 / ZGC

# 3. 调整年轻代比例
-XX:NewRatio=2       # 老年代:年轻代 = 2:1
-XX:SurvivorRatio=8  # Eden:S0:S1 = 8:1:1

# 4. 大对象直接进入老年代
-XX:PretenureSizeThreshold=1m

# 5. 调整晋升年龄
-XX:MaxTenuringThreshold=15

# 6. G1调优
-XX:MaxGCPauseMillis=200  # 目标停顿时间
-XX:G1HeapWastePercent=5  # 允许浪费的堆百分比
```

### 调优案例

```java
// 场景1：频繁Full GC
// 原因：老年代空间不足
// 解决：增大堆大小或调整年轻代比例

// 场景2：Minor GC频繁
// 原因：年轻代空间太小
// 解决：增大年轻代大小

// 场景3：GC停顿时间长
// 原因：堆太大或使用了不合适的收集器
// 解决：减小堆或使用低延迟收集器（G1/ZGC）
```

## 小结

| 收集器 | 类型 | 适用场景 |
|--------|------|----------|
| Serial | 单线程 | 客户端、小内存 |
| Parallel | 多线程 | 吞吐量优先 |
| CMS | 并发 | 低延迟（已废弃） |
| G1 | 分区 | 服务端、通用 |
| ZGC | 并发 | 超低延迟 |
