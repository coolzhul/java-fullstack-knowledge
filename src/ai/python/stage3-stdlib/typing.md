---
title: 类型注解系统
icon: package
order: 409
category:
  - AI
tag:
  - Python
---

## 9.1 为什么需要类型注解？

Java 是强类型语言，编译器帮你检查类型错误。Python 是动态类型语言，变量没有类型约束，但代码规模大了之后，类型混乱会成为 bug 的温床。

类型注解的好处：
1. **IDE 智能提示**：PyCharm、VS Code 可以根据类型提示提供补全
2. **静态检查**：`mypy` 可以在运行前发现类型错误
3. **文档作用**：类型注解就是最好的文档
4. **重构安全**：修改函数签名时，类型检查器会找到所有不兼容的调用

```python
 没有类型注解：这个函数接受什么？返回什么？
def process(data):
    return data.strip().upper()

 有类型注解：一目了然
def process(data: str) -> str:
    return data.strip().upper()
```

## 9.2 基础类型注解

```python
 基本类型
age: int = 25
name: str = "张三"
score: float = 95.5
is_active: bool = True
nothing: None = None

 函数注解
def greet(name: str, age: int) -> str:
    return f"Hello, {name}, you are {age} years old"

 返回 None
def log(message: str) -> None:
    print(message)
```

## 9.3 Optional 和 Union

```python
from typing import Optional, Union

 Optional[X] 等价于 Union[X, None] —— 表示值可以是 X 或 None
def find_user(user_id: int) -> Optional[dict]:
    """查找用户，找不到返回 None"""
    if user_id == 1:
        return {'name': '张三'}
    return None

 Union：多种类型之一
def parse_value(value: Union[int, str, float]) -> str:
    return str(value)

 Python 3.10+ 可以用 | 语法（推荐）
def find_user_v2(user_id: int) -> dict | None:
    if user_id == 1:
        return {'name': '张三'}
    return None

def parse_value_v2(value: int | str | float) -> str:
    return str(value)
```

## 9.4 list / dict / tuple / set 类型注解

```python
from typing import List, Dict, Tuple, Set

 Python 3.9+ 可以直接用小写
names: list[str] = ['张三', '李四', '王五']
scores: dict[str, int] = {'张三': 90, '李四': 85}
point: tuple[int, int] = (3, 4)
unique: set[int] = {1, 2, 3}

 复杂嵌套
users: list[dict[str, str | int]] = [
    {'name': '张三', 'age': 25},
    {'name': '李四', 'age': 30},
]

 Python 3.8 及以下需要大写
names: List[str] = ['张三', '李四']
scores: Dict[str, int] = {'张三': 90}
point: Tuple[int, int] = (3, 4)
```

## 9.5 Callable（函数类型）

```python
from typing import Callable

 Callable[[参数类型], 返回类型]
def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

result = apply(lambda x, y: x + y, 3, 4)
print(result)  # 7

 作为参数传递
def process_data(data: list[int], callback: Callable[[int], None]) -> None:
    for item in data:
        callback(item)

process_data([1, 2, 3], lambda x: print(f"处理: {x}"))
 处理: 1
 处理: 2
 处理: 3
```

## 9.6 TypeVar 和泛型

```python
from typing import TypeVar, Generic

 ========== 泛型函数 ==========
T = TypeVar('T')  # 类型变量

def first(items: list[T]) -> T:
    """返回列表第一个元素，保持类型信息"""
    return items[0]

 mypy 知道返回值是 int
x: int = first([1, 2, 3])
 mypy 知道返回值是 str
y: str = first(['a', 'b', 'c'])

 带约束的 TypeVar
C = TypeVar('C', int, float)  # 只能是 int 或 float

def add(a: C, b: C) -> C:
    return a + b

 ========== 泛型类 ==========
T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def is_empty(self) -> bool:
        return len(self._items) == 0

 mypy 知道这是 Stack[int]
int_stack: Stack[int] = Stack()
int_stack.push(42)
x: int = int_stack.pop()

 mypy 知道这是 Stack[str]
str_stack: Stack[str] = Stack()
str_stack.push('hello')
```

## 9.7 TypeAlias 类型别名

```python
from typing import TypeAlias

 给复杂类型起别名，提高可读性
UserId: TypeAlias = int
UserName: TypeAlias = str
UserRecord: TypeAlias = dict[str, int | str]

def get_user(uid: UserId) -> UserRecord:
    return {'id': uid, 'name': '张三', 'age': 25}

 Python 3.12+ 可以用 type 语句（推荐）
type Matrix = list[list[float]]
type Point = tuple[float, float]
```

## 9.8 TypedDict

