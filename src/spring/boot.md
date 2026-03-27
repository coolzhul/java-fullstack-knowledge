---
title: Spring Boot
icon: boot
order: 3
category:
  - Spring
tag:
  - Spring
  - Spring Boot
---

# Spring Boot

> Spring Boot 的本质不是什么新技术，而是一套"约定优于配置"的规范 + 自动配置机制 + Starter 依赖管理。它解决了传统 Spring 开发中最烦人的问题：写大量 XML 配置、依赖版本冲突、部署复杂。

## 基础入门：Spring Boot 是什么？

### 为什么需要 Spring Boot？

```
传统 Spring 开发的痛点：
1. 大量 XML 配置（数据源、事务、MVC、AOP...）
2. 依赖版本冲突（Spring 4 + Hibernate 5 + Jackson 2.x 兼容性...）
3. 部署复杂（War 包 + Tomcat 配置 + JVM 参数...）
4. 每个项目都要重复配置一样的东西

Spring Boot 的解决方案：
1. 自动配置（Auto Configuration）：根据 classpath 自动配置 Bean
2. Starter 依赖：一个依赖搞定一组相关依赖（版本兼容性已处理好）
3. 内嵌容器：不需要外部 Tomcat，java -jar 直接运行
4. 配置简化：application.yml 替代 XML
```

### 第一个 Spring Boot 应用

```java
// 启动类（一个就够了）
@SpringBootApplication  // 自动配置 + 组件扫描
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// application.yml（核心配置）
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: root
  redis:
    host: localhost
    port: 6379

# 日志配置
logging:
  level:
    com.example: debug
```

### 常用 Starter

| Starter | 作用 |
|---------|------|
| `spring-boot-starter-web` | Spring MVC + 内嵌 Tomcat |
| `spring-boot-starter-data-jpa` | JPA + Hibernate |
| `spring-boot-starter-data-redis` | Redis 客户端 |
| `spring-boot-starter-security` | Spring Security |
| `spring-boot-starter-validation` | 参数校验（JSR 380） |
| `spring-boot-starter-test` | JUnit + Mockito + MockMvc |

---

## 自动配置原理——Spring Boot 的核心

### `@SpringBootApplication` 做了什么？

```java
@SpringBootApplication 等价于三个注解的组合：

@SpringBootConfiguration     // 标记为配置类
@EnableAutoConfiguration     // 启用自动配置 ← 核心
@ComponentScan               // 扫描当前包及子包下的组件

@EnableAutoConfiguration 的原理：
1. 通过 @Import(AutoConfigurationImportSelector.class) 导入自动配置选择器
2. AutoConfigurationImportSelector 读取 META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
3. 加载所有自动配置类（如 DataSourceAutoConfiguration、RedisAutoConfiguration）
4. 每个自动配置类用 @ConditionalOnXxx 条件注解判断是否生效
```

### 自动配置生效的条件

```java
// 以 RedisAutoConfiguration 为例：
@Configuration
@ConditionalOnClass(Redis.class)              // classpath 有 Redis 的类
@EnableConfigurationProperties(RedisProperties.class)
public class RedisAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(name = "redisTemplate")  // 容器中没有自定义的 redisTemplate
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        // 自动配置 RedisTemplate
    }
}
```

::: tip 自动配置的"让步"原则
Spring Boot 的自动配置永远"让步"于你的自定义配置。如果你定义了自己的 `redisTemplate` Bean（`@ConditionalOnMissingBean` 不满足），Spring Boot 就不会创建默认的。这就是"约定优于配置"——约定好的默认行为，你随时可以覆盖。
:::

### 排除不需要的自动配置

```java
// 方式1：注解排除
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})

// 方式2：配置文件排除
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration

// 排查自动配置是否生效：启动时加 --debug
// 会在日志中打印每个自动配置类的匹配/未匹配原因
```

## Starter——为什么不用自己管理依赖？

```java
// 传统 Spring：你要自己找依赖、自己管版本
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>5.3.20</version>  <!-- 版本冲突？自己解决 -->
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-web</artifactId>
    <version>5.3.20</version>
</dependency>
// 还有 jackson、tomcat、logback... 十几个依赖

// Spring Boot：一个 Starter 搞定
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- 版本由 parent 管理，依赖由 starter 传递引入，零冲突 -->
</dependency>
```

::: tip 自定义 Starter
如果你的公司有一套通用的组件（如统一的 Redis 配置、封装的 RPC 客户端），可以做成自定义 Starter。核心是写一个自动配置类 + `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 文件。
:::

## 配置管理

### 配置优先级（从高到低）

```
1. 命令行参数：java -jar app.jar --server.port=9090
2. SPRING_APPLICATION_JSON 环境变量
3. ServletConfig / ServletContext 参数
4. JNDI 属性
5. Java 系统属性：System.getProperties()
6. 操作系统环境变量
7. application-{profile}.yml / .properties
8. application.yml / .properties
9. @PropertySource 注解指定的配置文件
10. 默认值（@Value 的默认值）
```

::: warning 配置陷阱
`application-dev.yml` 中的配置会覆盖 `application.yml` 中的同名配置，不是合并。如果某个配置在 `application.yml` 中设置了但没有在 `application-dev.yml` 中设置，则使用 `application.yml` 的值。这个行为很直观，但很容易忘记哪个 profile 里配了什么。
:::

### 配置绑定

```java
// 方式1：@Value（适合少量配置）
@Value("${app.name:default-name}")
private String appName;

// 方式2：@ConfigurationProperties（适合批量配置，推荐）
@ConfigurationProperties(prefix = "app.mail")
@Component
@Data
public class MailProperties {
    private String host;
    private int port = 587;
    private String username;
    private String password;
    private boolean sslEnabled = true;
}

// yml 中：
// app:
//   mail:
//     host: smtp.gmail.com
//     username: xxx@gmail.com
```

## Actuator——生产级监控

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env  # 暴露哪些端点
  endpoint:
    health:
      show-details: always  # 显示详细健康信息
```

::: danger 生产环境不要暴露所有端点
`/actuator/env` 会暴露所有环境变量（包括数据库密码等敏感信息）。生产环境只暴露必要的端点，敏感端点需要认证。`/actuator/beans` 暴露所有 Bean 定义，也可能存在安全风险。
:::

## 面试高频题

**Q1：Spring Boot 的启动流程？**

1. 创建 `SpringApplication` 对象（推断应用类型、加载初始化器和监听器）；2. 执行 `run()` 方法：准备 Environment → 打印 Banner → 创建 ApplicationContext → 加载 Bean 定义（包括自动配置）→ 刷新上下文（实例化 Bean、注入依赖、执行 BeanPostProcessor）→ 发布启动完成事件。

**Q2：Spring Boot 打包为什么能直接运行？**

`spring-boot-maven-plugin` 把所有依赖打包到一个 FAT JAR 中，同时在 `META-INF/MANIFEST.MF` 中指定了 `Main-Class: org.springframework.boot.loader.JarLauncher` 和 `Start-Class: 你的主类`。`JarLauncher` 从内嵌的 `BOOT-INF/lib/` 中加载依赖，然后调用你的主类的 `main` 方法。

## 延伸阅读

- 上一篇：[Spring AOP](aop.md) — 切面编程、代理机制
- 下一篇：[Spring MVC](mvc.md) — RESTful API、参数校验
- [Spring Cloud](cloud.md) — 微服务架构、服务治理
