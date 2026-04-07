---
title: AI 技术栈全景
icon: brain
order: 706
category:
  - AI
tag:
  - Python
---

## AI 技术栈全景图

```mermaid
flowchart TD
    subgraph 基础层["基础层"]
        A["Python 基础语法"]
        B["NumPy<br>数值计算"]
        C["Pandas<br>数据处理"]
        D["Matplotlib<br>可视化"]
    end

    subgraph 机器学习层["机器学习层"]
        E["Scikit-learn<br>传统 ML"]
        F["XGBoost / LightGBM<br>竞赛利器"]
        G["特征工程<br>数据预处理"]
    end

    subgraph 深度学习层["深度学习层"]
        H["PyTorch<br>模型训练"]
        I["CNN / RNN / Transformer<br>网络架构"]
    end

    subgraph 大模型层["大模型层"]
        J["HuggingFace<br>模型与 Tokenizer"]
        K["LoRA / PEFT<br>高效微调"]
        L["vLLM / Ollama<br>推理部署"]
    end

    subgraph 应用层["应用层"]
        M["LangChain<br>RAG / Agent"]
        N["LangGraph<br>复杂工作流"]
        O["向量数据库<br>FAISS / Milvus"]
    end

    A --> B --> C --> E --> H
    H --> J --> M
    F --> E
    G --> E
    I --> H
    K --> J
    L --> J
    O --> M
```

## 不同目标的学习路径

```mermaid
flowchart TD
    A["你的目标是什么？"] --> B["算法工程师"]
    A --> C["AI 应用工程师"]
    A --> D["AI 产品经理"]

    B --> B1["数学基础<br>线性代数 / 概率论 / 优化"]
    B1 --> B2["深度学习<br>PyTorch 从零实现"]
    B2 --> B3["前沿论文<br>读论文 / 复现代码"]
    B3 --> B4["Kaggle 竞赛"]

    C --> C1["传统 ML<br>Scikit-learn 熟练使用"]
    C1 --> C2["大模型应用<br>HuggingFace + LangChain"]
    C2 --> C3["RAG 系统<br>向量数据库 + 微调"]
    C3 --> C4["Agent 开发<br>工具调用 / 工作流"]

    D --> D1["AI 基础概念<br>ML/DL/NLP 基本原理"]
    D1 --> D2["Prompt 工程<br>提示词设计与优化"]
    D2 --> D3["产品思维<br>评估指标 / 成本控制"]
    D3 --> D4["行业洞察<br>关注最新动态"]
```

## 推荐资源

**课程**：
- 吴恩达《Machine Learning》（Coursera）— ML 入门经典
- 吴恩达《Deep Learning Specialization》（Coursera）— DL 入门
- 李沐《动手学深度学习》（d2l.ai）— PyTorch 实战
- fast.ai — 自顶向下的实战课程
- Andrej Karpathy《Neural Networks: Zero to Hero》（YouTube）— 从零理解 NN

**书籍**：
- 《统计学习方法》李航 — ML 理论
- 《动手学深度学习》李沐 — PyTorch 实战
- 《Deep Learning》Goodfellow — 深度学习圣经（偏理论）
- 《Build a LLM from Scratch》Sebastian Raschka — 大模型原理

**社区**：
- Hugging Face（https://huggingface.co）— 模型和数据集
- Kaggle（https://kaggle.com）— 竞赛和数据集
- Papers With Code（https://paperswithcode.com）— 论文 + 代码
- GitHub Trending — 关注最新项目

## Python 学习路线总结

恭喜你完成了 Python 全部六个阶段！🎓

| 阶段 | 内容 | 预计用时 | 核心收获 |
|------|------|---------|---------|
| 一：基础入门 | 语法、数据结构、函数 | 1-2 周 | 能写 Python 脚本 |
| 二：进阶特性 | OOP、装饰器、生成器 | 1-2 周 | 理解 Pythonic 风格 |
| 三：标准库 | 常用模块、包管理 | 1 周 | 不重复造轮子 |
| 四：高级编程 | 并发、元类、类型系统 | 2 周 | 写出高质量代码 |
| 五：数据处理 | NumPy、Pandas、Matplotlib | 2 周 | 能处理真实数据 |
| 六：AI/ML 入门 | Sklearn、PyTorch、大模型 | 2-4 周 | 进入 AI 领域 |

**总计约 2-3 个月**（有编程基础的情况）。

```mermaid
flowchart LR
    A["阶段一<br>基础入门"] --> B["阶段二<br>进阶特性"]
    B --> C["阶段三<br>标准库"]
    C --> D["阶段四<br>高级编程"]
    D --> E["阶段五<br>数据处理"]
    E --> F["阶段六<br>AI/ML"]
    F --> G["🚀 接下来？"]
    G --> H["深入 ML<br>Kaggle 竞赛"]
    G --> I["深入 DL<br>论文复现"]
    G --> J["大模型应用<br>RAG / Agent"]
    G --> K["回到 Java<br>Spring AI"]
```

学完之后，你已经具备了进入 AI 领域的基础能力。接下来可以：

1. **深入机器学习** — 手写算法、参加 Kaggle 比赛、学习特征工程
2. **深入深度学习** — CNN 图像、RNN 序列、Transformer 架构
3. **大模型应用** — LangChain、Agent、RAG 系统、微调部署
4. **回到 Java** — Spring AI、LangChain4j，用 Java 做 AI 应用

无论选哪条路，记住：**实践 > 理论**。跑通一个项目比读十篇教程更有价值。

---

> **延伸阅读**：
> - 上一篇：[阶段五：数据处理](./stage5-datascience.md)
> - Python 学习路线完整目录：[README](./README.md)