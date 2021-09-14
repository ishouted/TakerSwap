<template>
  <ElConfigProvider :locale="locale">
    <Header v-model:collapseMenu="collapseMenu"></Header>
    <div class="flex">
      <left-nav v-model:collapseMenu="collapseMenu"></left-nav>
      <!--      <left-nav :class="['mobile_nav', collapseMenu ? 'hide-nav' : '']" :collapseMenu="false" mobile></left-nav>-->
      <div :class="['inner_content', collapseMenu ? 'expand' : '']">
        <router-view></router-view>
      </div>
    </div>
    <div
      :class="['nav-mask', collapseMenu ? '' : 'show']"
      @click="collapseMenu = true"
    ></div>
  </ElConfigProvider>
  <div class="cover-bg"></div>
</template>

<script>
import Header from "./components/Header.vue";
import LeftNav from "@/components/LeftNav";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import enLocale from "element-plus/lib/locale/lang/en";
import nerve from "nerve-sdk-js";
import config from "@/config";
nerve.customnet(config.chainId, config.API_URL, config.timeout); // sdk设置测试网chainId
const navigatorLang = window.navigator.language === "zh-CN" ? "zh-cn" : "en";
const lang = localStorage.getItem("lang") || navigatorLang;

export default {
  name: "App",
  data() {
    return {
      locale: lang === "zh-cn" ? zhCn : enLocale,
      collapseMenu: false
    };
  },
  watch: {
    "$store.state.lang": {
      immediate: true,
      handler(val) {
        this.locale = val === "zh-cn" ? zhCn : enLocale;
      }
    }
  },
  components: {
    Header,
    LeftNav,
    ElConfigProvider
  }
};
</script>

<style lang="scss">
@import "assets/css/base.scss";

#app {
  width: 100%;
  min-height: 100%;
  padding-bottom: 30px;
  word-break: break-all;
}
.inner_content {
  position: relative;
  z-index: 10;
  padding-top: 50px;
  margin-left: 200px;
  margin-top: 80px;
  flex: 1;
  &.expand {
    margin-left: 64px;
  }
  @media screen and (max-width: 1200px) {
    margin-left: 0;
    &.expand {
      margin-left: 0;
    }
  }
  @media screen and (max-width: 500px) {
    margin-top: 50px;
  }
}
.nav-mask {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(69, 42, 122);
  transition: opacity 0.4s ease 0s;
  opacity: 0;
  z-index: 10;
  pointer-events: none;
  &.show {
    opacity: 0.6;
    pointer-events: initial;
  }
}
@media screen and (max-width: 1200px) {
  .inner_content {
    margin-left: 0;
    &.expand {
      margin-left: 0;
    }
  }
  .nav-mask {
    display: block;
  }
  /*.pc_nav {
    display: none;
  }
  .mobile_nav {
    display: flex;
  }*/
}
.cover-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url("assets/img/bg.jpg");
  z-index: -1;
}
</style>
