import { defineClientConfig } from "vuepress/client";
import AiDisclaimer from "./components/AiDisclaimer.vue";

export default defineClientConfig({
  layouts: {},
  extendsPage: () => {},
  rootComponents: [AiDisclaimer],
});
