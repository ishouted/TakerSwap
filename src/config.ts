type EnvType = "beta" | "prod";

const env = process.env.BUILD_ENV as EnvType;
const IS_DEV = process.env.NODE_ENV === "development";

// console.log(env, 789789, process.env);

function getWSUrl(): string {
  let url;
  if (env === "beta") {
    url = "ws://seeda.nuls.io:8009/ws";
  } else {
    const { protocol } = window.location;
    const wsProtocol = protocol === "http:" ? "ws:" : "wss:";
    url = `${wsProtocol}//api.swap.nerve.network/ws`;
  }
  // if (IS_DEV) {
  //   // url = "ws://192.168.1.111:8009/ws";
  //   url = "ws://seeda.nuls.io:8009/ws";
  // } else {
  //   const { host, protocol } = window.location;
  //   const wsProtocol = protocol === "http:" ? "ws:" : "wss:";
  //   url = wsProtocol + "//" + host + "/ws";
  // }
  return url;
}

const WS_URL = getWSUrl();
const timeout = 15000;

const config = {
  beta: {
    isBeta: true,
    API_URL: "http://beta.public.nerve.network",
    WS_URL,
    chainId: 5,
    assetId: 1,
    prefix: "TNVT",
    symbol: "NVT",
    timeout,
    ETHNET: "ropsten",
    feeAddress: "TNVTdTSPP9oSLvdtVSVFiUYCvXJdj1ZA1nyQU", //提现费用地址
    destroyAddress: "TNVTdTSPGwjgRMtHqjmg8yKeMLnpBpVN5ZuuY", // 黑洞地址
    htgMainAsset: {
      // 提现费用资产信息
      NERVE: { chainId: 5, assetId: 1, decimals: 8, symbol: "NVT" },
      Ethereum: { chainId: 5, assetId: 2, decimals: 18, symbol: "ETH" },
      BSC: { chainId: 5, assetId: 8, decimals: 18, symbol: "BNB" },
      Heco: { chainId: 5, assetId: 9, decimals: 18, symbol: "HT" },
      OKExChain: { chainId: 5, assetId: 12, decimals: 18, symbol: "OKT" },
      Harmony: { chainId: 5, assetId: 33, decimals: 18, symbol: "ONE" },
      Polygon: { chainId: 5, assetId: 34, decimals: 18, symbol: "MATIC" },
      KCC: { chainId: 5, assetId: 35, decimals: 18, symbol: "KCS" },
      TRON: { chainId: 5, assetId: 55, decimals: 6, symbol: "TRX"}
    },
    trxWithdrawFee: "20000000"
  },
  prod: {
    isBeta: false,
    API_URL: "https://public.nerve.network",
    WS_URL,
    chainId: 9,
    assetId: 1,
    prefix: "NERVE",
    symbol: "NVT",
    timeout,
    ETHNET: "homestead",
    feeAddress: "NERVEepb69f573sRzfoTX9Kn67WeNtXhG6Y6W8",
    destroyAddress: "NERVEepb63T1M8JgQ26jwZpZXYL8ZMLdUAK31L",
    htgMainAsset: {
      NERVE: { chainId: 9, assetId: 1, decimals: 8, symbol: "NVT" },
      Ethereum: { chainId: 9, assetId: 2, decimals: 18, symbol: "ETH" },
      BSC: { chainId: 9, assetId: 25, decimals: 18, symbol: "BNB" },
      Heco: { chainId: 9, assetId: 55, decimals: 18, symbol: "HT" },
      OKExChain: { chainId: 9, assetId: 87, decimals: 18, symbol: "OKT" },
      Harmony: { chainId: 9, assetId: 159, decimals: 18, symbol: "ONE" },
      Polygon: { chainId: 9, assetId: 160, decimals: 18, symbol: "MATIC" },
      KCC: { chainId: 9, assetId: 161, decimals: 18, symbol: "KCS" },
      TRON: { chainId: 9, assetId: 0, decimals: 6, symbol: "TRX" }
    },
    trxWithdrawFee: "20000000"
  }
};

export default config[env];
