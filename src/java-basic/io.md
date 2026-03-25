---
title: IO/NIO
icon: file
order: 4
category:
  - Java
tag:
  - Java
  - IO
  - NIO
---

# Java IO/NIO

Java提供了丰富的IO操作API，包括传统的BIO（Blocking IO）和NIO（Non-blocking IO）。

## IO流体系

```
字节流                    字符流
├── InputStream          ├── Reader
│   ├── FileInputStream  │   ├── FileReader
│   ├── BufferedInputStream  │   ├── BufferedReader
│   └── ObjectInputStream    │   └── InputStreamReader
└── OutputStream         └── Writer
    ├── FileOutputStream      ├── FileWriter
    ├── BufferedOutputStream  ├── BufferedWriter
    └── ObjectOutputStream    └── OutputStreamWriter
```

## 字节流

### FileInputStream / FileOutputStream

```java
import java.io.*;

public class FileStreamDemo {
    public static void main(String[] args) {
        // 写入文件
        try (FileOutputStream fos = new FileOutputStream("test.txt")) {
            String content = "Hello, Java IO!";
            fos.write(content.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 读取文件（单字节）
        try (FileInputStream fis = new FileInputStream("test.txt")) {
            int data;
            while ((data = fis.read()) != -1) {
                System.out.print((char) data);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 读取文件（缓冲区）
        try (FileInputStream fis = new FileInputStream("test.txt")) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = fis.read(buffer)) != -1) {
                System.out.println(new String(buffer, 0, len));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### BufferedInputStream / BufferedOutputStream

```java
import java.io.*;

public class BufferedStreamDemo {
    public static void main(String[] args) {
        // 复制文件
        try (
            BufferedInputStream bis = new BufferedInputStream(
                new FileInputStream("source.txt")
            );
            BufferedOutputStream bos = new BufferedOutputStream(
                new FileOutputStream("dest.txt")
            )
        ) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = bis.read(buffer)) != -1) {
                bos.write(buffer, 0, len);
            }
            bos.flush();
            System.out.println("复制完成");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 字符流

### FileReader / FileWriter

```java
import java.io.*;

public class FileReaderDemo {
    public static void main(String[] args) {
        // 写入文件
        try (FileWriter fw = new FileWriter("test.txt")) {
            fw.write("你好，Java字符流！\n");
            fw.write("第二行内容");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 读取文件
        try (FileReader fr = new FileReader("test.txt")) {
            char[] buffer = new char[1024];
            int len;
            while ((len = fr.read(buffer)) != -1) {
                System.out.print(new String(buffer, 0, len));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### BufferedReader / BufferedWriter

```java
import java.io.*;

