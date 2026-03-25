---
title: Spring IOC
icon: box
order: 1
category:
  - Spring
tag:
  - Spring
  - IOC
  - 依赖注入
---

# Spring IOC

控制反转（Inversion of Control）是Spring框架的核心，通过依赖注入实现对象间的解耦。

## IOC容器

### BeanFactory vs ApplicationContext

```java
// BeanFactory - 延迟加载
BeanFactory factory = new XmlBeanFactory(new ClassPathResource("beans.xml"));
MyBean bean = (MyBean) factory.getBean("myBean");

// ApplicationContext - 立即加载（推荐）
ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
MyBean bean = context.getBean(MyBean.class);

// 注解配置
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
```

### 常用ApplicationContext实现

```java
// XML配置
ClassPathXmlApplicationContext

// 注解配置
AnnotationConfigApplicationContext

// Web应用
AnnotationConfigWebApplicationContext

// Groovy配置
GenericGroovyApplicationContext
```

## Bean配置

### 注解配置

```java
@Configuration
@ComponentScan("com.example")
public class AppConfig {
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource();
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
```

### 组件注解

```java
// 通用组件
@Component

// 服务层
@Service
public class UserServiceImpl implements UserService {
}

// 持久层
@Repository
public class UserRepositoryImpl implements UserRepository {
}

// 控制层
@Controller
@RestController
public class UserController {
}

// 配置类
@Configuration
public class AppConfig {
}
```

## 依赖注入

### 注入方式

```java
// 1. 构造器注入（推荐）
@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// 2. Setter注入
@Service
public class UserService {
    private UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// 3. 字段注入（不推荐）
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}

// 4. 方法注入
@Service
public class UserService {
    private UserRepository userRepository;

    @Autowired
    public void configure(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

### @Autowired详解

```java
@Service
public class UserService {
    // 按类型注入
    @Autowired
    private UserRepository userRepo;

    // 按名称注入
    @Autowired
    @Qualifier("mysqlUserRepository")
    private UserRepository userRepo;

    // 可选注入（没有匹配的Bean不报错）
    @Autowired(required = false)
    private Optional<SomeService> someService;

    // 注入集合（注入所有实现）
    @Autowired
    private List<UserRepository> userRepos;

    // 注入Map（key为Bean名称）
    @Autowired
    private Map<String, UserRepository> userRepoMap;
}
```

### 构造器注入最佳实践

```java
// Spring 4.3+ 单构造器可省略@Autowired
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    // 唯一构造器，@Autowired可省略
    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
}

// 多构造器需要指定@Primary或@Autowired
@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserService() {
        this.userRepository = new InMemoryUserRepository();
    }
}
```

## Bean作用域

```java
// 单例（默认）
@Scope("singleton")
@Bean
public SingletonBean singletonBean() {
    return new SingletonBean();
}

// 原型（每次获取创建新实例）
@Scope("prototype")
@Bean
public PrototypeBean prototypeBean() {
    return new PrototypeBean();
}

// Web作用域
@Scope("request")   // 每个HTTP请求
@Scope("session")   // 每个HTTP会话
@Scope("application") // ServletContext生命周期
```

## Bean生命周期

```java
@Component
public class LifecycleBean implements InitializingBean, DisposableBean {

    @PostConstruct
    public void init() {
        System.out.println("@PostConstruct - 初始化");
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("@PreDestroy - 销毁");
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("InitializingBean - afterPropertiesSet");
    }

    @Override
    public void destroy() throws Exception {
        System.out.println("DisposableBean - destroy");
    }
}

// 生命周期流程
// 1. 实例化 Bean
// 2. 属性赋值
// 3. 处理 Aware 接口
// 4. BeanPostProcessor.postProcessBeforeInitialization()
// 5. @PostConstruct
// 6. InitializingBean.afterPropertiesSet()
// 7. 自定义 init-method
// 8. BeanPostProcessor.postProcessAfterInitialization()
// 9. Bean 就绪
// 10. @PreDestroy
// 11. DisposableBean.destroy()
// 12. 自定义 destroy-method
```

## 条件装配

### @Conditional

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @ConditionalOnProperty(name = "db.type", havingValue = "mysql")
    public DataSource mysqlDataSource() {
        return new MysqlDataSource();
    }

    @Bean
    @ConditionalOnProperty(name = "db.type", havingValue = "postgres")
    public DataSource postgresDataSource() {
        return new PostgresDataSource();
    }

    @Bean
    @ConditionalOnMissingBean(DataSource.class)
    public DataSource defaultDataSource() {
        return new H2DataSource();
    }

    @Bean
    @ConditionalOnClass(name = "redis.clients.jedis.Jedis")
    public RedisClient redisClient() {
        return new RedisClient();
    }
}
```

### 自定义条件

```java
public class LinuxCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return context.getEnvironment().getProperty("os.name").contains("Linux");
    }
}

@Configuration
public class AppConfig {
    @Bean
    @Conditional(LinuxCondition.class)
    public LinuxService linuxService() {
        return new LinuxService();
    }
}
```

## Profile

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .build();
    }

    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:mysql://prod-db:3306/mydb");
        return ds;
    }
}

// 激活Profile
// 1. 代码方式
AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
ctx.getEnvironment().setActiveProfiles("dev");
ctx.register(AppConfig.class);
ctx.refresh();

// 2. 配置文件
spring.profiles.active=dev

// 3. 命令行
java -jar app.jar --spring.profiles.active=dev
```

## 事件机制

```java
// 自定义事件
public class UserCreatedEvent extends ApplicationEvent {
    private final User user;

    public UserCreatedEvent(Object source, User user) {
        super(source);
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}

// 事件发布
@Service
public class UserService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public void createUser(User user) {
        // 创建用户...
        eventPublisher.publishEvent(new UserCreatedEvent(this, user));
    }
}

// 事件监听
@Component
public class UserEventListener {

    @EventListener
    public void onUserCreated(UserCreatedEvent event) {
        System.out.println("User created: " + event.getUser());
    }

    @EventListener(condition = "#event.user.age > 18")
    public void onAdultUserCreated(UserCreatedEvent event) {
        System.out.println("Adult user created");
    }

    @Async
    @EventListener
    public void asyncHandler(UserCreatedEvent event) {
        // 异步处理
    }
}
```

## 小结

| 特性 | 说明 |
|------|------|
| IOC | 控制反转，由容器管理对象 |
| DI | 依赖注入，自动装配依赖 |
| Scope | Bean作用域（singleton/prototype等） |
| Lifecycle | Bean生命周期回调 |
| Conditional | 条件化Bean装配 |
| Profile | 环境隔离配置 |
| Event | 事件驱动编程 |
