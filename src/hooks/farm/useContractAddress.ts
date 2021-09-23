import { computed } from "vue";
import { useStore } from "vuex";
import { contract_BSC, contract_ETH } from "./contractConfig";

export default function useContractAddress() {
  const store = useStore();
  return computed(() => {
    const L1Chain = store.getters.chain;
    return L1Chain === "Ethereum" ? contract_ETH : contract_BSC;
  });
}
