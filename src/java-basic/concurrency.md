---
title: 并发编程
icon: concurrent
order: 5
category:
  - Java
tag:
  - Java
  - 并发
  - 多线程
  - JUC
---

# Java并发编程

并发编程是Java开发中的核心技能，涉及多线程、锁机制、并发容器等内容。

## 线程基础

### 创建线程

```java
// 方式1：继承Thread类
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread running: " + Thread.currentThread().getName());
    }
}

// 方式2：实现Runnable接口
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Runnable running: " + Thread.currentThread().getName());
    }
}

// 方式3：实现Callable接口（有返回值）
class MyCallable implements Callable<String> {
    @Override
    public String call() throws Exception {
        Thread.sleep(1000);
        return "Callable result";
    }
}

public class ThreadDemo {
    public static void main(String[] args) throws Exception {
        // 方式1
        MyThread t1 = new MyThread();
        t1.start();

        // 方式2
        Thread t2 = new Thread(new MyRunnable());
        t2.start();

        // 方式2（Lambda）
        Thread t3 = new Thread(() -> System.out.println("Lambda thread"));
        t3.start();

        // 方式3
        FutureTask<String> futureTask = new FutureTask<>(new MyCallable());
        Thread t4 = new Thread(futureTask);
        t4.start();
        System.out.println(futureTask.get());  // 获取返回值
    }
}
```

### 线程生命周期

```java
public class ThreadStateDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(() -> {
            try {
                Thread.sleep(1000);  // TIMED_WAITING
                synchronized (ThreadStateDemo.class) {
                    ThreadStateDemo.class.wait();  // WAITING
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        System.out.println("创建后: " + thread.getState());  // NEW

        thread.start();
        System.out.println("启动后: " + thread.getState());  // RUNNABLE

        Thread.sleep(100);  // 等待线程启动
        System.out.println("睡眠中: " + thread.getState());  // TIMED_WAITING

        thread.join();  // 等待线程结束
        System.out.println("结束后: " + thread.getState());  // TERMINATED
    }
}
```

## 线程同步

### synchronized关键字

```java
public class SynchronizedDemo {
    private int count = 0;
    private final Object lock = new Object();

    // 同步实例方法（锁this）
    public synchronized void increment1() {
        count++;
    }

    // 同步代码块（锁指定对象）
    public void increment2() {
        synchronized (lock) {
            count++;
        }
    }

    // 同步静态方法（锁Class对象）
    public static synchronized void staticMethod() {
        // ...
    }
}

// 同步代码块示例
class Counter {
    private int count = 0;

    public void add() {
        synchronized (this) {
            count++;
        }
    }

    public int getCount() {
        return count;
    }
}

public class SynchronizedExample {
    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();

        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                counter.add();
            }
        });

        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                counter.add();
            }
        });

        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Count: " + counter.getCount());  // 20000
    }
}
```

### Lock接口

```java
import java.util.concurrent.locks.*;

public class LockDemo {
    private int count = 0;
    private final ReentrantLock lock = new ReentrantLock();

    public void increment() {
        lock.lock();  // 获取锁
        try {
            count++;
        } finally {
            lock.unlock();  // 释放锁（必须在finally中）
        }
    }

    // 可中断锁
    public void interruptibleLock() throws InterruptedException {
        if (lock.tryLock(1, TimeUnit.SECONDS)) {  // 尝试获取锁，最多等待1秒
            try {
                // 临界区代码
            } finally {
                lock.unlock();
            }
        } else {
            System.out.println("获取锁失败");
        }
    }

    // 读写锁
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock readLock = rwLock.readLock();
    private final Lock writeLock = rwLock.writeLock();

    public int read() {
        readLock.lock();
        try {
            return count;
        } finally {
            readLock.unlock();
        }
    }

    public void write(int value) {
        writeLock.lock();
        try {
            count = value;
        } finally {
            writeLock.unlock();
        }
    }
}
```

### Condition条件变量

