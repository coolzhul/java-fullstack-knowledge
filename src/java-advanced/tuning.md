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

# Java性能调优

性能调优是Java开发中的重要技能，涉及JVM调优、代码优化、系统监控等多个方面。

## 性能指标

### 关键指标

| 指标 | 说明 | 目标 |
|------|------|------|
| 响应时间 | 请求处理时间 | < 200ms |
| 吞吐量 | 单位时间处理请求数 | 越高越好 |
| 并发数 | 同时处理的请求数 | 根据业务定 |
| 错误率 | 失败请求占比 | < 0.1% |
| GC停顿 | GC造成的暂停时间 | < 100ms |
| CPU使用率 | CPU占用比例 | < 80% |
| 内存使用率 | 内存占用比例 | < 80% |

## 性能监控工具

### JDK工具

```bash
# jps - 查看Java进程
jps -l

# jstat - 监控GC
jstat -gc <pid> 1000  # 每秒输出GC信息
jstat -gcutil <pid>   # GC统计信息

# jinfo - 查看JVM参数
jinfo -flags <pid>
jinfo -flag MaxHeapSize <pid>

# jmap - 内存映射
jmap -heap <pid>           # 堆信息
jmap -histo <pid>          # 对象统计
jmap -dump:format=b,file=heap.hprof <pid>  # 堆转储

# jstack - 线程栈
jstack <pid>               # 线程栈信息
jstack -l <pid>            # 包含锁信息

# jcmd - 多功能工具
jcmd <pid> VM.flags        # JVM参数
jcmd <pid> GC.heap_info    # 堆信息
jcmd <pid> Thread.print    # 线程栈
```

### 可视化工具

```bash
# JConsole
jconsole

# VisualVM
jvisualvm

# Java Mission Control (JMC)
# 需要单独下载

# Arthas - 阿里开源诊断工具
java -jar arthas-boot.jar
```

### Arthas常用命令

```bash
# 查看仪表盘
dashboard

# 查看线程
thread
thread -n 5          # CPU占用最高的5个线程
thread <thread-id>   # 线程详情

# 查看方法执行时间
trace com.example.Service method

# 监控方法调用
monitor -c 5 com.example.Service method

# 查看方法参数和返回值
watch com.example.Service method "{params, returnObj}"

# 反编译
jad com.example.Service

# 查看类信息
sc -d com.example.Service

# 查看方法信息
sm -d com.example.Service method

# 堆转储
heapdump /tmp/dump.hprof
```

## JVM调优

### 内存调优

```bash
# 堆内存
-Xms4g                    # 初始堆大小
-Xmx4g                    # 最大堆大小（与-Xms相同避免动态扩展）
-Xmn2g                    # 年轻代大小
-XX:NewRatio=2            # 老年代:年轻代 = 2:1
-XX:SurvivorRatio=8       # Eden:S0:S1 = 8:1:1

# 元空间
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m

# 栈内存
-Xss256k                  # 每个线程栈大小

# 直接内存
-XX:MaxDirectMemorySize=1g
```

### GC调优

```bash
# 选择GC收集器
-XX:+UseG1GC              # G1（推荐）
-XX:+UseZGC               # ZGC（低延迟）

# G1调优
-XX:MaxGCPauseMillis=200  # 目标停顿时间
-XX:G1HeapRegionSize=16m  # Region大小
-XX:InitiatingHeapOccupancyPercent=45  # 触发并发GC的堆占用率

# 日志
-Xlog:gc*:file=gc.log:time,uptime,level,tags
```

### JIT调优

```bash
# 分层编译
-XX:+TieredCompilation    # 默认开启

# 代码缓存
-XX:ReservedCodeCacheSize=256m

# JIT阈值
-XX:CompileThreshold=10000  # 方法调用次数达到阈值后编译
```

## 代码层面优化

### 字符串优化

```java
// 1. 字符串拼接
// 不推荐
String s = "";
for (int i = 0; i < 1000; i++) {
    s += i;  // 每次创建新对象
}

// 推荐
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String result = sb.toString();

// 2. 字符串常量池
// 推荐：使用intern()复用字符串
String s1 = new String("hello").intern();
String s2 = "hello";
System.out.println(s1 == s2);  // true
```

### 集合优化

