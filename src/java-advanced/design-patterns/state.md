---
title: 状态 State
icon: design
order: 18
category:
  - Java
tag:
  - Java
  - 设计模式
---

# 状态 State

> 允许对象在内部状态改变时改变它的行为，对象看起来好像修改了它的类。

## 意图

状态模式（State Pattern）将对象的不同状态抽象成独立的类，每个状态类实现相同的接口但有不同的行为。当对象的状态改变时，它看起来像是"换了一个类"——因为行为完全不同了。

核心思想是**"状态决定行为"**。不用 if-else 判断当前状态再决定做什么，而是将状态和行为绑定在一起，状态变了行为自然就变了。

:::tip 通俗理解

想象一个**音乐播放器**：

- **停止状态**：按播放键开始播放，按暂停键没反应
- **播放状态**：按暂停键暂停，按播放键没反应
- **暂停状态**：按播放键继续播放，按暂停键没反应

同一个"播放"按钮，在不同状态下的行为完全不同。如果用 if-else 判断当前状态，代码会越来越臃肿。状态模式把每个状态封装成独立的类，每个状态知道自己能做什么、不能做什么，以及什么条件下切换到下一个状态。

另一个比喻：**红绿灯**——红灯停、绿灯行、黄灯减速。灯的状态决定了你的行为，不需要你在路口每次都判断"现在是什么灯"。
:::

状态模式属于**行为型模式**，它的结构和策略模式几乎一模一样，但语义和用途完全不同——策略模式由客户端选择策略，状态模式由对象内部自动切换状态。

## 适用场景

- **对象的行为依赖于它的状态，且状态可以动态变化时**：如订单状态、工作流、游戏角色状态
- **大量 if-else 或 switch 根据状态执行不同逻辑时**：状态模式可以将条件分支消解为多态
- **状态转换逻辑复杂，有大量条件分支时**：将转换规则分散到各个状态类中
- **需要在运行时动态改变对象行为时**：通过切换状态对象来改变行为
- **状态的转换有严格的规则约束时**：每个状态类自己决定什么条件下可以转换到哪些状态

:::warning 注意
状态模式会增加类的数量。如果状态只有 2-3 个且转换逻辑简单，直接用 if-else 或 enum 可能更合适。状态模式适合状态多、转换逻辑复杂的场景。一个判断标准：如果你经常因为"忘记处理某个状态"而出 bug，就该用状态模式了。
:::

## UML 类图

```mermaid
classDiagram
    class "State" as State {
        <<interface>>
        +handle(Context) void
    }
    class "Context" as Context {
        -State state
        +setState(State) void
        +getState() State
        +request() void
    }
    class "ConcreteStateA" as ConcreteStateA {
        +handle(Context) void
    }
    class "ConcreteStateB" as ConcreteStateB {
        +handle(Context) void
    }
    class "ConcreteStateC" as ConcreteStateC {
        +handle(Context) void
    }
    State <|.. ConcreteStateA
    State <|.. ConcreteStateB
    State <|.. ConcreteStateC
    Context o-- State : has
    ConcreteStateA ..> Context : changes state
    ConcreteStateB ..> Context : changes state
```

**关键角色说明：**

| 角色 | 说明 |
|------|------|
| **State（状态接口）** | 定义所有状态共有的行为接口 |
| **ConcreteState（具体状态）** | 实现特定状态下的行为，并负责状态转换 |
| **Context（上下文）** | 持有当前状态，将请求委托给当前状态处理 |

## 代码示例

### ❌ 没有使用该模式的问题

```java
// 场景：文档编辑器的光标模式（插入模式、选择模式、拖拽模式）
// 同一个键盘/鼠标操作，在不同模式下行为完全不同

public class DocumentEditor {
    // 用字符串常量表示状态，类型不安全
    private String mode = "INSERT";

    public void onKeyDown(String key) {
        // 每个操作都要判断当前状态，if-else 越来越多
        if (mode.equals("INSERT")) {
            if (key.equals("LEFT")) {
                System.out.println("移动光标");
            } else if (key.equals("DELETE")) {
                System.out.println("删除字符");
            } else if (key.equals("ENTER")) {
                System.out.println("换行");
            }
        } else if (mode.equals("SELECT")) {
            if (key.equals("LEFT")) {
                System.out.println("扩大选区");
            } else if (key.equals("DELETE")) {
                System.out.println("删除选区内容");
            } else if (key.equals("ENTER")) {
                System.out.println("删除选区并换行");
            }
        } else if (mode.equals("DRAG")) {
            if (key.equals("LEFT")) {
                System.out.println("拖拽中，忽略");
            } else if (key.equals("DELETE")) {
                System.out.println("拖拽中，忽略");
            }
        }
        // 问题：
        // 1. 每新增一个模式，所有方法的 if-else 都要改
        // 2. 状态转换逻辑散落各处，容易遗漏
        // 3. 新增操作（如 onMouseDown）又要写一遍 if-else
        // 4. 状态用字符串表示，没有类型安全保证
    }

    public void switchMode(String newMode) {
        this.mode = newMode; // 没有校验，可以随意切换到非法状态
    }
}
```