```java
import java.util.concurrent.locks.*;

class BoundedBuffer<T> {
    private final Lock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    private final Object[] items;
    private int putIndex, takeIndex, count;

    public BoundedBuffer(int capacity) {
        items = new Object[capacity];
    }

    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length) {
                notFull.await();  // 等待不满
            }
            items[putIndex] = item;
            if (++putIndex == items.length) putIndex = 0;
            count++;
            notEmpty.signal();  // 通知不为空
        } finally {
            lock.unlock();
        }
    }

    @SuppressWarnings("unchecked")
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0) {
                notEmpty.await();  // 等待不为空
            }
            Object item = items[takeIndex];
            if (++takeIndex == items.length) takeIndex = 0;
            count--;
            notFull.signal();  // 通知不满
            return (T) item;
        } finally {
            lock.unlock();
        }
    }
}
```

## JUC并发包

### 原子类

```java
import java.util.concurrent.atomic.*;

public class AtomicDemo {
    public static void main(String[] args) {
        // 基本类型原子类
        AtomicInteger atomicInt = new AtomicInteger(0);
        atomicInt.incrementAndGet();  // ++i
        atomicInt.getAndIncrement();  // i++
        atomicInt.compareAndSet(0, 10);  // CAS操作

        // 原子引用
        AtomicReference<String> atomicRef = new AtomicReference<>("initial");
        atomicRef.compareAndSet("initial", "updated");

        // 原子数组
        int[] arr = {1, 2, 3};
        AtomicIntegerArray atomicArr = new AtomicIntegerArray(arr);
        atomicArr.incrementAndGet(0);

        // 字段更新器
        AtomicIntegerFieldUpdater<User> updater =
            AtomicIntegerFieldUpdater.newUpdater(User.class, "age");

        // 原子累加器（高性能）
        LongAdder adder = new LongAdder();
        adder.increment();
        adder.add(10);
        System.out.println(adder.sum());
    }
}

class User {
    volatile int age;
}
```

### 并发容器

```java
import java.util.concurrent.*;

public class ConcurrentContainerDemo {
    public static void main(String[] args) {
        // ConcurrentHashMap
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        map.put("key", 1);
        map.computeIfAbsent("newKey", k -> 100);

        // CopyOnWriteArrayList
        CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
        list.add("item");

        // BlockingQueue
        BlockingQueue<String> queue = new ArrayBlockingQueue<>(100);
        queue.offer("item");  // 非阻塞
        queue.put("item");     // 阻塞

        // PriorityBlockingQueue
        PriorityBlockingQueue<Integer> pq = new PriorityBlockingQueue<>();

        // DelayQueue
        DelayQueue<DelayedTask> dq = new DelayQueue<>();
    }
}

class DelayedTask implements Delayed {
    private final long executeTime;

    public DelayedTask(long delayMs) {
        this.executeTime = System.currentTimeMillis() + delayMs;
    }

    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(executeTime - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }

    @Override
    public int compareTo(Delayed o) {
        return Long.compare(this.executeTime, ((DelayedTask) o).executeTime);
    }
}
```

### 线程池

```java
import java.util.concurrent.*;

public class ThreadPoolDemo {
    public static void main(String[] args) {
        // 固定大小线程池
        ExecutorService fixedPool = Executors.newFixedThreadPool(5);

        // 缓存线程池
        ExecutorService cachedPool = Executors.newCachedThreadPool();

        // 单线程池
        ExecutorService singlePool = Executors.newSingleThreadExecutor();

        // 定时任务线程池
        ScheduledExecutorService scheduledPool = Executors.newScheduledThreadPool(2);

        // 自定义线程池（推荐）
        ThreadPoolExecutor customPool = new ThreadPoolExecutor(
            5,                      // 核心线程数
            10,                     // 最大线程数
            60L, TimeUnit.SECONDS,  // 空闲线程存活时间
            new LinkedBlockingQueue<>(100),  // 工作队列
            new ThreadFactory() {   // 线程工厂
                private int count = 0;
                @Override
                public Thread newThread(Runnable r) {
                    return new Thread(r, "my-thread-" + count++);
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
        );

        // 提交任务
        Future<?> future = customPool.submit(() -> {
            System.out.println("Task running in " + Thread.currentThread().getName());
        });

        // 提交有返回值的任务
        Future<String> resultFuture = customPool.submit(() -> "Result");

        // 定时任务
        scheduledPool.scheduleAtFixedRate(() -> {
            System.out.println("Scheduled task");
        }, 0, 1, TimeUnit.SECONDS);

        // 关闭线程池
        customPool.shutdown();
        try {
            if (!customPool.awaitTermination(60, TimeUnit.SECONDS)) {
                customPool.shutdownNow();
            }
        } catch (InterruptedException e) {
            customPool.shutdownNow();
        }
    }
}
```

