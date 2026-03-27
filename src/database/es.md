---
title: Elasticsearch
icon: search
order: 3
category:
  - 数据库
tag:
  - Elasticsearch
  - 搜索
  - ELK
---

# Elasticsearch

> Elasticsearch（ES）不是数据库的替代品，而是解决"搜索"和"分析"问题的专用工具。全文搜索、日志分析、指标聚合——这些是 MySQL 做不好或不该做的事情。这篇文章帮你理解 ES 的核心概念和实战用法。

## 基础入门：Elasticsearch 是什么？

### 为什么不用 MySQL 做搜索？

```
MySQL LIKE '%关键词%':
- 全表扫描 → 慢
- 不支持分词（"Java开发工程师" 搜 "Java" 搜不到）
- 不支持相关性排序
- 百万级数据基本不可用

Elasticsearch:
- 倒排索引 → 毫秒级搜索
- 内置分词器 → 支持中文分词
- 相关性评分 → 匹配度高的排前面
- 分布式 → 天然支持水平扩展
```

### 基本概念

```
MySQL          →  Elasticsearch
数据库         →  索引（Index）
表             →  索引（Index）
行             →  文档（Document）
列             →  字段（Field）
```

---


## 为什么 MySQL 做搜索不好？

```
MySQL 的 LIKE '%关键词%' 问题：
  - 无法使用索引 → 全表扫描 → 慢
  - 不支持分词（"Java开发工程师" 搜 "Java" 搜不到）
  - 不支持相关性排序（匹配度高的排在前面）
  - 数据量大时（百万级）基本不可用

ES 的优势：
  - 倒排索引（Inverted Index）→ 毫秒级全文搜索
  - 分词器 → 支持中文分词、同义词、拼音搜索
  - 相关性评分 → 匹配度高的自然排在前面
  - 分布式架构 → 天然支持水平扩展
```

## 核心概念

```
MySQL          →  Elasticsearch
数据库(Database) →  索引(Index)
表(Table)      →  类型(Type)（ES 7.x 后废弃，一个 Index 就是一种类型）
行(Row)        →  文档(Document)
列(Column)     →  字段(Field)
                →  映射(Mapping)（定义字段类型和分析规则）
```

### 倒排索引

```
文档1：Java 是最好的编程语言
文档2：Python 编程也很棒
文档3：Java 和 Python 都是好语言

倒排索引：
  Java    → [文档1, 文档3]
  Python  → [文档2, 文档3]
  编程    → [文档1, 文档2]
  语言    → [文档1, 文档3]
  棒      → [文档2]

搜索 "Java 编程"：
  Java  → [文档1, 文档3]
  编程  → [文档1, 文档2]
  交集  → [文档1]（且文档1 包含两个词，评分更高）
```

## 实战用法

```json
// 创建索引并定义映射
PUT /articles
{
  "mappings": {
    "properties": {
      "title": { "type": "text", "analyzer": "ik_max_word" },
      "content": { "type": "text", "analyzer": "ik_max_word" },
      "author": { "type": "keyword" },
      "publish_date": { "type": "date" },
      "views": { "type": "integer" }
    }
  }
}

// 搜索
GET /articles/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "Java" } }
      ],
      "filter": [
        { "range": { "publish_date": { "gte": "2024-01-01" } } }
      ]
    }
  },
  "sort": [
    { "views": { "order": "desc" } },
    "_score"
  ],
  "from": 0,
  "size": 10
}
```

::: tip ES 与 MySQL 数据同步
不要在业务代码中同时写 MySQL 和 ES（耦合太强，写入延迟翻倍）。推荐：1) Canal 监听 MySQL binlog 异步同步到 ES；2) Logstash 定时增量同步；3) 应用层双写 + MQ 异步消费写 ES。
:::

## 面试高频题

**Q1：ES 为什么搜索快？**

倒排索引 + 分词 + 分布式。倒排索引让搜索变成"查字典"，O(1) 或 O(log n) 找到包含关键词的文档。分布式让查询在多个分片上并行执行。聚合分析则是利用列式存储的优势。

**Q2：ES 的深度分页问题怎么解决？**

`from + size` 在 ES 中如果 `from` 很大（如 10000），每个分片都要返回 `from + size` 条数据给协调节点再排序截取——非常浪费。解决方案：1) `scroll`（游标，适合大批量导出）；2) `search_after`（基于排序值的翻页，推荐）；3) 限制最大页码（产品层面，如最多 100 页）。

## 延伸阅读

- 上一篇：[Redis](redis.md) — 缓存实战、数据结构
- [MySQL](mysql.md) — 索引、事务、MVCC
- [消息队列](../distributed/mq.md) — RocketMQ/Kafka