```java
// 1. 设置初始容量
// 不推荐
List<String> list = new ArrayList<>();  // 默认容量10，需要多次扩容

// 推荐
List<String> list = new ArrayList<>(1000);  // 预估容量

// 2. 选择合适的集合
// 随机访问：ArrayList
// 频繁插入删除：LinkedList
// 去重：HashSet
// 排序：TreeSet
// 键值对：HashMap

// 3. HashMap初始容量
Map<String, String> map = new HashMap<>(64);  // 避免扩容
```

### 并发优化

```java
// 1. 使用并发集合
// 不推荐
Map<String, String> map = Collections.synchronizedMap(new HashMap<>());

// 推荐
Map<String, String> map = new ConcurrentHashMap<>();

// 2. 使用线程池
// 不推荐
new Thread(() -> doSomething()).start();

// 推荐
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> doSomething());

// 3. 使用LongAdder代替AtomicLong
// 高并发计数场景
LongAdder counter = new LongAdder();
counter.increment();
```

### IO优化

```java
// 1. 使用缓冲
// 不推荐
FileInputStream fis = new FileInputStream("file.txt");

// 推荐
BufferedInputStream bis = new BufferedInputStream(
    new FileInputStream("file.txt")
);

// 2. 使用NIO
// 大文件复制
Files.copy(sourcePath, destPath, StandardCopyOption.REPLACE_EXISTING);

// 3. 使用try-with-resources
try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
    // ...
}
```

### 对象优化

```java
// 1. 避免创建不必要的对象
// 不推荐
String s = new String("hello");  // 创建两个对象

// 推荐
String s = "hello";  // 使用常量池

// 2. 重用对象
// 不推荐
Boolean b = new Boolean(true);

// 推荐
Boolean b = Boolean.TRUE;

// 3. 延迟初始化
public class LazyInit {
    private volatile ExpensiveObject instance;

    public ExpensiveObject getInstance() {
        if (instance == null) {
            synchronized (this) {
                if (instance == null) {
                    instance = new ExpensiveObject();
                }
            }
        }
        return instance;
    }
}
```

## 数据库优化

### 连接池配置

```java
// HikariCP配置（推荐）
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/db");
config.setUsername("user");
config.setPassword("password");
config.setMaximumPoolSize(20);        // 最大连接数
config.setMinimumIdle(5);             // 最小空闲连接
config.setConnectionTimeout(30000);   // 连接超时
config.setIdleTimeout(600000);        // 空闲超时
config.setMaxLifetime(1800000);       // 连接最大生命周期
```

### SQL优化

```sql
-- 1. 使用索引
CREATE INDEX idx_user_name ON users(name);

-- 2. 避免SELECT *
SELECT id, name FROM users WHERE id = 1;

-- 3. 使用EXPLAIN分析
EXPLAIN SELECT * FROM users WHERE name = 'test';

-- 4. 批量操作
INSERT INTO users (name, age) VALUES
    ('a', 20),
    ('b', 25),
    ('c', 30);
```

## 常见问题排查

### CPU飙高

```bash
# 1. 找到占用CPU高的进程
top

# 2. 找到进程中的高CPU线程
top -H -p <pid>

# 3. 将线程ID转换为16进制
printf "%x\n" <thread-id>

# 4. 查看线程栈
jstack <pid> | grep <hex-thread-id> -A 30
```

### 内存溢出

```bash
# 1. 生成堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 2. 使用MAT或VisualVM分析

# 3. 查看大对象
jmap -histo <pid> | head -20
```

### 死锁

```bash
# 查看死锁
jstack <pid> | grep -A 10 "deadlock"

# 或使用Arthas
thread -b
```

### GC频繁

```bash
# 1. 查看GC统计
jstat -gcutil <pid> 1000

# 2. 分析GC日志
# 关注Full GC频率和耗时

# 3. 解决方案
# - 增大堆内存
# - 优化对象创建
# - 调整GC参数
```

## 小结

性能调优是一个系统工程，需要从多个层面考虑：

| 层面 | 优化方向 |
|------|----------|
| JVM | 内存、GC、JIT |
| 代码 | 数据结构、算法、并发 |
| 数据库 | SQL、连接池、索引 |
| 架构 | 缓存、异步、分库分表 |

::: tip 调优原则
1. 先监控，后优化
2. 找到瓶颈，针对性优化
3. 优化后验证效果
4. 不过度优化
:::