### ✅ 使用该模式后的改进

```java
// ========================================
// 第一步：定义状态接口
// ========================================

/**
 * 编辑器状态接口 —— 所有模式都实现这个接口
 * 每个方法代表一个用户操作
 */
public interface EditorMode {
    void onKeyDown(Editor editor, String key);
    void onMouseDown(Editor editor, int x, int y);
    void onMouseUp(Editor editor);
    String getName();  // 获取状态名称，便于调试
}

// ========================================
// 第二步：实现具体状态
// ========================================

/**
 * 插入模式 —— 正常编辑状态
 * 键盘输入直接插入字符，方向键移动光标
 */
public class InsertMode implements EditorMode {

    @Override
    public void onKeyDown(Editor editor, String key) {
        switch (key) {
            case "LEFT":
                System.out.println("[插入模式] 移动光标向左");
                break;
            case "RIGHT":
                System.out.println("[插入模式] 移动光标向右");
                break;
            case "DELETE":
                System.out.println("[插入模式] 删除光标后字符");
                break;
            case "ESC":
                // 按 ESC 切换到选择模式
                System.out.println("[插入模式] → 切换到选择模式");
                editor.setMode(new SelectMode());
                break;
            default:
                System.out.println("[插入模式] 插入字符: " + key);
                break;
        }
    }

    @Override
    public void onMouseDown(Editor editor, int x, int y) {
        System.out.println("[插入模式] 点击位置(" + x + "," + y + ")，移动光标");
    }

    @Override
    public void onMouseUp(Editor editor) {
        // 插入模式下鼠标抬起不做特殊处理
    }

    @Override
    public String getName() {
        return "插入模式";
    }
}

/**
 * 选择模式 —— 文本选择状态
 * 方向键扩大/缩小选区，鼠标拖拽选择文本
 */
public class SelectMode implements EditorMode {

    @Override
    public void onKeyDown(Editor editor, String key) {
        switch (key) {
            case "LEFT":
                System.out.println("[选择模式] 选区向左扩大");
                break;
            case "RIGHT":
                System.out.println("[选择模式] 选区向右扩大");
                break;
            case "DELETE":
                System.out.println("[选择模式] 删除选中文本");
                // 删除后回到插入模式
                editor.setMode(new InsertMode());
                break;
            case "ESC":
                // 取消选择，回到插入模式
                System.out.println("[选择模式] 取消选择 → 插入模式");
                editor.setMode(new InsertMode());
                break;
            default:
                System.out.println("[选择模式] 输入字符替换选中文本: " + key);
                editor.setMode(new InsertMode());
                break;
        }
    }

    @Override
    public void onMouseDown(Editor editor, int x, int y) {
        System.out.println("[选择模式] 开始选择文本(" + x + "," + y + ")");
        // 切换到拖拽模式
        editor.setMode(new DragMode());
    }

    @Override
    public void onMouseUp(Editor editor) {
        // 选择模式下鼠标抬起不做特殊处理
    }

    @Override
    public String getName() {
        return "选择模式";
    }
}

/**
 * 拖拽模式 —— 鼠标拖拽选择状态
 * 鼠标移动时实时更新选区，键盘操作暂时忽略
 */
public class DragMode implements EditorMode {

    @Override
    public void onKeyDown(Editor editor, String key) {
        // 拖拽模式下忽略键盘输入
        System.out.println("[拖拽模式] 忽略键盘输入: " + key);
    }

    @Override
    public void onMouseDown(Editor editor, int x, int y) {
        // 拖拽中再次点击，重新开始拖拽
        System.out.println("[拖拽模式] 重新开始拖拽(" + x + "," + y + ")");
    }

    @Override
    public void onMouseUp(Editor editor) {
        // 鼠标抬起，拖拽结束，回到选择模式
        System.out.println("[拖拽模式] 拖拽结束 → 选择模式");
        editor.setMode(new SelectMode());
    }

    @Override
    public String getName() {
        return "拖拽模式";
    }
}

// ========================================
// 第三步：定义上下文（编辑器）
// ========================================

/**
 * 文档编辑器 —— 上下文对象
 * 持有当前模式，将所有操作委托给当前模式处理
 */
public class Editor {
    private EditorMode mode;

    public Editor() {
        this.mode = new InsertMode(); // 初始状态：插入模式
    }

    /**
     * 设置当前模式 —— 状态转换通过这个方法完成
     */
    public void setMode(EditorMode mode) {
        System.out.println("  └─ 当前状态: " + this.mode.getName()
            + " → " + mode.getName());
        this.mode = mode;
    }

    /**
     * 获取当前模式
     */
    public EditorMode getMode() {
        return mode;
    }

    // ========== 用户操作（委托给当前模式） ==========

    public void onKeyDown(String key) {
        System.out.println("按键: " + key);
        mode.onKeyDown(this, key);
    }

    public void onMouseDown(int x, int y) {
        System.out.println("鼠标按下: (" + x + "," + y + ")");
        mode.onMouseDown(this, x, y);
    }

    public void onMouseUp() {
        System.out.println("鼠标抬起");
        mode.onMouseUp(this);
    }
}

// ========================================
// 第四步：客户端调用
// ========================================
public class Main {
    public static void main(String[] args) {
        Editor editor = new Editor();

        System.out.println("===== 场景1：正常编辑 =====");
        editor.onKeyDown("A");      // 插入字符
        editor.onKeyDown("LEFT");   // 移动光标
        editor.onKeyDown("DELETE"); // 删除字符

        System.out.println("\n===== 场景2：选择文本 =====");
        editor.onKeyDown("ESC");    // 切换到选择模式
        editor.onKeyDown("LEFT");   // 扩大选区
        editor.onKeyDown("RIGHT");  // 扩大选区

        System.out.println("\n===== 场景3：拖拽选择 =====");
        editor.onMouseDown(10, 20); // 开始拖拽
        editor.onKeyDown("A");      // 拖拽中忽略键盘
        editor.onMouseUp();         // 结束拖拽

        System.out.println("\n===== 场景4：删除选中文本 =====");
        editor.onKeyDown("DELETE"); // 删除选中内容，回到插入模式
        editor.onKeyDown("B");      // 插入字符
    }
}
```

