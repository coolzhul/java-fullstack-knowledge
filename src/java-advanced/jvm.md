---
title: JVM原理
icon: memory
order: 1
category:
  - Java
tag:
  - Java
  - JVM
  - 内存模型
---

# JVM原理

Java虚拟机（JVM）是Java程序运行的核心，理解JVM原理对于编写高性能Java程序至关重要。

## JVM架构

```
┌─────────────────────────────────────────────────────────────┐
│                        JVM架构                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 类加载器    │→ │ 运行时数据区 │← │    本地库接口(NI)   │  │
│  │ 子系统      │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          ↓                                   │
│                  ┌─────────────┐                            │
│                  │  执行引擎   │                            │
│                  └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## 运行时数据区

### 程序计数器

- 线程私有
- 存储当前线程执行的字节码指令地址
- 唯一没有OOM的区域

### Java虚拟机栈

```java
// 栈帧结构
┌──────────────────────────┐
│     局部变量表            │  ← 存储方法参数和局部变量
├──────────────────────────┤
│     操作数栈              │  ← 计算过程中的中间结果
├──────────────────────────┤
│     动态链接              │  ← 指向运行时常量池的方法引用
├──────────────────────────┤
│     方法返回地址          │  ← 方法退出后的返回地址
├──────────────────────────┤
│     附加信息              │
└──────────────────────────┘
```

```java
// 栈溢出示例
public class StackOverflowDemo {
    private int count = 0;

    public void recursive() {
        count++;
        recursive();  // 无限递归
    }

    public static void main(String[] args) {
        StackOverflowDemo demo = new StackOverflowDemo();
        try {
            demo.recursive();
        } catch (StackOverflowError e) {
            System.out.println("栈深度: " + demo.count);
        }
    }
}
```

### 本地方法栈

- 为Native方法服务
- 线程私有

### 堆

```java
// 堆内存结构（JDK 8+）
┌─────────────────────────────────────────────────────┐
│                      堆内存                          │
├────────────────┬────────────────┬───────────────────┤
│   年轻代       │                │                   │
│  ┌─────┬─────┐ │    老年代      │                   │
│  │ Eden│ S1  │ │    (Old)       │                   │
│  │     │ S0  │ │                │                   │
│  └─────┴─────┘ │                │                   │
└────────────────┴────────────────┴───────────────────┘
```

### 方法区

- 存储类信息、常量、静态变量
- JDK 7：永久代（PermGen）
- JDK 8+：元空间（Metaspace），使用本地内存

### 运行时常量池

```java
public class ConstantPoolDemo {
    public static void main(String[] args) {
        // 字符串常量池
        String s1 = "Hello";
        String s2 = "Hello";
        String s3 = new String("Hello");
        String s4 = s3.intern();

        System.out.println(s1 == s2);  // true
        System.out.println(s1 == s3);  // false
        System.out.println(s1 == s4);  // true

        // Integer缓存池（-128 ~ 127）
        Integer i1 = 127;
        Integer i2 = 127;
        Integer i3 = 128;
        Integer i4 = 128;

        System.out.println(i1 == i2);  // true
        System.out.println(i3 == i4);  // false
    }
}
```

## 对象内存布局

```java
// 对象结构
┌─────────────────────────────────┐
│         对象头 (Header)          │
│  ┌─────────────────────────────┐│
│  │ Mark Word (8字节)           ││  ← 哈希码、GC分代年龄、锁状态
│  ├─────────────────────────────┤│
│  │ 类型指针 (4/8字节)          ││  ← 指向类元数据
│  ├─────────────────────────────┤│
│  │ 数组长度 (仅数组对象)       ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│         实例数据 (Data)          │
│  字段数据...                    │
├─────────────────────────────────┤
│         对齐填充 (Padding)       │
│  保证对象大小是8字节的倍数      │
└─────────────────────────────────┘
```

## 类加载机制

### 类加载过程

```java
// 类加载流程
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  加载   │ →  │  连接   │ →  │  初始化 │ →  │   使用  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  验证   │ │  准备   │ │  解析   │
   └─────────┘ └─────────┘ └─────────┘
