<template>
  <div class="custom-input">
    <div class="info flex-between">
      <span>{{ label }}</span>
      <span v-if="talonAddress">{{ $t("public.public12") }}{{ balance }}</span>
    </div>
    <div class="inner flex-between">
      <el-input
        class="no-border"
        :model-value="amount"
        @input="changeInput"
        @focus="customerFocus"
        placeholder="0.0"
      >
        <template #append v-if="talonAddress">
          <span @click="max">MAX</span>
        </template>
      </el-input>
      <div class="select-wrap flex-center" @click="showDialog = true">
        <template v-if="icon">
          <symbol-icon :icon="icon" />
          <!--          <span class="coin-name">{{ icon }}</span>-->
          <el-tooltip effect="dark" :content="icon" placement="top">
            <span class="click">{{ icon }}</span>
          </el-tooltip>
          <i class="el-icon-arrow-down"></i>
        </template>
        <template v-else>
          <span class="placeholder">{{ $t("transfer.transfer12") }}</span>
          <i class="el-icon-arrow-down"></i>
        </template>
      </div>
    </div>
    <!--<span class="error-tip" v-if="errorTip">{{ errorTip }}</span>-->
    <el-dialog
      custom-class="select-assets-dialog"
      :title="$t('transfer.transfer12')"
      :show-close="true"
      top="10vh"
      v-model="showDialog"
      @closed="searchVal = ''"
    >
      <el-input
        v-model="searchVal"
        :placeholder="$t(showAmount ? 'assets.assets8' : 'assets.assets9')"
      ></el-input>
      <ul class="list-wrap">
        <li
          v-for="item in list"
          :key="item.assetKey"
          :class="{
            disable_asset:
              selectedAsset &&
              selectedAsset.chainId === item.chainId &&
              selectedAsset.assetId === item.assetId
          }"
          @click="changeSelect(item)"
        >
          <div class="flex-center flex-1" style="width: 100%">
            <symbol-icon :icon="item.symbol"></symbol-icon>
            <div class="asset-base-info">
              <div>
                {{ item.symbol }}
                <span>({{ item.originNetwork }})</span>
              </div>
              <span v-if="showAmount">ID: {{ item.assetKey }}</span>
              <template v-else>
                <span class="pc-span">{{ item.contractAddress }}</span>
                <span class="mobile-span">
                  {{ superLong(item.contractAddress, 15) }}
                </span>
              </template>
            </div>
            <div class="asset-price ellipsis" v-if="talonAddress">
              <span class="ellipsis" v-if="showAmount">
                {{ item.listAvailable }}
              </span>
              <!--<span>≈{{ item.usdPrice }}</span>-->
            </div>
          </div>
        </li>
      </ul>
    </el-dialog>
  </div>
</template>

