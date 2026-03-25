import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  { text: "Java基础", icon: "java", link: "/java-basic/" },
  { text: "Java进阶", icon: "rocket", link: "/java-advanced/" },
  { text: "Spring生态", icon: "leaf", link: "/spring/" },
  { text: "数据库", icon: "database", link: "/database/" },
  { text: "分布式", icon: "network", link: "/distributed/" },
  { text: "开发工具", icon: "tool", link: "/tools/" },
  { text: "架构设计", icon: "architecture", link: "/architecture/" },
]);
