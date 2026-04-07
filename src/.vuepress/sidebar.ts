import { sidebar } from "vuepress-theme-hope";

// AI 统一侧边栏（Python + AI 应用开发共用）
const aiSidebar = [
  {
    text: "AI 学习路线",
    icon: "robot",
    link: "/ai/",
  },
  {
    text: "Python 学习路线",
    icon: "language-python",
    collapsible: true,
    children: [
      {
        text: "阶段一：基础入门",
        icon: "pen",
        prefix: "/ai/python/stage1-basics/",
        collapsible: true,
        children: [
          { text: "环境搭建", link: "setup" },
          { text: "变量与数据类型", link: "types" },
          { text: "运算符", link: "operators" },
          { text: "字符串", link: "string" },
          { text: "数据结构", link: "datastructure" },
          { text: "条件与循环", link: "controlflow" },
          { text: "函数", link: "function" },
          { text: "文件操作", link: "file" },
          { text: "异常处理", link: "exception" },
        ],
      },
      {
        text: "阶段二：进阶特性",
        icon: "cog",
        prefix: "/ai/python/stage2-intermediate/",
        collapsible: true,
        children: [
          { text: "面向对象编程", link: "oop" },
          { text: "装饰器", link: "decorator" },
          { text: "生成器", link: "generator" },
          { text: "上下文管理器", link: "context-manager" },
          { text: "模块与包", link: "module" },
        ],
      },
      {
        text: "阶段三：标准库与包管理",
        icon: "package",
        prefix: "/ai/python/stage3-stdlib/",
        collapsible: true,
        children: [
          { text: "包管理", link: "package-mgmt" },
          { text: "文件与路径操作", link: "pathlib" },
          { text: "日期与时间", link: "datetime" },
          { text: "正则表达式", link: "regex" },
          { text: "JSON 处理", link: "json" },
          { text: "CSV 处理", link: "csv" },
          { text: "日志系统", link: "logging" },
          { text: "高级数据结构", link: "collections" },
          { text: "类型注解系统", link: "typing" },
          { text: "其他实用标准库", link: "stdlib-misc" },
        ],
      },
      {
        text: "阶段四：高级编程",
        icon: "rocket",
        prefix: "/ai/python/stage4-advanced/",
        collapsible: true,
        children: [
          { text: "并发编程", link: "concurrency" },
          { text: "元类", link: "metaclass" },
          { text: "描述符", link: "descriptor" },
          { text: "类型系统进阶", link: "type-system" },
          { text: "设计模式", link: "design-patterns" },
          { text: "代码质量工具链", link: "code-quality" },
        ],
      },
      {
        text: "阶段五：数据处理",
        icon: "chart-bar",
        prefix: "/ai/python/stage5-datascience/",
        collapsible: true,
        children: [
          { text: "NumPy 数值计算", link: "numpy" },
          { text: "Pandas 数据分析", link: "pandas" },
          { text: "Matplotlib 可视化", link: "matplotlib" },
          { text: "数据分析实战", link: "data-analysis-project" },
        ],
      },
      {
        text: "阶段六：AI/ML 入门",
        icon: "brain",
        prefix: "/ai/python/stage6-ai-ml/",
        collapsible: true,
        children: [
          { text: "机器学习基础", link: "ml-basics" },
          { text: "Scikit-learn", link: "sklearn" },
          { text: "PyTorch 深度学习", link: "pytorch" },
          { text: "HuggingFace 大模型", link: "huggingface" },
          { text: "LangChain", link: "langchain" },
          { text: "AI 技术栈全景", link: "ai-roadmap" },
        ],
      },
    ],
  },
  {
    text: "AI 大模型应用开发",
    icon: "robot",
    collapsible: true,
    children: [
      {
        text: "Prompt 工程",
        icon: "edit",
        prefix: "/ai/ai-app-dev/prompt-engineering/",
        collapsible: true,
        children: [
          { text: "基础概念与技巧", link: "basics" },
          { text: "高级模式", link: "advanced-patterns" },
          { text: "评估与优化", link: "evaluation" },
        ],
      },
      {
        text: "API 集成",
        icon: "api",
        prefix: "/ai/ai-app-dev/api-integration/",
        collapsible: true,
        children: [
          { text: "OpenAI API", link: "openai-api" },
          { text: "国产大模型", link: "domestic-models" },
          { text: "流式输出", link: "streaming" },
          { text: "多模态", link: "multimodal" },
        ],
      },
      {
        text: "RAG 检索增强生成",
        icon: "link",
        prefix: "/ai/ai-app-dev/rag/",
        collapsible: true,
        children: [
          { text: "文档处理", link: "document-processing" },
          { text: "向量化与 Embedding", link: "embedding" },
          { text: "向量数据库", link: "vector-database" },
          { text: "检索策略", link: "retrieval-strategy" },
          { text: "RAG 优化", link: "optimization" },
        ],
      },
      {
        text: "Agent 智能体",
        icon: "bot",
        prefix: "/ai/ai-app-dev/agent/",
        collapsible: true,
        children: [
          { text: "工具调用 Function Calling", link: "function-calling" },
          { text: "ReAct 推理框架", link: "react-framework" },
          { text: "多 Agent 协作", link: "multi-agent" },
          { text: "记忆系统", link: "memory" },
        ],
      },
      {
        text: "Java AI 生产落地",
        icon: "language-java",
        prefix: "/ai/ai-app-dev/java-ai/",
        collapsible: true,
        children: [
          { text: "LangChain4j", link: "langchain4j" },
          { text: "Spring AI", link: "spring-ai" },
          { text: "生产实践", link: "production-practices" },
        ],
      },
      {
        text: "工程化",
        icon: "settings",
        prefix: "/ai/ai-app-dev/engineering/",
        collapsible: true,
        children: [
          { text: "部署方案", link: "deployment" },
          { text: "监控与评估", link: "monitoring" },
          { text: "安全与合规", link: "security" },
        ],
      },
    ],
  },
];