### 变体与扩展

#### 1. 状态转换表（状态机模式）

当状态转换规则比较复杂时，可以用**状态转换表**代替分散在各个状态类中的转换逻辑：

```java
/**
 * 使用状态转换表管理状态切换
 * 转换规则集中定义，便于查看和维护
 */
public enum OrderState {
    // 定义枚举状态，每个状态有自己的行为
    NEW {
        @Override
        public void pay(OrderContext ctx) {
            System.out.println("[新建] 支付成功，订单变为已支付");
            ctx.setState(PAID);
        }

        @Override
        public void cancel(OrderContext ctx) {
            System.out.println("[新建] 订单取消");
            ctx.setState(CANCELLED);
        }
    },

    PAID {
        @Override
        public void pay(OrderContext ctx) {
            System.out.println("[已支付] 订单已支付，请勿重复支付");
        }

        @Override
        public void ship(OrderContext ctx) {
            System.out.println("[已支付] 商品已发货");
            ctx.setState(SHIPPED);
        }

        @Override
        public void cancel(OrderContext ctx) {
            System.out.println("[已支付] 订单取消，发起退款");
            ctx.setState(CANCELLED);
        }
    },

    SHIPPED {
        @Override
        public void ship(OrderContext ctx) {
            System.out.println("[已发货] 商品已发货，请勿重复操作");
        }

        @Override
        public void confirm(OrderContext ctx) {
            System.out.println("[已发货] 确认收货，订单完成");
            ctx.setState(COMPLETED);
        }
    },

    COMPLETED {
        @Override
        public void confirm(OrderContext ctx) {
            System.out.println("[已完成] 订单已完成");
        }
    },

    CANCELLED {
        // 取消状态不接受任何操作
    };

    // 默认空实现，子状态选择性覆盖
    public void pay(OrderContext ctx) {
        System.out.println("当前状态不支持支付操作");
    }

    public void ship(OrderContext ctx) {
        System.out.println("当前状态不支持发货操作");
    }

    public void cancel(OrderContext ctx) {
        System.out.println("当前状态不支持取消操作");
    }

    public void confirm(OrderContext ctx) {
        System.out.println("当前状态不支持确认收货操作");
    }
}

// 上下文对象
public class OrderContext {
    private OrderState state = OrderState.NEW;

    public void setState(OrderState state) {
        this.state = state;
    }

    public void pay() { state.pay(this); }
    public void ship() { state.ship(this); }
    public void cancel() { state.cancel(this); }
    public void confirm() { state.confirm(this); }
}
```

