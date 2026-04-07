---
title: 访问者 Visitor
icon: design
order: 22
category:
  - Java
tag:
  - Java
  - 设计模式
---

# 访问者 Visitor

> 在不修改已有类结构的前提下，定义作用于这些对象的新操作。

## 意图

访问者模式（Visitor Pattern）将操作从对象结构中分离出来。当你有一个稳定的对象结构，但需要频繁添加新的操作时，可以在不修改对象类的前提下，通过添加新的访问者来实现新操作。

核心是**"双分派"（Double Dispatch）**——访问者调用元素的方法，元素再回调访问者的方法，最终根据访问者和元素两个维度来确定执行哪个操作。

:::tip 通俗理解

想象一个**体检中心**：

- 体检中心有固定的科室（内科、外科、眼科、耳鼻喉科）——这就是**稳定的对象结构**
- 每次体检可以有不同的套餐（基础套餐、高级套餐、VIP 套餐）——这就是**变化的操作**
- 新增一个套餐不需要改动任何科室，只需要定义一个新的"套餐访问者"

如果不使用访问者模式，每新增一种套餐，所有科室的代码都要改。用了访问者模式，新增套餐只需要新增一个访问者类，科室代码完全不动。

另一个比喻：**博物馆导览**——展品是固定的（绘画、雕塑、瓷器），但导览路线可以变化（历史线、艺术线、技术线）。新增一条导览路线不需要移动任何展品。
:::

访问者模式属于**行为型模式**，它的使用前提是**对象结构稳定、操作频繁变化**。这是一个非常"挑场景"的模式——用对了很优雅，用错了很痛苦。

## 适用场景

- **对象结构稳定，但需要频繁添加新操作时**：如编译器 AST 的多种分析/优化操作
- **需要对一个复杂对象结构执行多种不同的、不相关的操作时**：如报表系统对同一组数据生成不同格式的输出
- **对象结构中的类很少变化，但需要经常定义新操作时**：操作和对象结构独立演化
- **编译器的语法树遍历（AST）**：编译器前端生成 AST，后端用不同的 Visitor 做类型检查、优化、代码生成
- **需要跨对象累积状态的操作**：如统计一组对象的总价格、总数量等

:::warning 注意
访问者模式的前提是**对象结构稳定**。如果元素类型也经常变化（频繁新增 Element），访问者模式反而会增加维护成本——每新增一种元素，所有访问者都要改。这和"开闭原则对新增元素类型不友好"是同一个问题。
:::

## UML 类图

```mermaid
classDiagram
    class "Visitor" as Visitor {
        <<interface>>
        +visit(ConcreteElementA) void
        +visit(ConcreteElementB) void
    }
    class "ConcreteVisitor1" as ConcreteVisitor1 {
        +visit(ConcreteElementA) void
        +visit(ConcreteElementB) void
    }
    class "ConcreteVisitor2" as ConcreteVisitor2 {
        +visit(ConcreteElementA) void
        +visit(ConcreteElementB) void
    }
    class "Element" as Element {
        <<interface>>
        +accept(Visitor) void
    }
    class "ConcreteElementA" as ConcreteElementA {
        +accept(Visitor) void
        +operationA() void
    }
    class "ConcreteElementB" as ConcreteElementB {
        +accept(Visitor) void
        +operationB() void
    }
    class "ObjectStructure" as ObjectStructure {
        -List~Element~ elements
        +accept(Visitor) void
        +add(Element) void
    }
    Visitor <|.. ConcreteVisitor1
    Visitor <|.. ConcreteVisitor2
    Element <|.. ConcreteElementA
    Element <|.. ConcreteElementB
    ObjectStructure o-- Element : contains
    note for ConcreteElementA "accept中调用\nvisitor.visit(this)"
```

**关键角色说明：**

| 角色 | 说明 |
|------|------|
| **Visitor（访问者接口）** | 为每个元素类型定义一个 `visit()` 方法 |
| **ConcreteVisitor（具体访问者）** | 实现具体的操作逻辑 |
| **Element（元素接口）** | 定义 `accept(Visitor)` 方法 |
| **ConcreteElement（具体元素）** | 在 `accept()` 中调用 `visitor.visit(this)` |
| **ObjectStructure（对象结构）** | 持有元素集合，提供遍历接口 |

