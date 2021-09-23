<template>
  <div class="transfer-page">
    <div class="top">
      <div class="back"><i class="iconfont icon-fanhui" @click="back"></i></div>
      <div class="tab-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane name="first" :disabled="father.disableTx">
            <template #label>
              <el-tooltip
                :content="$t('assets.assets4')"
                placement="top"
              >
                <i class="iconfont icon-chongzhidaoL2"></i>
              </el-tooltip>
            </template>
          </el-tab-pane>
          <el-tab-pane name="second">
            <template #label>
              <el-tooltip
                :content="$t('assets.assets5')"
                placement="top"
              >
                <i class="iconfont icon-L2zhuanzhang"></i>
              </el-tooltip>
            </template>
          </el-tab-pane>
          <el-tab-pane name="third" :disabled="father.disableTx">
            <template #label>
              <el-tooltip
                :content="$t('assets.assets6')"
                placement="top"
              >
                <i class="iconfont icon-tixiandaoL1"></i>
              </el-tooltip>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="bottom">
      <cross-in
        v-show="activeName === 'first'"
        :transferAsset="transferAsset"
      ></cross-in>
      <common-transfer
        v-show="activeName === 'second'"
        :transferAsset="transferAsset"
      ></common-transfer>
      <withdrawal
        v-show="activeName === 'third'"
        :transferAsset="transferAsset"
      ></withdrawal>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import CrossIn from "./CrossIn.vue";
import CommonTransfer from "./CommonTransfer.vue";
import Withdrawal from "./Withdrawal.vue";
export default defineComponent({
  name: "transfer",
  components: {
    CrossIn,
    CommonTransfer,
    Withdrawal
  },
  inject: ["father"],
  props: {
    showTransfer: Boolean,
    currentTab: String,
    transferAsset: Object
  },
  setup(props, { emit }) {
    const crossInVal = ref("");
    const activeName = ref("first");
    watch(
      () => props.currentTab,
      val => {
        activeName.value = val;
      },
      {
        immediate: true
      }
    );
    function back() {
      emit("update:show", false);
    }
    function handleClick(index) {
      console.log(index);
    }
    return {
      activeName,
      crossInVal,
      handleClick,
      back
    };
  }
});
</script>

<style lang="scss">
.transfer-page {
  max-width: 470px;
  margin: 0 auto;
  border-radius: 20px;
  background-color: #5b6fff;
  .top {
    height: 173px;
    padding: 40px;
    .back {
      margin-bottom: 25px;
      .iconfont {
        font-size: 25px;
        color: #fff;
        /* margin: -10px 0 30px -5px; */
        cursor: pointer;
      }
    }
  }
  .el-tabs .el-tabs__item {
    height: 50px;
    line-height: 50px;
    //width: 60px;
    //text-align: center;
    .iconfont {
      font-size: 28px;
    }
  }
  .el-tabs__item .iconfont {
    font-size: 20px;
  }
  .bottom {
    padding: 50px 40px;
    min-height: 400px;
    background-color: #fff;
    border-radius: 20px;
  }
  @media screen and (max-width: 500px) {
    .top {
      height: 120px;
      padding: 20px 20px 10px;
      .back {
        margin-bottom: 15px;
        .iconfont {
          font-size: 20px;
        }
      }
      //.el-tabs {
      //  .el-tabs__item {
      //    font-size: 16px!important;
      //    padding: 0 18px 0 0;
      //    .iconfont {
      //      font-size: 16px;
      //    }
      //  }
      //}
    }
    .bottom {
      padding: 30px 20px;
      min-height: auto;
    }
  }
}
</style>
