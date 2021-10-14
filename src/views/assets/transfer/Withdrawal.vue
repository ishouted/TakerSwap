<template>
  <div
    class="cross-out"
    v-loading="loading"
    element-loading-background="rgba(24, 24, 55, 0.8)"
  >
    <div class="title">
      {{ "To " + $store.getters.chain }}
      <span class="click" @click="openUrl(father.address, father.network)">
        {{ superLong(father.address) }}
        <i class="iconfont icon-tiaozhuanlianjie"></i>
      </span>
    </div>
    <div class="transfer-content">
      <custom-input
        v-model:inputVal="amount"
        :label="$t('transfer.transfer20')"
        :icon="transferAsset.symbol"
        :assetList="assetsList"
        :balance="balance"
        :errorTip="amountErrorTip"
        @selectAsset="selectAsset"
        @max="max"
      ></custom-input>
      <div class="fee">
        {{ $t("public.public15") }}
        <span class="el-icon-loading" v-if="!fee"></span>
        <span v-else>{{ fee + " " + feeSymbol }}</span>
      </div>
    </div>
    <div class="confirm-wrap">
      <el-button type="primary" @click="sendTx" :disabled="disableTransfer">
        {{ $t("transfer.transfer11") }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import CustomInput from "@/components/CustomInput.vue";
import {
  superLong,
  Minus,
  timesDecimals,
  _networkInfo,
  divisionDecimals,
  Times,
  Plus,
  floatToCeil
} from '@/api/util'
import { NTransfer, ETransfer } from "@/api/api";
import config from "@/config";
export default defineComponent({
  name: "withdrawal",
  inject: ["father"],
  components: {
    CustomInput
  },
  data() {
    this.timer = null;
    return {
      loading: false,
      assetsList: [],
      amount: "",
      balance: "",
      transferAsset: {},
      amountErrorTip: "",
      fee: 0,
      feeSymbol: "",
      fee_mainAsset: {} // 手续费资产信息--L1网络在nerve上的主资产
    };
  },
  watch: {
    amount(val) {
      if (val) {
        const { chainId, assetId } = this.fee_mainAsset;
        const L1MainAssetBalance = this.assetsList.find(v => {
          return v.chainId === chainId && v.assetId === assetId;
        }).available;
        const isL1MainAsset =
          this.transferAsset.chainId === chainId &&
          this.transferAsset.assetId === assetId;
        console.log(this.balance, Minus(this.balance, this.amount) < 0, isL1MainAsset && Minus(this.balance, Plus(this.amount, this.fee)) < 0)
        if (
          !Number(this.balance) ||
          Minus(this.balance, this.amount) < 0 ||
          (isL1MainAsset && Minus(this.balance, Plus(this.amount, this.fee)) < 0)
        ) {
          this.amountErrorTip = this.$t("transfer.transfer15");
        } else if (Minus(L1MainAssetBalance, this.fee) < 0) {
          this.amountErrorTip = this.$t("transfer.transfer18");
        } else {
          this.amountErrorTip = "";
        }
        console.log(this.amountErrorTip);
      }
    },
    "father.crossInOutSymbol": {
      deep: true,
      handler() {
        this.filterAssets();
        // this.selectAsset(this.father.transferAsset);
        this.balance = this.assetsList.find(
          v => v.assetKey === this.transferAsset.assetKey
        )?.available;
      }
    }
  },
  computed: {
    disableTransfer() {
      return !!(
        !Number(this.amount) ||
        !Number(this.balance) ||
        !Number(this.fee) ||
        this.addressError ||
        this.amountErrorTip ||
        this.father.disableTx
      );
    }
  },
  mounted() {
    // console.log(this.father, "===commontransfer===");
    // console.log(this.$store.state.addressInfo, "===addressInfo===");
    this.filterAssets();
    const { transferAsset, network } = this.father;
    this.selectAsset(transferAsset);
    this.feeSymbol = _networkInfo[network].mainAsset;
    this.fee_mainAsset = config.htgMainAsset[network];
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    filterAssets() {
      // console.log(123465,this.father);
      const chain = _networkInfo[this.father.network];
      if (this.father.disableTx || !chain) return;
      this.assetsList = this.father.crossInOutSymbol.filter(v => {
        return v.heterogeneousList?.filter(item => {
          return item.heterogeneousChainId === chain.chainId;
        });
      });
    },
    selectAsset(asset) {
      if (this.father.disableTx) return;
      this.fee = 0;
      this.amount = "";
      this.balance = "";
      this.heterogeneousInfo = {}; // 异构链信息
      const heterogeneousList = asset.heterogeneousList || [];
      // 目标异构链ID
      const heterogeneousChainId = _networkInfo[this.father.network]?.chainId;
      if (!heterogeneousChainId) return;
      const heterogeneousInfo = heterogeneousList.find(
        v => v.heterogeneousChainId === heterogeneousChainId
      );
      this.heterogeneousInfo = heterogeneousInfo;
      // console.log(heterogeneousInfo, 123456);
      if (heterogeneousInfo) {
        this.transferAsset = asset;
        this.balance = this.transferAsset.available;
        this.heterogeneousInfo = heterogeneousInfo;
        if (this.timer) clearInterval(this.timer);
        this.getCrossOutFee();
        this.timer = setInterval(() => {
          this.getCrossOutFee();
        }, 5000);
      } else {
        this.transferAsset = {};
      }
    },
    async getCrossOutFee() {
      const transfer = new ETransfer(this.father.network);
      /*const nvtUSD = await getSymbolUSD();
      const mainAsset = this.assetsList.find(
        v => v.symbol === this.heterogeneousInfo.chainName
      );
      const heterogeneousChainUSD = await getSymbolUSD({
        chaiId: mainAsset.chaiId,
        assetId: mainAsset.assetId
      });*/
      /*const res = await transfer.calWithdrawalNVTFee(
        String(nvtUSD),
        String(heterogeneousChainUSD),
        this.heterogeneousInfo.isToken
      );*/
      const res = await transfer.calWithdrawFee(this.heterogeneousInfo.isToken);
      console.log(res, 111, divisionDecimals(res, 8));
      // this.fee = Times(divisionDecimals(res, 8), 1.2).toString();
      this.fee = floatToCeil(res, 6);
    },
    max() {
      if (!this.balance || !Number(this.balance)) return;
      const isL1MainAsset =
        this.transferAsset.chainId === this.fee_mainAsset.chainId &&
        this.transferAsset.assetId === this.fee_mainAsset.assetId;
      if (isL1MainAsset) {
        if (!this.fee) return;
        if (Minus(this.balance, this.fee).toString() > 0) {
          this.amount = Minus(this.balance, this.fee).toString();
        } else {
          this.amount = this.balance;
        }
      } else {
        this.amount = this.balance;
      }
    },
    async sendTx() {
      this.loading = true;
      try {
        const { chainId, assetId, decimals } = this.transferAsset;
        const { talonAddress, address } = this.father;
        const withdrawalFee = timesDecimals(this.fee, this.fee_mainAsset.decimals);
        const transferInfo = {
          from: talonAddress,
          assetsChainId: chainId,
          assetsId: assetId,
          amount: timesDecimals(this.amount, decimals),
          fee: 0,
          withdrawalFee,
          fee_mainAsset: {
            chainId: this.fee_mainAsset.chainId,
            assetId: this.fee_mainAsset.assetId
          }
        };

        console.log(transferInfo);
        const transfer = new NTransfer({
          chain: "NERVE",
          type: 43
        });
        const inputOuput = await transfer.WithdrawalTransaction(transferInfo);
        // console.log(inputOuput, 456456465)
        const addressInfo = this.$store.state.addressInfo;
        const txData = {
          heterogeneousAddress: address,
          heterogeneousChainId: this.heterogeneousInfo.heterogeneousChainId
        };
        const data = {
          inputs: inputOuput.inputs,
          outputs: inputOuput.outputs,
          txData,
          pub: addressInfo.pub,
          signAddress: address
        };
        const txHex = await transfer.getTxHex(data);
        console.log(txHex, 9999);
        const result = await transfer.broadcastHex(txHex);
        if (result && result.hash) {
          this.amount = "";
          this.$toast(this.$t("transfer.transfer14"));
        } else {
          this.$toast("Broadcast tx failed", {
            type: "error"
          });
        }
      } catch (e) {
        console.log(e, "common-transfer-error");
        this.$toast(e.message || e, {
          type: "error"
        });
      }
      this.loading = false;
    },
    superLong(str, len = 6) {
      return superLong(str, len);
    },
    openUrl(address, network) {
      const { origin } = _networkInfo[network];
      window.open(origin + "/address/" + address);
    }
  }
});
</script>

<style lang="scss" scoped>
@import "../../../assets/css/style.scss";
.cross-out {
  .title {
    font-size: 18px;
    color: $labelColor;
    span {
      color: $linkColor;
    }
  }
  .transfer-content {
    margin: 35px 0 60px;
  }
  .fee {
    color: #7e87c2;
    font-size: 14px;
    margin-top: 20px;
  }
  .wrong-net {
    margin-top: 10px;
  }
  @media screen and (max-width: 500px) {
    .title {
      font-size: 16px;
    }
    .transfer-content {
      margin: 35px 0 50px;
    }
  }
}
</style>
