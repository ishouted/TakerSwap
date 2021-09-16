<template>
  <div class="w1300">
    <div
      class="liquidity"
      v-loading="loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
    >
      <div class="overview" v-if="!addLiquidity">
        <div class="top-part">
          <div class="title">
            <h3>{{ $t("liquidity.liquidity1") }}</h3>
            <p>{{ $t("liquidity.liquidity2") }}</p>
          </div>
          <div class="confirm-wrap">
            <el-button type="primary" @click="addLiquidity = true">
              {{ $t("liquidity.liquidity3") }}
            </el-button>
          </div>
        </div>
        <div class="your-liquidity" v-if="talonAddress">
          <h3>{{ $t("liquidity.liquidity4") }}</h3>
          <div class="liquidity-list">
            <div v-for="(item, index) in liquidityList" :key="index">
              <div :class="['list-item', item.showDetail ? 'hide-border' : '']">
                <div class="symbol">
                  <div class="symbol-cont">
                    <div class="img-wrap">
                      <symbol-icon
                        class="symbol1"
                        :icon="item.token0.symbol"
                      ></symbol-icon>
                      <symbol-icon
                        class="symbol2"
                        :icon="item.token1.symbol"
                      ></symbol-icon>
                    </div>
                    <span>{{ item.lpTokenAmount.token.symbol }}</span>
                  </div>
                  <div class="amount-cont">{{ item.amount }}</div>
                </div>
                <div class="view-detail" @click="toggleDetail(item)">
                  <i
                    :class="{
                      'el-icon-arrow-right': true,
                      expand: item.showDetail
                    }"
                  ></i>
                </div>
              </div>
              <collapse-transition>
                <detail-bar
                  v-show="item.showDetail"
                  :talonAddress="talonAddress"
                  :info="item"
                  @loading="handleLoading"
                  @updateList="getData"
                ></detail-bar>
              </collapse-transition>
            </div>
            <div class="no-data" v-if="!liquidityList.length">No Data</div>
          </div>
          <pagination
            v-model:pager="pager"
            @change="getUserLiquidity"
          ></pagination>
        </div>
      </div>
      <add-liquidity
        v-else
        v-model:show="addLiquidity"
        :defaultAsset="defaultAsset"
        :assetsList="assetsList"
        :talonAddress="talonAddress"
        @updateList="getData"
      ></add-liquidity>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  onMounted,
  reactive,
  toRefs,
  onBeforeUnmount,
  watch
} from "vue";
import AddLiquidity from "./AddLiquidity.vue";
import CollapseTransition from "@/components/CollapseTransition.vue";
import DetailBar from "./DetailBar.vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { getAssetList, userLiquidityPage } from "@/model";
import { divisionAndFix } from "@/api/util";
import SymbolIcon from "@/components/SymbolIcon.vue";
import Pagination from "@/components/Pagination";
export default defineComponent({
  name: "liquidity",
  components: {
    AddLiquidity,
    CollapseTransition,
    DetailBar,
    SymbolIcon,
    Pagination
  },
  props: {},
  setup: () => {
    const route = useRoute();
    console.log(route.params, 9999);
    const store = useStore();
    const talonAddress = computed(() => store.getters.talonAddress);
    const state = reactive({
      addLiquidity: false,
      assetsList: [],
      liquidityList: [],
      loading: false,
      defaultAsset: null
    });
    let isLoaded = false;
    watch(
      store.state.assetList,
      val => {
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
                state.addLiquidity = true;
                defaultAsset.from = from || default_nvt;
                state.defaultAsset = { from, to };
              }
            } else {
              state.defaultAsset = {
                from: default_nvt
              };
            }
            isLoaded = true;
          }
        }
      },
      {
        immediate: true,
        deep: true
      }
    );
    let timer;
    onMounted(async () => {
      await getData();
      // await getUserLiquidity();
      // state.assetsList = await getAssetList(talonAddress.value);
      /*if (state.assetsList.length) {
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
            state.addLiquidity = true;
            defaultAsset.from = from || default_nvt;
            state.defaultAsset = { from, to };
          }
        } else {
          state.defaultAsset = {
            from: default_nvt
          };
        }
      }
      console.log(state.defaultAsset, 99999)*/
      timer = setInterval(async () => {
        await getData();
      }, 5000);
    });
    async function getData() {
      await getUserLiquidity();
      // state.assetsList = await getAssetList(talonAddress.value);
    }
    onBeforeUnmount(() => {
      clearInterval(timer);
    });
    const pager = reactive({
      index: 1,
      size: 5,
      total: 0
    });
    async function getUserLiquidity() {
      if (talonAddress.value) {
        const res = await userLiquidityPage({
          userAddress: talonAddress.value,
          pageIndex: pager.index,
          pageSize: pager.size
        });
        if (res) {
          pager.total = res.total || 0;
          res.list.map(v => {
            const info = v.lpTokenAmount;
            const amountSlice = divisionAndFix(
              info.amount,
              info.token.decimals,
              2
            );
            v.amountSlice = amountSlice;
            v.amount = divisionAndFix(
              info.amount,
              info.token.decimals,
              info.token.decimals
            );
            const exist = state.liquidityList.find(
              item => v.pairAddress === item.pairAddress
            );
            v.showDetail = exist ? exist.showDetail : false;
          });
          state.liquidityList = res.list.filter(item => item.amount !== "0");
        }
      }
    }

    function toggleDetail(item) {
      for (let liquidityItem of state.liquidityList) {
        if (item.amount === liquidityItem.amount) {
          item.showDetail = !item.showDetail;
        } else {
          liquidityItem.showDetail = false;
        }
      }
    }

    function handleLoading(loading) {
      state.loading = loading;
    }
    return {
      talonAddress,
      ...toRefs(state),
      toggleDetail,
      handleLoading,
      getData,
      pager,
      getUserLiquidity
    };
  }
});
</script>

<style lang="scss">
.liquidity {
  overflow: hidden;
  max-width: 470px;
  margin: 0 auto;
  border-radius: 20px;
  background-color: #fff;
  h3 {
    font-size: 24px;
  }
  .top-part {
    padding: 40px;
    h3 {
      margin-bottom: 5px;
    }
    .confirm-wrap {
      margin-top: 36px;
    }
  }
  .your-liquidity {
    padding: 35px 40px 30px;
    border-top: 1px solid #e4efff;
    .liquidity-list {
      margin-top: 10px;
      .list-item {
        height: 74px;
        padding: 20px 0;
        border-bottom: 1px solid #e4efff;
        display: flex;
        align-items: center;
        &.hide-border {
          border: none;
        }
      }
      .symbol {
        //flex: 5;
        display: flex;
        //align-items: center;
        flex-direction: column;
        .symbol-cont {
          display: flex;
          align-items: center;
          img {
            width: 32px;
            height: 32px;
            overflow: hidden;
          }
          .img-wrap {
            display: flex;
            align-items: center;
            margin-right: 10px;
          }
          .symbol1 {
            z-index: 2;
          }
          .symbol2 {
            margin-left: -10px;
          }
        }
        .amount-cont {
          margin-top: 5px;
        }
      }
      .value {
        flex: 3;
        text-align: center;
      }
      .view-detail {
        flex: 2;
        color: #4a5ef2;
        text-align: right;
        cursor: pointer;
      }
    }
    .no-data {
      padding-top: 40px;
      text-align: center;
      color: #909399;
      font-size: 14px;
    }
  }
  @media screen and (max-width: 500px) {
    h3 {
      font-size: 22px;
    }
    .top-part,
    .your-liquidity {
      padding: 20px;
    }
  }
}
.pagination-cont {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
