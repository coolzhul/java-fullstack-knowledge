---
title: Maven
icon: package
order: 3
category:
  - 开发工具
tag:
  - Maven
  - 构建
  - 依赖管理
---

# Maven

> Maven 不只是"用来下载 jar 包的"。理解 Maven 的生命周期、依赖传递、冲突解决机制，才能避免"为什么加了依赖还是报错"这种问题。这篇文章聚焦实际开发中最重要的 Maven 知识。

## 基础入门：Maven 是什么？

### 为什么需要 Maven？

```
手动管理依赖的问题：
- 去官网下载 jar 包 → 版本管理混乱
- jar 包之间的依赖冲突 → ClassNotFoundException
- 项目构建流程不统一 → 每个人构建方式不同

Maven 的解决方案：
- 声明依赖（pom.xml）→ 自动下载
- 依赖传递 → 自动处理间接依赖
- 统一构建 → mvn clean package 一条命令搞定
```

### 基本概念

```xml
<!-- pom.xml 核心结构 -->
<project>
    <!-- 坐标：唯一标识一个项目 -->
    <groupId>com.example</groupId>
    <artifactId>myproject</artifactId>
    <version>1.0.0</version>
    
    <!-- 依赖：需要哪些 jar 包 -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>3.2.0</version>
        </dependency>
    </dependencies>
</project>
```

### 常用命令

```bash
mvn clean package       # 清理 + 打包
mvn clean install       # 打包 + 安装到本地仓库
mvn dependency:tree     # 查看依赖树（排查冲突必备）
mvn clean package -DskipTests  # 跳过测试打包
```

---


## 核心概念

```
pom.xml：项目对象模型，定义项目的基本信息和依赖
坐标（GAV）：groupId + artifactId + version，唯一标识一个依赖
仓库：本地仓库（~/.m2/repository）→ 远程仓库（Maven Central / 阿里云镜像）
生命周期：clean → compile → test → package → install → deploy
```

## 依赖管理

### 依赖范围（Scope）

| Scope | 编译 | 测试 | 运行 | 打包 | 典型场景 |
|-------|------|------|------|------|----------|
| compile | ✅ | ✅ | ✅ | ✅ | 大多数依赖 |
| provided | ✅ | ✅ | ❌ | ❌ | Servlet API（Tomcat 已有） |
| runtime | ❌ | ✅ | ✅ | ✅ | JDBC 驱动 |
| test | ❌ | ✅ | ❌ | ❌ | JUnit、Mockito |

```xml
<!-- 依赖冲突：最短路径优先 -->
<!-- A → B → C → D(2.0)    路径长度 3 -->
<!-- A → E → D(1.0)        路径长度 2 -->
<!-- 结果：D 1.0 被使用（路径更短） -->

<!-- 如果路径长度相同：先声明优先 -->
```

### 排除依赖

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>module-a</artifactId>
    <version>1.0</version>
    <exclusions>
        <!-- 排除传递依赖中冲突的版本 -->
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

## 多模块项目

```xml
<!-- 父 pom.xml -->
<modules>
    <module>common</module>
    <module>service</module>
    <module>web</module>
</modules>

<!-- dependencyManagement：只声明版本，不实际引入 -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.2.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- 子模块中不需要写 version（继承父 pom） -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

::: tip 依赖管理最佳实践
1. 版本号集中在 `dependencyManagement` 中管理
2. 用 `<properties>` 定义版本号常量
3. 周期性检查依赖更新（`mvn versions:display-dependency-updates`）
4. 及时排除不需要的传递依赖，减少 jar 包体积
:::

## 常用命令

```bash
mvn clean package          # 清理 + 打包
mvn clean install          # 打包 + 安装到本地仓库
mvn dependency:tree        # 查看依赖树（排查冲突必备）
mvn dependency:analyze     # 分析未使用和未声明的依赖
mvn versions:display-dependency-updates  # 检查可更新的依赖
mvn clean package -DskipTests  # 跳过测试打包
mvn clean package -P prod  # 使用 prod profile 打包
```

## 面试高频题

**Q1：Maven 依赖冲突怎么排查？**

`mvn dependency:tree` 查看完整依赖树，找到同一个依赖的不同版本。看哪个路径更短——Maven 选择最短路径的版本。如果路径相同，看 pom 中谁先声明。解决方式：`<exclusions>` 排除冲突版本，或用 `<dependencyManagement>` 锁定版本。

## 延伸阅读

- 上一篇：[Git](git.md) — 版本控制、分支策略
- [Docker](docker.md) — 容器化部署
