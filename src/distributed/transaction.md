---
title: 分布式事务
icon: transaction
order: 3
category:
  - 分布式
tag:
  - 分布式事务
  - Seata
  - 最终一致性
---

# 分布式事务

分布式事务保证跨多个服务的数据一致性。

## 解决方案

| 方案 | 说明 | 适用场景 |
|------|------|----------|
| 2PC | 两阶段提交 | 强一致性要求 |
| TCC | 尝试-确认-取消 | 金融交易 |
| Saga | 长事务编排 | 复杂业务流程 |
| 本地消息表 | 最终一致性 | 一般业务 |
| 事务消息 | 异步确保 | 高并发场景 |

## 2PC（两阶段提交）

```
┌─────────────────────────────────────────────────────────────┐
│                      两阶段提交                              │
├─────────────────────────────────────────────────────────────┤
│  阶段1（Prepare）：                                          │
│  Coordinator → Participant1: 准备                            │
│  Coordinator → Participant2: 准备                            │
│                                                             │
│  阶段2（Commit/Rollback）：                                  │
│  所有参与者就绪 → Commit                                     │
│  任一参与者失败 → Rollback                                   │
└─────────────────────────────────────────────────────────────┘
```

**缺点**：同步阻塞、单点故障、数据不一致风险

## TCC（Try-Confirm-Cancel）

```java
public interface AccountService {
    // Try: 冻结资金
    @Transactional
    void tryDeduct(String accountId, BigDecimal amount);

    // Confirm: 扣减资金
    @Transactional
    void confirmDeduct(String accountId, BigDecimal amount);

    // Cancel: 释放冻结
    @Transactional
    void cancelDeduct(String accountId, BigDecimal amount);
}

@Service
public class AccountServiceImpl implements AccountService {

    @Override
    public void tryDeduct(String accountId, BigDecimal amount) {
        // 检查余额
        Account account = accountDao.findById(accountId);
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException();
        }
        // 冻结资金
        accountDao.freeze(accountId, amount);
    }

    @Override
    public void confirmDeduct(String accountId, BigDecimal amount) {
        // 扣减余额并解冻
        accountDao.deduct(accountId, amount);
        accountDao.unfreeze(accountId, amount);
    }

    @Override
    public void cancelDeduct(String accountId, BigDecimal amount) {
        // 释放冻结
        accountDao.unfreeze(accountId, amount);
    }
}
```

## Seata

### AT模式

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

```java
@Service
public class OrderService {

    @GlobalTransactional  // 开启全局事务
    public void createOrder(OrderDTO dto) {
        // 创建订单
        orderMapper.insert(order);

        // 扣减库存（远程服务）
        inventoryClient.deduct(dto.getProductId(), dto.getQuantity());

        // 扣减余额（远程服务）
        accountClient.debit(dto.getUserId(), dto.getAmount());
    }
}
```

### Seata架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Seata架构                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    TM       │  │    RM       │  │       TC            │  │
│  │ 事务管理器   │  │ 资源管理器  │  │   事务协调器        │  │
│  │             │  │             │  │   (Server)          │  │
│  │ 全局事务     │  │ 分支事务    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 本地消息表

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final MessageRepository messageRepo;

    @Transactional
    public void createOrder(OrderDTO dto) {
        // 1. 创建订单
        Order order = new Order(dto);
        orderRepo.save(order);

        // 2. 保存消息到本地消息表
        Message message = new Message();
        message.setTopic("inventory-deduct");
        message.setBody(JSON.toJSONString(dto));
        message.setStatus("PENDING");
        messageRepo.save(message);
    }
}

// 定时任务扫描并发送
@Scheduled(fixedDelay = 5000)
public void sendPendingMessages() {
    List<Message> messages = messageRepo.findByStatus("PENDING");
    for (Message message : messages) {
        try {
            mqProducer.send(message.getTopic(), message.getBody());
            message.setStatus("SENT");
            messageRepo.save(message);
        } catch (Exception e) {
            // 重试
        }
    }
}
```

## 事务消息（RocketMQ）

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final RocketMQTemplate rocketMQTemplate;

    public void createOrder(OrderDTO dto) {
        // 发送事务消息
        rocketMQTemplate.sendMessageInTransaction(
            "order-group",
            "order-topic",
            MessageBuilder.withPayload(dto).build(),
            null
        );
    }
}

@RocketMQMessageListener(topic = "order-topic", consumerGroup = "inventory-group")
public class InventoryConsumer implements RocketMQListener<OrderDTO> {
    @Override
    public void onMessage(OrderDTO dto) {
        // 扣减库存
        inventoryService.deduct(dto.getProductId(), dto.getQuantity());
    }
}
```

## 小结

| 方案 | 一致性 | 性能 | 复杂度 |
|------|--------|------|--------|
| 2PC | 强 | 低 | 中 |
| TCC | 最终 | 高 | 高 |
| Saga | 最终 | 高 | 中 |
| 本地消息表 | 最终 | 高 | 低 |
| 事务消息 | 最终 | 高 | 低 |