```python
from typing import TypedDict

class User(TypedDict):
    name: str
    age: int
    email: str
    active: bool

 创建 TypedDict 实例
user: User = {
    'name': '张三',
    'age': 25,
    'email': 'zhangsan@example.com',
    'active': True,
}

 mypy 会检查字段名和类型
 user = {'name': '张三', 'age': '25'}  # mypy 报错：age 应该是 int

 也支持函数式创建
User = TypedDict('User', {'name': str, 'age': int})

 部分可选字段
class UserUpdate(TypedDict, total=False):
    name: str
    age: int
    email: str
```

## 9.9 Protocol（结构化子类型）

```python
from typing import Protocol

 Protocol 定义接口（鸭子类型的类型安全版本）
class Drawable(Protocol):
    def draw(self) -> str:
        ...

class Circle:
    def draw(self) -> str:
        return "⭕"

class Square:
    def draw(self) -> str:
        return "⬜"

class Dog:
    def bark(self) -> str:
        return "汪汪"

def render(obj: Drawable) -> None:
    print(obj.draw())

render(Circle())  # ✅ Circle 有 draw 方法
render(Square())  # ✅ Square 有 draw 方法
 render(Dog())   # ❌ mypy 报错：Dog 没有 draw 方法
```

:::tip Protocol vs Java Interface
Java 的 Interface 是**名义类型**（必须显式 implements），Python 的 Protocol 是**结构化子类型**（只要有对应方法就满足）。类似于 Go 的 interface 和 TypeScript 的 structural typing。不需要继承任何基类，只要有正确的结构就通过类型检查。
:::

## 9.10 Literal 类型

```python
from typing import Literal

 限制为几个固定值之一
def set_log_level(level: Literal['DEBUG', 'INFO', 'WARNING', 'ERROR']) -> None:
    print(f'日志级别设为: {level}')

set_log_level('DEBUG')   # ✅
set_log_level('VERBOSE') # ❌ mypy 报错

 实际应用：HTTP 方法
HttpMethod = Literal['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

def request(url: str, method: HttpMethod = 'GET') -> dict:
    ...
```

## 9.11 TypeGuard

```python
from typing import TypeGuard

 自定义类型守卫：告诉 mypy 过滤后的类型
def is_str_list(val: list) -> TypeGuard[list[str]]:
    """检查列表中的所有元素是否都是字符串"""
    return all(isinstance(x, str) for x in val)

items: list[str | int] = ['hello', 42, 'world']

if is_str_list(items):
    # mypy 知道这里 items 是 list[str]
    for item in items:
        print(item.upper())  # ✅ mypy 知道 item 是 str
```

## 9.12 mypy 配置和使用

```bash
 安装
pip install mypy

 基本使用
mypy my_script.py
mypy my_package/     # 检查整个包

 常用选项
mypy --strict my_script.py      # 严格模式
mypy --ignore-missing-imports   # 忽略缺少类型桩的第三方库
```

**mypy 配置文件 `mypy.ini`：**

```ini
[mypy]
python_version = 3.11
strict = True
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
ignore_missing_imports = True

[mypy-tests.*]
disallow_untyped_defs = False
```

## 9.13 py.typed 和类型桩文件

```
my_package/
├── __init__.py
├── py.typed          # 标记此包提供类型信息
└── core.py
```

- `py.typed`：一个空文件，告诉 mypy 和其他工具"这个包有内联类型注解"
- 类型桩文件（stub files，`.pyi`）：当第三方库没有类型注解时，可以用 `.pyi` 文件提供类型信息

```python
 stub 文件：requests-stubs/requests/api.pyi
def get(url: str, **kwargs) -> Response: ...
def post(url: str, data: dict | None = None, **kwargs) -> Response: ...
```

## 9.14 Java 泛型对比

| 特性 | Java | Python typing |
|------|------|--------------|
| 泛型函数 | `<T> T first(List<T> list)` | `def first(items: list[T]) -> T` |
| 泛型类 | `class Stack<T>` | `class Stack(Generic[T])` |
| 类型约束 | `<T extends Number>` | `TypeVar('T', int, float)` |
| 通配符 | `List<? extends Number>` | 不需要（Python 的类型系统更灵活） |
| 类型擦除 | 运行时擦除 | 运行时可用 `get_type_hints()` |
| 检查时机 | 编译时 | `mypy` 静态检查（运行时不检查） |
| 类型推断 | 强（Java 10+ var） | 中等（3.12+ 改进中） |
| 联合类型 | 无（用重载或 Object） | `int \| str` |

:::warning Python 类型注解只是"提示"
Python 运行时**不会**检查类型注解。`x: int = "hello"` 在 Python 中完全合法，不会报错。类型检查是 `mypy` 等工具的工作，不是 Python 解释器的。这与 Java 的编译时类型检查有本质区别。
:::

---