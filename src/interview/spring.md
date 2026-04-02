# Spring 生态面试题

> 持续更新中 | 最后更新：2026-04-02

---

## ⭐ Spring AOP 的实现原理？JDK 动态代理 vs CGLIB 有什么区别？

**简要回答：** Spring AOP 底层基于动态代理，对有接口的 Bean 默认使用 JDK 动态代理，对没有接口的 Bean 使用 CGLIB 生成子类代理。Spring Boot 2.x 起默认全部使用 CGLIB。

**深度分析：**

```java
// JDK 动态代理 — 基于接口
public interface UserService {
    void save(User user);
}

public class JdkProxyDemo {
    public static void main(String[] args) {
        UserService target = new UserServiceImpl();
        UserService proxy = (UserService) Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            (proxyObj, method, args1) -> {
                System.out.println("before: " + method.getName());
                Object result = method.invoke(target, args1);
                System.out.println("after: " + method.getName());
                return result;
            }
        );
        proxy.save(new User());
    }
}

// CGLIB — 基于继承（生成子类）
public class CglibProxyDemo {
    public static void main(String[] args) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(UserService.class);
        enhancer.setCallback((MethodInterceptor) (obj, method, params, proxy) -> {
            System.out.println("before: " + method.getName());
            Object result = proxy.invokeSuper(obj, params);
            System.out.println("after: " + method.getName());
            return result;
        });
        UserService proxy = (UserService) enhancer.create();
        proxy.save(new User());
    }
}
```

**关键细节：**

| 特性 | JDK 动态代理 | CGLIB |
|------|-------------|-------|
| 实现方式 | 基于接口（InvocationHandler） | 基于继承（生成子类） |
| 要求 | 目标类必须实现接口 | 目标类不能是 final |
| 性能 | JDK 8 后差距缩小 | 生成子类略慢，调用略快 |
| 无法代理 | 无 | final 类、final/private 方法 |

**Spring AOP 代理创建时机：**
- `ProxyFactory` 根据 `proxyTargetClass` 和 `optimize` 决定策略
- `@EnableAspectJAutoProxy(proxyTargetClass = false)` → 优先 JDK 代理
- Spring Boot 2.x 默认 `spring.aop.proxy-target-class=true`

:::danger 面试追问
- AOP 有哪些通知类型？→ Before、After、AfterReturning、AfterThrowing、Around（最强大）
- Spring AOP 和 AspectJ 的区别？→ Spring AOP 是运行时代理，AspectJ 是编译时/加载时织入
- 同一个类中方法互相调用 AOP 失效？→ 因为走的是 this 引用而非代理对象，可用 AopContext.currentProxy() 解决
:::

---

## ⭐ Spring Boot 自动配置的原理是什么？@EnableAutoConfiguration 做了什么？

**简要回答：** `@EnableAutoConfiguration` 通过 `@Import(AutoConfigurationImportSelector.class)` 加载 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`（Spring Boot 3.x）或 `META-INF/spring.factories`（2.x）中注册的所有自动配置类，再根据 `@Conditional` 系列注解按条件生效。

**深度分析：**

```java
// @SpringBootApplication 的组成
@SpringBootConfiguration      // 等价于 @Configuration
@EnableAutoConfiguration      // 核心：开启自动配置
@ComponentScan                // 扫描当前包及子包

// @EnableAutoConfiguration 内部
@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration { ... }