### CompletableFuture

```java
import java.util.concurrent.*;

public class CompletableFutureDemo {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(4);

        // 创建CompletableFuture
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
            sleep(1000);
            return "Hello";
        }, executor);

        CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
            sleep(1000);
            return "World";
        }, executor);

        // 组合多个Future
        CompletableFuture<String> combined = future1.thenCombine(future2, (a, b) -> a + " " + b);

        // 链式调用
        CompletableFuture<String> chained = CompletableFuture
            .supplyAsync(() -> "Hello")
            .thenApply(s -> s + " World")
            .thenApply(String::toUpperCase);

        // 异常处理
        CompletableFuture<String> withException = CompletableFuture
            .supplyAsync(() -> {
                if (true) throw new RuntimeException("Error");
                return "Success";
            })
            .exceptionally(ex -> "Error: " + ex.getMessage());

        // 等待所有完成
        CompletableFuture<Void> allOf = CompletableFuture.allOf(future1, future2);

        // 等待任一完成
        CompletableFuture<Object> anyOf = CompletableFuture.anyOf(future1, future2);

        // 获取结果
        try {
            System.out.println(combined.get(5, TimeUnit.SECONDS));
        } catch (Exception e) {
            e.printStackTrace();
        }

        executor.shutdown();
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### CountDownLatch / CyclicBarrier / Semaphore

```java
import java.util.concurrent.*;

public class SyncToolsDemo {
    public static void main(String[] args) throws Exception {
        // CountDownLatch - 一次性计数器
        CountDownLatch latch = new CountDownLatch(3);
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                System.out.println(Thread.currentThread().getName() + " 完成");
                latch.countDown();
            }).start();
        }
        latch.await();
        System.out.println("所有线程完成");

        // CyclicBarrier - 循环屏障
        CyclicBarrier barrier = new CyclicBarrier(3, () -> {
            System.out.println("所有线程到达屏障，继续执行");
        });
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                try {
                    System.out.println(Thread.currentThread().getName() + " 到达屏障");
                    barrier.await();
                    System.out.println(Thread.currentThread().getName() + " 继续执行");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
        }

        // Semaphore - 信号量
        Semaphore semaphore = new Semaphore(3);  // 3个许可
        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                try {
                    semaphore.acquire();  // 获取许可
                    System.out.println(Thread.currentThread().getName() + " 获取资源");
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    semaphore.release();  // 释放许可
                }
            }).start();
        }
    }
}
```

## 线程安全策略

### 不可变对象

```java
// 不可变类
public final class ImmutablePerson {
    private final String name;
    private final int age;
    private final List<String> hobbies;

    public ImmutablePerson(String name, int age, List<String> hobbies) {
        this.name = name;
        this.age = age;
        this.hobbies = Collections.unmodifiableList(new ArrayList<>(hobbies));
    }

    public String getName() { return name; }
    public int getAge() { return age; }
    public List<String> getHobbies() { return hobbies; }
}
```

### ThreadLocal

```java
public class ThreadLocalDemo {
    private static final ThreadLocal<String> userContext = new ThreadLocal<>();

    public static void main(String[] args) {
        // 设置线程局部变量
        userContext.set("User-1");

        new Thread(() -> {
            userContext.set("User-2");
            System.out.println("Thread-1: " + userContext.get());
            userContext.remove();  // 清理
        }).start();

        System.out.println("Main: " + userContext.get());

        userContext.remove();  // 清理
    }
}
```

## 小结

| 机制 | 用途 | 特点 |
|------|------|------|
| synchronized | 互斥同步 | 简单易用，自动释放锁 |
| Lock | 灵活锁定 | 可中断、超时、公平锁 |
| volatile | 可见性 | 轻量级，不保证原子性 |
| Atomic类 | 原子操作 | CAS实现，高性能 |
| 线程池 | 线程复用 | 控制并发数，提高性能 |
| CompletableFuture | 异步编程 | 链式调用，组合操作 |