## 代码示例

### ❌ 没有使用该模式的问题

```java
// 场景：电商系统中的商品促销计算
// 商品类型固定（图书、电子产品、食品），但促销规则经常变化
// 促销类型：打折、满减、会员价、节日促销、新人优惠...

// 每种商品类
public interface Product {
    double getPrice();
    double getWeight();

    // 问题开始：每新增一种促销规则，所有商品类都要修改
    double getDiscountedPrice();     // 打折价
    double getCouponPrice();         // 满减价
    double getMemberPrice();         // 会员价
    double getHolidayPrice();        // 节日价
    // double getNewUserPrice();     // 新增新人价？所有实现类都要改
    // double getFlashSalePrice();   // 新增秒杀价？所有实现类都要改
}

public class Book implements Product {
    @Override
    public double getDiscountedPrice() {
        return getPrice() * 0.8;  // 图书打8折
    }

    @Override
    public double getCouponPrice() {
        return Math.max(0, getPrice() - 10);  // 图书满10减10
    }

    @Override
    public double getMemberPrice() {
        return getPrice() * 0.85;  // 会员价
    }

    // 每个方法都要实现，即使有些商品类型不支持该促销
    @Override
    public double getHolidayPrice() {
        return getPrice() * 0.7;  // 节日价
    }
    // 新增促销类型？修改所有 Product 实现类...
}

// 问题总结：
// 1. 违反开闭原则：新增操作要修改所有元素类
// 2. 操作和元素耦合：促销逻辑散落在各个商品类中
// 3. 代码膨胀：商品类越来越大，职责不清
// 4. 难以组合操作：想同时应用"打折+满减"？更复杂了
```

### ✅ 使用该模式后的改进