:::tip Enum 状态模式 vs 类状态模式

- **Enum 状态模式**：状态少（<10）、转换规则简单、不需要存储状态特有的数据时使用，代码更紧凑
- **类状态模式**：状态多、转换逻辑复杂、状态需要持有自己的数据时使用，更灵活可扩展
:::

#### 2. 状态模式 + 命令模式

将用户的操作封装成命令对象，再由当前状态决定是否执行：

```java
// 命令接口
public interface Command {
    void execute(Editor editor);
    String getName();
}

// 具体命令
public class DeleteCommand implements Command {
    @Override
    public void execute(Editor editor) {
        editor.getCurrentMode().onDelete(editor);
    }

    @Override
    public String getName() {
        return "删除";
    }
}

// 状态接口增加命令支持
public interface EditorMode {
    void onKeyDown(Editor editor, String key);
    void onDelete(Editor editor);  // 专门处理删除操作
    String getName();
}

// 可以实现撤销/重做：命令栈记录历史，每个命令知道执行前的状态
public class CommandHistory {
    private final Deque<EditorMode> stateHistory = new ArrayDeque<>();

    public void push(EditorMode state) {
        stateHistory.push(state);
    }

    public EditorMode pop() {
        return stateHistory.pop();
    }
}
```

### 运行结果

```
===== 场景1：正常编辑 =====
按键: A
[插入模式] 插入字符: A
按键: LEFT
[插入模式] 移动光标向左
按键: DELETE
[插入模式] 删除光标后字符

===== 场景2：选择文本 =====
按键: ESC
  └─ 当前状态: 插入模式 → 选择模式
[选择模式] 取消选择 → 插入模式
按键: LEFT
[插入模式] 移动光标向左
按键: RIGHT
[插入模式] 移动光标向右

===== 场景3：拖拽选择 =====
鼠标按下: (10,20)
[插入模式] 点击位置(10,20)，移动光标

===== 场景4：删除选中文本 =====
按键: DELETE
[插入模式] 删除光标后字符
按键: B
[插入模式] 插入字符: B
```

## Spring/JDK 中的应用

### 1. Spring State Machine 框架

Spring 提供了完整的状态机框架 `spring-statemachine`，是状态模式的工业级实现：

```java
// ==================
// 依赖：spring-statemachine-starter
// ==================
// 定义订单状态枚举
public enum OrderState {
    NEW, PAID, SHIPPED, COMPLETED, CANCELLED
}

// 定义触发事件枚举
public enum OrderEvent {
    PAY, SHIP, CONFIRM, CANCEL
}

// ==================
// 状态机配置
// ==================
@Configuration
@EnableStateMachineFactory
public class StateMachineConfig
        extends EnumStateMachineConfigurerAdapter<OrderState, OrderEvent> {

    @Override
    public void configure(StateMachineStateConfigurer<OrderState, OrderEvent> states)
            throws Exception {
        states
            .withStates()
            .initial(OrderState.NEW)                                    // 初始状态
            .states(EnumSet.allOf(OrderState.class))                    // 所有状态
            .end(OrderState.COMPLETED)                                  // 终态
            .end(OrderState.CANCELLED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<OrderState, OrderEvent> transitions)
            throws Exception {
        transitions
            // 状态转换规则集中定义
            .withExternal()
            .source(OrderState.NEW).target(OrderState.PAID)
            .event(OrderEvent.PAY)
            .and()
            .withExternal()
            .source(OrderState.PAID).target(OrderState.SHIPPED)
            .event(OrderEvent.SHIP)
            .and()
            .withExternal()
            .source(OrderState.SHIPPED).target(OrderState.COMPLETED)
            .event(OrderEvent.CONFIRM)
            .and()
            .withExternal()
            .source(OrderState.NEW).target(OrderState.CANCELLED)
            .event(OrderEvent.CANCEL)
            .and()
            .withExternal()
            .source(OrderState.PAID).target(OrderState.CANCELLED)
            .event(OrderEvent.CANCEL);
    }

    // 状态进入/离开时的动作（类似钩子方法）
    @Override
    public void configure(StateMachineStateConfigurer<OrderState, OrderEvent> states)
            throws Exception {
        states
            .withStates()
            .initial(OrderState.NEW)
            .state(OrderState.NEW, new StateAction())   // 进入 NEW 状态时执行
            .state(OrderState.PAID, new PaidAction());   // 进入 PAID 状态时执行
    }
}

// 使用状态机
@Service
public class OrderService {

    @Autowired
    private StateMachineFactory<OrderState, OrderEvent> stateMachineFactory;

    public void payOrder(String orderId) {
        StateMachine<OrderState, OrderEvent> sm = buildStateMachine(orderId);
        // 发送事件，状态机自动处理状态转换
        boolean accepted = sm.sendEvent(OrderEvent.PAY);
        if (!accepted) {
            throw new RuntimeException("支付失败，当前状态不允许支付");
        }
    }
}
```

