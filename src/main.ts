import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { useElementPlus } from "@/plugins/element-plus";
import "element-plus/dist/index.css";
import { useI18nPlugin } from "@/plugins/i18n";
// import "amfe-flexible/index.js";
// import "normalize.css"; // 初始化css
// import { ElMessage } from "element-plus";
import { copys, toThousands } from "./api/util";
import "./config";

setTimeout(() => {
  // 不延迟有时刷新会拿不到ethereum.selectedAddress???
  const app = createApp(App);
  app
    .use(router)
    .use(store)
    .use(useElementPlus)
    .use(useI18nPlugin)
    .mixin({
      methods: {
        $copy(str: string) {
          copys(str);
          this.$message({
            message: this.$t("public.public13"),
            type: "success"
          });
        },
        $thousands(str: string | number) {
          return toThousands(str);
        }
      }
    })
    .mount("#app");
}, 500);