```java
// ========================================
// 第一步：定义元素接口和具体元素
// ========================================

/**
 * 商品元素接口 —— 只定义 accept 方法
 * 商品类不再关心促销逻辑，职责单一
 */
public interface Product {
    void accept(ProductVisitor visitor);
    double getPrice();   // 基础价格
    double getWeight();  // 重量（用于计算运费）
}

/**
 * 图书 —— 具体元素
 */
public class Book implements Product {
    private final String name;
    private final double price;
    private final String author;

    public Book(String name, double price, String author) {
        this.name = name;
        this.price = price;
        this.author = author;
    }

    @Override
    public void accept(ProductVisitor visitor) {
        // 关键：调用 visitor.visit(this)，把"自己"传给访问者
        // 这就是双分派的第二步
        visitor.visit(this);
    }

    @Override
    public double getPrice() { return price; }
    @Override
    public double getWeight() { return 0.5; }  // 图书固定重量
    public String getName() { return name; }
    public String getAuthor() { return author; }
}

/**
 * 电子产品 —— 具体元素
 */
public class Electronics implements Product {
    private final String name;
    private final double price;
    private final int warrantyMonths;

    public Electronics(String name, double price, int warrantyMonths) {
        this.name = name;
        this.price = price;
        this.warrantyMonths = warrantyMonths;
    }

    @Override
    public void accept(ProductVisitor visitor) {
        visitor.visit(this);  // 传递具体类型给访问者
    }

    @Override
    public double getPrice() { return price; }
    @Override
    public double getWeight() { return 2.0; }
    public String getName() { return name; }
    public int getWarrantyMonths() { return warrantyMonths; }
}

/**
 * 食品 —— 具体元素
 */
public class Food implements Product {
    private final String name;
    private final double price;
    private final LocalDate expiryDate;

    public Food(String name, double price, LocalDate expiryDate) {
        this.name = name;
        this.price = price;
        this.expiryDate = expiryDate;
    }

    @Override
    public void accept(ProductVisitor visitor) {
        visitor.visit(this);
    }

    @Override
    public double getPrice() { return price; }
    @Override
    public double getWeight() { return 0.3; }
    public String getName() { return name; }
    public LocalDate getExpiryDate() { return expiryDate; }
}

// ========================================
// 第二步：定义访问者接口
// ========================================

/**
 * 商品访问者接口 —— 为每种商品类型定义一个 visit 方法
 * 新增操作只需新增一个访问者实现类
 */
public interface ProductVisitor {
    void visit(Book book);
    void visit(Electronics electronics);
    void visit(Food food);
}

// ========================================
// 第三步：实现具体访问者
// ========================================

/**
 * 折扣计算访问者 —— 计算每种商品的折扣价
 */
public class DiscountVisitor implements ProductVisitor {
    // 访问者可以累积状态（跨元素的结果）
    private double totalSavings = 0;

    @Override
    public void visit(Book book) {
        // 图书统一8折
        double discount = book.getPrice() * 0.2;
        totalSavings += discount;
        System.out.printf("  《%s》: 原价 %.2f, 折扣价 %.2f (8折, 省 %.2f)%n",
            book.getName(), book.getPrice(),
            book.getPrice() - discount, discount);
    }

    @Override
    public void visit(Electronics electronics) {
        // 电子产品满500减100
        double discount = electronics.getPrice() >= 500 ? 100 : 0;
        totalSavings += discount;
        System.out.printf("  %s: 原价 %.2f, 折扣价 %.2f (满500减100, 省 %.2f)%n",
            electronics.getName(), electronics.getPrice(),
            electronics.getPrice() - discount, discount);
    }

    @Override
    public void visit(Food food) {
        // 临期食品5折
        double discount = food.getExpiryDate().isBefore(LocalDate.now().plusDays(7))
            ? food.getPrice() * 0.5 : 0;
        totalSavings += discount;
        System.out.printf("  %s: 原价 %.2f, 折扣价 %.2f (%s, 省 %.2f)%n",
            food.getName(), food.getPrice(),
            food.getPrice() - discount,
            discount > 0 ? "临期5折" : "无折扣",
            discount);
    }

    public double getTotalSavings() {
        return totalSavings;
    }
}

/**
 * 运费计算访问者 —— 计算每种商品的运费
 */
public class ShippingCostVisitor implements ProductVisitor {
    private double totalCost = 0;

    @Override
    public void visit(Book book) {
        // 图书运费：重量 * 2
        double cost = book.getWeight() * 2;
        totalCost += cost;
        System.out.printf("  《%s》: 运费 %.2f (重量 %.1fkg × 2)%n",
            book.getName(), cost, book.getWeight());
    }

    @Override
    public void visit(Electronics electronics) {
        // 电子产品运费：基础10 + 重量 * 5（需要防震包装）
        double cost = 10 + electronics.getWeight() * 5;
        totalCost += cost;
        System.out.printf("  %s: 运费 %.2f (基础10 + 重量 %.1fkg × 5)%n",
            electronics.getName(), cost, electronics.getWeight());
    }

    @Override
    public void visit(Food food) {
        // 食品运费：需要冷链，重量 * 8
        double cost = food.getWeight() * 8;
        totalCost += cost;
        System.out.printf("  %s: 运费 %.2f (冷链 %.1fkg × 8)%n",
            food.getName(), cost, food.getWeight());
    }

    public double getTotalCost() {
        return totalCost;
    }
}

/**
 * JSON 导出访问者 —— 将商品信息导出为 JSON 格式
 */
public class JsonExportVisitor implements ProductVisitor {
    private final StringBuilder json = new StringBuilder();
    private boolean first = true;

    @Override
    public void visit(Book book) {
        appendSeparator();
        json.append(String.format(
            "{\"type\":\"book\",\"name\":\"%s\",\"price\":%.2f,\"author\":\"%s\"}",
            book.getName(), book.getPrice(), book.getAuthor()));
    }

    @Override
    public void visit(Electronics electronics) {
        appendSeparator();
        json.append(String.format(
            "{\"type\":\"electronics\",\"name\":\"%s\",\"price\":%.2f,\"warranty\":%d}",
            electronics.getName(), electronics.getPrice(),
            electronics.getWarrantyMonths()));
    }

    @Override
    public void visit(Food food) {
        appendSeparator();
        json.append(String.format(
            "{\"type\":\"food\",\"name\":\"%s\",\"price\":%.2f,\"expiry\":\"%s\"}",
            food.getName(), food.getPrice(), food.getExpiryDate()));
    }

    private void appendSeparator() {
        if (!first) {
            json.append(",\n");
        }
        first = false;
    }

    public String getJson() {
        return "[\n" + json.toString() + "\n]";
    }
}

// ========================================
// 第四步：对象结构（购物车）
// ========================================

/**
 * 购物车 —— 对象结构，持有商品集合
 */
public class ShoppingCart {
    private final List<Product> products = new ArrayList<>();

    public void addProduct(Product product) {
        products.add(product);
    }

    /**
     * 接受访问者 —— 遍历所有商品，让每个商品接受访问者
     * 这是访问者模式的标准用法
     */
    public void accept(ProductVisitor visitor) {
        for (Product product : products) {
            product.accept(visitor);
        }
    }

    public List<Product> getProducts() {
        return Collections.unmodifiableList(products);
    }
}

// ========================================
// 第五步：客户端调用
// ========================================
public class Main {
    public static void main(String[] args) {
        // 构建购物车
        ShoppingCart cart = new ShoppingCart();
        cart.addProduct(new Book("Java编程思想", 108.00, "Bruce Eckel"));
        cart.addProduct(new Electronics("MacBook Pro", 12999.00, 12));
        cart.addProduct(new Electronics("AirPods", 1399.00, 12));
        cart.addProduct(new Food("三文鱼", 89.00, LocalDate.now().plusDays(3)));

        // ===== 操作1：计算折扣 =====
        System.out.println("===== 折扣计算 =====");
        DiscountVisitor discountVisitor = new DiscountVisitor();
        cart.accept(discountVisitor);
        System.out.printf("  总计节省: %.2f 元%n", discountVisitor.getTotalSavings());

        // ===== 操作2：计算运费 =====
        System.out.println("\n===== 运费计算 =====");
        ShippingCostVisitor shippingVisitor = new ShippingCostVisitor();
        cart.accept(shippingVisitor);
        System.out.printf("  总运费: %.2f 元%n", shippingVisitor.getTotalCost());

        // ===== 操作3：导出 JSON =====
        System.out.println("\n===== JSON 导出 =====");
        JsonExportVisitor jsonVisitor = new JsonExportVisitor();
        cart.accept(jsonVisitor);
        System.out.println(jsonVisitor.getJson());

        // 新增操作？只需要新增一个访问者类，商品类完全不用改！
    }
}
```

