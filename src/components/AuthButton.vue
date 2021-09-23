<template>
  <div class="auth-button">
    <slot>
      <el-button
        type="primary"
        v-if="!address"
        @click="showConnectDialog(true)"
      >
        {{ $t("header.header3") }}
      </el-button>
      <el-button v-else type="primary" @click="derivedAddress">
        {{ $t("login.login2") }}
      </el-button>
    </slot>
  </div>
</template>

<script>
import { useStore } from "vuex";
import nerve from "nerve-sdk-js";
import { useToast } from "vue-toastification";
import useEthereum, { getProvider } from "@/hooks/useEthereum";
import { useI18n } from "vue-i18n";
import config from "@/config";
import { watch } from "vue";
import { getCurrentAccount } from "@/api/util";

const ethers = require("ethers");

export default {
  props: {
    label: String
  },
  setup(_, { emit }) {
    const store = useStore();
    const { t } = useI18n();
    const toast = useToast();
    const { address, initProvider } = useEthereum();
    initProvider();
    function showConnectDialog(state) {
      store.commit("changeConnectShow", state);
    }
    watch(
      () => address.value,
      val => {
        if (val) {
          const currentAccount = getCurrentAccount(val);
          store.commit("setCurrentAddress", currentAccount || {});
        }
      },
      {
        deep: true
      }
    );
    async function derivedAddress() {
      let result = false;
      emit("loading", true);
      try {
        if (!address.value) {
          showConnect();
          return;
        }
        const provider = getProvider();
        const EProvider = new ethers.providers.Web3Provider(provider);
        const jsonRpcSigner = EProvider.getSigner();
        let message = "Generate Taker address";
        const signature = await jsonRpcSigner.signMessage(message);
        const msgHash = ethers.utils.hashMessage(message);
        const msgHashBytes = ethers.utils.arrayify(msgHash);
        const recoveredPubKey = ethers.utils.recoverPublicKey(
          msgHashBytes,
          signature
        );

        const account = {
          address: {
            Ethereum: address.value,
            BSC: address.value,
            Heco: address.value,
            OKExChain: address.value
          }
        };
        if (recoveredPubKey.startsWith("0x04")) {
          const compressPub = ethers.utils.computePublicKey(
            recoveredPubKey,
            true
          );
          const pub = compressPub.slice(2);
          account.pub = pub;
          // account.selected = true;
          const { chainId, assetId = 1, prefix } = config;
          account.address.Talon = nerve.getAddressByPub(
            chainId,
            assetId,
            pub,
            prefix
          );
          const accountList =
            JSON.parse(localStorage.getItem("accountList")) || [];
          const existIndex = accountList.findIndex(v => v.pub === account.pub);
          // 原来存在就替换，找不到就push
          if (existIndex > -1) {
            accountList[existIndex] = account;
          } else {
            accountList.push(account);
          }
          localStorage.setItem("accountList", JSON.stringify(accountList));
          store.commit("setCurrentAddress", account);
          result = true;
          // const fromPath = route.redirectedFrom?.fullPath || "/";
          // router.push(fromPath);
        }
      } catch (e) {
        toast.error(t("login.login3"));
      }
      emit("loading", false);
      return result;
    }
    function showConnect() {
      store.commit("changeConnectShow", true);
    }
    return {
      showConnectDialog,
      derivedAddress,
      showConnect,
      address
    };
  }
};
</script>

<style lang="scss"></style>
