<template>
  <div :class="['left-nav', isCollapse&&isMobile ? 'hide-nav' : '']">
<!--    <div class="top">
      <ul>
        <li>
          <i class="iconfont icon-Home"></i>
          {{ $t("header.header4") }}
        </li>
      </ul>
    </div>
    <div class="bottom">
:collapse="isMobile ? false : isCollapse"
    </div>-->
    <el-menu
      :class="['menu', isCollapse ? 'collapse' : '']"
      @select="handleSelect"
      :default-active="activeIndex"
      background-color="#4A5FF2"
      text-color="#fff"
      active-text-color="#8dc8d6"
    >
      <el-menu-item index="home">
        <i class="iconfont icon-Home"></i>
        <template #title>
          <span class="title">{{ $t("header.header4") }}</span>
        </template>
      </el-menu-item>
      <el-menu-item index="trading">
        <i class="iconfont icon-Swap"></i>
        <template #title>
          <span class="title">{{ $t("header.header1") }}</span>
        </template>
      </el-menu-item>
      <el-menu-item index="liquidity">
        <i class="iconfont icon-Liquidity"></i>
        <template #title>
          <span class="title">{{ $t("header.header2") }}</span>
        </template>
      </el-menu-item>
      <el-menu-item index="farm">
        <i class="iconfont icon-Farm"></i>
        <template #title>
          <span class="title">Farm</span>
        </template>
      </el-menu-item>
<!--      <el-menu-item index="pool">
        <i class="iconfont icon-Pool"></i>
        <template #title>
          <span class="title">Pool</span>
        </template>
      </el-menu-item>-->
      <el-menu-item index="createFarm">
        <i class="iconfont icon-a-CreateFarm"></i>
        <template #title>
          <span class="title">{{ $t("header.header5") }}</span>
        </template>
      </el-menu-item>
      <el-menu-item>
        <i class="iconfont icon-Docs"></i>
        <template #title>
          <span class="title">{{ $t("header.header6") }}</span>
        </template>
      </el-menu-item>
      <!-- <el-menu-item index="info">Info</el-menu-item> -->
      <!-- <el-menu-item index="test">Test</el-menu-item> -->
    </el-menu>
    <div class="nav-bottom" :style="{ width: isCollapse ? '64px' : '100%' }">
      <template v-if="!isCollapse">
        <div class="wrap">
          <div class="left flex-center">
            <img src="../assets/s-logo.png" alt="" />
            ${{ usdValue }}
          </div>
          <div class="right flex-center">
            <i class="iconfont icon-Telegram"></i>
            <i class="iconfont icon-Twitter"></i>
          </div>
        </div>
        <div class="language click">
          <span @click="switchLang">{{ lang }}</span>
        </div>
      </template>
      <div v-else>
        <i class="iconfont icon-shezhi" @click="isCollapse = !isCollapse"></i>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import useLang from "@/hooks/useLang";
import {listen} from "@/api/websocket";
import config from "@/config";

const url = config.WS_URL;

export default {
  name: "LeftNav",
  props: {
    collapseMenu: Boolean
  },
  setup(props, context) {
    const router = useRouter();
    const route = useRoute();
    const activeIndex = ref("home");
    const isMobile = ref(false);

    const isCollapse = computed({
      get() {
        return props.collapseMenu;
      },
      set(val) {
        context.emit("update:collapseMenu", val);
      }
    });
    onMounted(() => {
      isMobile.value = document.documentElement.clientWidth < 1200;
      if (isMobile.value) {
        context.emit("update:collapseMenu", true);
      }
      window.addEventListener("resize", function () {
        isMobile.value = document.documentElement.clientWidth < 1200;
      });
    });
    watch(
      () => route.path,
      val => {
        const path = val?.split("/")[1];
        if (path === "create-farm") {
          activeIndex.value = "createFarm";
        } else {
          activeIndex.value = path || "home";
        }
      }
    );

    function handleSelect(key) {
      toUrl(key);
    }

    function toUrl(name, url = "") {
      if (url) {
        window.open(url);
      } else {
        router.push({ name: name });
      }
      if (isMobile.value) {
        context.emit("update:collapseMenu", true);
      }
    }
    const { lang, switchLang } = useLang();

    const usdValue = ref("0.00")
    function getOverview() {
      const channel = "mainAssetInfo";
      const params = {
        method: channel
      };
      listen({
        url,
        channel,
        params: {
          cmd: true,
          channel: "cmd:" + JSON.stringify(params)
        },
        success: data => {
          usdValue.value = data.priceUSD;
        }
      });
    }
    onMounted(() => {
      getOverview();
      setInterval(getOverview, 10000);
    });

    return {
      activeIndex,
      isCollapse,
      isMobile,
      handleSelect,
      lang,
      switchLang,
      usdValue
    };
  }
};
</script>

<style lang="scss">
.left-nav {
  position: fixed;
  left: 0;
  top: 0;
  padding-top: 80px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color:#4A5FF2;
  border-right: 2px solid #3345C7;
  z-index: 11;
  .menu {
    border-right: none;
    flex: 1;
    .el-menu-item {
      display: flex;
      align-items: center;
      font-size: 16px;
      .iconfont {
        color: #fff;
        font-size: 22px;
        margin-right: 10px;
      }
      &.is-active {
        .iconfont {
          color: #8dc8d6;
        }
      }
    }
    .iconfont {
      color: #fff;
      font-size: 22px;
      margin-right: 10px;
    }
  }
  .menu:not(.el-menu--collapse) {
    width: 198px;
    //width: 100%;
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0s;
    &.collapse {
      width: 64px;
      .title {
        opacity: 0;
      }
    }
  }
  .nav-bottom {
    height: 110px;
    border-top: 2px solid #3345C7;
    color: #fff;
    padding: 20px 20px 0;
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0s;
    .wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      overflow: hidden;
    }
    .left {
      img {
        width: 25px;
        height: 25px;
        margin-right: 5px;
        //border-radius: 50%;
      }
    }
    .right {
      i {
        margin-left: 10px;
        &:hover {
          opacity: 0.7;
        }
      }
    }
    .iconfont {
      font-size: 20px;
      color: #fff;
      cursor: pointer;
    }
    .language {
      text-align: right;
      color: #fff;
      font-size: 14px;
      padding-top: 5px;
      &:hover {
        opacity: 0.7;
      }
    }
  }
}
.left-nav {
  overflow: hidden;
  transition: padding-top 0.2s ease 0s, width 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0s;
  &.hide-nav {
    width: 0;
  }
}
@media screen and (max-width: 1200px) {
  .left-nav {
    width: 198px;
  }
  .inner_content {
    margin-left: 0;
    &.expand {
      margin-left: 0;
    }
  }
  .nav-mask {
    display: block;
  }
}
</style>
