---
title: MySQL
icon: mysql
order: 1
category:
  - 数据库
tag:
  - MySQL
  - SQL
  - 索引
---

# MySQL

MySQL是最流行的关系型数据库管理系统，广泛应用于Web应用。

## 数据类型

### 数值类型

| 类型 | 大小 | 范围 |
|------|------|------|
| TINYINT | 1字节 | -128 ~ 127 |
| INT | 4字节 | -21亿 ~ 21亿 |
| BIGINT | 8字节 | 非常大 |
| DECIMAL | 可变 | 精确小数 |

### 字符串类型

| 类型 | 最大长度 | 说明 |
|------|----------|------|
| CHAR | 255 | 定长 |
| VARCHAR | 65535 | 变长 |
| TEXT | 65535 | 长文本 |
| LONGTEXT | 4GB | 超长文本 |

### 时间类型

| 类型 | 格式 | 范围 |
|------|------|------|
| DATE | YYYY-MM-DD | 1000 ~ 9999 |
| DATETIME | YYYY-MM-DD HH:MM:SS | 1000 ~ 9999 |
| TIMESTAMP | 时间戳 | 1970 ~ 2038 |

## 索引

### 索引类型

```sql
-- 主键索引
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 普通索引
CREATE INDEX idx_name ON users(name);

-- 复合索引
CREATE INDEX idx_name_age ON users(name, age);

-- 全文索引
CREATE FULLTEXT INDEX idx_content ON articles(content);
```

### 索引优化

```sql
-- 查看索引使用情况
EXPLAIN SELECT * FROM users WHERE name = '张三';

-- EXPLAIN结果分析
-- type: ALL(全表扫描) < index < range < ref < const
-- key: 使用的索引
-- rows: 预估扫描行数
-- Extra: Using index(覆盖索引) / Using filesort(文件排序)

-- 最左前缀原则
-- 索引 (name, age, city)
WHERE name = '张三'                    -- 命中
WHERE name = '张三' AND age = 20       -- 命中
WHERE name = '张三' AND city = '北京'  -- 部分命中（只有name）
WHERE age = 20                         -- 不命中
```

### 索引失效场景

```sql
-- 1. 使用函数
SELECT * FROM users WHERE YEAR(created_at) = 2024;  -- 失效

-- 2. 隐式类型转换
SELECT * FROM users WHERE phone = 13800138000;  -- phone是varchar，失效

-- 3. LIKE以%开头
SELECT * FROM users WHERE name LIKE '%张';  -- 失效
SELECT * FROM users WHERE name LIKE '张%';  -- 命中

-- 4. OR连接非索引列
SELECT * FROM users WHERE name = '张三' OR age = 20;  -- age无索引，失效

-- 5. NOT IN / NOT EXISTS
SELECT * FROM users WHERE id NOT IN (1, 2, 3);  -- 可能失效
```

## SQL优化

### 查询优化

```sql
-- 1. 避免SELECT *
SELECT id, name FROM users;

-- 2. 使用LIMIT
SELECT * FROM orders LIMIT 100;

-- 3. 避免子查询，使用JOIN
-- 不推荐
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);

-- 推荐
SELECT u.* FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 4. 使用EXISTS代替IN（大数据量时）
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 5. 分页优化
-- 传统分页（深分页慢）
SELECT * FROM users LIMIT 1000000, 10;

-- 优化：使用上次的最大ID
SELECT * FROM users WHERE id > 1000000 LIMIT 10;
```

### 表结构优化

```sql
-- 1. 选择合适的数据类型
-- 小表用TINYINT，不用INT
-- 定长用CHAR，变长用VARCHAR

-- 2. 适当冗余
-- 避免频繁JOIN
SELECT o.id, u.name FROM orders o
JOIN users u ON o.user_id = u.id;

-- 冗余user_name到orders表
SELECT id, user_name FROM orders;

-- 3. 垂直拆分
-- 大字段单独存储
CREATE TABLE user_profile (
    user_id INT PRIMARY KEY,
    avatar TEXT,
    description TEXT
);

-- 4. 水平拆分
-- 按时间/地区/ID范围分表
orders_202401, orders_202402, ...
```

## 事务

### ACID特性

| 特性 | 说明 |
|------|------|
| 原子性 | 全部成功或全部失败 |
| 一致性 | 事务前后数据一致 |
| 隔离性 | 并发事务互不影响 |
| 持久性 | 事务提交后永久保存 |

### 隔离级别

```sql
-- 查看隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|----------|------|------------|------|
| READ UNCOMMITTED | ✓ | ✓ | ✓ |
| READ COMMITTED | ✗ | ✓ | ✓ |
| REPEATABLE READ（默认） | ✗ | ✗ | ✓ |
| SERIALIZABLE | ✗ | ✗ | ✗ |

### 事务使用

```sql
-- 开始事务
START TRANSACTION;

-- 执行SQL
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 提交
COMMIT;

-- 回滚
ROLLBACK;

-- 保存点
SAVEPOINT sp1;
ROLLBACK TO sp1;
```

## 锁机制

### 锁类型

```sql
-- 共享锁（读锁）
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 排他锁（写锁）
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- 行锁（InnoDB）
UPDATE users SET name = 'test' WHERE id = 1;

-- 表锁
LOCK TABLES users READ;
UNLOCK TABLES;
```

### 乐观锁 vs 悲观锁

```sql
-- 乐观锁（版本号）
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 10;

-- 悲观锁
SELECT * FROM products WHERE id = 1 FOR UPDATE;
UPDATE products SET stock = stock - 1 WHERE id = 1;
COMMIT;
```

## 主从复制

### 配置

```ini
# 主库配置 (my.cnf)
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW

# 从库配置
[mysqld]
server-id = 2
relay-log = relay-bin
```

### 操作

```sql
-- 主库创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- 从库配置
CHANGE MASTER TO
    MASTER_HOST = '192.168.1.100',
    MASTER_USER = 'repl',
    MASTER_PASSWORD = 'password',
    MASTER_LOG_FILE = 'mysql-bin.000001',
    MASTER_LOG_POS = 0;

START SLAVE;
```

## 小结

| 主题 | 要点 |
|------|------|
| 索引 | B+树结构，最左前原则 |
| 优化 | 避免全表扫描，合理使用索引 |
| 事务 | ACID，隔离级别 |
| 锁 | 行锁/表锁，乐观/悲观锁 |
| 复制 | 主从复制，读写分离 |
