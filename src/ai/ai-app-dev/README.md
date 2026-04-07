---
title: AI 大模型应用开发
icon: robot
order: 100
category:
  - AI
tag:
  - AI
  - LLM
  - RAG
  - Agent
---

# AI 大模型应用开发

> 从 Prompt 工程到 Agent 开发，系统掌握大模型应用开发的完整技术栈。

## 学习阶段

```mermaid
flowchart LR
    A["Prompt 工程"] --> B["API 集成"]
    B --> C["RAG"]
    C --> D["Agent"]
    D --> E["Java AI"]
    E --> F["工程化"]

    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#9C27B0,color:#fff
    style E fill:#F44336,color:#fff
    style F fill:#607D8B,color:#fff
```

| 阶段 | 内容 | 预计用时 |
|------|------|---------|
| [Prompt 工程](./prompt-engineering/) | 提示词设计、Few-shot、CoT、评估优化 | 1-2 周 |
| [API 集成](./api-integration/) | 各大模型 API、流式输出、多模态 | 1-2 周 |
| [RAG](./rag/) | 文档处理、向量化、向量数据库、检索优化 | 2-3 周 |
| [Agent](./agent/) | 工具调用、ReAct、多 Agent、记忆系统 | 2-3 周 |
| [Java AI](./java-ai/) | LangChain4j、Spring AI、生产级应用 | 2-3 周 |
| [工程化](./engineering/) | 部署、监控、安全合规、成本优化 | 1-2 周 |

## 学习建议

::: tip Java 开发者的建议
1. **Python 阶段一~三学完就够** — 不需要深入 ML/PyTorch，应用开发层面 API 调用为主
2. **Prompt 工程是基石** — 写好 Prompt 比选对模型更重要
3. **RAG 是企业刚需** — 学完 RAG 你就能为公司做知识库系统
4. **最终回到 Java** — 用 Spring AI / LangChain4j 做生产应用是你的优势
:::
