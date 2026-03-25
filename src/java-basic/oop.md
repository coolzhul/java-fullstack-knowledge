---
title: 面向对象
icon: object
order: 2
category:
  - Java
tag:
  - Java
  - OOP
---

# Java面向对象编程

面向对象编程（Object-Oriented Programming，OOP）是Java的核心编程范式。

## 三大特性

### 1. 封装

封装是将数据和操作数据的方法绑定在一起，对外隐藏实现细节。

```java
public class Person {
    // 私有属性
    private String name;
    private int age;

    // 公共的getter方法
    public String getName() {
        return name;
    }

    // 公共的setter方法
    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        if (age > 0 && age < 150) {
            this.age = age;
        } else {
            throw new IllegalArgumentException("年龄不合法");
        }
    }
}
```

### 2. 继承

继承允许一个类获得另一个类的属性和方法。

```java
// 父类
public class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }

    public void eat() {
        System.out.println(name + "正在吃东西");
    }
}

// 子类继承父类
public class Dog extends Animal {
    private String breed;

    public Dog(String name, String breed) {
        super(name);  // 调用父类构造函数
        this.breed = breed;
    }

    public void bark() {
        System.out.println(name + "正在汪汪叫");
    }

    // 方法重写
    @Override
    public void eat() {
        System.out.println(name + "正在吃狗粮");
    }
}
```

### 3. 多态

多态允许使用父类引用指向子类对象，实现同一接口的不同实现。

```java
public class PolymorphismDemo {
    public static void main(String[] args) {
        // 父类引用指向子类对象
        Animal animal1 = new Dog("旺财", "金毛");
        Animal animal2 = new Cat("咪咪", "橘猫");

        // 同一方法调用，不同行为
        animal1.eat();  // 旺财正在吃狗粮
        animal2.eat();  // 咪咪正在吃鱼

        // 类型检查与转换
        if (animal1 instanceof Dog) {
            Dog dog = (Dog) animal1;
            dog.bark();
        }
    }
}

class Cat extends Animal {
    private String color;

    public Cat(String name, String color) {
        super(name);
        this.color = color;
    }

    @Override
    public void eat() {
        System.out.println(name + "正在吃鱼");
    }
}
```

## 类与对象

### 类的定义

```java
public class Student {
    // 静态变量（类变量）
    public static int count = 0;

    // 实例变量
    private String name;
    private int age;
    private double score;

    // 静态代码块
    static {
        System.out.println("类加载时执行");
    }

    // 实例代码块
    {
        count++;
        System.out.println("创建对象时执行");
    }

    // 构造函数
    public Student() {
        this("未知", 0, 0.0);
    }

    public Student(String name, int age, double score) {
        this.name = name;
        this.age = age;
        this.score = score;
    }

    // 实例方法
    public void study() {
        System.out.println(name + "正在学习");
    }

    // 静态方法
    public static int getCount() {
        return count;
    }

    // toString方法
    @Override
    public String toString() {
        return "Student{name='" + name + "', age=" + age + ", score=" + score + "}";
    }
}
```

### 对象创建与使用

```java
public class Main {
    public static void main(String[] args) {
        // 创建对象
        Student s1 = new Student();
        Student s2 = new Student("张三", 20, 85.5);

        // 调用方法
        s1.study();
        s2.study();

        // 访问静态成员
        System.out.println("学生人数: " + Student.getCount());
    }
}
```

## 抽象类与接口

### 抽象类

```java
// 抽象类
public abstract class Shape {
    protected String color;

    public Shape(String color) {
        this.color = color;
    }

    // 抽象方法（没有实现）
    public abstract double getArea();

    // 具体方法
    public void display() {
        System.out.println("这是一个" + color + "色的图形，面积：" + getArea());
    }
}

// 具体子类
public class Circle extends Shape {
    private double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }
}

public class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }

    @Override
    public double getArea() {
        return width * height;
    }
}
```

### 接口