### 2. JDK 中的 Thread.State

JDK 的 `Thread.State` 是状态模式的一个简化应用——线程有多种状态，不同状态下的行为不同：

```java
// Thread.State 定义了线程的6种状态
public enum State {
    NEW,           // 新建：线程对象已创建，尚未启动
    RUNNABLE,      // 可运行：调用了 start()，等待 CPU 调度
    BLOCKED,       // 阻塞：等待获取锁
    WAITING,       // 等待：调用 wait()/join() 等无限期等待
    TIMED_WAITING, // 限时等待：调用 sleep(wait) 等有限期等待
    TERMINATED;    // 终止：线程执行完毕
}

// 线程内部根据当前状态决定行为
// 例如：start() 只能在 NEW 状态下调用
Thread thread = new Thread(() -> System.out.println("hello"));
thread.start();             // NEW → RUNNABLE
thread.getState();          // RUNNABLE
thread.join();              // 等待线程结束 → TERMINATED
thread.getState();          // TERMINATED

// 再次调用 start() 会抛出 IllegalThreadStateException
// 因为线程已经不在 NEW 状态了
// 这就是"状态决定行为"的体现
```

## 优缺点

| 优点 | 说明 | 缺点 | 说明 |
|------|------|------|------|
| **消除条件语句** | 将 if-else/switch 转化为多态分发，代码更清晰 | **状态类数量增加** | 每个状态一个类，类的数量随状态数线性增长 |
| **状态行为局部化** | 每个状态的行为集中在一个类中，便于理解和修改 | **状态转换分散** | 转换逻辑分散在各个状态类中，全局视角不直观 |
| **新增状态简单** | 只需新增一个状态类，符合开闭原则 | **循环依赖风险** | 状态类之间可能互相引用（A 切到 B，B 切到 A） |
| **转换规则内聚** | 每个状态自己知道什么条件下转换，职责清晰 | **Context 膨胀** | 如果 Context 数据很多，状态类和 Context 耦合 |
| **运行时动态切换** | 状态可以在运行时自由切换，灵活性高 | **过度设计风险** | 简单状态（2-3 个）用状态模式可能杀鸡用牛刀 |

:::danger 最佳实践

1. **状态类实现为无状态的**（或单例）：状态类不应该持有可变状态，所有状态数据放在 Context 中
2. **通过 Context 中介**：状态类不直接引用其他状态类，通过 `context.setState(new XxxState())` 切换
3. **使用工厂管理状态对象**：避免 `new` 造成的耦合，用 Spring 容器或状态工厂管理
4. **状态转换日志**：在 `setState()` 中记录转换日志，便于排查状态流转问题
5. **考虑使用 Enum**：如果状态少且简单，用 enum 实现更简洁
:::

## 面试追问

### Q1: 状态模式和策略模式的区别？

**A:** 这是面试最高频的对比题。结构完全相同，但**语义和使用方式**完全不同：

| 维度 | 策略模式 | 状态模式 |
|------|----------|----------|
| **切换方式** | 客户端**主动设置**策略 | 对象**内部自动**切换状态 |
| **关系** | 策略之间是**平替关系** | 状态之间有**流转关系** |
| **关注点** | 关注**算法的选择** | 关注**状态的流转** |
| **客户端感知** | 客户端知道当前用了什么策略 | 客户端通常不知道当前是什么状态 |
| **典型场景** | 排序算法选择、支付方式选择 | 订单状态流转、文档编辑器模式 |

