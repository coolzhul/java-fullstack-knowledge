---
title: 运算符
icon: pen
order: 203
category:
  - AI
tag:
  - Python
---

## 3.1 算术运算符

```python
 基本算术
print(10 + 3)    # 13  加法
print(10 - 3)    # 7   减法
print(10 * 3)    # 30  乘法

 重点：三种除法的区别
print(10 / 3)    # 3.3333333333333335  真除法（/），总是返回 float
print(10 // 3)   # 3                  整除（//），返回商的整数部分（地板除）
print(10 % 3)    # 1                  取模（%），返回余数
print(-10 // 3)  # -4                 注意！地板除是向下取整，不是向零取整
print(-10 % 3)   # 2                  Python 的取模结果符号跟随除数

 幂运算 **
print(2 ** 10)   # 1024   2的10次方
print(9 ** 0.5)  # 3.0    9的0.5次方 = 平方根
print(2 ** -1)   # 0.5    2的-1次方 = 1/2

 Java 对比：
// Java 中：
// 10 / 3    → 3（整数除法，截断）
// 10.0 / 3  → 3.333...（浮点除法）
// 10 % 3    → 1
// Math.pow(2, 10) → 1024.0（返回 double）
// Java 没有 // 和 ** 运算符
```

:::tip `//` 与 Java 除法的区别
Java 的整数除法是**向零取整**：`-10 / 3 = -3`
Python 的 `//` 是**向下取整**（地板除）：`-10 // 3 = -4`

```python
import math
print(-10 // 3)       # -4
print(math.floor(-10/3))  # -4（等价于地板除）

 如果想要 Java 风格的向零取整：
print(int(-10 / 3))   # -3
```
:::

## 3.2 比较运算符

```python
 基本比较
print(10 > 3)     # True
print(10 < 3)     # False
print(10 >= 10)   # True
print(10 <= 10)   # True
print(10 == 10)   # True
print(10 != 10)   # False

 Python 特有：链式比较
x = 5
print(1 < x < 10)      # True，等价于 (1 < x) and (x < 10)
print(1 < x > 3)       # True，等价于 (1 < x) and (x > 3)
print(1 < x < 3)       # False
 Java 中必须写：(1 < x) && (x < 10)

 注意链式比较中，每个表达式只计算一次
 1 < f(x) < 10  中 f(x) 只调用一次，不会重复计算
```

## 3.3 逻辑运算符

Python 的逻辑运算符跟 Java 有一个重要区别：**返回值不一定是 bool，而是参与运算的操作数。**

```python
 and —— 如果两个都为真，返回最后一个真值；否则返回第一个假值
print(True and True)       # True
print(True and False)      # False
print(False and True)      # False
print(1 and 2)             # 2（两个都为真，返回最后一个）
print(1 and 0)             # 0（第二个为假，返回它）
print(0 and 1)             # 0（第一个为假，短路，直接返回）

 or —— 如果有真值，返回第一个真值；否则返回最后一个假值
print(True or False)       # True
print(False or True)       # True
print(False or False)      # False
print(1 or 2)              # 1（第一个为真，返回它）
print(0 or 2)              # 2（第一个为假，返回第二个）
print(0 or "")             # ""（都为假，返回最后一个）

 not —— 返回 bool
print(not True)            # False
print(not 0)               # True
print(not "hello")         # False

 短路求值
def side_effect():
    print("我被调用了！")
    return True

print(False and side_effect())  # 输出：False（不会打印任何东西！）
 因为 and 左边已经是 False，右边不会执行

print(True or side_effect())    # 输出：True（同样不会打印）
 因为 or 左边已经是 True，右边不会执行
```

:::info Java 对比
Java 的 `&&`、`||`、`!` 始终返回 `boolean`。
Python 的 `and`、`or` 返回**操作数本身**，这使得 Python 可以写出很优雅的默认值语法：

```python
 Python 的惯用写法
name = input("名字：") or "匿名"    # 如果输入为空，用"匿名"
config = settings.get("timeout") or 30  # 如果配置不存在，用默认值 30

 Java 的等价写法
String name = input.isEmpty() ? "匿名" : input;
int timeout = settings.containsKey("timeout") ? settings.get("timeout") : 30;
```
:::

## 3.4 赋值运算符

