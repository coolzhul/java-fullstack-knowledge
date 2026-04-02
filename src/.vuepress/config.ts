import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

const base: "/" | `/${string}/` = (process.env.BASE_URL as "/" | `/${string}/`) || "/";

export default defineUserConfig({
  base,

  lang: "zh-CN",
  title: "Java全栈知识库",
  description: "涵盖Java基础、进阶、Spring生态、数据库、分布式技术等全方位知识",

  head: [
    ["meta", { name: "algolia-site-verification", content: "9492C4FC620FAA6E" }],
  ],

  theme,

  shouldPrefetch: false,
});
