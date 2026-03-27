---
title: Spring MVC
icon: web
order: 4
category:
  - Spring
tag:
  - Spring
  - Spring MVC
  - RESTful
---

# Spring MVC

> Spring MVC 是 Java Web 开发的事实标准。但很多人只停留在 `@GetMapping` + `@PostMapping` 的层面——参数校验怎么做全局处理？统一响应格式怎么包装？拦截器和过滤器的区别是什么？这些才是实际开发中每天要面对的问题。

## 基础入门：Spring MVC 是什么？

### 一个 RESTful API 的完整流程

```java
// Controller：接收请求、返回响应
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // GET /api/users/1
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    // POST /api/users
    @PostMapping
    public User create(@RequestBody @Valid CreateUserRequest request) {
        return userService.create(request);
    }

    // PUT /api/users/1
    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }

    // DELETE /api/users/1
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

### 常用注解

| 注解 | 作用 | 示例 |
|------|------|------|
| `@RestController` | `@Controller` + `@ResponseBody` | 返回 JSON |
| `@GetMapping` | 处理 GET 请求 | `@GetMapping("/users")` |
| `@PostMapping` | 处理 POST 请求 | `@PostMapping("/users")` |
| `@PathVariable` | URL 路径参数 | `/users/{id}` |
| `@RequestParam` | 查询参数 | `?name=张三` |
| `@RequestBody` | 请求体 JSON → 对象 | POST 的 JSON body |
| `@Valid` | 触发参数校验 | 配合 JSR 380 注解 |

---

## 请求处理全流程

```
浏览器请求
    │
    ▼
DispatcherServlet（前端控制器，所有请求的入口）
    │
    ├→ HandlerMapping（找到对应的 Controller 方法）
    │
    ├→ HandlerAdapter（执行 Controller 方法）
    │       │
    │       ├→ 参数绑定（@PathVariable、@RequestParam、@RequestBody...）
    │       ├→ 参数校验（@Valid、@Validated）
    │       ├→ 执行业务代码
    │       └→ 返回值处理（@ResponseBody → JSON 序列化）
    │
    ├→ ViewResolver（如果返回视图名，解析为具体视图）
    │   或 HttpMessageConverter（如果返回 @ResponseBody，直接写响应体）
    │
    └→ 返回响应
```

::: tip DispatcherServlet 是 Spring MVC 的大脑
所有请求都经过 `DispatcherServlet`，它协调各个组件完成请求处理。理解了这个流程，你就知道 `@RequestBody` 的参数是从哪里绑定的、`@RestControllerAdvice` 的异常处理是在哪一步介入的、拦截器是在哪一步执行的。
:::

## RESTful API 设计

### 参数接收的几种方式

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    // @PathVariable——路径参数（资源定位）
    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) { }

    // @RequestParam——查询参数（过滤、分页）
    @GetMapping
    public Page<User> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String keyword) { }

    // @RequestBody——请求体（JSON → 对象）
    @PostMapping
    public User create(@RequestBody @Valid UserDTO dto) { }

    // @RequestHeader——请求头（认证 Token 等）
    @GetMapping("/me")
    public User getCurrentUser(
        @RequestHeader("Authorization") String token) { }
}
```

::: warning 常见参数绑定错误
1. `@RequestParam` 拼写错误写成 `@Param`（MyBatis 的注解，Spring MVC 不认）→ 400 错误
2. `@RequestBody` 用在了 GET 请求上 → GET 请求没有请求体，参数永远为 null
3. 日期参数没指定格式：`@DateTimeFormat(pattern = "yyyy-MM-dd")` → 默认格式解析失败
:::

### 参数校验

```java
@Data
public class UserDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50)
    private String username;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Min(18) @Max(100)
    private Integer age;
}

// Controller 中加 @Valid
@PostMapping
public User create(@RequestBody @Valid UserDTO dto) {
    return userService.create(dto);
}

// 校验失败 → 抛出 MethodArgumentNotValidException
// 需要 @RestControllerAdvice 统一处理（见下文）
```

## 全局异常处理——每个项目都必须有

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 参数校验失败
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
            errors.put(err.getField(), err.getDefaultMessage())
        );
        return Result.error(400, "参数校验失败", errors);
    }

    // 业务异常
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleBusiness(BusinessException ex) {
        return Result.error(ex.getCode(), ex.getMessage());
    }

    // 资源不存在
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleNotFound(NoHandlerFoundException ex) {
        return Result.error(404, "接口不存在");
    }

    // 兜底异常
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception ex) {
        log.error("未预期的异常", ex);
        return Result.error(500, "系统错误");
    }
}
```

::: danger 不要吞掉异常
`@ExceptionHandler` 最常见的错误是把所有异常都返回"系统错误"但日志里什么都没打。线上排查问题时，没有异常堆栈等于没有线索。**至少在兜底异常处理里打 error 级别日志。**
:::

## 统一响应格式

```java
@Data
@AllArgsConstructor
public class Result<T> {
    private int code;
    private String message;
    private T data;

    public static <T> Result<T> ok(T data) {
        return new Result<>(200, "success", data);
    }

    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }
}
```

::: tip 统一响应的两种方式
1. Controller 方法手动包装 `Result.ok(data)`——简单直接，但每个方法都要写
2. `ResponseBodyAdvice` 自动包装——所有返回值自动包装，但要注意不要包装已经是 Result 类型的返回值（需要 `supports()` 方法判断）
:::

## 拦截器 vs 过滤器

```
请求 → Filter → Servlet → DispatcherServlet → Interceptor → Controller → Interceptor → Servlet → Filter → 响应

Filter（Servlet 规范）：
  - 在 DispatcherServlet 之前执行
  - 可以修改 request/response
  - 适合：编码转换、CORS、请求日志、安全认证

Interceptor（Spring MVC）：
  - 在 DispatcherServlet 之后、Controller 之前执行
  - 可以注入 Spring Bean
  - 适合：权限校验、登录检查、请求耗时统计

选择建议：需要和 Spring 容器交互的用 Interceptor，否则用 Filter
```

## 面试高频题

**Q1：@Controller 和 @RestController 的区别？**

`@RestController` = `@Controller` + `@ResponseBody`。`@Controller` 的方法返回值会被 ViewResolver 解析为视图（如 JSP、Thymeleaf）。`@RestController` 的方法返回值直接通过 HttpMessageConverter 写入响应体（如 JSON）。前后端分离项目都用 `@RestController`。

**Q2：@RequestParam 和 @PathVariable 的区别？**

`@RequestParam` 从查询参数中取值（`/users?name=张三`）。`@PathVariable` 从 URL 路径中取值（`/users/123`）。RESTful 风格推荐用 `@PathVariable` 定位资源，`@RequestParam` 做过滤和分页。

## 延伸阅读

- 上一篇：[Spring Boot](boot.md) — 自动配置、Starter 原理
- 下一篇：[Spring Cloud](cloud.md) — 微服务架构、服务治理
- [Spring Security](security.md) — JWT 认证、权限控制
