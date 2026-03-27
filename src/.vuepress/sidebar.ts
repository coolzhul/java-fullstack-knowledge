import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  // 设计模式子模块 - 更精确的路径要放前面
  "/java-advanced/design-patterns/": "structure",

  // Java进阶模块
  "/java-advanced/": "structure",

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
  ],
});
