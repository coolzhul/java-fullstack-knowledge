---
title: Elasticsearch
icon: search
order: 3
category:
  - 数据库
tag:
  - Elasticsearch
  - 搜索
---

# Elasticsearch

Elasticsearch是分布式搜索和分析引擎，基于Lucene构建。

## 核心概念

| ES概念 | 关系型数据库类比 |
|--------|------------------|
| Index（索引） | Database |
| Type（类型） | Table |
| Document（文档） | Row |
| Field（字段） | Column |
| Mapping（映射） | Schema |

## 索引操作

### 创建索引

```json
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "price": {
        "type": "double"
      },
      "category": {
        "type": "keyword"
      },
      "created_at": {
        "type": "date"
      }
    }
  }
}
```

### 文档操作

```json
// 创建文档
POST /products/_doc/1
{
  "title": "iPhone 15 Pro",
  "price": 7999,
  "category": "手机"
}

// 获取文档
GET /products/_doc/1

// 更新文档
POST /products/_update/1
{
  "doc": {
    "price": 7499
  }
}

// 删除文档
DELETE /products/_doc/1

// 批量操作
POST /_bulk
{"index": {"_index": "products", "_id": 1}}
{"title": "iPhone 15", "price": 5999}
{"index": {"_index": "products", "_id": 2}}
{"title": "MacBook Pro", "price": 14999}
```

## 查询DSL

### 基本查询

```json
// 查询所有
GET /products/_search
{
  "query": {
    "match_all": {}
  }
}

// 全文搜索
GET /products/_search
{
  "query": {
    "match": {
      "title": "iPhone"
    }
  }
}

// 精确匹配
GET /products/_search
{
  "query": {
    "term": {
      "category": "手机"
    }
  }
}

// 多字段搜索
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "iPhone",
      "fields": ["title", "description"]
    }
  }
}
```

### 复合查询

```json
// bool查询
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "iPhone" } }
      ],
      "must_not": [
        { "term": { "status": "deleted" } }
      ],
      "should": [
        { "term": { "featured": true } }
      ],
      "filter": [
        { "range": { "price": { "lte": 10000 } } }
      ]
    }
  }
}

// 范围查询
GET /products/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 1000,
        "lte": 5000
      }
    }
  }
}
```

### 聚合查询

```json
// 统计聚合
GET /products/_search
{
  "size": 0,
  "aggs": {
    "avg_price": {
      "avg": { "field": "price" }
    },
    "max_price": {
      "max": { "field": "price" }
    },
    "categories": {
      "terms": { "field": "category" }
    }
  }
}

// 嵌套聚合
GET /products/_search
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": { "field": "category" },
      "aggs": {
        "avg_price": {
          "avg": { "field": "price" }
        }
      }
    }
  }
}
```

## 分页与排序

```json
// 分页
GET /products/_search
{
  "from": 0,
  "size": 10,
  "query": {
    "match_all": {}
  }
}

// 排序
GET /products/_search
{
  "sort": [
    { "price": "desc" },
    { "_score": "desc" }
  ],
  "query": {
    "match_all": {}
  }
}

// 高亮
GET /products/_search
{
  "query": {
    "match": { "title": "iPhone" }
  },
  "highlight": {
    "fields": {
      "title": {}
    },
    "pre_tags": ["<em>"],
    "post_tags": ["</em>"]
  }
}
```

## Java客户端

### 依赖

```xml
<dependency>
    <groupId>co.elastic.clients</groupId>
    <artifactId>elasticsearch-java</artifactId>
    <version>8.11.0</version>
</dependency>
```

### 配置

```java
@Configuration
public class ElasticsearchConfig {

    @Bean
    public ElasticsearchClient elasticsearchClient() {
        RestClient restClient = RestClient.builder(
            HttpHost.create("http://localhost:9200")
        ).build();

        ElasticsearchTransport transport = new RestClientTransport(
            restClient, new JacksonJsonpMapper()
        );

        return new ElasticsearchClient(transport);
    }
}
```

### 使用示例

```java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ElasticsearchClient client;

    // 索引文档
    public void indexProduct(Product product) throws IOException {
        client.index(i -> i
            .index("products")
            .id(product.getId())
            .document(product)
        );
    }

    // 搜索
    public List<Product> search(String keyword) throws IOException {
        SearchResponse<Product> response = client.search(s -> s
            .index("products")
            .query(q -> q
                .match(m -> m
                    .field("title")
                    .query(keyword)
                )
            ),
            Product.class
        );

        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }

    // 复合查询
    public List<Product> complexSearch(String keyword, double maxPrice) throws IOException {
        SearchResponse<Product> response = client.search(s -> s
            .index("products")
            .query(q -> q
                .bool(b -> b
                    .must(m -> m.match(mt -> mt.field("title").query(keyword)))
                    .filter(f -> f.range(r -> r.field("price").lte(JsonData.of(maxPrice))))
                )
            ),
            Product.class
        );

        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }
}
```

## 集群架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Elasticsearch Cluster                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Node 1    │  │   Node 2    │  │      Node 3         │  │
│  │  (Master)   │  │  (Data)     │  │    (Data)           │  │
│  │             │  │             │  │                     │  │
│  │  Shard 0    │  │  Shard 1    │  │    Shard 2          │  │
│  │  Replica 1  │  │  Replica 0  │  │    Replica 0        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 小结

| 特性 | 说明 |
|------|------|
| 倒排索引 | 快速全文搜索 |
| 分片 | 数据水平分割 |
| 副本 | 高可用 |
| DSL | 查询语法 |
| 聚合 | 统计分析 |
