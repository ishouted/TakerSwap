<template>
  <div class="w1300 assets-wrap">
    <div
      class="hack-table-resize"
      v-if="!showTransfer"
      style="position: relative"
    >
      <div style="position: absolute; width: 100%">
        <div class="assets">
          <div class="address-wrap flex-center">
            <div class="address">
              {{ $t("assets.assets3") }}
              {{ talonAddress }}
              <i class="iconfont icon-fuzhi" @click="$copy(talonAddress)"></i>
            </div>
            <i
              class="iconfont icon-tianjia"
              @click="showAssetManage = true"
            ></i>
          </div>
          <div class="assets-list" v-loading="loading">
            <template v-if="tableData && tableData.length !== 0">
              <div
                class="asset-item"
                v-for="(item, index) in tableData"
                :key="index"
              >
                <span class="assets_symbol">{{ item.symbol }}</span>
                <div class="asset-info">
                  <span>
                    {{ $t("public.public2") }}：{{ item.number }}≈${{
                      item.valuation
                    }}
                  </span>
                  <span>{{ $t("public.public3") }}：{{ item.available }}</span>
                  <span>{{ $t("public.public4") }}：{{ item.locking }}</span>
                </div>
                <div class="option_btn">
                  <el-dropdown trigger="click">
                    <span class="el-dropdown-link">
                      {{ $t("public.public5") }}
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="transfer(item, 'crossIn')">
                          {{ $t("assets.assets4") }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="transfer(item, 'general')">
                          {{ $t("assets.assets5") }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="transfer(item, 'withdrawal')">
                          {{ $t("assets.assets6") }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>
            <el-empty description="No Data" v-if="!tableData.length"></el-empty>
          </div>
          <el-table
            :data="tableData"
            height="480"
            class="show_table"
            v-loading="loading"
            element-loading-background="rgba(255, 255, 255, 0.8)"
          >
            <el-table-column width="20px"></el-table-column>
            <el-table-column :label="$t('public.public1')">
              <template v-slot="scope">
                <div class="flex-center">
                  <symbol-icon :icon="scope.row.symbol"></symbol-icon>
                  <span>{{ scope.row.symbol }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('public.public2')"
            >
              <template v-slot="scope">
                {{ $thousands(scope.row.available) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="locking"
              :label="$t('public.public3')"
            >
              <template v-slot="scope">
                {{ $thousands(scope.row.locking) }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('public.public4')">
              <template v-slot="scope">
                {{ $thousands(scope.row.number) }}
                <p class="ydy">≈${{ $thousands(scope.row.valuation) }}</p>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('public.public5')"
              align="center"
              width="240px"
            >
              <template v-slot="scope">
                <el-button
                  @click="transfer(scope.row, 'crossIn')"
                  type="text"
                  v-if="isShowCrossHandle(scope.row)"
                  :disabled="disableTx"
                >
                  {{ $t("assets.assets4") }}
                </el-button>
                <el-button @click="transfer(scope.row, 'general')" type="text">
                  {{ $t("assets.assets5") }}
                </el-button>
                <el-button
                  @click="transfer(scope.row, 'withdrawal')"
                  type="text"
                  :disabled="disableTx"
                  v-if="isShowCrossHandle(scope.row)"
                >
                  {{ $t("assets.assets6") }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-dialog
            :title="$t('assets.assets7')"
            custom-class="assets-manage"
            :show-close="false"
            v-model="showAssetsDialog"
          >
            <div class="content">
              <div class="top">
                <span>{{ superLong(address, 9) }}</span>
                <span><i class="el-icon-copy-document"></i></span>
                <span><i class="el-icon-copy-document"></i></span>
              </div>
              <div class="bottom tc">
                <el-button type="primary">{{ $t("public.public7") }}</el-button>
              </div>
            </div>
          </el-dialog>
        </div>
      </div>
    </div>
    <div class="mobile-cont pb-28" v-if="!showTransfer">
      <div class="p-24 address-wrap flex-center">
        <div class="address">
          {{ $t("assets.assets3") }}
          <span class="text-7e size-14">
            {{ superLong(talonAddress, 9) }}
          </span>
          <i class="iconfont icon-fuzhi" @click="$copy(talonAddress)"></i>
        </div>
        <i class="iconfont icon-tianjia" @click="showAssetManage = true"></i>
      </div>
      <el-empty
        description="No Data"
        v-loading="loading"
        v-if="!tableData.length"
      />
      <div v-for="(item, index) in tableData" v-else :key="index">
        <div class="p-24 asset-cont" @click="assetClick(item)">
          <div class="asset-item">
            <span class="asset-img">
              <img :src="getImageSrc(item.symbol)" @error="replaceImg" alt="" />
            </span>
            <span class="font-bold" style="font-size: 15px">
              {{ item.symbol }}
            </span>
          </div>
          <div class="asset-amount flex-center">
            <div class="left">
              <div class="font-bold align-right" style="font-size: 15px">
                {{ $thousands(item.number) }}
              </div>
              <div class="size-13 text-7e align-right">
                ≈{{ $thousands(item.valuation) }}
              </div>
            </div>
            <i
              :class="[
                'el-icon-caret-right',
                item.showDetail ? 'rotate-icon' : ''
              ]"
            ></i>
          </div>
        </div>
        <CollapseTransition>
          <div class="option-btn" v-if="item.showDetail">
            <div class="btn-cont">
              <div
                class="btn"
                @click="transfer(item, 'crossIn')"
                v-if="isShowCrossHandle(item)"
                :class="{ btn_disable: disableTx }"
              >
                {{ $t("assets.assets4") }}
              </div>
              <div
                class="btn"
                @click="transfer(item, 'general')"
              >
                {{ $t("assets.assets5") }}
              </div>
              <div
                class="btn"
                @click="transfer(item, 'withdrawal')"
                v-if="isShowCrossHandle(item)"
                :class="{ btn_disable: disableTx }"
              >
                {{ $t("assets.assets6") }}
              </div>
            </div>
          </div>
        </CollapseTransition>
      </div>
    </div>
    <assets-manage
      v-model:showAssetManage="showAssetManage"
      :assetList="allAssetsList"
      :selectAssets="selectAssets"
      @addAssets="filterAssets"
    ></assets-manage>
    <transfer
      v-if="showTransfer"
      v-model:currentTab="currentTab"
      v-model:show="showTransfer"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { chainToSymbol, superLong, getIconSrc, _networkInfo } from "@/api/util";
import SymbolIcon from "@/components/SymbolIcon.vue";
import AssetsManage from "./AssetsManage.vue";
import Transfer from "./transfer/index.vue";
import { getAssetList } from "@/model";
import config from "@/config";
import defaultIcon from "../../assets/Talon.svg";
import CollapseTransition from "@/components/CollapseTransition.vue";

const url = config.WS_URL;

export default defineComponent({
  name: "assets",
  props: {},
  components: {
    SymbolIcon,
    AssetsManage,
    Transfer,
    CollapseTransition
  },
  provide() {
    return {
      father: this
    };
  },
  watch: {
    address: {
      immediate: true,
      handler(val) {
        console.log(val, 444);
        if (val) {
          this.getList();
        }
      }
    }
  },
  computed: {
    netIcon() {
      return getIconSrc(chainToSymbol[this.network]);
    },
    network() {
      return this.$store.getters.chain;
    },
    disableTx() {
      return this.$store.getters.wrongChain;
    },
    currentAccount() {
      return this.$store.state.addressInfo;
    },
    address() {
      return this.$store.getters.currentAddress;
    },
    talonAddress() {
      return this.$store.getters.talonAddress;
    }
  },
  data() {
    return {
      loading: true,
      showAssetManage: false,
      selectAssets: [], // 勾选显示的资产
      allAssetsList: [], // L2 所有资产
      crossInOutSymbol: [], // 支持Ethereum转入/转出的资产
      showTransfer: false,
      currentTab: "first",
      tableData: [],
      transferAsset: {},
      show: false
    };
  },

  methods: {
    getImageSrc(icon) {
      return "https://nuls-cf.oss-us-west-1.aliyuncs.com/icon/" + icon + ".png";
    },
    replaceImg(e) {
      e.target.src = defaultIcon;
    },
    assetClick(item) {
      for (let asset of this.tableData) {
        if (item.assetKey === asset.assetKey) {
          item.showDetail = !item.showDetail;
        } else {
          asset.showDetail = false;
        }
      }
    },
    async getList() {
      this.loading = true;
      const res = await getAssetList(this.talonAddress);
      this.loading = false;
      const sortDataByValue = [...res].sort((a, b) => {
        return a.valuation - b.valuation > 0 ? -1 : 1;
      });
      const crossInOutSymbol = [...res].filter(item => {
        if (!item.heterogeneousList) {
          return false;
        } else {
          let supportedChain = false;
          item.heterogeneousList.map(v => {
            Object.keys(_networkInfo).map(key => {
              if (_networkInfo[key].chainId === v.heterogeneousChainId) {
                supportedChain = true;
              }
            });
          });
          return supportedChain;
        }
      });
      this.sortDataByValue = sortDataByValue;
      this.allAssetsList = res;
      this.crossInOutSymbol = crossInOutSymbol;
      this.filterAssets();
    },
    //过滤展示资产列表
    filterAssets() {
      // console.log(this.sortDataByValue, 66);
      let result = [];
      if (this.currentAccount.visiableAssets) {
        this.sortDataByValue.map(v =>
          this.currentAccount.visiableAssets.map(item => {
            if (item === v.assetKey) {
              result.push(v);
            }
          })
        );
      } else {
        const defaultSymbol = ["ETH", "USDT", "USDC"];
        result = this.sortDataByValue.filter(
          v => defaultSymbol.indexOf(v.symbol) > -1
        );
      }
      this.selectAssets = result;
      this.tableData = result;
    },

    transfer(asset, type) {
      if (type === "crossIn") {
        // L1到L2
        this.currentTab = "first";
      } else if (type === "withdrawal") {
        // L2到L1
        this.currentTab = "third";
      } else {
        // L2内部转账
        this.currentTab = "second";
      }
      this.showTransfer = true;
      this.transferAsset = asset;
      // console.log(this.transferAsset,55)
    },
    isShowCrossHandle(item) {
      if (!item.heterogeneousList) return false;
      let supportedChain = false;
      item.heterogeneousList.map(v => {
        Object.keys(_networkInfo).map(key => {
          if (_networkInfo[key].chainId === v.heterogeneousChainId) {
            supportedChain = true;
          }
        });
      });
      return supportedChain;
    },
    superLong(str, len = 9) {
      return superLong(str, len);
    }
  }
});
</script>

<style lang="scss" scoped>
.assets-wrap {
  padding: 0 20px;
}
.mobile-cont {
  display: none;
  //padding: 24px 15px 28px 15px;
  background-color: #ffffff;
  overflow: hidden;
  border-radius: 10px;

  .address-wrap {
    justify-content: space-between;
    font-size: 18px;
    color: #333;
    margin: 20px 0 10px;
    i {
      color: #4a5ef2;
      font-size: 20px;
      cursor: pointer;
      margin-left: 10px;
    }
  }
  .asset-cont {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    border-bottom: 1px solid #e9ebf3;
    .asset-item {
      display: flex;
      align-items: center;
      max-width: 40%;
      .asset-img {
        height: 22.5px;
        width: 22.5px;
        overflow: hidden;
        margin-right: 6px;
        flex-shrink: 0;
        img {
          height: 100%;
          width: 100%;
        }
      }
    }
    .asset-amount {
      flex: 1;
      justify-content: flex-end;
    }
    .el-icon-caret-right {
      font-size: 16px;
      margin-left: 5px;
      transition: transform 0.1s ease;
    }
    .rotate-icon {
      transform: rotate(-90deg);
    }
  }
  .option-btn {
    padding: 20px 0;
    background-color: #f8f8fc;
    .btn-cont {
      display: flex;
      align-items: center;
      justify-content: center;
      .btn {
        cursor: pointer;
        height: 39px;
        width: 95px;
        font-size: 15px;
        background-color: #4a5ef2;
        color: #ffffff;
        line-height: 39px;
        text-align: center;
        border-radius: 10px;
        margin: 0 5px;
      }
    }
  }
}
.font-bold {
  font-weight: bolder;
}
.p-24 {
  padding: 0 15px 0 15px;
}
.pt-25 {
  padding: 25px 15px 0 15px;
}
.pb-28 {
  padding-bottom: 28px;
}
.align-right {
  text-align: right;
}
.btn_disable {
  background-color: #a0cfff !important;
  cursor: not-allowed;
}
.assets {
  max-height: 721px;
  background: #ffffff;
  box-shadow: 0px 2px 0px 0px #e9eaf4;
  border-radius: 30px;
  padding: 35px 40px;
  .font_20 {
    font-size: 20px;
  }
  .address-wrap {
    justify-content: space-between;
    font-size: 24px;
    color: #333;
    margin: 10px 0 30px;
    i {
      color: #4a5ef2;
      font-size: 36px;
      cursor: pointer;
      margin-left: 20px;
    }
  }
  :deep(.el-table) {
    th .cell {
      font-size: 16px;
    }
    tr .cell {
      font-size: 16px;
      color: #333;
    }
    tr .flex-center {
      span {
        font-weight: 600;
        margin-left: 10px;
      }
    }
    .el-button--text {
      color: #4a5ef2;
    }
    .ydy {
      color: #7e87c2;
    }
  }
}
.assets-list {
  display: none;
  .asset-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    .assets_symbol {
      width: 100px;
    }
    .asset-info {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}
@media screen and (max-width: 800px) {
  .mobile-cont {
    display: block;
  }
  .assets {
    display: none;
  }
}
@media screen and (max-width: 1200px) {
  //.show_table {
  //  display: none;
  //}
  //.assets-list {
  //  display: block;
  //}
  .assets {
    padding: 20px;
    border-radius: 20px !important;
  }
  .assets .top .top-title {
    font-size: 18px;
  }
  .assets .font_20 {
    font-size: 16px;
  }
  .transfer-page .bottom {
    padding: 10px;
  }
}
</style>
