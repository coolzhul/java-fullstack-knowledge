---
title: 集合框架
icon: list
order: 3
category:
  - Java
tag:
  - Java
  - 集合
  - Collection
---

# Java集合框架

Java集合框架提供了一套性能优良、使用方便的接口和类，用于存储和操作对象。

## 集合框架体系

```
Iterable
└── Collection
    ├── List (有序、可重复)
    │   ├── ArrayList
    │   ├── LinkedList
    │   └── Vector
    ├── Set (无序、不可重复)
    │   ├── HashSet
    │   ├── LinkedHashSet
    │   └── TreeSet
    └── Queue (队列)
        ├── LinkedList
        ├── PriorityQueue
        └── ArrayDeque

Map (键值对)
├── HashMap
├── LinkedHashMap
├── TreeMap
└── Hashtable
```

## List接口

### ArrayList

基于动态数组实现，查询快，增删慢。

```java
import java.util.ArrayList;
import java.util.List;

public class ArrayListDemo {
    public static void main(String[] args) {
        // 创建ArrayList
        List<String> list = new ArrayList<>();

        // 添加元素
        list.add("Apple");
        list.add("Banana");
        list.add("Cherry");
        list.add(1, "Orange");  // 在索引1处插入

        // 访问元素
        System.out.println(list.get(0));  // Apple
        System.out.println(list.get(2));  // Banana

        // 修改元素
        list.set(0, "Grape");

        // 删除元素
        list.remove("Banana");      // 按值删除
        list.remove(0);             // 按索引删除

        // 遍历
        for (String fruit : list) {
            System.out.println(fruit);
        }

        // 使用迭代器
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }

        // 常用方法
        System.out.println("大小: " + list.size());
        System.out.println("是否包含: " + list.contains("Cherry"));
        System.out.println("索引: " + list.indexOf("Cherry"));

        // 转数组
        String[] arr = list.toArray(new String[0]);
    }
}
```

### LinkedList

基于双向链表实现，增删快，查询慢。

```java
import java.util.LinkedList;

public class LinkedListDemo {
    public static void main(String[] args) {
        LinkedList<String> list = new LinkedList<>();

        // 添加元素
        list.add("A");
        list.addFirst("First");   // 添加到头部
        list.addLast("Last");     // 添加到尾部

        // 访问元素
        System.out.println(list.getFirst());  // First
        System.out.println(list.getLast());   // Last

        // 删除元素
        list.removeFirst();
        list.removeLast();

        // 栈操作
        list.push("Stack1");  // 压栈
        list.push("Stack2");
        System.out.println(list.pop());  // 出栈: Stack2

        // 队列操作
        list.offer("Queue1");  // 入队
        list.offer("Queue2");
        System.out.println(list.poll());  // 出队
    }
}
```

## Set接口

### HashSet

基于哈希表实现，元素无序，允许null。

```java
import java.util.HashSet;
import java.util.Set;

public class HashSetDemo {
    public static void main(String[] args) {
        Set<String> set = new HashSet<>();

        // 添加元素
        set.add("Apple");
        set.add("Banana");
        set.add("Cherry");
        set.add("Apple");  // 重复元素不会被添加

        System.out.println(set);  // [Apple, Cherry, Banana] (顺序不确定)

        // 判断
        System.out.println(set.contains("Banana"));  // true
        System.out.println(set.isEmpty());           // false
        System.out.println(set.size());              // 3

        // 删除
        set.remove("Banana");

        // 遍历
        for (String item : set) {
            System.out.println(item);
        }
    }
}
```

### TreeSet

基于红黑树实现，元素有序（自然排序或自定义排序）。

```java
import java.util.TreeSet;

public class TreeSetDemo {
    public static void main(String[] args) {
        // 自然排序
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(5);
        numbers.add(1);
        numbers.add(3);
        numbers.add(2);
        System.out.println(numbers);  // [1, 2, 3, 5]

        // 导航方法
        System.out.println("第一个: " + numbers.first());
        System.out.println("最后一个: " + numbers.last());
        System.out.println("小于4的最大值: " + numbers.lower(4));
        System.out.println("大于3的最小值: " + numbers.higher(3));

        // 范围操作
        System.out.println("小于等于3: " + numbers.headSet(3, true));
        System.out.println("大于等于2: " + numbers.tailSet(2, true));
        System.out.println("1到4之间: " + numbers.subSet(1, 4));

        // 自定义排序
        TreeSet<String> words = new TreeSet<>((a, b) -> b.compareTo(a));  // 降序
        words.add("Apple");
        words.add("Banana");
        words.add("Cherry");
        System.out.println(words);  // [Cherry, Banana, Apple]
    }
}
```

## Map接口

### HashMap

基于哈希表实现，键值对存储，允许null键和null值。

