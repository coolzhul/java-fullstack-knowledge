---
title: Docker
icon: docker
order: 3
category:
  - 工具
tag:
  - Docker
  - 容器
---

# Docker

Docker是容器化平台，简化应用的部署和运行。

## 核心概念

| 概念 | 说明 |
|------|------|
| Image | 镜像，只读模板 |
| Container | 容器，镜像的运行实例 |
| Registry | 仓库，存储镜像 |
| Dockerfile | 构建镜像的脚本 |

## 常用命令

### 镜像操作

```bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest
docker pull nginx:1.24

# 查看镜像
docker images
docker image ls

# 删除镜像
docker rmi nginx:latest
docker image prune  # 清理无用镜像

# 构建镜像
docker build -t myapp:1.0 .
docker build -t myapp:1.0 -f Dockerfile.prod .

# 导出/导入镜像
docker save -o myapp.tar myapp:1.0
docker load -i myapp.tar
```

### 容器操作

```bash
# 运行容器
docker run -d --name nginx -p 80:80 nginx:latest
docker run -it --name ubuntu ubuntu:22.04 /bin/bash

# 查看容器
docker ps           # 运行中的容器
docker ps -a        # 所有容器

# 启动/停止/重启
docker start nginx
docker stop nginx
docker restart nginx

# 进入容器
docker exec -it nginx /bin/bash
docker attach nginx

# 查看日志
docker logs nginx
docker logs -f --tail 100 nginx

# 删除容器
docker rm nginx
docker rm -f nginx  # 强制删除运行中的容器
docker container prune  # 清理所有停止的容器

# 复制文件
docker cp file.txt nginx:/tmp/
docker cp nginx:/etc/nginx/nginx.conf ./
```

### 其他命令

```bash
# 查看资源使用
docker stats

# 查看容器详情
docker inspect nginx

# 查看端口映射
docker port nginx

# 查看进程
docker top nginx
```

## Dockerfile

### 基本结构

```dockerfile
# 基础镜像
FROM openjdk:17-jdk-slim

# 维护者
LABEL maintainer="dev@example.com"

# 设置工作目录
WORKDIR /app

# 复制文件
COPY target/myapp.jar app.jar

# 暴露端口
EXPOSE 8080

# 环境变量
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 多阶段构建

```dockerfile
# 构建阶段
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 运行阶段
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 最佳实践

```dockerfile
# 1. 使用特定版本
FROM nginx:1.24.0-alpine

# 2. 合并RUN命令
RUN apt-get update && apt-get install -y \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*

# 3. 使用COPY而非ADD
COPY config.yml /app/config/

# 4. 优化层缓存
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package

# 5. 使用非root用户
RUN addgroup -S app && adduser -S app -G app
USER app

# 6. 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:8080/actuator/health || exit 1
```

## Docker Compose

### 基本配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=db
    depends_on:
      - db
      - redis
    networks:
      - backend

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=mydb
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - backend

  redis:
    image: redis:7-alpine
    networks:
      - backend

networks:
  backend:

volumes:
  db-data:
```

### 常用命令

```bash
# 启动
docker-compose up -d

# 停止
docker-compose down

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 重建服务
docker-compose up -d --build app

# 执行命令
docker-compose exec app bash
```

## Docker网络

```bash
# 创建网络
docker network create mynet

# 查看网络
docker network ls

# 连接容器到网络
docker network connect mynet nginx

# 运行时指定网络
docker run -d --name app --network mynet myapp:1.0
```

## 数据卷

```bash
# 创建卷
docker volume create mydata

# 查看卷
docker volume ls

# 使用卷
docker run -v mydata:/app/data myapp:1.0

# 挂载主机目录
docker run -v /host/path:/container/path myapp:1.0
```

## 小结

| 概念 | 说明 |
|------|------|
| 镜像 | 只读模板 |
| 容器 | 运行实例 |
| Dockerfile | 构建脚本 |
| Compose | 多容器编排 |
| 网络 | 容器通信 |
| 卷 | 数据持久化 |
