---
title: 语法基础
icon: code
order: 1
category:
  - Java
tag:
  - Java
  - 语法
---

# Java语法基础

## 数据类型

Java是一种强类型语言，每个变量都必须声明其类型。

### 基本数据类型

Java共有8种基本数据类型：

| 类型 | 关键字 | 大小 | 取值范围 | 默认值 |
|------|--------|------|----------|--------|
| 字节型 | byte | 1字节 | -128 ~ 127 | 0 |
| 短整型 | short | 2字节 | -32768 ~ 32767 | 0 |
| 整型 | int | 4字节 | -2^31 ~ 2^31-1 | 0 |
| 长整型 | long | 8字节 | -2^63 ~ 2^63-1 | 0L |
| 单精度浮点 | float | 4字节 | ±3.4E38 | 0.0f |
| 双精度浮点 | double | 8字节 | ±1.7E308 | 0.0d |
| 字符型 | char | 2字节 | 0 ~ 65535 | '\u0000' |
| 布尔型 | boolean | 1位 | true/false | false |

```java
// 基本数据类型示例
byte b = 100;
short s = 10000;
int i = 1000000000;
long l = 10000000000L;  // 注意L后缀
float f = 3.14f;        // 注意f后缀
double d = 3.14159265358979;
char c = 'A';
boolean bool = true;
```

### 引用类型

引用类型包括：类、接口、数组、枚举等。

```java
// 引用类型示例
String str = "Hello, Java!";
int[] arr = {1, 2, 3, 4, 5};
List<String> list = new ArrayList<>();
```

## 变量与常量

### 变量声明

```java
// 变量声明与初始化
int age;                    // 声明
age = 25;                   // 初始化

String name = "张三";        // 声明并初始化

// var关键字（Java 10+）
var message = "Hello";      // 自动推断类型
```

### 常量

使用 `final` 关键字定义常量：

```java
// 常量定义
final double PI = 3.14159265;
final int MAX_SIZE = 100;

// 常量一旦赋值不能修改
// PI = 3.14;  // 编译错误
```

## 运算符

### 算术运算符

```java
int a = 10, b = 3;

System.out.println(a + b);   // 13 加法
System.out.println(a - b);   // 7  减法
System.out.println(a * b);   // 30 乘法
System.out.println(a / b);   // 3  除法（整数除法）
System.out.println(a % b);   // 1  取模

// 自增自减
int x = 5;
System.out.println(x++);     // 5 后自增
System.out.println(++x);     // 7 前自增
```

### 关系运算符

```java
int a = 10, b = 20;

System.out.println(a == b);  // false 等于
System.out.println(a != b);  // true  不等于
System.out.println(a > b);   // false 大于
System.out.println(a < b);   // true  小于
System.out.println(a >= b);  // false 大于等于
System.out.println(a <= b);  // true  小于等于
```

### 逻辑运算符

```java
boolean x = true, y = false;

System.out.println(x && y);  // false 逻辑与（短路与）
System.out.println(x || y);  // true  逻辑或（短路或）
System.out.println(!x);      // false 逻辑非

// 位运算符
System.out.println(5 & 3);   // 1  按位与
System.out.println(5 | 3);   // 7  按位或
System.out.println(5 ^ 3);   // 6  按位异或
System.out.println(~5);      // -6 按位取反
System.out.println(5 << 2);  // 20 左移
System.out.println(5 >> 1);  // 2  右移
System.out.println(5 >>> 1); // 2  无符号右移
```

### 三元运算符

```java
int score = 85;
String result = score >= 60 ? "及格" : "不及格";
System.out.println(result);  // 及格
```

## 流程控制

### 条件语句

```java
// if-else
int score = 85;

if (score >= 90) {
    System.out.println("优秀");
} else if (score >= 80) {
    System.out.println("良好");
} else if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}

// switch语句
int day = 3;
switch (day) {
    case 1:
        System.out.println("星期一");
        break;
    case 2:
        System.out.println("星期二");
        break;
    case 3:
        System.out.println("星期三");
        break;
    default:
        System.out.println("其他");
}

// switch表达式（Java 14+）
String dayName = switch (day) {
    case 1 -> "星期一";
    case 2 -> "星期二";
    case 3 -> "星期三";
    case 4, 5, 6, 7 -> "其他";
    default -> "无效";
};
```