export default sidebar({
  // 面试题库模块
  "/interview/": "structure",

  // Java进阶 — 显式配置，子页面保持导航不变
  "/java-advanced/": [
    "",
    { text: "JVM原理", icon: "memory", link: "jvm" },
    { text: "垃圾回收", icon: "recycle", link: "gc" },
    { text: "性能调优", icon: "speedometer", link: "tuning" },
    {
      text: "设计模式",
      icon: "puzzle",
      prefix: "/java-advanced/design-patterns/",
      collapsible: true,
      children: [
        { text: "创建型", type: "group", children: [
          { text: "单例 Singleton", link: "singleton" },
          { text: "工厂方法 Factory Method", link: "factory-method" },
          { text: "抽象工厂 Abstract Factory", link: "abstract-factory" },
          { text: "建造者 Builder", link: "builder" },
          { text: "原型 Prototype", link: "prototype" },
        ]},
        { text: "结构型", type: "group", children: [
          { text: "适配器 Adapter", link: "adapter" },
          { text: "桥接 Bridge", link: "bridge" },
          { text: "组合 Composite", link: "composite" },
          { text: "装饰器 Decorator", link: "decorator" },
          { text: "外观 Facade", link: "facade" },
          { text: "享元 Flyweight", link: "flyweight" },
          { text: "代理 Proxy", link: "proxy" },
        ]},
        { text: "行为型", type: "group", children: [
          { text: "责任链 Chain of Responsibility", link: "chain-of-responsibility" },
          { text: "命令 Command", link: "command" },
          { text: "迭代器 Iterator", link: "iterator" },
          { text: "中介者 Mediator", link: "mediator" },
          { text: "备忘录 Memento", link: "memento" },
          { text: "观察者 Observer", link: "observer" },
          { text: "状态 State", link: "state" },
          { text: "策略 Strategy", link: "strategy" },
          { text: "模板方法 Template Method", link: "template-method" },
          { text: "访问者 Visitor", link: "visitor" },
          { text: "解释器 Interpreter", link: "interpreter" },
        ]},
      ],
    },
  ],

  // AI — 所有 /ai/ 子页面共用统一侧边栏
  "/ai/python/": aiSidebar,
  "/ai/ai-app-dev/": aiSidebar,
  "/ai/": aiSidebar,

  // Java基础模块
  "/java-basic/": "structure",

  // Spring生态模块
  "/spring/": "structure",

  // 数据库模块
  "/database/": "structure",

  // 分布式模块
  "/distributed/": "structure",

  // 开发工具模块
  "/tools/": "structure",

  // 架构设计模块
  "/architecture/": "structure",

  // 首页 - 放在最后作为 fallback
  "/": [
    "",
    "star",
    "timeline",
    {
      text: "Java基础",
      icon: "java",
      link: "/java-basic/",
    },
    {
      text: "Java进阶",
      icon: "rocket",
      link: "/java-advanced/",
    },
    {
      text: "Spring生态",
      icon: "leaf",
      link: "/spring/",
    },
    {
      text: "数据库",
      icon: "database",
      link: "/database/",
    },
    {
      text: "分布式",
      icon: "network",
      link: "/distributed/",
    },
    {
      text: "开发工具",
      icon: "tool",
      link: "/tools/",
    },
    {
      text: "架构设计",
      icon: "architecture",
      link: "/architecture/",
    },
    {
      text: "面试题库",
      icon: "clipboard",
      link: "/interview/",
    },
    {
      text: "AI",
      icon: "robot",
      link: "/ai/",
    },
  ],
});
