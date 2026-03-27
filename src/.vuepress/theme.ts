import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://coolzhul.github.io",

  author: {
    name: "coolzhul",
    url: "https://github.com/coolzhul",
  },

  logo: "/logo.png",
  logoDark: "/logo-dark.png",

  repo: "coolzhul/java-fullstack-knowledge",

  docsDir: "src",

  // 导航栏
  navbar,

  // 侧边栏
  sidebar,

  // 页脚
  footer: "MIT 协议 | 版权所有 © 2024-present coolzhul | ⚠️ 内容由AI创作，请谨慎甄别",
  displayFooter: true,

  // 多语言配置
  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },

  // 如果想要实时查看任何改变，启用它
  hotReload: true,

  markdown: {
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    figure: true,
    gfm: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    mermaid: true,
    spoiler: true,
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true,
  },

  plugins: {
    blog: true,

    icon: {
      assets: "iconify",
    },

    copyright: {
      author: "coolzhul",
      license: "MIT",
    },

    components: {
      components: ["Badge", "VPCard"],
    },
  },
});