```

### 类加载器

```java
// 类加载器层次
┌─────────────────────────────────────┐
│        Bootstrap ClassLoader        │  ← 加载核心类库（rt.jar等）
│         (启动类加载器)              │
├─────────────────────────────────────┤
│       Extension ClassLoader         │  ← 加载扩展类库（ext目录）
│         (扩展类加载器)              │
├─────────────────────────────────────┤
│       Application ClassLoader       │  ← 加载应用程序类路径
│         (应用类加载器)              │
├─────────────────────────────────────┤
│        Custom ClassLoader           │  ← 自定义类加载器
│         (自定义类加载器)            │
└─────────────────────────────────────┘
```

### 双亲委派模型

```java
public class ClassLoaderDemo {
    public static void main(String[] args) {
        ClassLoader loader = ClassLoaderDemo.class.getClassLoader();
        System.out.println("当前类加载器: " + loader);
        System.out.println("父加载器: " + loader.getParent());
        System.out.println("祖父加载器: " + loader.getParent().getParent());

        // String类由Bootstrap ClassLoader加载
        ClassLoader stringLoader = String.class.getClassLoader();
        System.out.println("String类加载器: " + stringLoader);  // null
    }
}

// 自定义类加载器
class CustomClassLoader extends ClassLoader {
    private String classPath;

    public CustomClassLoader(String classPath) {
        this.classPath = classPath;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            byte[] data = loadClassData(name);
            return defineClass(name, data, 0, data.length);
        } catch (IOException e) {
            throw new ClassNotFoundException(name, e);
        }
    }

    private byte[] loadClassData(String name) throws IOException {
        String fileName = classPath + name.replace('.', '/') + ".class";
        try (InputStream is = new FileInputStream(fileName);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = is.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            return baos.toByteArray();
        }
    }
}
```

## 即时编译器（JIT）

### 编译优化

```java
// 方法内联
public class InlineDemo {
    // 原始代码
    public int add(int a, int b) {
        return a + b;
    }

    public int calculate(int x) {
        return add(x, 10);  // JIT会内联这个方法调用
    }

    // 内联后（等效代码）
    public int calculateInlined(int x) {
        return x + 10;
    }
}

// 逃逸分析
public class EscapeAnalysisDemo {
    // 对象不逃逸，可能被优化为栈上分配
    public void process() {
        Point p = new Point(1, 2);  // 不逃逸
        System.out.println(p.x + p.y);
    }

    // 对象逃逸
    public Point createPoint() {
        return new Point(1, 2);  // 逃逸
    }
}

class Point {
    int x, y;
    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
```

## JVM参数

```bash
# 堆内存设置
-Xms512m          # 初始堆大小
-Xmx2g            # 最大堆大小
-Xmn256m          # 年轻代大小

# 栈内存设置
-Xss256k          # 每个线程的栈大小

# 元空间设置（JDK 8+）
-XX:MetaspaceSize=128m
-XX:MaxMetaspaceSize=256m

# GC设置
-XX:+UseG1GC              # 使用G1收集器
-XX:+UseZGC               # 使用ZGC（JDK 15+）
-XX:MaxGCPauseMillis=200  # 最大GC停顿时间

# GC日志
-Xlog:gc*:file=gc.log

# OOM时生成堆转储
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=dump.hprof
```

## 小结

JVM核心组件：

| 组件 | 作用 |
|------|------|
| 类加载器 | 加载.class文件 |
| 运行时数据区 | 存储程序运行数据 |
| 执行引擎 | 执行字节码 |
| JIT编译器 | 即时编译优化 |

内存区域：

| 区域 | 特点 |
|------|------|
| 堆 | 对象存储，GC主要区域 |
| 栈 | 方法调用，线程私有 |
| 方法区 | 类信息、常量 |
| 程序计数器 | 指令地址 |