```java
import java.util.HashMap;
import java.util.Map;

public class HashMapDemo {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();

        // 添加键值对
        map.put("Apple", 10);
        map.put("Banana", 20);
        map.put("Cherry", 30);

        // 获取值
        System.out.println(map.get("Apple"));     // 10
        System.out.println(map.getOrDefault("Orange", 0));  // 0

        // 修改
        map.put("Apple", 15);  // 覆盖
        map.replace("Banana", 25);

        // 条件更新（Java 8+）
        map.compute("Apple", (k, v) -> v + 5);
        map.computeIfAbsent("Orange", k -> 100);
        map.merge("Cherry", 10, Integer::sum);

        // 删除
        map.remove("Banana");
        map.remove("Apple", 20);  // 只有值匹配才删除

        // 判断
        System.out.println(map.containsKey("Apple"));   // true
        System.out.println(map.containsValue(30));      // true

        // 遍历
        // 遍历键
        for (String key : map.keySet()) {
            System.out.println(key + " = " + map.get(key));
        }

        // 遍历值
        for (Integer value : map.values()) {
            System.out.println(value);
        }

        // 遍历键值对（推荐）
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + " = " + entry.getValue());
        }

        // forEach方法（Java 8+）
        map.forEach((k, v) -> System.out.println(k + " = " + v));
    }
}
```

### TreeMap

基于红黑树实现，键有序。

```java
import java.util.TreeMap;

public class TreeMapDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> map = new TreeMap<>();

        map.put("C", 3);
        map.put("A", 1);
        map.put("B", 2);
        map.put("D", 4);

        System.out.println(map);  // {A=1, B=2, C=3, D=4}

        // 导航方法
        System.out.println("第一个: " + map.firstEntry());
        System.out.println("最后一个: " + map.lastEntry());
        System.out.println("小于C的最大键: " + map.lowerEntry("C"));
        System.out.println("大于B的最小键: " + map.higherEntry("B"));

        // 范围操作
        System.out.println("小于等于C: " + map.headMap("C", true));
        System.out.println("大于B: " + map.tailMap("B", false));
    }
}
```

## Queue接口

### PriorityQueue

优先队列，基于堆实现。

```java
import java.util.PriorityQueue;

public class PriorityQueueDemo {
    public static void main(String[] args) {
        // 默认最小堆
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        minHeap.offer(5);
        minHeap.offer(1);
        minHeap.offer(3);
        minHeap.offer(2);

        while (!minHeap.isEmpty()) {
            System.out.print(minHeap.poll() + " ");  // 1 2 3 5
        }

        // 最大堆
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(
            (a, b) -> b - a
        );
        maxHeap.offer(5);
        maxHeap.offer(1);
        maxHeap.offer(3);

        System.out.println("\n最大堆顶部: " + maxHeap.peek());  // 5
    }
}
```

### ArrayDeque

双端队列，基于数组实现。

```java
import java.util.ArrayDeque;

public class ArrayDequeDemo {
    public static void main(String[] args) {
        ArrayDeque<Integer> deque = new ArrayDeque<>();

        // 双端添加
        deque.addFirst(1);
        deque.addLast(2);
        deque.offerFirst(0);
        deque.offerLast(3);

        System.out.println(deque);  // [0, 1, 2, 3]

        // 双端访问
        System.out.println("头部: " + deque.getFirst());
        System.out.println("尾部: " + deque.getLast());

        // 双端删除
        System.out.println("删除头部: " + deque.removeFirst());
        System.out.println("删除尾部: " + deque.removeLast());
    }
}
```

## 集合工具类

### Collections

```java
import java.util.*;

public class CollectionsDemo {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6));

        // 排序
        Collections.sort(list);
        System.out.println("升序: " + list);

        Collections.sort(list, Collections.reverseOrder());
        System.out.println("降序: " + list);

        // 查找
        Collections.sort(list);
        int index = Collections.binarySearch(list, 4);
        System.out.println("4的索引: " + index);

        // 最大最小
        System.out.println("最大值: " + Collections.max(list));
        System.out.println("最小值: " + Collections.min(list));

        // 反转
        Collections.reverse(list);
        System.out.println("反转: " + list);

        // 打乱
        Collections.shuffle(list);
        System.out.println("打乱: " + list);

        // 填充
        List<String> names = new ArrayList<>(Arrays.asList("A", "B", "C"));
        Collections.fill(names, "X");
        System.out.println("填充: " + names);

        // 复制
        List<Integer> dest = Arrays.asList(new Integer[list.size()]);
        Collections.copy(dest, list);

        // 不可变集合
        List<String> immutable = Collections.unmodifiableList(
            new ArrayList<>(Arrays.asList("A", "B", "C"))
        );
        // immutable.add("D");  // 抛出异常

        // 同步集合
        List<String> syncList = Collections.synchronizedList(new ArrayList<>());
    }
}
```

## 集合选择指南

| 需求 | 推荐集合 |
|------|----------|
| 快速随机访问 | ArrayList |
| 频繁插入删除 | LinkedList |
| 去重，不关心顺序 | HashSet |
| 去重，需要排序 | TreeSet |
| 去重，保持插入顺序 | LinkedHashSet |
| 键值对存储，快速查找 | HashMap |
| 键值对存储，需要排序 | TreeMap |
| 优先级队列 | PriorityQueue |
| 栈/队列操作 | ArrayDeque |

::: warning 注意事项
1. **HashMap vs ConcurrentHashMap**：多线程环境使用ConcurrentHashMap
2. **ArrayList vs Vector**：优先使用ArrayList，Vector是线程安全的但性能较低
3. **HashSet去重**：依赖equals()和hashCode()方法，自定义类需要正确重写
:::

## 小结

Java集合框架是日常开发中最常用的API之一，掌握各种集合的特点和适用场景非常重要。
