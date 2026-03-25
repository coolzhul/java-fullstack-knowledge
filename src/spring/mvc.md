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

Spring MVC是基于Java的轻量级Web框架，实现了MVC设计模式。

## 核心组件

```java
// MVC架构流程
请求 → DispatcherServlet → HandlerMapping → Controller
                                           ↓
视图 ← ViewResolver ← ModelAndView ← Controller
```

## Controller开发

### RESTful API

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // GET - 查询列表
    @GetMapping
    public List<User> list() {
        return userService.findAll();
    }

    // GET - 查询详情
    @GetMapping("/{id}")
    public User get(@PathVariable Long id) {
        return userService.findById(id);
    }

    // POST - 创建
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User create(@RequestBody @Valid UserDTO dto) {
        return userService.create(dto);
    }

    // PUT - 更新
    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody @Valid UserDTO dto) {
        return userService.update(id, dto);
    }

    // DELETE - 删除
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

### 参数绑定

```java
@RestController
public class ParamController {

    // 路径变量
    @GetMapping("/users/{id}/posts/{postId}")
    public void get(@PathVariable Long id, @PathVariable Long postId) {}

    // 请求参数
    @GetMapping("/search")
    public void search(
        @RequestParam String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {}

    // 请求头
    @GetMapping("/header")
    public void header(
        @RequestHeader("User-Agent") String userAgent,
        @RequestHeader(value = "X-Token", required = false) String token
    ) {}

    // Cookie
    @GetMapping("/cookie")
    public void cookie(@CookieValue("JSESSIONID") String sessionId) {}

    // 请求体
    @PostMapping("/body")
    public void body(@RequestBody String content) {}

    // 表单数据
    @PostMapping("/form")
    public void form(@ModelAttribute UserDTO dto) {}

    // 多参数封装
    @GetMapping("/page")
    public void page(Pageable pageable) {
        // page=0&size=10&sort=name,desc
    }
}
```

### 参数校验

```java
@Data
public class UserDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度3-50")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @Min(value = 18, message = "年龄不能小于18")
    @Max(value = 100, message = "年龄不能大于100")
    private Integer age;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
}

@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {

    @PostMapping
    public User create(@RequestBody @Valid UserDTO dto) {
        return userService.create(dto);
    }

    // 方法级校验
    @GetMapping("/search")
    public void search(@RequestParam @Size(min = 2) String keyword) {}
}

// 全局异常处理
@RestControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return errors;
    }
}
```

## 响应处理

### ResponseEntity

```java
@GetMapping("/{id}")
public ResponseEntity<User> get(@PathVariable Long id) {
    User user = userService.findById(id);
    if (user == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok()
        .header("X-Custom", "value")
        .body(user);
}

@PostMapping
public ResponseEntity<User> create(@RequestBody UserDTO dto) {
    User user = userService.create(dto);
    return ResponseEntity
        .created(URI.create("/api/users/" + user.getId()))
        .body(user);
}
```

### 统一响应格式

```java
@Data
@AllArgsConstructor
public class Result<T> {
    private int code;
    private String message;
    private T data;

    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }

    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }
}

@RestControllerAdvice
public class ResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        return !returnType.getParameterType().equals(Result.class);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType,
            MediaType selectedContentType, Class selectedConverterType,
            ServerHttpRequest request, ServerHttpResponse response) {
        return Result.success(body);
    }
}
```

## 异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleNotFound(EntityNotFoundException e) {
        return Result.error(404, e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(err ->
            errors.put(err.getField(), err.getDefaultMessage())
        );
        return Result.error(400, "参数校验失败");
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Result<Void> handleAccessDenied(AccessDeniedException e) {
        return Result.error(403, "无权限");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error(500, "系统错误");
    }
}
```

## 拦截器

```java
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
            Object handler) throws Exception {
        String token = request.getHeader("Authorization");
        if (token == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        // 验证token...
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response,
            Object handler, ModelAndView modelAndView) {
        // 请求处理后
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
            Object handler, Exception ex) {
        // 请求完成后
    }
}

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/auth/**");
    }
}
```

## 跨域配置

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://example.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}

// 或使用注解
@CrossOrigin(origins = "https://example.com")
@RestController
public class ApiController {}
```

## 文件上传下载

```java
@RestController
@RequestMapping("/api/files")
public class FileController {

    @PostMapping("/upload")
    public String upload(@RequestParam("file") MultipartFile file) throws IOException {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get("uploads", filename);
        Files.createDirectories(path.getParent());
        Files.copy(file.getInputStream(), path);
        return filename;
    }

    @GetMapping("/download/{filename}")
    public void download(@PathVariable String filename, HttpServletResponse response)
            throws IOException {
        Path path = Paths.get("uploads", filename);
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition",
            "attachment; filename=\"" + filename + "\"");
        Files.copy(path, response.getOutputStream());
    }
}

// 配置文件大小限制
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 100MB
```

## 小结

| 组件 | 说明 |
|------|------|
| @RestController | RESTful控制器 |
| @RequestMapping | URL映射 |
| @PathVariable | 路径变量 |
| @RequestParam | 请求参数 |
| @RequestBody | 请求体 |
| @Valid | 参数校验 |
| ResponseEntity | 响应实体 |
| @RestControllerAdvice | 全局异常处理 |
| HandlerInterceptor | 拦截器 |