### 变体与扩展

#### 1. 带返回值的访问者

Java 的泛型可以让访问者方法返回值，实现更灵活的操作：

```java
/**
 * 带返回值的访问者 —— 每次访问可以返回不同类型的结果
 * @param <T> 访问操作的返回值类型
 */
public interface ProductVisitor<T> {
    T visit(Book book);
    T visit(Electronics electronics);
    T visit(Food food);
}

// 使用：返回具体的数值
public class PriceSumVisitor implements ProductVisitor<Double> {
    private double total = 0;

    @Override
    public Double visit(Book book) {
        total += book.getPrice();
        return total;  // 返回当前累计总价
    }

    @Override
    public Double visit(Electronics electronics) {
        total += electronics.getPrice();
        return total;
    }

    @Override
    public Double visit(Food food) {
        total += food.getPrice();
        return total;
    }
}

// 使用方式
PriceSumVisitor visitor = new PriceSumVisitor();
for (Product product : cart.getProducts()) {
    product.accept(visitor);
}
System.out.println("总价: " + visitor.visit(null)); // 获取最终结果
```

#### 2. 组合模式 + 访问者模式

当元素构成**树形结构**时，访问者可以递归遍历整棵树：

```java
/**
 * 树形商品结构 —— 商品可以是单品，也可以是组合商品（如套装）
 */
// 组合节点：商品套装
public class ProductBundle implements Product {
    private final String name;
    private final List<Product> items = new ArrayList<>();

    public ProductBundle(String name) {
        this.name = name;
    }

    public void add(Product product) {
        items.add(product);
    }

    @Override
    public void accept(ProductVisitor visitor) {
        // 先访问自己（如果有 visit(ProductBundle) 方法）
        // 然后递归访问所有子商品
        for (Product item : items) {
            item.accept(visitor);  // 递归遍历子树
        }
    }

    @Override
    public double getPrice() {
        return items.stream().mapToDouble(Product::getPrice).sum();
    }

    @Override
    public double getWeight() {
        return items.stream().mapToDouble(Product::getWeight).sum();
    }
}

// 使用：套装中的每个单品都会被访问者处理
ProductBundle bundle = new ProductBundle("编程套装");
bundle.add(new Book("Java编程思想", 108.00, "Bruce Eckel"));
bundle.add(new Book("Effective Java", 89.00, "Joshua Bloch"));
bundle.add(new Electronics("机械键盘", 399.00, 24));

cart.addProduct(bundle);  // 套装作为一个整体加入购物车
// 访问者会自动递归处理套装中的每个单品
```

