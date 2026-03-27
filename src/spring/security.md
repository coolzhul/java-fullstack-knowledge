---
title: Spring Security
icon: lock
order: 6
category:
  - Spring
tag:
  - Spring
  - Spring Security
  - 安全
---

# Spring Security

> 安全不是"加上登录功能"这么简单。认证（你是谁）、授权（你能做什么）、会话管理（你的登录状态）、CSRF 防护（跨站请求伪造）——每一个环节都有坑。Spring Security 提供了一套完整的安全框架，但它的学习曲线确实陡峭。这篇文章帮你理清核心脉络。

## 基础入门：Spring Security 是什么？

### 为什么需要安全框架？

```
安全不只是"加个登录页"：
- 认证（Authentication）：你是谁？（登录、Token 校验）
- 授权（Authorization）：你能做什么？（角色、权限）
- 会话管理：登录状态怎么维护？
- CSRF 防护：防止跨站请求伪造
- 密码加密：不能明文存储密码

这些安全逻辑散布在代码各处 → 难以维护
Spring Security 提供了一套完整的安全框架，集中管理
```

### 最简配置

```java
// SecurityFilterChain：定义安全规则
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()  // 公开接口
                .requestMatchers("/api/admin/**").hasRole("ADMIN")  // 管理员
                .anyRequest().authenticated()  // 其他需要登录
            )
            .csrf(csrf -> csrf.disable())  // REST API 通常关闭 CSRF
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));  // 无状态
        return http.build();
    }
}
```

---

## 认证 vs 授权

```
认证（Authentication）：验证"你是谁"
  → 登录、Token 校验、OAuth2

授权（Authorization）：验证"你能做什么"
  → 角色权限、接口权限、数据权限

Spring Security 的核心流程：
请求 → 过滤器链 → 认证过滤器 → 授权过滤器 → Controller
```

## JWT 认证——前后端分离的首选

### 为什么选 JWT 而不是 Session？

```
Session 方式：
  - 服务端存储会话信息（内存或 Redis）
  - 客户端只存 Session ID（Cookie）
  - 问题：多服务共享 Session 困难、服务端需要存储开销

JWT 方式：
  - Token 自包含（包含用户信息和签名）
  - 服务端无状态（不需要存储 Token）
  - 天然适合微服务（每个服务都能验证 Token）
  - 缺点：无法主动失效（只能等 Token 过期）、Token 体积较大
```

### JWT 认证流程

```java
// 1. 用户登录 → 验证账号密码 → 生成 JWT
@PostMapping("/login")
public Result<String> login(@RequestBody LoginRequest request) {
    Authentication auth = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
    );
    String token = jwtUtils.generateToken(auth.getName());
    return Result.ok(token);
}

// 2. 后续请求在 Header 中携带 Token
// Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

// 3. JwtAuthenticationFilter 拦截每个请求
//    → 解析 Token → 验证签名 → 获取用户名 → 查询用户信息 → 设置 SecurityContext

// 4. Controller 中通过 SecurityContext 获取当前用户
@GetMapping("/me")
public User getCurrentUser() {
    String username = SecurityContextHolder.getContext()
        .getAuthentication().getName();
    return userService.findByUsername(username);
}
```

### JWT 过滤器

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain chain) throws ServletException, IOException {

        String token = extractToken(request);
        if (token != null && jwtUtils.validateToken(token)) {
            String username = jwtUtils.getUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }
}
```

::: danger JWT 安全注意事项
1. **密钥管理**：JWT 密钥泄露 = 所有 Token 可被伪造。密钥不要硬编码在代码里，用配置中心或环境变量
2. **Token 过期时间**：不要设置太长，建议 Access Token 15-30 分钟，Refresh Token 7 天
3. **敏感信息**：不要在 JWT Payload 中放密码等敏感数据（Base64 不是加密，可被解码）
4. **HTTPS**：JWT 在网络传输中可能被截获，必须使用 HTTPS
:::

## 方法级权限控制

```java
// 开启方法安全
@EnableMethodSecurity(prePostEnabled = true)

// 在 Controller 或 Service 方法上使用
@PreAuthorize("hasRole('ADMIN')")          // 需要 ADMIN 角色
@PreAuthorize("hasAuthority('user:write')") // 需要 user:write 权限
@PreAuthorize("#id == authentication.principal.id")  // 只能操作自己的数据

// 复杂表达式
@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
@PreAuthorize("isAuthenticated()")  // 已登录即可
```

## 面试高频题

**Q1：Spring Security 的过滤器链是什么？**

Spring Security 通过一系列 Filter 组成过滤器链处理请求。每个 Filter 负责一个安全关注点（如 CSRF、CORS、认证、授权）。`UsernamePasswordAuthenticationFilter` 处理表单登录，`BasicAuthenticationFilter` 处理 HTTP Basic 认证，自定义的 `JwtAuthenticationFilter` 处理 Token 认证。顺序由 `@Order` 或 `FilterRegistrationBean` 控制。

**Q2：`@PreAuthorize` 和 `@Secured` 的区别？**

`@Secured` 只支持简单的角色检查（`@Secured("ROLE_ADMIN")`），不支持 SpEL 表达式。`@PreAuthorize` 支持 SpEL 表达式，可以做更复杂的权限判断（如 `hasRole('ADMIN') or #id == authentication.principal.id`）。推荐用 `@PreAuthorize`。

## 延伸阅读

- 上一篇：[Spring Cloud](cloud.md) — 微服务架构、服务治理
- [高并发架构](../architecture/high-concurrency.md) — 缓存、限流、降级
- [数据库优化](../database/mysql.md) — 索引、事务、分库分表
