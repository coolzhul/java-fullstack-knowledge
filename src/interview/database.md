# 数据库面试题

> 持续更新中 | 最后更新：2026-04-02

---

## ⭐ MySQL 索引为什么用 B+ 树？索引失效的常见场景有哪些？

**简要回答：** B+ 树的非叶子节点不存数据，只存索引键，使得每个内部节点能容纳更多键值，树更矮（通常 3-4 层），磁盘 IO 次数更少。叶子节点形成有序双向链表，范围查询效率极高。索引失效常见于：隐式类型转换、左模糊查询、对索引列使用函数、不符合最左前缀原则、OR 连接非索引列等。

**深度分析：**

```
B+ 树结构（3 层示例）：

        [30 | 60 | 90]
       /    |    |    \
   [10|20] [40|50] [70|80] [100|110]
      ↓       ↓       ↓        ↓
  叶子节点（有序双向链表）→ 范围查询只需遍历链表
```

```sql
-- B+ 树 vs 其他数据结构对比

-- Hash 索引：等值查询 O(1)，但不支持范围查询、排序、最左前缀
-- 二叉树：可能退化成链表，高度不可控
-- 红黑树：高度约 2*log(n)，层数仍然较多
-- B 树：非叶子节点存数据，每个节点能存的键更少，树更高
-- B+ 树：非叶子节点只存键，叶子节点存数据+形成链表 → 最优选择

-- InnoDB 一页 16KB，假设主键 8B + 指针 6B
-- 非叶子节点每页可存：16KB / (8B + 6B) ≈ 1170 个指针
-- 3 层 B+ 树可存：1170 × 1170 × 16 ≈ 2000 万行
-- 查找一条记录最多 3 次磁盘 IO
```

**索引失效的 7 大场景：**

```sql
-- 1. 隐式类型转换
CREATE INDEX idx_phone ON user(phone);  -- phone 是 VARCHAR
SELECT * FROM user WHERE phone = 13800138000;  -- ❌ 数字隐式转字符串，索引失效

-- 2. 左模糊 / 全模糊
SELECT * FROM user WHERE name LIKE '%张';     -- ❌ 左模糊无法走索引
SELECT * FROM user WHERE name LIKE '张%';     -- ✅ 右模糊可以

-- 3. 对索引列使用函数
SELECT * FROM user WHERE YEAR(create_time) = 2026;  -- ❌
SELECT * FROM user WHERE create_time >= '2026-01-01' AND create_time < '2027-01-01';  -- ✅

-- 4. 不符合最左前缀原则
CREATE INDEX idx_abc ON user(a, b, c);
SELECT * FROM user WHERE b = 1;        -- ❌ 跳过了 a
SELECT * FROM user WHERE a = 1 AND c = 3;  -- ✅ a 走索引，c 不走（但可用索引下推）

-- 5. OR 连接非索引列
SELECT * FROM user WHERE a = 1 OR d = 2;  -- d 无索引 → 全表扫描

-- 6. IS NOT NULL（部分情况不走索引，取决于优化器）
-- 7. 不等于（!= / <>）通常不走索引，优化器认为全表扫描成本更低
```

**关键细节：**

| 对比 | B 树 | B+ 树 |
|------|------|-------|
| 数据存储 | 所有节点都存 | 仅叶子节点存 |
| 范围查询 | 需要中序遍历 | 叶子链表直接遍历 |
| 单页容量 | 较少（存了数据） | 较多（只存键） |
| 树的高度 | 较高 | 较矮（通常 3 层） |

:::danger 面试追问
- 聚簇索引 vs 非聚簇索引？→ InnoDB 聚簇索引叶子节点存整行数据，二级索引叶子节点存主键值（回表查询）
- 什么是覆盖索引？→ 查询的列全部在索引中，不需要回表
- 什么是索引下推（ICP）？→ 5.6 引入，把 WHERE 条件下推到存储引擎层过滤，减少回表次数
:::

---

## ⭐ Redis 缓存穿透、缓存击穿、缓存雪崩分别是什么？怎么解决？

**简要回答：** 缓存穿透是查询不存在的数据绕过缓存直达数据库；缓存击穿是热点 Key 过期瞬间大量请求打到数据库；缓存雪崩是大量 Key 同时过期或 Redis 宕机导致请求全部涌向数据库。

**深度分析：**

```
              缓存穿透                    缓存击穿                    缓存雪崩
          查询不存在的数据              热点 Key 过期               大量 Key 同时过期
          → 永远不命中缓存             → 瞬间大量并发请求           → 请求全部穿透

  请求 → [缓存 MISS] → [DB MISS]    请求×N → [缓存 MISS] → [DB]   请求×N → [缓存 MISS] → [DB]
                ↑                            ↑                            ↑
             恶意攻击/空数据              高并发热点                    批量过期/宕机
```

**解决方案对比：**

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 缓存穿透 | 查询不存在的数据 | ① 布隆过滤器 ② 缓存空值（短过期）③ 参数校验 |
| 缓存击穿 | 热点 Key 过期 | ① 互斥锁（setnx）② 逻辑过期（不设 TTL）③ 热点预加载 |
| 缓存雪崩 | 大量 Key 同时过期 | ① 过期时间加随机值 ② 多级缓存 ③ 熔断降级 ④ Redis 集群高可用 |

**代码示例 — 缓存击穿互斥锁方案：**

```java
public String getWithMutex(String key) {
    // 1. 查缓存
    String value = redisTemplate.opsForValue().get(key);
    if (value != null) {
        return value;
    }
    // 2. 缓存未命中，尝试获取分布式锁
    String lockKey = "lock:" + key;
    Boolean locked = redisTemplate.opsForValue()
        .setIfAbsent(lockKey, "1", 10, TimeUnit.SECONDS);
    if (Boolean.TRUE.equals(locked)) {
        try {
            // 3. 双重检查（防止排队线程重复查库）
            value = redisTemplate.opsForValue().get(key);
            if (value != null) return value;
            // 4. 查数据库并写入缓存
            value = queryFromDB(key);
            redisTemplate.opsForValue().set(key, value, 30, TimeUnit.MINUTES);
        } finally {
            redisTemplate.delete(lockKey);  // 释放锁
        }
    } else {
        // 5. 获取锁失败，短暂休眠后重试
        Thread.sleep(50);
        return getWithMutex(key);  // 递归重试
    }
    return value;
}
```

**代码示例 — 布隆过滤器防穿透：**

```java
// 初始化布隆过滤器，预热所有合法 ID
BloomFilter<Long> bloomFilter = BloomFilter.create(
    Funnels.longFunnel(), 1000000, 0.01  // 预期 100 万数据，误判率 1%
);

public User getUserById(Long id) {
    // 布隆过滤器快速判断
    if (!bloomFilter.mightContain(id)) {
        return null;  // 一定不存在，直接返回
    }
    // 可能存在，继续查缓存和数据库
    // ...
}
```

:::danger 面试追问
- 布隆过滤器的误判率怎么理解？→ 存在的元素一定返回 true，不存在的可能误判为 true（但不会漏）
- 互斥锁方案有什么问题？→ 获取锁失败的大量线程在自旋等待，可以改为发 MQ 异步更新缓存
- 缓存和数据库一致性怎么保证？→ 延迟双删、Canal 监听 binlog、最终一致性
:::