#### 3. 反射式访问者（避免接口膨胀）

当元素类型很多时，可以用反射来避免访问者接口方法过多：

```java
/**
 * 反射式访问者 —— 用注解 + 反射代替为每个元素类型定义 visit 方法
 * 适用于元素类型很多的场景
 */
public class ReflectiveVisitor {

    // 用注解标记处理方法
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    public @interface Visit {
        Class<?> value();  // 指定处理的元素类型
    }

    public static void dispatch(Object visitor, Product product) {
        Class<?> productClass = product.getClass();
        // 查找标记了 @Visit(该类型) 的方法
        for (Method method : visitor.getClass().getMethods()) {
            Visit visit = method.getAnnotation(Visit.class);
            if (visit != null && visit.value().isAssignableFrom(productClass)) {
                try {
                    method.invoke(visitor, product);
                    return;
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }
        throw new IllegalArgumentException(
            "No handler for " + productClass.getSimpleName());
    }
}

// 使用：通过注解定义处理方法
public class AnnotationBasedVisitor {
    @ReflectiveVisitor.Visit(Book.class)
    public void handleBook(Book book) {
        System.out.println("处理图书: " + book.getName());
    }

    @ReflectiveVisitor.Visit(Electronics.class)
    public void handleElectronics(Electronics electronics) {
        System.out.println("处理电子产品: " + electronics.getName());
    }
}
```

:::warning 反射式访问者的取舍

优点：不需要为每个元素类型定义 visit 方法，接口更简洁
缺点：失去编译时类型检查，性能略有损失，调试更困难
推荐在元素类型超过 10 种时考虑使用
:::

### 运行结果

```
===== 折扣计算 =====
  《Java编程思想》: 原价 108.00, 折扣价 86.40 (8折, 省 21.60)
  MacBook Pro: 原价 12999.00, 折扣价 12899.00 (满500减100, 省 100.00)
  AirPods: 原价 1399.00, 折扣价 1299.00 (满500减100, 省 100.00)
  三文鱼: 原价 89.00, 折扣价 44.50 (临期5折, 省 44.50)
  总计节省: 266.10 元

===== 运费计算 =====
  《Java编程思想》: 运费 1.00 (重量 0.5kg × 2)
  MacBook Pro: 运费 20.00 (基础10 + 重量 2.0kg × 5)
  AirPods: 运费 20.00 (基础10 + 重量 2.0kg × 5)
  三文鱼: 运费 2.40 (冷链 0.3kg × 8)
  总运费: 43.40 元

===== JSON 导出 =====
[
{"type":"book","name":"Java编程思想","price":108.00,"author":"Bruce Eckel"},
{"type":"electronics","name":"MacBook Pro","price":12999.00,"warranty":12},
{"type":"electronics","name":"AirPods","price":1399.00,"warranty":12},
{"type":"food","name":"三文鱼","price":89.00,"expiry":"2024-01-18"}
]
```

## Spring/JDK 中的应用

### 1. Spring 的 BeanDefinitionVisitor

Spring 在解析 Bean 定义时使用访问者模式遍历和修改 BeanDefinition：

