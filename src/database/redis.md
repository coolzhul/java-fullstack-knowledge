---
title: Redis
icon: redis
order: 2
category:
  - 数据库
tag:
  - Redis
  - 缓存
---

# Redis

Redis是高性能的内存键值数据库，支持多种数据结构。

## 数据类型

### String

```bash
# 设置值
SET key value
SET key value EX 3600  # 设置过期时间（秒）
SET key value PX 3600000  # 毫秒
SETNX key value  # 不存在时设置

# 获取值
GET key

# 自增
INCR counter
INCRBY counter 10
DECR counter

# 追加
APPEND key value

# 获取子串
GETRANGE key 0 10
```

### Hash

```bash
# 设置字段
HSET user:1 name "张三"
HSET user:1 age 25
HMSET user:1 name "张三" age 25

# 获取字段
HGET user:1 name
HMGET user:1 name age
HGETALL user:1

# 删除字段
HDEL user:1 age

# 自增
HINCRBY user:1 age 1

# 判断字段存在
HEXISTS user:1 name
```

### List

```bash
# 左推入/右推入
LPUSH list a b c
RPUSH list x y z

# 左弹出/右弹出
LPOP list
RPOP list

# 获取范围
LRANGE list 0 -1  # 获取所有

# 阻塞弹出
BLPOP list 5  # 5秒超时

# 获取长度
LLEN list
```

### Set

```bash
# 添加成员
SADD set1 a b c

# 获取所有成员
SMEMBERS set1

# 判断成员存在
SISMEMBER set1 a

# 集合运算
SUNION set1 set2   # 并集
SINTER set1 set2   # 交集
SDIFF set1 set2    # 差集

# 移除成员
SREM set1 a
```

### Sorted Set

```bash
# 添加成员（带分数）
ZADD scores 100 "张三" 95 "李四" 88 "王五"

# 获取排名范围
ZRANGE scores 0 -1 WITHSCORES  # 升序
ZREVRANGE scores 0 -1 WITHSCORES  # 降序

# 获取成员分数
ZSCORE scores "张三"

# 获取成员排名
ZRANK scores "张三"  # 升序排名
ZREVRANK scores "张三"  # 降序排名

# 分数范围查询
ZRANGEBYSCORE scores 90 100 WITHSCORES

# 增加分数
ZINCRBY scores 5 "张三"
```

## 持久化

### RDB

```ini
# redis.conf
save 900 1      # 900秒内至少1次修改
save 300 10     # 300秒内至少10次修改
save 60 10000   # 60秒内至少10000次修改

dbfilename dump.rdb
dir ./
```

### AOF

```ini
# redis.conf
appendonly yes
appendfilename "appendonly.aof"

# 同步策略
appendfsync always     # 每次写入都同步
appendfsync everysec   # 每秒同步（推荐）
appendfsync no         # 由操作系统决定
```

## 缓存策略

### 缓存穿透

```java
// 问题：查询不存在的数据，绕过缓存直接访问数据库
// 解决：缓存空值或布隆过滤器

// 方案1：缓存空值
public User getUser(Long id) {
    String key = "user:" + id;
    String value = redis.get(key);

    if (value != null) {
        if ("null".equals(value)) {
            return null;  // 防止穿透
        }
        return JSON.parseObject(value, User.class);
    }

    User user = userDao.findById(id);
    if (user == null) {
        redis.setex(key, 300, "null");  // 缓存空值5分钟
    } else {
        redis.setex(key, 3600, JSON.toJSONString(user));
    }
    return user;
}

// 方案2：布隆过滤器
public User getUserWithBloom(Long id) {
    if (!bloomFilter.mightContain(id)) {
        return null;  // 一定不存在
    }
    // 查询缓存和数据库...
}
```

### 缓存击穿

```java
// 问题：热点key过期，大量请求同时访问数据库
// 解决：互斥锁或永不过期

// 方案1：互斥锁
public User getUser(Long id) {
    String key = "user:" + id;
    String lockKey = "lock:user:" + id;

    String value = redis.get(key);
    if (value != null) {
        return JSON.parseObject(value, User.class);
    }

    // 获取分布式锁
    if (redis.setnx(lockKey, "1", 10)) {
        try {
            // 双重检查
            value = redis.get(key);
            if (value != null) {
                return JSON.parseObject(value, User.class);
            }

            User user = userDao.findById(id);
            redis.setex(key, 3600, JSON.toJSONString(user));
            return user;
        } finally {
            redis.del(lockKey);
        }
    } else {
        // 等待并重试
        Thread.sleep(50);
        return getUser(id);
    }
}

// 方案2：逻辑过期
public User getUser(Long id) {
    String key = "user:" + id;
    String value = redis.get(key);

    if (value != null) {
        RedisData redisData = JSON.parseObject(value, RedisData.class);
        if (redisData.getExpireTime().isAfter(LocalDateTime.now())) {
            return redisData.getData();
        }
        // 过期，异步刷新
        asyncRefresh(id);
        return redisData.getData();  // 返回旧数据
    }

    // 缓存不存在，加锁重建
    // ...
}
```

### 缓存雪崩

```java
// 问题：大量缓存同时过期
// 解决：随机过期时间 + 多级缓存

// 方案1：随机过期时间
int randomExpire = 3600 + new Random().nextInt(600);  // 1小时 ± 10分钟
redis.setex(key, randomExpire, value);

// 方案2：多级缓存
// L1: 本地缓存 (Caffeine)
// L2: Redis
// L3: 数据库
```

## 分布式锁

### Redisson

```java
// 添加依赖
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
</dependency>

// 使用
@Autowired
private RedissonClient redisson;

public void doSomething() {
    RLock lock = redisson.getLock("my-lock");
    try {
        // 尝试获取锁，最多等待10秒，锁自动释放时间30秒
        if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
            // 执行业务逻辑
        }
    } finally {
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}

// 看门狗机制（自动续期）
RLock lock = redisson.getLock("my-lock");
lock.lock();  // 默认30秒，看门狗每10秒续期
```

## 消息队列

### 发布订阅

```bash
# 发布消息
PUBLISH channel1 "Hello"

# 订阅
SUBSCRIBE channel1

# 模式订阅
PSUBSCRIBE channel*
```

### Stream

```bash
# 添加消息
XADD stream1 * name "张三" age 25

# 读取消息
XREAD COUNT 10 STREAMS stream1 0

# 消费者组
XGROUP CREATE stream1 group1 0
XREADGROUP GROUP group1 consumer1 COUNT 1 STREAMS stream1 >
```

## 小结

| 特性 | 说明 |
|------|------|
| 数据类型 | String/Hash/List/Set/ZSet |
| 持久化 | RDB快照 / AOF日志 |
| 缓存策略 | 穿透/击穿/雪崩 |
| 分布式锁 | Redisson实现 |
| 消息 | Pub/Sub / Stream |
