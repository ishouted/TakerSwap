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
        <div
          class="your-liquidity"
          v-if="talonAddress"
          v-loading="myLoading"
          element-loading-background="rgba(255, 255, 255, 0.8)"
        >
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
                <!--                <div class="value">-->
                <!--                  <el-tooltip-->
                <!--                    class="item"-->
                <!--                    effect="dark"-->
                <!--                    :content="item.amount"-->
                <!--                    placement="top"-->
                <!--                  >-->
                <!--                    <span class="click">{{ item.amountSlice }}</span>-->
                <!--                  </el-tooltip>-->
                <!--                </div>-->
                <div class="view-detail" @click="toggleDetail(item)">
                  <!--{{ $t("liquidity.liquidity5") }}-->
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
          <div class="pagination-cont" v-if="totalSize > 10">
            <el-pagination
              layout="prev, pager, next"
              :total="totalSize"
              @next-click="nextPage"
              @prev-click="prevPage"
            ></el-pagination>
          </div>
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
  onBeforeUnmount
} from "vue";
import AddLiquidity from "./AddLiquidity.vue";
import CollapseTransition from "@/components/CollapseTransition.vue";
import DetailBar from "./DetailBar.vue";
import { useStore } from "vuex";
import { getAssetList, userLiquidityPage } from "@/model";
import { divisionAndFix } from "@/api/util";
import SymbolIcon from "@/components/SymbolIcon.vue";
export default defineComponent({
  name: "liquidity",
  components: {
    AddLiquidity,
    CollapseTransition,
    DetailBar,
    SymbolIcon
  },
  props: {},
  setup: () => {
    const store = useStore();
    const talonAddress = computed(() => store.getters.talonAddress);
    const state = reactive({
      addLiquidity: false,
      assetsList: [],
      liquidityList: [],
      myLoading: false,
      loading: false,
      defaultAsset: null,
      pageIndex: 1,
      totalSize: 0
    });
    let timer;
    onMounted(async () => {
      await getData();
      // await getUserLiquidity();
      // state.assetsList = await getAssetList(talonAddress.value);
      state.defaultAsset = state.assetsList.find(item => item.symbol === "NVT");
      timer = setInterval(async () => {
        await getData();
      }, 10000);
    });
    async function getData() {
      await getUserLiquidity();
      state.assetsList = await getAssetList(talonAddress.value);
    }
    onBeforeUnmount(() => {
      clearInterval(timer);
    });
    async function getUserLiquidity() {
      if (talonAddress.value) {
        state.myLoading = true;
        const res = await userLiquidityPage({
          userAddress: talonAddress.value,
          pageIndex: state.pageIndex
        });
        if (res) {
          state.totalSize = res.total;
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
        state.myLoading = false;
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
    function nextPage(pageNo) {
      state.pageIndex = pageNo;
      getUserLiquidity();
    }
    function prevPage(pageNo) {
      state.pageIndex = pageNo;
      getUserLiquidity();
    }
    return {
      talonAddress,
      ...toRefs(state),
      toggleDetail,
      handleLoading,
      getData,
      nextPage,
      prevPage
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
    padding: 40px;
    border-top: 1px solid #e4efff;
    .liquidity-list {
      //margin-top: -10px;
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
    .top-part, .your-liquidity {
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