public class BufferedReaderDemo {
    public static void main(String[] args) {
        // 写入文件
        try (BufferedWriter bw = new BufferedWriter(
            new FileWriter("test.txt")
        )) {
            bw.write("第一行");
            bw.newLine();  // 换行
            bw.write("第二行");
            bw.newLine();
            bw.write("第三行");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 读取文件（按行）
        try (BufferedReader br = new BufferedReader(
            new FileReader("test.txt")
        )) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### InputStreamReader / OutputStreamWriter

```java
import java.io.*;

public class ConvertStreamDemo {
    public static void main(String[] args) {
        // 指定编码读取
        try (
            InputStreamReader isr = new InputStreamReader(
                new FileInputStream("test.txt"), "UTF-8"
            );
            BufferedReader br = new BufferedReader(isr)
        ) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 指定编码写入
        try (
            OutputStreamWriter osw = new OutputStreamWriter(
                new FileOutputStream("output.txt"), "UTF-8"
            );
            BufferedWriter bw = new BufferedWriter(osw)
        ) {
            bw.write("中文内容");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 对象序列化

### Serializable接口

```java
import java.io.*;

// 实现Serializable接口
class Person implements Serializable {
    private static final long serialVersionUID = 1L;

    private String name;
    private int age;
    private transient String password;  // 不参与序列化

    public Person(String name, int age, String password) {
        this.name = name;
        this.age = age;
        this.password = password;
    }

    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age +
               ", password='" + password + "'}";
    }
}

public class SerializationDemo {
    public static void main(String[] args) {
        Person person = new Person("张三", 25, "123456");

        // 序列化
        try (ObjectOutputStream oos = new ObjectOutputStream(
            new FileOutputStream("person.dat")
        )) {
            oos.writeObject(person);
            System.out.println("序列化完成");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 反序列化
        try (ObjectInputStream ois = new ObjectInputStream(
            new FileInputStream("person.dat")
        )) {
            Person p = (Person) ois.readObject();
            System.out.println("反序列化: " + p);
            // Person{name='张三', age=25, password='null'}
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}
```

## File类

```java
import java.io.File;
import java.io.IOException;
import java.util.Date;

public class FileDemo {
    public static void main(String[] args) throws IOException {
        File file = new File("test.txt");
        File dir = new File("mydir/subdir");

        // 创建目录
        boolean created = dir.mkdirs();
        System.out.println("目录创建: " + created);

        // 创建文件
        File newFile = new File(dir, "newfile.txt");
        if (!newFile.exists()) {
            newFile.createNewFile();
        }

        // 文件信息
        System.out.println("文件名: " + file.getName());
        System.out.println("路径: " + file.getPath());
        System.out.println("绝对路径: " + file.getAbsolutePath());
        System.out.println("父目录: " + file.getParent());
        System.out.println("是否存在: " + file.exists());
        System.out.println("是否文件: " + file.isFile());
        System.out.println("是否目录: " + file.isDirectory());
        System.out.println("文件大小: " + file.length() + " bytes");
        System.out.println("最后修改: " + new Date(file.lastModified()));

        // 文件操作
        // file.delete();       // 删除
        // file.renameTo(new File("newname.txt"));  // 重命名

        // 遍历目录
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) {
                System.out.println(f.getName() + (f.isDirectory() ? "/" : ""));
            }
        }

        // 文件过滤器
        File[] txtFiles = dir.listFiles((d, name) -> name.endsWith(".txt"));
    }
}
```

## NIO

### Channel和Buffer

```java
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.*;

public class NIODemo {
    public static void main(String[] args) {
        // 使用NIO复制文件
        try (
            FileChannel sourceChannel = FileChannel.open(
                Paths.get("source.txt"),
                StandardOpenOption.READ
            );
            FileChannel destChannel = FileChannel.open(
                Paths.get("dest.txt"),
                StandardOpenOption.CREATE,
                StandardOpenOption.WRITE
            )
        ) {
            // 方式1：使用transferTo
            sourceChannel.transferTo(0, sourceChannel.size(), destChannel);

            // 方式2：使用Buffer
            // ByteBuffer buffer = ByteBuffer.allocate(1024);
            // while (sourceChannel.read(buffer) != -1) {
            //     buffer.flip();  // 切换为读模式
            //     destChannel.write(buffer);
            //     buffer.clear();  // 清空缓冲区
            // }

            System.out.println("复制完成");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### Buffer操作

```java
import java.nio.ByteBuffer;
import java.nio.CharBuffer;

public class BufferDemo {
    public static void main(String[] args) {
        // 创建Buffer
        ByteBuffer buffer = ByteBuffer.allocate(1024);

        // 写入数据
        buffer.put("Hello".getBytes());

        // 切换为读模式
        buffer.flip();

        // 读取数据
        while (buffer.hasRemaining()) {
            System.out.print((char) buffer.get());
        }
        System.out.println();

        // 重置buffer
        buffer.clear();  // 清空，准备再次写入
        // buffer.rewind();  // 重置position，可重新读取

        // 直接Buffer（堆外内存）
        ByteBuffer directBuffer = ByteBuffer.allocateDirect(1024);

        // Buffer属性
        System.out.println("容量: " + buffer.capacity());
        System.out.println("限制: " + buffer.limit());
        System.out.println("位置: " + buffer.position());
    }
}
```

## NIO.2 (Files和Path)

```java
import java.nio.file.*;
import java.nio.file.attribute.*;
import java.io.IOException;
import java.util.stream.Stream;

public class FilesDemo {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("test.txt");
        Path dir = Paths.get("mydir");

        // 创建文件和目录
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }
        if (!Files.exists(path)) {
            Files.createFile(path);
        }

        // 写入文件
        Files.write(path, "Hello, NIO.2!".getBytes());
        Files.write(path, "\n第二行".getBytes(), StandardOpenOption.APPEND);

        // 读取文件
        String content = Files.readString(path);
        System.out.println("全部内容:\n" + content);

        // 读取所有行
        Files.readAllLines(path).forEach(System.out::println);

        // 文件信息
        System.out.println("大小: " + Files.size(path));
        System.out.println("是否隐藏: " + Files.isHidden(path));
        System.out.println("是否可读: " + Files.isReadable(path));
        System.out.println("是否可写: " + Files.isWritable(path));

        // 文件属性
        BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class);
        System.out.println("创建时间: " + attrs.creationTime());
        System.out.println("修改时间: " + attrs.lastModifiedTime());
        System.out.println("是否目录: " + attrs.isDirectory());

        // 复制、移动、删除
        // Files.copy(path, Paths.get("copy.txt"), StandardCopyOption.REPLACE_EXISTING);
        // Files.move(path, Paths.get("moved.txt"), StandardCopyOption.REPLACE_EXISTING);
        // Files.deleteIfExists(path);

        // 遍历目录
        try (Stream<Path> stream = Files.list(dir)) {
            stream.forEach(p -> System.out.println(p.getFileName()));
        }

        // 深度遍历（递归）
        try (Stream<Path> stream = Files.walk(dir)) {
            stream.filter(Files::isRegularFile)
                  .forEach(p -> System.out.println(p));
        }

        // 查找文件
        try (Stream<Path> stream = Files.find(dir, 10,
            (p, attr) -> attr.isRegularFile() && p.toString().endsWith(".txt")
        )) {
            stream.forEach(System.out::println);
        }

        // 读取大文件（流式）
        try (Stream<String> lines = Files.lines(path)) {
            lines.filter(line -> line.contains("Hello"))
                 .forEach(System.out::println);
        }
    }
}
```

## IO流选择指南

| 场景 | 推荐方案 |
|------|----------|
| 文本文件读写 | BufferedReader / BufferedWriter |
| 二进制文件读写 | BufferedInputStream / BufferedOutputStream |
| 对象持久化 | ObjectOutputStream / ObjectInputStream |
| 大文件复制 | NIO FileChannel |
| 文件属性操作 | NIO.2 Files |
| 文件遍历搜索 | NIO.2 Files.walk() |

::: tip 资源管理
Java 7+ 推荐使用 try-with-resources 语句自动关闭资源，避免资源泄漏。
:::

## 小结

- **BIO**：传统IO，面向流，阻塞式
- **NIO**：新IO，面向缓冲区，非阻塞式
- **NIO.2**：增强的文件操作API，更简洁易用
