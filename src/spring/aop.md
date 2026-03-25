---
title: Spring AOP
icon: layers
order: 2
category:
  - Spring
tag:
  - Spring
  - AOP
  - 切面编程
---

# Spring AOP

面向切面编程（Aspect-Oriented Programming）是将与业务无关的逻辑分离出来，实现代码的模块化。

## AOP概念

### 核心术语

| 术语 | 说明 |
|------|------|
| Aspect（切面） | 横切关注点的模块化 |
| JoinPoint（连接点） | 程序执行的某个点（方法调用） |
| Pointcut（切点） | 匹配连接点的表达式 |
| Advice（通知） | 在切点执行的代码 |
| Target（目标） | 被通知的对象 |
| Proxy（代理） | AOP框架创建的对象 |
| Weaving（织入） | 将切面应用到目标对象 |

### 通知类型

```java
// 前置通知
@Before

// 后置通知（方法执行后，无论是否异常）
@After

// 返回通知（方法成功执行后）
@AfterReturning

// 异常通知（方法抛出异常后）
@AfterThrowing

// 环绕通知（包围方法执行）
@Around
```

## 启用AOP

```java
@Configuration
@EnableAspectJAutoProxy
@ComponentScan
public class AopConfig {
}

// 或在Spring Boot中，添加依赖即可自动配置
```

## 切面定义

### 基本切面

```java
@Aspect
@Component
public class LoggingAspect {

    // 切点表达式
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceLayer() {}

    // 前置通知
    @Before("serviceLayer()")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("执行方法: " + joinPoint.getSignature().getName());
    }

    // 后置通知
    @After("serviceLayer()")
    public void logAfter(JoinPoint joinPoint) {
        System.out.println("方法执行完成: " + joinPoint.getSignature().getName());
    }
}
```

### 切点表达式

```java
@Aspect
@Component
public class PointcutExpressions {

    // execution - 方法执行
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void anyServiceMethod() {}

    // within - 类型限制
    @Pointcut("within(com.example.service..*)")
    public void withinServicePackage() {}

    // @annotation - 注解标记
    @Pointcut("@annotation(com.example.annotation.Loggable)")
    public void loggableMethod() {}

    // bean - Bean名称
    @Pointcut("bean(userService)")
    public void userServiceBean() {}

    // args - 参数类型
    @Pointcut("execution(* *(String, ..))")
    public void firstArgString() {}

    // @within - 类级别注解
    @Pointcut("@within(org.springframework.stereotype.Service)")
    public void serviceAnnotatedClass() {}

    // 组合切点
    @Pointcut("anyServiceMethod() && loggableMethod()")
    public void loggableServiceMethod() {}
}
```

### 通知详解

```java
@Aspect
@Component
public class AdviceTypes {

    // 环绕通知 - 最强大
    @Around("execution(* com.example.service.*.*(..))")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        System.out.println("方法开始: " + methodName + ", 参数: " + Arrays.toString(args));

        try {
            Object result = joinPoint.proceed();  // 执行目标方法
            System.out.println("方法返回: " + result);
            return result;
        } catch (Exception e) {
            System.out.println("方法异常: " + e.getMessage());
            throw e;
        } finally {
            System.out.println("方法结束: " + methodName);
        }
    }

    // 返回通知
    @AfterReturning(
        pointcut = "execution(* com.example.service.*.*(..))",
        returning = "result"
    )
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        System.out.println("方法返回值: " + result);
    }

    // 异常通知
    @AfterThrowing(
        pointcut = "execution(* com.example.service.*.*(..))",
        throwing = "ex"
    )
    public void logAfterThrowing(JoinPoint joinPoint, Exception ex) {
        System.out.println("方法抛出异常: " + ex.getMessage());
    }

    // 带参数的通知
    @Before("execution(* com.example.service.UserService.findById(..)) && args(id)")
    public void logWithParam(Long id) {
        System.out.println("查询用户ID: " + id);
    }
}
```

## 实战示例

### 日志切面

```java
@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("@annotation(loggable)")
    public Object logMethod(ProceedingJoinPoint joinPoint, Loggable loggable) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        log.info("{}.{}() 开始执行, 参数: {}", className, methodName, args);

        long startTime = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;

            log.info("{}.{}() 执行完成, 耗时: {}ms, 结果: {}",
                className, methodName, duration, result);
            return result;
        } catch (Exception e) {
            log.error("{}.{}() 执行异常: {}", className, methodName, e.getMessage());
            throw e;
        }
    }
}

// 注解定义
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Loggable {
    String value() default "";
}
```

### 性能监控切面

```java
@Aspect
@Component
public class PerformanceAspect {

    private final Map<String, Statistics> stats = new ConcurrentHashMap<>();

    @Around("@annotation(monitor)")
    public Object monitor(ProceedingJoinPoint joinPoint, Monitor monitor) throws Throwable {
        String key = joinPoint.getSignature().toShortString();
        long start = System.nanoTime();

        try {
            return joinPoint.proceed();
        } finally {
            long duration = System.nanoTime() - start;
            stats.computeIfAbsent(key, k -> new Statistics())
                 .record(duration);
        }
    }

    public Map<String, Statistics> getStatistics() {
        return Collections.unmodifiableMap(stats);
    }

    @Data
    static class Statistics {
        private long count = 0;
        private long totalTime = 0;
        private long maxTime = 0;

        void record(long duration) {
            count++;
            totalTime += duration;
            maxTime = Math.max(maxTime, duration);
        }

        public double getAverageTime() {
            return count > 0 ? (double) totalTime / count : 0;
        }
    }
}
```

### 事务切面（模拟）

```java
@Aspect
@Component
public class TransactionAspect {

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Around("@annotation(transactional)")
    public Object manageTransaction(ProceedingJoinPoint joinPoint, Transactional transactional) throws Throwable {
        TransactionDefinition def = new DefaultTransactionDefinition();
        TransactionStatus status = transactionManager.getTransaction(def);

        try {
            Object result = joinPoint.proceed();
            transactionManager.commit(status);
            return result;
        } catch (Exception e) {
            if (shouldRollback(e, transactional)) {
                transactionManager.rollback(status);
            }
            throw e;
        }
    }

    private boolean shouldRollback(Exception e, Transactional transactional) {
        for (Class<? extends Throwable> exClass : transactional.rollbackFor()) {
            if (exClass.isInstance(e)) {
                return true;
            }
        }
        return false;
    }
}
```

## AOP代理机制

```java
// JDK动态代理 - 基于接口
// CGLIB代理 - 基于类

// 强制使用CGLIB
@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class AopConfig {
}

// 暴露代理对象（解决同类方法调用问题）
@Aspect
@Component
public class ExposeProxyAspect {

    @Configuration
    @EnableAspectJAutoProxy(exposeProxy = true)
    static class Config {}

    // 获取当前代理对象
    public void someMethod() {
        MyService proxy = (MyService) AopContext.currentProxy();
        proxy.anotherMethod();  // 通过代理调用，触发切面
    }
}
```

## 小结

| 特性 | 说明 |
|------|------|
| @Aspect | 定义切面 |
| @Pointcut | 定义切点 |
| @Before/@After/@Around | 定义通知 |
| execution | 方法匹配表达式 |
| @annotation | 注解匹配 |
| ProceedingJoinPoint | 环绕通知连接点 |
