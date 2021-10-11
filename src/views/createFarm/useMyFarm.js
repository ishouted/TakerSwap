import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default function useMyFarm() {
  const store = useStore();
  const router = useRouter();
  const myFarms = ref([]);
  const currentAccount = store.state.addressInfo;
  onMounted(() => {
    myFarms.value = currentAccount.farms || [];
  });
  function toMyFarm(farm) {
    let url;
    if (farm.type === "farm") {
      url = `/farm/${farm.hash}`;
    } else {
      url = `/pool/${farm.hash}`;
    }
    router.push(url);
  }

  function updateMyFarms(farm) {
    const accountList =
      JSON.parse(localStorage.getItem("accountList") || "") || [];
    accountList.map(v => {
      if (v.pub === currentAccount.pub) {
        if (v.farms && v.farms.length) {
          v.farms.push(farm);
        } else {
          v.farms = [farm];
        }
        myFarms.value = v.farms;
      }
    });
    localStorage.setItem("accountList", JSON.stringify(accountList));
  }

  return {
    myFarms,
    toMyFarm,
    updateMyFarms
  };
}