<script>
import SymbolIcon from "@/components/SymbolIcon.vue";
import { superLong } from "@/api/util";
export default {
  props: {
    label: {
      type: String,
      default: ""
    },
    icon: String,
    assetList: {
      type: Array,
      default: () => []
    },
    inputVal: String,
    balance: String,
    errorTip: String,
    selectedAsset: {
      type: Object,
      default: () => null
    },
    showAmount: {
      type: Boolean,
      default: true
    }
  },
  components: {
    SymbolIcon
  },
  data() {
    this.allAssetsList = [];
    return {
      amount: "",
      list: [],
      showDialog: false,
      searchVal: "",
      chooseAsset: {}
    };
  },
  watch: {
    inputVal(val) {
      this.amount = val;
    },
    searchVal(val) {
      this.filter(val);
    },
    assetList: {
      immediate: true,
      handler(val) {
        if (val && val.length) {
          this.allAssetsList = [...val];
          this.filter(this.searchVal);
        }
      }
    },
    selectedAsset: {
      immediate: true,
      handler(val) {
        this.chooseAsset = val;
      }
    }
  },
  computed: {
    talonAddress() {
      return this.$store.getters.talonAddress;
    }
  },
  mounted() {
    // this.allAssetsList = [...this.assetList];
  },
  methods: {
    changeInput(val) {
      // this.amount = val;
      let decimals = this.chooseAsset?.decimals || 0;
      let patrn = "";
      if (!decimals) {
        patrn = new RegExp("^([1-9][\\d]*|0)(\\.[\\d]*)?$|(^\\.[\\d]*$)");
      } else {
        patrn = new RegExp(
          "^([1-9][\\d]*|0)(\\.[\\d]{0," +
            decimals +
            "})?$|(^\\.[\\d]{0," +
            decimals +
            "}$)"
          // "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
        );
      }
      if (patrn.exec(val) || val === "") {
        this.$emit("update:inputVal", val);
      }
    },
    filter(str) {
      if (!str) {
        this.list = this.allAssetsList.filter(v => v);
      } else {
        if (this.showAmount) {
          this.list = this.allAssetsList.filter(v => {
            return (
              v.assetKey.indexOf(str) > -1 ||
              v.symbol.toUpperCase().indexOf(str.toUpperCase()) > -1
            );
          });
        } else {
          this.list = this.allAssetsList.filter(v => {
            return (
              v.contractAddress.indexOf(str) > -1 ||
              v.symbol.toUpperCase().indexOf(str.toUpperCase()) > -1
            );
          });
        }
      }
    },
    changeSelect(asset) {
      if (!asset) return;
      this.$emit("selectAsset", asset);
      this.chooseAsset = asset;
      this.showDialog = false;
    },
    max() {
      this.$emit("max");
    },
    customerFocus() {
      this.$emit("customerFocus");
    },
    superLong(str, len = 6) {
      return superLong(str, len);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/css/base.scss";
.custom-input {
  //border: 1px solid #e3eeff;
  border-radius: 15px;
  padding: 15px 20px;
  position: relative;
  background-color: $navBorder;
  .error-tip {
    position: absolute;
    left: 0;
    top: 98px;
    font-size: 13px;
    color: #f56c6c;
  }
  .info {
    margin-bottom: 5px;
    color: $txColor;
    font-size: 12px;
    & span:first-child {
      font-size: 14px;
    }
  }
  .el-input {
    margin-right: 20px;
    ::-webkit-input-placeholder {
      color: $labelColor;
    }
  }
  .inner {
    :deep(.el-input) {
      flex: 1;
      .el-input__inner {
        font-size: 20px;
        padding-right: 0;
      }
    }
  }
  .select-wrap {
    cursor: pointer;
    color: #8da9d4;
    img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }
    span {
      font-size: 14px;
      //font-weight: 600;
      margin: 0 5px;
      color: $txColor;
      max-width: 80px;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    i {
      color: #8da9d4;
    }
  }
  :deep(.el-input) {
    .el-input-group__append,
    .el-input-group__prepend {
      background-color: transparent;
      border: none;
      padding-right: 0;
      span {
        display: inline-block;
        padding: 3px 6px;
        color: $labelColor;
        background-color: #26263F;
        cursor: pointer;
        border-radius: 5px;
      }
    }
  }
  :deep(.select-assets-dialog) {
    //max-width: 450px !important;
    //min-width: 360px !important;
    .el-input {
      .el-input__inner {
        border-radius: 10px;
        line-height: 45px;
        height: 45px;
      }
      margin-bottom: 15px;
    }
    .list-wrap {
      max-height: 50vh;
      overflow-y: auto;
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 66px;
        padding: 9px 0;
        cursor: pointer;
        img {
          width: 48px;
          height: 48px;
          margin-right: 15px;
        }
        .asset-base-info {
          flex: 1;
          div {
            font-size: 18px;
            //font-weight: 600;
          }
          span {
            font-size: 14px;
            color: $labelColor;
            font-weight: 400;
          }
          .mobile-span {
            display: none;
          }
        }
        .asset-price {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: right;
          max-width: 70%;
          span:nth-child(1) {
            text-align: right;
            font-size: 20px;
            //font-weight: bold;
          }
        }
      }
    }
  }
  @media screen and (max-width: 1200px) {
    :deep(.select-assets-dialog) {
      .list-wrap {
        li {
          .asset-base-info {
            .pc-span {
              display: none;
            }
            .mobile-span {
              display: block;
            }
          }
        }
      }
    }
  }
  @media screen and (max-width: 500px) {
    padding: 10px 15px;
    .el-input {
      margin-right: 10px;
    }
    .inner {
      :deep(.el-input) {
        .el-input__inner {
          font-size: 16px;
        }
      }
    }
    .select-wrap {
      img {
        width: 25px;
        height: 25px;
      }
    }
    :deep(.el-input) {
      .el-input-group__append,
      .el-input-group__prepend {
        padding-left: 10px;
        span {
          padding: 2px 4px;
        }
      }
    }
    :deep(.select-assets-dialog) {
      .el-input {
        .el-input__inner {
          line-height: 36px;
          height: 36px;
        }
        margin-bottom: 10px;
      }
      .list-wrap {
        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 48px;
          cursor: pointer;
          img {
            width: 30px;
            height: 30px;
            margin-right: 10px;
          }
          .asset-base-info {
            flex: 1;
            div {
              font-size: 14px;
            }
            span {
              font-size: 12px;
            }
          }
          .asset-price {
            max-width: 60%;
            span:nth-child(1) {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
}

.disable_asset {
  opacity: 0.6;
  cursor: not-allowed !important;
}
</style>