### 循环语句

```java
// for循环
for (int i = 0; i < 5; i++) {
    System.out.println("i = " + i);
}

// 增强for循环
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}

// while循环
int count = 0;
while (count < 5) {
    System.out.println("count = " + count);
    count++;
}

// do-while循环
int num = 0;
do {
    System.out.println("num = " + num);
    num++;
} while (num < 5);
```

### 跳转语句

```java
// break - 跳出循环
for (int i = 0; i < 10; i++) {
    if (i == 5) break;
    System.out.println(i);  // 输出 0-4
}

// continue - 跳过本次循环
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;
    System.out.println(i);  // 输出 1,3,5,7,9
}

// 带标签的break
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) break outer;
        System.out.println(i + ", " + j);
    }
}
```

## 数组

### 数组声明与初始化

```java
// 数组声明
int[] arr1;
int arr2[];

// 静态初始化
int[] arr3 = {1, 2, 3, 4, 5};

// 动态初始化
int[] arr4 = new int[5];  // 默认值为0
String[] arr5 = new String[3];  // 默认值为null

// 数组访问
arr4[0] = 10;
System.out.println(arr4.length);  // 5
```

### 多维数组

```java
// 二维数组
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

System.out.println(matrix[1][2]);  // 6

// 动态创建
int[][] arr = new int[3][4];
```

### 数组操作

```java
import java.util.Arrays;

int[] arr = {5, 2, 8, 1, 9};

// 排序
Arrays.sort(arr);
System.out.println(Arrays.toString(arr));  // [1, 2, 5, 8, 9]

// 二分查找（需要先排序）
int index = Arrays.binarySearch(arr, 5);
System.out.println(index);  // 2

// 数组填充
int[] filled = new int[5];
Arrays.fill(filled, 10);
System.out.println(Arrays.toString(filled));  // [10, 10, 10, 10, 10]

// 数组复制
int[] copied = Arrays.copyOf(arr, 3);
System.out.println(Arrays.toString(copied));  // [1, 2, 5]
```

## 字符串

### 字符串创建

```java
// 直接创建
String s1 = "Hello";

// 使用构造函数
String s2 = new String("Hello");

// 从字符数组创建
char[] chars = {'H', 'e', 'l', 'l', 'o'};
String s3 = new String(chars);
```

### 常用方法

```java
String str = "Hello, Java!";

// 获取信息
int length = str.length();           // 12
char ch = str.charAt(0);             // 'H'
int index = str.indexOf('a');        // 7
int lastIndex = str.lastIndexOf('a');// 9

// 字符串操作
String upper = str.toUpperCase();    // "HELLO, JAVA!"
String lower = str.toLowerCase();    // "hello, java!"
String sub = str.substring(0, 5);    // "Hello"
String rep = str.replace("Java", "World"); // "Hello, World!"
String trim = "  hello  ".trim();    // "hello"

// 字符串判断
boolean start = str.startsWith("Hello"); // true
boolean end = str.endsWith("!");         // true
boolean contains = str.contains("Java"); // true
boolean empty = str.isEmpty();           // false

// 字符串分割
String[] parts = "a,b,c".split(",");  // ["a", "b", "c"]
```

### 字符串拼接

```java
// 使用 +
String s1 = "Hello" + " " + "World";

// 使用 StringBuilder（推荐用于循环中）
StringBuilder sb = new StringBuilder();
sb.append("Hello");
sb.append(" ");
sb.append("World");
String s2 = sb.toString();

// 使用 String.join
String joined = String.join(", ", "a", "b", "c");  // "a, b, c"
```

::: tip 字符串不可变性
Java中的String是不可变的，每次"修改"实际上都创建了新的字符串对象。在需要频繁修改字符串的场景，应使用StringBuilder或StringBuffer。
:::

## 小结

本章介绍了Java的基础语法，包括：

- 8种基本数据类型和引用类型
- 变量声明与常量定义
- 各类运算符的使用
- 流程控制语句（条件、循环、跳转）
- 数组的声明与操作
- 字符串的常用操作

掌握这些基础知识是学习Java编程的第一步。
