<template>
  <div class="w1300 trading-page">
    <overview
      v-if="showOverview && !isMobile"
      :swapSymbol="swapSymbol"
      :swapRate="swapRate"
      :list="orderList"
      :loading="orderLoading"
      v-model:pager="pager"
      @changeList="changeList"
    ></overview>
    <swap
      :assetsList="assetsList"
      :defaultAsset="defaultAsset"
      @toggleExpand="toggleExpand"
      @selectAsset="selectAsset"
      @updateRate="updateRate"
    ></swap>
    <el-dialog
      custom-class="mobile-overview-dialog"
      top="10vh"
      v-model="showMobileOverview"
      :show-close="false"
      @closed="showOverview = false"
    >
      <overview
        :swapSymbol="swapSymbol"
        :swapRate="swapRate"
        :list="orderList"
        :loading="orderLoading"
        v-model:pager="pager"
        @changeList="changeList"
      ></overview>
    </el-dialog>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  computed,
  reactive,
  toRefs,
  onBeforeUnmount,
  watch,
  ref
} from "vue";
import Overview from "./Overview.vue";
import Swap from "./Swap.vue";
import { useStore } from "vuex";
import { getAssetList, userTradeHistoryPage } from "@/model";
import nerve from "nerve-sdk-js";
import config from "@/config";
import { divisionDecimals } from "@/api/util";
import dayjs from "dayjs";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "trading",
  components: {
    Overview,
    Swap
  },
  props: {},
  setup() {
    const store = useStore();
    const route = useRoute();
    const state = reactive({
      showOverview: false,
      assetsList: [],
      swapRate: "",
      swapSymbol: [],
      orderList: [],
      orderLoading: false,
      defaultAsset: null // 默认选择的资产
    });
    function toggleExpand() {
      state.showOverview = !state.showOverview;
    }

    const talonAddress = computed(() => store.getters.talonAddress);
    let isLoaded = false;
    watch(
      () => store.state.assetList,
      val => {
        // console.log(val, "-=-=-=-=-=-=")
        if (val && val.length) {
          state.assetsList = val;
          if (!isLoaded) {
            // 默认选择资产
            const defaultAsset = {};
            const { fromAsset, toAsset } = route.params;
            const default_nvt = state.assetsList.find(
              item => item.symbol === "NVT"
            );
            if (fromAsset || toAsset) {
              const from = state.assetsList.find(
                item => item.assetKey === fromAsset
              );
              const to = state.assetsList.find(
                item => item.assetKey === toAsset
              );
              if (from || to) {
                defaultAsset.from = from || default_nvt;
                state.defaultAsset = { from, to };
              }
            } else {
              state.defaultAsset = {
                from: default_nvt
              };
            }
            console.log(state.defaultAsset, 9666)
            isLoaded = true;
          }
          if (selectedAsset) {
            selectAsset(selectedAsset.from, selectedAsset.to);
          }
        }
      },
      {
        immediate: true,
        deep: true
      }
    );
    /*let timer;
    onMounted(async () => {
      state.assetsList = await getAssetList(talonAddress.value);
      if (state.assetsList.length) {
        const defaultAsset = {};
        const { fromAsset, toAsset } = route.params;
        const default_nvt = state.assetsList.find(
          item => item.symbol === "NVT"
        );
        if (fromAsset || toAsset) {
          const from = state.assetsList.find(
            item => item.assetKey === fromAsset
          );
          const to = state.assetsList.find(item => item.assetKey === toAsset);
          if (from || to) {
            defaultAsset.from = from || default_nvt;
            state.defaultAsset = { from, to };
          }
        } else {
          state.defaultAsset = {
            from: default_nvt
          };
        }
      }
      // state.defaultAsset = state.assetsList.find(item => item.symbol === "NVT");
      timer = setInterval(async () => {
        state.assetsList = await getAssetList(talonAddress.value);
        if (selectedAsset) {
          selectAsset(selectedAsset.from, selectedAsset.to);
        }
      }, 5000);
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });*/

    const pager = reactive({
      index: 1,
      size: 5,
      total: 0
    });
    let selectedAsset = null;
    async function selectAsset(fromAsset, toAsset) {
      if (!talonAddress.value || !fromAsset || !toAsset) return;
      selectedAsset = {
        from: fromAsset,
        to: toAsset
      };
      state.swapSymbol = [fromAsset.symbol, toAsset.symbol];
      const fromToken = nerve.swap.token(fromAsset.chainId, fromAsset.assetId);
      const toToken = nerve.swap.token(toAsset.chainId, toAsset.assetId);
      const pairAddress = nerve.swap.getStringPairAddress(
        config.chainId,
        fromToken,
        toToken
      );
      const data = {
        pairAddress,
        userAddress: talonAddress.value,
        pageIndex: pager.index,
        pageSize: pager.size
      };
      // state.orderLoading = true;
      const res = await userTradeHistoryPage(data);
      // state.orderLoading = false;
      if (res) {
        pager.total = res.total || 0;
        const list = [];
        res.list.map(v => {
          const fromToken = v.paidTokenAmount.token;
          const fromAmount = v.paidTokenAmount.amount;
          const toToken = v.receivedTokenAmount.token;
          const toAmount = v.receivedTokenAmount.amount;
          list.push({
            time: dayjs(v.txTime * 1000).format("MM-DD HH:mm"),
            fromAmount: divisionDecimals(fromAmount, fromToken.decimals),
            fromSymbol: fromToken.symbol,
            toAmount: divisionDecimals(toAmount, toToken.decimals),
            toSymbol: toToken.symbol,
            status: true
          });
        });
        state.orderList = list;
        console.log(list, 44444);
      }
    }
    function changeList() {
      selectAsset(selectedAsset.from, selectedAsset.to);
    }

    function updateRate(rate) {
      state.swapRate = rate;
    }

    const isMobile = ref(false);
    function checkIsMobile() {
      isMobile.value = document.documentElement.clientWidth < 1000;
    }
    onMounted(() => {
      checkIsMobile();
      if (isMobile.value) {
        // context.emit("update:collapseMenu", true);
      }
      window.addEventListener("resize", checkIsMobile);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", checkIsMobile);
    });

    const showMobileOverview = computed(() => {
      return isMobile.value && state.showOverview;
    });
    return {
      ...toRefs(state),
      toggleExpand,
      selectAsset,
      updateRate,
      isMobile,
      showMobileOverview,
      pager,
      changeList
    };
  }
});
</script>

<style lang="scss">
.trading-page {
  display: flex;
  justify-content: center;
  padding: 0 20px;
  .mobile-overview-dialog {
    max-width: 680px !important;
    .el-dialog__header,
    .el-dialog__body {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .el-dialog__header {
      padding-top: 16px !important;
      padding-bottom: 0;
    }
    .el-dialog__body {
      padding-top: 10px !important;
    }
    .overview {
      width: 100%;
      max-height: 640px;
      padding: 0 10px 10px;
    }
  }
}
</style>