```java
// ==================
// Spring 内部：BeanDefinitionVisitor
// ==================
// Spring 容器启动时，需要解析所有 BeanDefinition 中的属性值
// 比如将占位符 ${db.url} 替换为实际的配置值
// 这个过程就是通过访问者模式实现的

public class BeanDefinitionVisitor {
    /**
     * 遍历 BeanDefinition 中的所有属性值
     * 对每个值执行 visit 方法
     */
    public void visitBeanDefinition(BeanDefinition beanDefinition) {
        // 遍历属性值
        visitPropertyValues(beanDefinition.getPropertyValues());
        // 遍历构造器参数
        visitConstructorArgumentValues(beanDefinition.getConstructorArgumentValues());
    }

    private void visitPropertyValues(MutablePropertyValues pvs) {
        PropertyValue[] pvArray = pvs.getPropertyValues();
        for (PropertyValue pv : pvArray) {
            Object value = pv.getValue();
            // 对每个值执行解析（访问者逻辑）
            Object resolvedValue = resolveValue(value);
            if (resolvedValue != value) {
                pvs.add(pv.getName(), resolvedValue);
            }
        }
    }
}

// ==================
// 实际应用：PropertySourcesPlaceholderConfigurer
// ==================
// Spring 的 ${placeholder} 解析就是访问者模式
// 它遍历所有 BeanDefinition，将 ${...} 替换为实际值

// ==================
// Spring 的事件分发也体现了访问者思想
// ==================
// ApplicationEventMulticaster 遍历所有 Listener
// 每个 Listener 根据事件类型决定是否处理
// 这是一种简化版的访问者模式
```

### 2. ASM 字节码操作框架

ASM 是 Java 字节码操作的事实标准，它大量使用访问者模式：

```java
// ==================
// ASM 的 ClassVisitor —— 最经典的访问者模式应用
// ==================
// ASM 用访问者模式来遍历和修改 .class 文件的结构
// 不需要修改原始类，通过 Visitor 注入新逻辑

import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;

/**
 * 自定义 ClassVisitor —— 给所有方法添加耗时统计
 * 这就是访问者模式：不修改原始类，通过 Visitor 添加新操作
 */
public class TimingClassVisitor extends ClassVisitor {

    public TimingClassVisitor(int api, ClassVisitor cv) {
        super(api, cv);
    }

    @Override
    public MethodVisitor visitMethod(int access, String name, String desc,
                                      String signature, String[] exceptions) {
        // 获取原始 MethodVisitor
        MethodVisitor mv = super.visitMethod(access, name, desc,
                                              signature, exceptions);

        // 返回一个自定义的 MethodVisitor（也是访问者模式）
        return new TimingMethodVisitor(api, mv, name);
    }
}

/**
 * 方法级别的访问者 —— 在方法前后插入计时代码
 */
public class TimingMethodVisitor extends MethodVisitor {
    private final String methodName;

    public TimingMethodVisitor(int api, MethodVisitor mv, String methodName) {
        super(api, mv);
        this.methodName = methodName;
    }

    @Override
    public void visitCode() {
        // 方法开始时插入代码：记录开始时间
        mv.visitFieldInsn(Opcodes.GETSTATIC, "java/lang/System",
                          "nanoTime", "()J");
        mv.visitVarInsn(Opcodes.LSTORE, 1);  // 保存到局部变量1
        super.visitCode();
    }

    @Override
    public void visitInsn(int opcode) {
        // 在 RETURN 指令前插入代码：计算并打印耗时
        if (opcode == Opcodes.RETURN || opcode == Opcodes.IRETURN
            || opcode == Opcodes.ARETURN) {
            mv.visitFieldInsn(Opcodes.GETSTATIC, "java/lang/System",
                              "nanoTime", "()J");
            mv.visitVarInsn(Opcodes.LLOAD, 1);
            mv.visitInsn(Opcodes.LSUB);
            mv.visitVarInsn(Opcodes.LSTORE, 3);  // 耗时存到局部变量3
        }
        super.visitInsn(opcode);
    }
}

// 使用 ASM 修改字节码
byte[] originalClass = ...;  // 原始类的字节码
ClassReader reader = new ClassReader(originalClass);
ClassWriter writer = new ClassWriter(reader, ClassWriter.COMPUTE_MAXS);
ClassVisitor visitor = new TimingClassVisitor(Opcodes.ASM9, writer);
reader.accept(visitor, 0);  // 遍历并修改
byte[] modifiedClass = writer.toByteArray();  // 得到修改后的类
```