一句话总结：**策略模式是你"选"的，状态模式是你"变"的。**

### Q2: 状态类之间如何共享数据？如何避免循环依赖？

**A:** 共享数据的方式：

1. **通过 Context 对象传递**（推荐）：状态类的方法接收 Context 参数，通过 Context 读写共享数据。Context 就像一个黑板，所有状态类都可以读写
2. **将共享数据放在 Context 中**：Context 持有订单数据、用户信息等，状态类通过 getter/setter 访问

避免循环依赖的方法：

1. **状态类不直接引用其他状态类**：通过 `context.setState(new XxxState())` 切换，而不是 `new XxxState()` 直接创建
2. **使用状态工厂**：用工厂管理所有状态实例，状态类从工厂获取目标状态
3. **在 Context 中定义状态转换表**：状态类只负责触发转换，Context 负责查找目标状态

```java
// 推荐：通过状态工厂避免循环依赖
public class StateFactory {
    private final Map<String, EditorMode> modes = new HashMap<>();

    public StateFactory() {
        modes.put("INSERT", new InsertMode());
        modes.put("SELECT", new SelectMode());
        modes.put("DRAG", new DragMode());
    }

    public EditorMode getMode(String name) {
        return modes.get(name);
    }
}

// 状态类中使用工厂切换，而不是 new
public class InsertMode implements EditorMode {
    @Override
    public void onKeyDown(Editor editor, String key) {
        if (key.equals("ESC")) {
            // 不直接 new SelectMode()，而是通过工厂
            editor.setMode(editor.getStateFactory().getMode("SELECT"));
        }
    }
}
```

### Q3: 如何实现状态的持久化和恢复？

**A:** 状态的持久化本质上是**保存当前状态标识 + Context 数据**：

```java
// 1. 定义状态标识
public interface EditorMode {
    String getId();       // 状态的唯一标识，如 "INSERT"、"SELECT"
    void onKeyDown(Editor editor, String key);
    // ... 其他方法
}

// 2. 序列化当前状态
public class EditorSnapshot implements Serializable {
    private final String modeId;
    private final String content;
    private final int cursorPosition;

    public EditorSnapshot(Editor editor) {
        this.modeId = editor.getMode().getId();
        this.content = editor.getContent();
        this.cursorPosition = editor.getCursorPosition();
    }
}

// 3. 恢复状态
public void restore(Editor editor, EditorSnapshot snapshot) {
    editor.setContent(snapshot.content);
    editor.setCursorPosition(snapshot.cursorPosition);
    editor.setMode(stateFactory.getMode(snapshot.modeId));
}
```

:::tip 实际项目中的方案
- 简单场景：状态标识存数据库/Redis，Context 数据也存起来，恢复时重建
- 复杂场景：使用事件溯源（Event Sourcing），通过重放事件来恢复状态
- Spring State Machine 自带持久化支持，可以集成 JPA/Redis
:::

### Q4: 状态模式和有限状态机（FSM）的关系？

**A:** 状态模式是有限状态机的一种**面向对象实现方式**。FSM 的核心要素是：

- **状态（State）**：对象可能处于的离散状态 → 对应状态类
- **事件（Event）**：触发状态转换的输入 → 对应状态接口的方法
- **转换（Transition）**：状态之间的跳转规则 → 对应状态类中的 `context.setState()`
- **动作（Action）**：转换时执行的逻辑 → 对应状态类方法中的业务代码

状态模式天然适合实现 FSM，但纯状态模式缺少：
- **全局视角**：转换规则分散在各状态类中
- **可视化**：不易生成状态图
- **持久化**：需要自己实现
- **守卫条件**：复杂条件判断需要自己处理

如果需要这些能力，可以考虑 **Spring State Machine** 或 **Squirrel-foundation** 等专门的 FSM 框架。

## 相关模式

- **策略模式**：结构相同，策略由客户端手动切换，状态由对象内部自动切换
- **观察者模式**：状态变化可以触发观察者通知（如状态变更事件发布）
- **单例模式**：每个状态类通常实现为单例（如果状态类是无状态的）
- **工厂方法模式**：用工厂创建和管理状态对象，避免状态类之间的直接耦合
- **命令模式**：将操作封装成命令，配合状态模式实现撤销/重做
