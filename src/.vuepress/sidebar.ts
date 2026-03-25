import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "Java基础",
      icon: "java",
      prefix: "java-basic/",
      children: "structure",
    },
    {
      text: "Java进阶",
      icon: "rocket",
      prefix: "java-advanced/",
      children: "structure",
    },
    {
      text: "Spring生态",
      icon: "leaf",
      prefix: "spring/",
      children: "structure",
    },
    {
      text: "数据库",
      icon: "database",
      prefix: "database/",
      children: "structure",
    },
    {
      text: "分布式",
      icon: "network",
      prefix: "distributed/",
      children: "structure",
    },
    {
      text: "开发工具",
      icon: "tool",
      prefix: "tools/",
      children: "structure",
    },
    {
      text: "架构设计",
      icon: "architecture",
      prefix: "architecture/",
      children: "structure",
    },
  ],
});
