import { navbar } from "vuepress-theme-hope";

export default navbar([
  { text: "首页", icon: "mdi:home", link: "/" },
  { text: "Java基础", icon: "mdi:language-java", link: "/java-basic/" },
  {
    text: "Java进阶",
    icon: "mdi:rocket",
    prefix: "/java-advanced/",
    children: [
      { text: "概览", icon: "mdi:home", link: "" },
      { text: "JVM", icon: "mdi:memory", link: "jvm" },
      { text: "垃圾回收", icon: "mdi:recycle", link: "gc" },
      { text: "性能调优", icon: "mdi:speedometer", link: "tuning" },
      { text: "设计模式", icon: "mdi:puzzle", link: "design-patterns/" },
    ],
  },
  { text: "Spring生态", icon: "mdi:leaf", link: "/spring/" },
  { text: "数据库", icon: "mdi:database", link: "/database/" },
  { text: "分布式", icon: "mdi:network", link: "/distributed/" },
  { text: "开发工具", icon: "mdi:tools", link: "/tools/" },
  { text: "架构设计", icon: "mdi:office-building-cog", link: "/architecture/" },
  { text: "面试题库", icon: "mdi:clipboard-text", link: "/interview/" },
]);
