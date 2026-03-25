import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/java-fullstack-knowledge/",

  lang: "zh-CN",
  title: "Java全栈知识库",
  description: "涵盖Java基础、进阶、Spring生态、数据库、分布式技术等全方位知识",

  theme,

  shouldPrefetch: false,
});
