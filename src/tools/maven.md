---
title: Maven
icon: package
order: 1
category:
  - 工具
tag:
  - Maven
  - 构建
---

# Maven

Maven是Java项目管理和构建工具。

## 项目结构

```
my-project/
├── pom.xml                 # 项目配置
├── src/
│   ├── main/
│   │   ├── java/           # 源代码
│   │   └── resources/      # 资源文件
│   └── test/
│       ├── java/           # 测试代码
│       └── resources/      # 测试资源
└── target/                 # 构建输出
```

## pom.xml

### 基本配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>My Project</name>
    <description>A sample project</description>

    <properties>
        <java.version>17</java.version>
        <spring-boot.version>3.2.0</spring-boot.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
```

### 依赖管理

```xml
<!-- 继承父POM -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<!-- 依赖 -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- 排除依赖 -->
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>some-lib</artifactId>
        <exclusions>
            <exclusion>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-log4j12</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <!-- 可选依赖 -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- 测试依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>

<!-- 依赖版本管理 -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>bom</artifactId>
            <version>1.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 构建配置

```xml
<build>
    <plugins>
        <!-- 编译插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>17</source>
                <target>17</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>

        <!-- Spring Boot插件 -->
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>

        <!-- 测试插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <configuration>
                <skipTests>false</skipTests>
            </configuration>
        </plugin>
    </plugins>

    <!-- 资源过滤 -->
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
            <includes>
                <include>**/*.yml</include>
                <include>**/*.properties</include>
            </includes>
        </resource>
    </resources>
</build>
```

## 常用命令

```bash
# 清理
mvn clean

# 编译
mvn compile

# 打包
mvn package

# 安装到本地仓库
mvn install

# 部署到远程仓库
mvn deploy

# 跳过测试
mvn package -DskipTests

# 指定Profile
mvn package -Pprod

# 查看依赖树
mvn dependency:tree

# 分析依赖
mvn dependency:analyze

# 更新快照
mvn clean install -U
```

## 依赖范围

| Scope | 编译 | 测试 | 运行 | 打包 |
|-------|------|------|------|------|
| compile | ✓ | ✓ | ✓ | ✓ |
| provided | ✓ | ✓ | ✗ | ✗ |
| runtime | ✗ | ✓ | ✓ | ✓ |
| test | ✗ | ✓ | ✗ | ✗ |
| system | ✓ | ✓ | ✗ | ✗ |

## 多模块项目

```xml
<!-- 父POM -->
<packaging>pom</packaging>
<modules>
    <module>common</module>
    <module>api</module>
    <module>service</module>
    <module>web</module>
</modules>

<!-- 子模块POM -->
<parent>
    <groupId>com.example</groupId>
    <artifactId>parent</artifactId>
    <version>1.0.0</version>
</parent>

<artifactId>service</artifactId>
<dependencies>
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>common</artifactId>
        <version>${project.version}</version>
    </dependency>
</dependencies>
```

## Settings配置

```xml
<!-- ~/.m2/settings.xml -->
<settings>
    <mirrors>
        <mirror>
            <id>aliyun</id>
            <mirrorOf>central</mirrorOf>
            <url>https://maven.aliyun.com/repository/public</url>
        </mirror>
    </mirrors>

    <profiles>
        <profile>
            <id>dev</id>
            <properties>
                <env>dev</env>
            </properties>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
        </profile>
    </profiles>

    <servers>
        <server>
            <id>releases</id>
            <username>admin</username>
            <password>password</password>
        </server>
    </servers>
</settings>
```

## 小结

| 概念 | 说明 |
|------|------|
| POM | 项目对象模型 |
| Artifact | 构建产物 |
| Dependency | 项目依赖 |
| Plugin | 构建插件 |
| Repository | 依赖仓库 |
| Profile | 环境配置 |
