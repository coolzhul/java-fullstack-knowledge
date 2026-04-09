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
    ["meta", { name: "keywords", content: "Java全栈,Java基础,Spring Boot,Spring Cloud,MySQL,Redis,分布式,微服务,高并发,面试题,AI" }],
    ["meta", { name: "author", content: "coolzhul" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Java全栈知识库" }],
    ["meta", { property: "og:description", content: "涵盖Java基础、进阶、Spring生态、数据库、分布式技术、AI等全方位知识" }],
    ["meta", { property: "og:image", content: "/logo.png" }],
    ["meta", { name: "twitter:card", content: "summary" }],
    ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
    ["link", { rel: "sitemap", href: "/sitemap.xml" }],
  ],

  theme,

  shouldPrefetch: false,
});
