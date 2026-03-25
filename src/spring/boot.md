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

Spring Boot简化了Spring应用的初始搭建和开发过程，提供自动配置和起步依赖。

## 快速开始

### 项目创建

```xml
<!-- pom.xml -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

### 主类

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### Controller

```java
@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }
}
```

## 自动配置原理

### @SpringBootApplication

```java
@SpringBootApplication 等价于：
@SpringBootConfiguration       // 配置类
@EnableAutoConfiguration       // 启用自动配置
@ComponentScan                  // 组件扫描
public class Application {}
```

### 条件装配

```java
// 常用条件注解
@ConditionalOnClass          // 类路径存在指定类
@ConditionalOnMissingClass   // 类路径不存在指定类
@ConditionalOnBean           // 容器中存在指定Bean
@ConditionalOnMissingBean    // 容器中不存在指定Bean
@ConditionalOnProperty       // 配置属性满足条件
@ConditionalOnWebApplication // Web应用环境
@ConditionalOnExpression     // SpEL表达式为true
```

### 自动配置类

```java
// 查看自动配置报告
// 启动参数：--debug
// 或配置：debug=true

// 排除自动配置
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class
})
// 或配置文件
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
```

## 配置管理

### application.yml

```yaml
# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api

# 数据源配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10

  # JPA配置
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

  # Redis配置
  data:
    redis:
      host: localhost
      port: 6379

  # Kafka配置
  kafka:
    bootstrap-servers: localhost:9092

# 自定义配置
app:
  name: My Application
  version: 1.0.0
  features:
    enabled: true
```

### 配置类

```java
@ConfigurationProperties(prefix = "app")
@Component
@Data
public class AppProperties {
    private String name;
    private String version;
    private Features features;

    @Data
    public static class Features {
        private boolean enabled;
    }
}

// 启用配置属性扫描
@EnableConfigurationProperties(AppProperties.class)
@Configuration
public class PropertiesConfig {}
```

### Profile配置

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb

# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/mydb

# 激活Profile
spring:
  profiles:
    active: dev
```

## Starter依赖

### 常用Starter

| Starter | 说明 |
|---------|------|
| spring-boot-starter-web | Web开发 |
| spring-boot-starter-data-jpa | JPA数据访问 |
| spring-boot-starter-data-redis | Redis |
| spring-boot-starter-security | 安全框架 |
| spring-boot-starter-validation | 参数校验 |
| spring-boot-starter-actuator | 健康监控 |
| spring-boot-starter-test | 测试 |

### 自定义Starter

```java
// 1. 自动配置类
@Configuration
@ConditionalOnClass(MyService.class)
@EnableConfigurationProperties(MyProperties.class)
public class MyAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public MyService myService(MyProperties properties) {
        return new MyService(properties);
    }
}

// 2. 配置属性
@ConfigurationProperties(prefix = "my")
public class MyProperties {
    private String name;
    private boolean enabled = true;
}

// 3. 注册自动配置
// META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
com.example.MyAutoConfiguration
```

## Actuator监控

### 启用端点

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env,beans
  endpoint:
    health:
      show-details: always
```

### 常用端点

| 端点 | 说明 |
|------|------|
| /actuator/health | 健康检查 |
| /actuator/info | 应用信息 |
| /actuator/metrics | 指标信息 |
| /actuator/env | 环境变量 |
| /actuator/beans | Bean列表 |
| /actuator/mappings | URL映射 |

### 自定义健康检查

```java
@Component
public class MyHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // 检查逻辑
        boolean healthy = checkHealth();
        if (healthy) {
            return Health.up()
                .withDetail("service", "my-service")
                .withDetail("status", "running")
                .build();
        } else {
            return Health.down()
                .withDetail("error", "Service unavailable")
                .build();
        }
    }
}
```

## 启动流程

```java
// SpringApplication启动流程
1. 创建 SpringApplication 对象
   - 判断应用类型（Servlet/Reactive）
   - 加载初始化器（Initializer）
   - 加载监听器（Listener）

2. 执行 run 方法
   - 准备环境（Environment）
   - 打印Banner
   - 创建 ApplicationContext
   - 准备上下文
   - 刷新上下文（加载Bean、自动配置）
   - 发布启动完成事件

// 自定义启动逻辑
@SpringBootApplication
public class Application implements ApplicationRunner {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    public void run(ApplicationArguments args) {
        System.out.println("应用启动完成");
    }
}

// CommandLineRunner - 更简单的参数处理
@Component
public class StartupRunner implements CommandLineRunner {
    @Override
    public void run(String... args) {
        System.out.println("启动参数: " + Arrays.toString(args));
    }
}
```

## 打包部署

### JAR打包

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

```bash
# 打包
mvn clean package

# 运行
java -jar target/myapp.jar

# 指定配置
java -jar myapp.jar --spring.profiles.active=prod

# 指定端口
java -jar myapp.jar --server.port=9090
```

### WAR打包

```xml
<packaging>war</packaging>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>
```

```java
@SpringBootApplication
public class Application extends SpringBootServletInitializer {
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(Application.class);
    }
}
```

## 小结

| 特性 | 说明 |
|------|------|
| 自动配置 | 根据依赖自动配置Bean |
| Starter | 一站式依赖管理 |
| Actuator | 生产级监控 |
| 外部化配置 | 配置文件、环境变量、命令行 |
| 内嵌容器 | Tomcat/Jetty/Undertow |
