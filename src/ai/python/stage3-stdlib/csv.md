---
title: CSV 处理
icon: package
order: 406
category:
  - AI
tag:
  - Python
---

CSV（Comma-Separated Values）是数据交换的经典格式。Excel、数据库导出、日志分析都离不开它。

## 6.1 CSV 格式基础

```csv
name,age,email,city
张三,25,zhangsan@example.com,北京
李四,30,lisi@example.com,上海
王五,28,wangwu@example.com,深圳
```

## 6.2 csv.reader/writer

```python
import csv

 ========== 读取 CSV ==========
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)  # 读取表头
    print(header)
    # ['name', 'age', 'email', 'city']
    for row in reader:
        print(row)
    # ['张三', '25', 'zhangsan@example.com', '北京']
    # ['李四', '30', 'lisi@example.com', '上海']
    # ['王五', '28', 'wangwu@example.com', '深圳']

 ========== 写入 CSV ==========
rows = [
    ['name', 'age', 'city'],
    ['张三', 25, '北京'],
    ['李四', 30, '上海'],
]
with open('output.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)  # 写入多行
    # writer.writerow(['王五', 28, '深圳'])  # 写入单行
```

:::warning newline='' 参数
用 `open()` 打开 CSV 文件时，必须指定 `newline=''`。否则 Python 的通用换行处理会干扰 CSV 模块自己的换行逻辑，导致写入的 CSV 多出空行。
:::

## 6.3 csv.DictReader/DictWriter（推荐）

```python
import csv

 ========== DictReader：按列名访问 ==========
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # row 是 OrderedDict（Python 3.8+ 是 dict）
        print(f"{row['name']}: {row['age']}岁, 来自{row['city']}")
 张三: 25岁, 来自北京
 李四: 30岁, 来自上海
 王五: 28岁, 来自深圳

 ========== DictWriter：按字段名写入 ==========
with open('output.csv', 'w', encoding='utf-8', newline='') as f:
    fieldnames = ['name', 'age', 'city']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()  # 写入表头
    writer.writerow({'name': '张三', 'age': 25, 'city': '北京'})
    writer.writerows([
        {'name': '李四', 'age': 30, 'city': '上海'},
        {'name': '王五', 'age': 28, 'city': '深圳'},
    ])
```

## 6.4 处理各种 CSV 格式

```python
import csv

 TSV（Tab 分隔）
with open('data.tsv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    for row in reader:
        print(row)

 自定义分隔符（如分号）
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter=';')

 不同编码（如 GBK 中文 CSV）
with open('data_gbk.csv', 'r', encoding='gbk') as f:
    reader = csv.reader(f)

 引号处理（字段内包含逗号的情况）
 默认 csv 模块会自动处理双引号包裹的字段
data = [
    ['name', 'description'],
    ['张三', '喜欢"编程"和阅读'],
    ['李四', '住在北京,朝阳区'],  # 逗号在字段内
]
with open('special.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_ALL)  # 所有字段都加引号
    writer.writerows(data)

 QUOTE_MINIMAL（默认）：只在必要时加引号
 QUOTE_ALL：所有字段都加引号
 QUOTE_NONNUMERIC：非数字字段加引号
 QUOTE_NONE：从不加引号
```

## 6.5 大文件 CSV 处理

```python
import csv

 逐行读取（内存友好），适合处理 GB 级 CSV
row_count = 0
with open('huge_file.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        row_count += 1
        if row_count <= 3:  # 只打印前3行
            print(row)
        # 在这里处理每一行
print(f'总共 {row_count} 行')
```

## 6.6 Pandas 读写 CSV（预览）

```python
 pip install pandas
import pandas as pd

 读取 CSV
df = pd.read_csv('data.csv')
print(df.head())           # 前5行
print(df.describe())       # 统计摘要
print(df[df['age'] > 26])  # 条件过滤

 写入 CSV
df.to_csv('output.csv', index=False, encoding='utf-8')
```

:::tip 什么时候用 csv 模块 vs Pandas？
- **简单读写、内存敏感** → `csv` 模块
- **数据分析、聚合计算** → `pandas`
- **超大文件** → `csv` 模块逐行处理，或 `pandas` 分块读取（`chunksize` 参数）
:::

## 6.7 实战：数据分析入门

```python
import csv
from collections import Counter

 分析 CSV 数据：统计各城市的用户数量
city_count = Counter()
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        city_count[row['city']] += 1

print('城市分布:')
for city, count in city_count.most_common():
    print(f'  {city}: {count}人')
 城市分布:
   北京: 15人
   上海: 12人
   深圳: 8人
```

---