:::tip ASM 的访问者层次

ASM 使用了多层次的访问者模式：

1. **ClassVisitor**：访问类级别的结构（字段、方法、注解）
2. **MethodVisitor**：访问方法级别的结构（指令、局部变量、异常表）
3. **AnnotationVisitor**：访问注解的键值对

每一层都是一个独立的访问者，可以按需覆盖。这种设计让 ASM 非常灵活——你只需要关心想修改的部分。
:::

## 优缺点

| 优点 | 说明 | 缺点 | 说明 |
|------|------|------|------|
| **新增操作简单** | 只需新增一个访问者类，元素类完全不用改 | **新增元素困难** | 需要修改所有访问者接口和实现类 |
| **操作集中管理** | 相关操作集中在一个访问者中，便于维护 | **违反依赖倒置** | 访问者依赖具体元素类，不是依赖抽象 |
| **跨元素累积状态** | 访问者可以在遍历过程中累积计算结果 | **元素需要暴露内部** | 元素类需要提供 getter 给访问者访问 |
| **灵活组合操作** | 可以对同一组元素应用不同的访问者 | **双分派增加复杂度** | `accept → visit` 的调用链不够直观 |
| **分离关注点** | 元素只负责数据，访问者负责操作 | **难以添加元素** | 元素结构变化时维护成本高 |

:::danger 最佳实践

1. **确定前提条件**：只在"元素结构稳定、操作频繁变化"时使用
2. **元素提供 getter**：元素类需要暴露足够的信息给访问者，但不暴露内部实现
3. **访问者无状态（推荐）**：如果可能，让访问者无状态，每次遍历创建新实例
4. **使用 ObjectStructure**：用对象结构类封装遍历逻辑，客户端不需要知道具体元素类型
5. **考虑 Acyclic Visitor**：如果元素类型非常多，用 Acyclic Visitor 模式减少接口耦合
:::

## 面试追问

### Q1: 什么是双分派（Double Dispatch）？Java 支持双分派吗？

**A:** 双分派是指方法的选择依赖于**两个对象的运行时类型**。

Java 只支持**单分派**——方法重载在编译时确定（静态分派），方法重写在运行时确定（动态分派）。

```java
// Java 的单分派演示
class Animal {
    void sound() { System.out.println("animal sound"); }
}
class Dog extends Animal {
    @Override
    void sound() { System.out.println("woof"); }
}

class Handler {
    void handle(Animal a) { System.out.println("handle animal"); }
    void handle(Dog d) { System.out.println("handle dog"); }
}

// 测试
Animal a = new Dog();
Handler h = new Handler();
h.handle(a);  // 输出 "handle animal"，不是 "handle dog"！
// 因为 handle() 的重载在编译时就确定了（参数声明类型是 Animal）

// 访问者模式如何实现双分派：
// 第一次分派：element.accept(visitor) → 根据 element 的运行时类型选择 accept
// 第二次分派：visitor.visit(this) → 根据 visitor 的运行时类型选择 visit
// 两次都是运行时决定，所以叫"双分派"
```

:::tip 总结
Java 本身不支持双分派。访问者模式通过两次单分派的组合来模拟双分派效果。如果 Java 未来支持方法重载的运行时分派，访问者模式就不需要了。
:::

### Q2: 访问者模式和迭代器模式有什么关系？

**A:** 它们是互补关系，经常**结合使用**：

- **迭代器**负责"遍历"对象结构中的元素（关注的是**怎么走**）
- **访问者**负责"操作"每个被遍历到的元素（关注的是**做什么**）

