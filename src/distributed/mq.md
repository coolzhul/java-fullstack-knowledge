---
title: 消息队列
icon: queue
order: 1
category:
  - 分布式
tag:
  - 消息队列
  - Kafka
  - RabbitMQ
---

# 消息队列

消息队列实现异步通信，解耦生产者和消费者。

## 消息队列对比

| 特性 | Kafka | RabbitMQ | RocketMQ |
|------|-------|----------|----------|
| 吞吐量 | 极高 | 中等 | 高 |
| 延迟 | 毫秒级 | 微秒级 | 毫秒级 |
| 持久化 | 支持 | 支持 | 支持 |
| 事务 | 支持 | 支持 | 支持 |
| 适用场景 | 日志、大数据 | 业务消息 | 电商、金融 |

## RabbitMQ

### 基本概念

```
Producer → Exchange → Queue → Consumer
              ↓
           Routing Key
```

### 交换机类型

| 类型 | 说明 |
|------|------|
| Direct | 精确匹配路由键 |
| Fanout | 广播到所有队列 |
| Topic | 模式匹配路由键 |
| Headers | 根据消息头匹配 |

### Spring Boot集成

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

```java
@Configuration
public class RabbitConfig {

    @Bean
    public Queue queue() {
        return new Queue("order.queue", true);
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange("order.exchange");
    }

    @Bean
    public Binding binding() {
        return BindingBuilder.bind(queue())
            .to(exchange())
            .with("order.created");
    }
}

// 生产者
@Service
@RequiredArgsConstructor
public class OrderProducer {
    private final RabbitTemplate rabbitTemplate;

    public void sendOrder(Order order) {
        rabbitTemplate.convertAndSend(
            "order.exchange",
            "order.created",
            order
        );
    }
}

// 消费者
@Component
public class OrderConsumer {

    @RabbitListener(queues = "order.queue")
    public void handleOrder(Order order) {
        System.out.println("收到订单: " + order);
    }
}
```

## Kafka

### 基本概念

```
Producer → Topic → Partition → Consumer Group
                           ↓
                        Replica
```

### Spring Boot集成

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: order-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
```

```java
// 生产者
@Service
@RequiredArgsConstructor
public class OrderProducer {
    private final KafkaTemplate<String, Order> kafkaTemplate;

    public void sendOrder(Order order) {
        kafkaTemplate.send("orders", order.getId(), order);
    }
}

// 消费者
@Component
public class OrderConsumer {

    @KafkaListener(topics = "orders", groupId = "order-group")
    public void consume(ConsumerRecord<String, Order> record) {
        Order order = record.value();
        System.out.println("收到订单: " + order);
    }
}
```

## 消息可靠性

### 生产者确认

```java
// RabbitMQ
rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
    if (!ack) {
        // 发送失败，重试或记录日志
    }
});

// Kafka
@Configuration
public class KafkaConfig {
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.ACKS_CONFIG, "all");  // 所有副本确认
        return new DefaultKafkaProducerFactory<>(props);
    }
}
```

### 消费者确认

```java
// RabbitMQ手动确认
@RabbitListener(queues = "order.queue", ackMode = "MANUAL")
public void handleOrder(Order order, Channel channel,
        @Header(AmqpHeaders.DELIVERY_TAG) long tag) throws IOException {
    try {
        processOrder(order);
        channel.basicAck(tag, false);
    } catch (Exception e) {
        channel.basicNack(tag, false, true);  // 重新入队
    }
}
```

### 死信队列

```java
@Configuration
public class DeadLetterConfig {

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable("dlq")
            .build();
    }

    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable("order.queue")
            .deadLetterExchange("")  // 默认交换机
            .deadLetterRoutingKey("dlq")
            .build();
    }
}
```

## 小结

| 特性 | 说明 |
|------|------|
| 解耦 | 生产者和消费者独立 |
| 异步 | 提高响应速度 |
| 削峰 | 平滑流量高峰 |
| 可靠 | 消息持久化和确认 |