```python
x = 10
x += 5       # x = x + 5  → 15
x -= 3       # x = x - 3  → 12
x *= 2       # x = x * 2  → 24
x //= 5      # x = x // 5 → 4
x **= 3      # x = x ** 3 → 64
x %= 7       # x = x % 7  → 1

 海象运算符 := （Python 3.8+，赋值表达式）
 在表达式内部赋值，减少重复代码
 Java 没有对应的语法

 传统写法
text = input("输入：")
if len(text) > 5:
    print(f"你输入了 {len(text)} 个字符")

 使用海象运算符
if (n := len(input("输入："))) > 5:
    print(f"你输入了 {n} 个字符")

 在列表推导式中使用
data = [1, 2, 3, 4, 5, 6]
filtered = [y for x in data if (y := x * 2) > 6]
print(filtered)  # [8, 10, 12]
```

## 3.5 位运算符

```python
 位运算直接操作整数的二进制表示
a = 0b1100   # 12
b = 0b1010   # 10

print(a & b)     # 8  (0b1000)  按位与
print(a | b)     # 14 (0b1110)  按位或
print(a ^ b)     # 6  (0b0110)  按位异或
print(~a)        # -13          按位取反
print(a << 2)    # 48 (0b110000) 左移（相当于乘以 2^n）
print(a >> 1)    # 6  (0b110)   右移（相当于除以 2^n）

 实际应用场景
 1. 判断奇偶（比 % 2 快）
print(7 & 1)     # 1（奇数）
print(8 & 1)     # 0（偶数）

 2. 交换两个变量（不需要临时变量）
a, b = 10, 20
a ^= b
b ^= a
a ^= b
print(a, b)      # 20 10

 3. 权限管理（类似 Java 的 BitMask）
READ = 1 << 0    # 0b001
WRITE = 1 << 1   # 0b010
EXECUTE = 1 << 2 # 0b100

permission = READ | WRITE   # 0b011，有读写权限
print(bool(permission & READ))     # True
print(bool(permission & EXECUTE))  # False
permission |= EXECUTE     # 添加执行权限
print(permission)          # 7 (0b111)
```

## 3.6 运算符优先级（完整表格）

从高到低：

| 优先级 | 运算符 | 说明 |
|--------|--------|------|
| 1 | `**` | 幂运算 |
| 2 | `~` | 按位取反 |
| 3 | `*`, `/`, `//`, `%` | 乘除、整除、取模 |
| 4 | `+`, `-` | 加减 |
| 5 | `<<`, `>>` | 位移 |
| 6 | `&` | 按位与 |
| 7 | `^` | 按位异或 |
| 8 | `\|` | 按位或 |
| 9 | `==`, `!=`, `<`, `>`, `<=`, `>=`, `in`, `is` | 比较 |
| 10 | `not` | 逻辑非 |
| 11 | `and` | 逻辑与 |
| 12 | `or` | 逻辑或 |
| 13 | `:=` | 海象运算符（最低优先级） |

:::tip 记不住？加括号！
与其死记优先级，不如在复杂表达式中加括号，让意图更清晰：

```python
 不推荐（需要记住优先级）
result = a or b and c

 推荐（意图明确）
result = a or (b and c)
```
:::

## 📝 练习题

**1. 计算 `10 // 3` 和 `-10 // 3`，解释为什么结果不同。**


**参考答案**

```python
print(10 // 3)    # 3
print(-10 // 3)   # -4
```

`//` 是**地板除**（向下取整），不是向零取整。`-10/3 = -3.33...`，向下取整是 `-4`。Java 的 `/` 是向零取整，所以 `-10 / 3 = -3`。



**2. `print(1 and 2 and 3)` 和 `print(1 or 2 or 3)` 分别输出什么？**


**参考答案**

```python
print(1 and 2 and 3)  # 3（所有都为真，返回最后一个）
print(1 or 2 or 3)    # 1（第一个为真，直接返回）
```



**3. 使用位运算判断一个整数是否是 2 的幂。**


**参考答案**

```python
def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0

print(is_power_of_two(1))    # True
print(is_power_of_two(4))    # True
print(is_power_of_two(6))    # False
print(is_power_of_two(0))    # False
```

原理：2 的幂的二进制只有一个 1。`n & (n-1)` 会消去最低位的 1，如果结果是 0，说明只有一个 1。



**4. 使用海象运算符 `:=` 重写以下代码：**

```python
data = [1, 2, 3, 4, 5]
squared = []
for x in data:
    y = x ** 2
    if y > 10:
        squared.append(y)
```


**参考答案**

```python
data = [1, 2, 3, 4, 5]
squared = [y for x in data if (y := x ** 2) > 10]
print(squared)  # [16, 25]
```



**5. 不用临时变量，交换两个变量的值（写出至少两种方法）。**


**参考答案**

```python
 方法一：Python 元组解包（最 Pythonic）
a, b = b, a

 方法二：位运算
a ^= b; b ^= a; a ^= b

 方法三：加减法
a = a + b; b = a - b; a = a - b
```



---