// AutoConfigurationImportSelector 核心逻辑
protected List<String> getCandidateConfigurations(...) {
    // Spring Boot 3.x: 从 AutoConfiguration.imports 文件读取
    // Spring Boot 2.x: 从 spring.factories 读取
    // 返回 ~130+ 个自动配置类全限定名
}
```

**条件注解体系（决定哪些配置生效）：**

```java
@ConditionalOnClass(DataSource.class)           // classpath 存在该类
@ConditionalOnMissingBean(DataSource.class)      // 容器中不存在该 Bean
@ConditionalOnProperty(prefix = "spring.datasource", name = "url")  // 配置项存在
@ConditionalOnWebApplication                      // 是 Web 应用
@ConditionalOnExpression("${feature.enabled:false}")  // SpEL 表达式
```

**自动配置报告：** 启动时加 `--debug` 可查看哪些自动配置生效/未生效及原因。

**自定义 Starter 的核心步骤：**
1. 创建 `xxx-spring-boot-starter` 和 `xxx-spring-boot-autoconfigure` 两个模块
2. 编写配置属性类（`@ConfigurationProperties`）
3. 编写自动配置类（`@AutoConfiguration` + `@ConditionalOnXxx`）
4. 在 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 中注册

:::danger 面试追问
- 自动配置的加载顺序怎么控制？→ `@AutoConfigureBefore`、`@AutoConfigureAfter`、`@AutoConfigureOrder`
- 如何排除某个自动配置？→ `@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})`
- spring.factories 和 AutoConfiguration.imports 的区别？→ Spring Boot 3.x 废弃前者，改用后者，加载更快
:::

---

## ⭐ Spring 事务的传播行为有哪些？事务在什么场景下会失效？

**简要回答：** Spring 事务通过 AOP 代理实现，7 种传播行为控制事务边界。常见失效场景：非 public 方法、同类内部调用、异常被 catch 吞掉、rollbackFor 未指定。

**深度分析：**

```java
// 7 种传播行为
@Transactional(propagation = Propagation.REQUIRED)      // 默认：有事务加入，没有就新建
@Transactional(propagation = Propagation.REQUIRES_NEW)   // 总是新建事务，挂起当前事务
@Transactional(propagation = Propagation.NESTED)         // 嵌套事务（保存点）
@Transactional(propagation = Propagation.SUPPORTS)       // 有事务就加入，没有就非事务执行
@Transactional(propagation = Propagation.NOT_SUPPORTED)  // 非事务执行，挂起当前事务
@Transactional(propagation = Propagation.MANDATORY)      // 必须在事务中，否则异常
@Transactional(propagation = Propagation.NEVER)          // 必须不在事务中，否则异常
```

**事务失效的 6 大常见场景：**

```java
// 1. 非 public 方法 — Spring AOP 只能代理 public 方法
@Transactional
void internalSave() { ... }  // ❌ 失效

// 2. 同类方法内部调用 — 走的是 this 而非代理对象
public void methodA() {
    methodB();  // ❌ 事务不生效
}
@Transactional
public void methodB() { ... }

// 3. 异常被 catch 吞掉 — Spring 只有感知到异常才回滚
@Transactional
public void save() {
    try {
        // 业务逻辑
    } catch (Exception e) {
        log.error("error", e);  // ❌ 异常被吞，事务不回滚
    }
}

// 4. 抛出非 RuntimeException（checked 异常）默认不回滚
@Transactional  // 只回滚 RuntimeException 和 Error
public void save() throws Exception {
    throw new IOException("fail");  // ❌ 不回滚
}
// 正确写法：@Transactional(rollbackFor = Exception.class)

// 5. Bean 未被 Spring 管理 — 没有代理对象
// 6. 数据库引擎不支持事务 — MyISAM 不支持，InnoDB 支持
```

**关键细节：**

| 传播行为 | 当前有事务 | 当前无事务 |
|---------|-----------|-----------|
| REQUIRED | 加入 | 新建 |
| REQUIRES_NEW | 挂起当前，新建 | 新建 |
| NESTED | 嵌套（保存点） | 新建 |
| SUPPORTS | 加入 | 非事务执行 |

:::danger 面试追问
- REQUIRES_NEW 和 NESTED 的区别？→ REQUIRES_NEW 是完全独立的新事务，回滚不影响外层；NESTED 是子事务，外层回滚会带滚子事务，子事务回滚不影响外层（保存点机制）
- @Transactional 加在类上和方法上的区别？→ 方法级覆盖类级，就近原则
- 如何编程式控制事务？→ `TransactionTemplate` 或 `PlatformTransactionManager`
:::