```java
// 接口定义
public interface Flyable {
    int MAX_HEIGHT = 10000;  // 默认public static final

    void fly();  // 默认public abstract

    // 默认方法（Java 8+）
    default void land() {
        System.out.println("正在降落");
    }

    // 静态方法（Java 8+）
    static void checkWeather() {
        System.out.println("检查天气状况");
    }
}

// 接口实现
public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("鸟儿在天空中飞翔");
    }
}

public class Airplane implements Flyable {
    @Override
    public void fly() {
        System.out.println("飞机在云层中飞行");
    }

    @Override
    public void land() {
        System.out.println("飞机正在着陆");
    }
}
```

### 接口多实现

```java
public interface Swimmable {
    void swim();
}

public class Duck implements Flyable, Swimmable {
    @Override
    public void fly() {
        System.out.println("鸭子飞行");
    }

    @Override
    public void swim() {
        System.out.println("鸭子游泳");
    }
}
```

## 内部类

### 成员内部类

```java
public class Outer {
    private int x = 10;

    // 成员内部类
    public class Inner {
        private int y = 20;

        public void display() {
            System.out.println("x = " + x);  // 访问外部类成员
            System.out.println("y = " + y);
        }
    }

    public void createInner() {
        Inner inner = new Inner();
        inner.display();
    }
}

// 使用
Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();
inner.display();
```

### 静态内部类

```java
public class Outer {
    private static int x = 10;

    // 静态内部类
    public static class StaticInner {
        public void display() {
            System.out.println("x = " + x);  // 只能访问静态成员
        }
    }
}

// 使用
Outer.StaticInner inner = new Outer.StaticInner();
inner.display();
```

### 局部内部类

```java
public void method() {
    final int localVar = 100;

    // 局部内部类
    class LocalInner {
        public void display() {
            System.out.println("localVar = " + localVar);
        }
    }

    LocalInner inner = new LocalInner();
    inner.display();
}
```

### 匿名内部类

```java
// 接口
public interface Greeting {
    void greet();
}

// 使用匿名内部类
public class Main {
    public static void main(String[] args) {
        Greeting greeting = new Greeting() {
            @Override
            public void greet() {
                System.out.println("Hello!");
            }
        };
        greeting.greet();

        // 使用Lambda表达式（Java 8+）
        Greeting lambdaGreeting = () -> System.out.println("Hello Lambda!");
        lambdaGreeting.greet();
    }
}
```

## 枚举

### 枚举定义

```java
public enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

// 使用
Day today = Day.MONDAY;
System.out.println(today);  // MONDAY

// switch语句
switch (today) {
    case MONDAY:
        System.out.println("星期一");
        break;
    case FRIDAY:
        System.out.println("星期五");
        break;
    default:
        System.out.println("其他");
}
```

### 带属性的枚举

```java
public enum Season {
    SPRING("春天", 1),
    SUMMER("夏天", 2),
    AUTUMN("秋天", 3),
    WINTER("冬天", 4);

    private final String name;
    private final int value;

    // 构造函数
    Season(String name, int value) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public int getValue() {
        return value;
    }
}

// 使用
Season season = Season.SPRING;
System.out.println(season.getName());   // 春天
System.out.println(season.getValue());  // 1

// 遍历枚举
for (Season s : Season.values()) {
    System.out.println(s.getName() + ": " + s.getValue());
}
```

## 小结

面向对象编程的要点：

| 特性 | 说明 | 关键字 |
|------|------|--------|
| 封装 | 隐藏实现细节，暴露公共接口 | private, protected, public |
| 继承 | 子类继承父类的属性和方法 | extends |
| 多态 | 同一接口，不同实现 | @Override, instanceof |

核心概念：

- **类**：对象的模板
- **对象**：类的实例
- **抽象类**：不能实例化，可以有抽象方法
- **接口**：纯粹的抽象，定义行为规范
- **内部类**：定义在类内部的类
- **枚举**：固定常量集合

掌握面向对象编程是成为Java开发者的必经之路。
