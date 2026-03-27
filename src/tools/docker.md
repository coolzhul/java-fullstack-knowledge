---
title: Docker
icon: docker
order: 1
category:
  - 开发工具
tag:
  - Docker
  - 容器
  - 容器化
---

# Docker

> Docker 解决的是"在我的机器上能跑"的问题。开发环境、测试环境、生产环境不一致，部署依赖冲突，版本升级困难——Docker 通过容器化让这一切标准化。这篇文章聚焦 Java 后端开发中最常用的 Docker 知识。

## 基础入门：Docker 是什么？

### 为什么需要 Docker？

```
"在我的机器上能跑啊！"
→ 环境不一致导致的问题：Java 版本、系统库、配置文件...

Docker 的解决方案：
把应用 + 运行环境打包成一个"容器"
→ 在任何机器上运行都一样
```

### 常用命令

```bash
# 镜像操作
docker pull mysql:8.0          # 拉取镜像
docker images                   # 查看本地镜像
docker build -t myapp .         # 构建镜像

# 容器操作
docker run -d -p 8080:8080 myapp   # 后台运行，端口映射
docker ps                            # 查看运行中的容器
docker logs <container-id>            # 查看日志
docker exec -it <container-id> bash  # 进入容器
docker stop <container-id>            # 停止容器

# 清理
docker system prune              # 清理无用镜像和容器
```

---


## 核心概念

```
镜像（Image）：只读模板，包含运行应用所需的一切（代码、运行时、库、配置）
容器（Container）：镜像的运行实例（可以启动、停止、删除）
仓库（Registry）：存放和分发镜像的地方（Docker Hub、私有仓库）

类比：
  镜像 → 类
  容器 → 对象（类的实例）
  仓库 → Maven Central（代码仓库）
```

## Dockerfile 最佳实践

```dockerfile
# Java 应用的多阶段构建（减小镜像体积）
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine  # 只用 JRE，不用 JDK
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

::: tip 镜像体积优化
1. 多阶段构建（构建阶段用 JDK，运行阶段用 JRE）→ 镜像从 500MB 降到 100MB
2. 使用 Alpine 基础镜像（Alpine Linux 只有 5MB）
3. 合理利用缓存（先 COPY pom.xml，利用 Docker 缓存层）
4. 不要在镜像中放开发工具（vim、curl 等）
:::

## Docker Compose

```yaml
# docker-compose.yml（本地开发环境一键启动）
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/mydb
    depends_on:
      db:
        condition: service_healthy

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: mydb
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      retries: 5

volumes:
  mysql_data:
```

## 面试高频题

**Q1：容器和虚拟机的区别？**

虚拟机：硬件级虚拟化，每个 VM 有自己的操作系统内核，隔离性强但资源开销大（GB 级）。容器：操作系统级虚拟化，共享宿主机内核，隔离性较弱但资源开销小（MB 级），启动快（秒级 vs 分钟级）。

## 延伸阅读

- [Git](git.md) — 版本控制、分支策略
- [Maven](maven.md) — 依赖管理、构建生命周期