```java
// 结合使用：迭代器遍历 + 访问者操作
public class ShoppingCart {
    private final List<Product> products = new ArrayList<>();

    // 标准的访问者模式用法
    public void accept(ProductVisitor visitor) {
        // 迭代器负责遍历
        Iterator<Product> iterator = products.iterator();
        while (iterator.hasNext()) {
            Product product = iterator.next();
            product.accept(visitor);  // 访问者负责操作
        }
    }
}
```

区别在于：迭代器是**外部迭代**（客户端控制遍历），而访问者模式中 ObjectStructure 通常使用**内部迭代**（封装在 accept 方法中）。

### Q3: 访问者模式为什么说对新增元素违反开闭原则？如何缓解？

**A:** 访问者模式的"开闭"是不对称的：

- **新增操作（访问者）** → 符合开闭原则 ✅：新增访问者类，不改元素类
- **新增元素类型** → 违反开闭原则 ❌：需要修改 Visitor 接口 + 所有 ConcreteVisitor

缓解方案：

```java
// 方案1：Acyclic Visitor（无环访问者）
// 将统一的 Visitor 接口拆分为多个小接口，元素只依赖自己需要的接口
public interface Visitable {
    void accept(Visitor visitor);
}

public interface BookVisitor {
    void visit(Book book);
}

public interface ElectronicsVisitor {
    void visit(Electronics electronics);
}

// 元素在 accept 中检查访问者是否支持自己
public class Book implements Visitable {
    @Override
    public void accept(Visitor visitor) {
        if (visitor instanceof BookVisitor) {
            ((BookVisitor) visitor).visit(this);
        }
    }
}

// 新增元素类型？只需要新增一个 XxxVisitor 接口 + 新元素类
// 已有的访问者不需要修改（它们不实现新接口）
// 缺点：accept 中的 instanceof 检查不够优雅

// 方案2：默认访问方法
// 在 Visitor 接口中添加默认实现，减少对已有访问者的影响
public interface ProductVisitor {
    default void visit(Book book) {
        throw new UnsupportedOperationException("不支持");
    }
    default void visit(Electronics electronics) {
        throw new UnsupportedOperationException("不支持");
    }
    // 新增元素类型的 visit 方法有默认实现
    // 已有访问者不会被强制要求实现
}
```

### Q4: 访问者模式在编译器中有哪些应用？

**A:** 访问者模式几乎是编译器的**标准设计模式**：

1. **语法树遍历**：编译器前端生成 AST，后端用 Visitor 遍历 AST
2. **语义分析**：类型检查 Visitor 遍历 AST，检查类型是否正确
3. **代码优化**：常量折叠、死代码消除、内联展开——每种优化是一个 Visitor
4. **代码生成**：遍历 AST 生成字节码/机器码
5. **Lint 检查**：代码风格检查、潜在 bug 检查

```java
// 编译器中的 AST 节点
public interface ASTNode {
    void accept(ASTVisitor visitor);
}

public class IfStatement implements ASTNode {
    private ASTNode condition;
    private ASTNode thenBranch;
    private ASTNode elseBranch;

    @Override
    public void accept(ASTVisitor visitor) {
        visitor.visit(this);  // 双分派
    }
}

// 不同的编译器阶段用不同的 Visitor
public class TypeCheckVisitor implements ASTVisitor {
    @Override
    public void visit(IfStatement node) {
        // 检查 condition 必须是 boolean 类型
        node.getCondition().accept(this);
        Type condType = getLastType();
        if (!condType.equals(Type.BOOLEAN)) {
            reportError("if condition must be boolean");
        }
        node.getThenBranch().accept(this);
        if (node.getElseBranch() != null) {
            node.getElseBranch().accept(this);
        }
    }
}

// 新增一种优化？新增一个 OptimizerVisitor 即可
// AST 节点类完全不需要修改
```

## 相关模式

- **组合模式**：访问者通常遍历组合模式中的树形结构（如 AST、UI 树）
- **迭代器模式**：迭代器负责遍历元素，访问者负责操作元素，两者经常结合使用
- **命令模式**：命令封装操作（一个操作），访问者定义多种操作（多个操作）
- **解释器模式**：解释器通常用访问者来遍历和操作语法树
- **装饰器模式**：装饰器在元素外层包装，访问者在元素上执行操作——两种不同的扩展方式
