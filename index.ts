import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

// Điền danh sách proxy
// proxy có user:passs  "http://user:pass@sp08-06.proxy.mkvn.net:13882"

const proxies = [
  "http://username:password@host:port",
  "http://username:password@host:port",
  "http://username:password@host:port"
];

const addresss = [
  "0x",
  "0x",
  "0x",
  "0x",
  "0x",
  "0x",
  "0x",
];

let currentIp: string | null = null;

const airdrop101Random = (array: any) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

async function main() {
  try {
    // Mỗi ví sẽ sử dụng một proxy riêng biệt
    const recipient = airdrop101Random(addresss);
    const proxy = proxies[addresss.indexOf(recipient)];
    const axiosInstance = axios.create({
      httpsAgent: new HttpsProxyAgent(proxy),
    });

    await getIp(axiosInstance);
    console.log(`Tổng sui ${recipient}:`, await checkSuiBalance(recipient));
    console.log("Đang faucet...");

    const { data } = await axiosInstance.post(
      "https://faucet.testnet.sui.io/v1/gas",
      {
        FixedAmountRequest: {
          recipient,
        },
      }
    );
    if (!data.error) {
      console.log("<================== Faucet thành công ==================>\n");
    } else {
      console.log("Faucet failed for:", recipient);
    }

  } catch (error: any) {
    console.log("Faucet thất bại: ", error?.response?.data, "\n\n");
  }
}

async function getIp(axiosInstance: any) {
  if (!currentIp) { // Kiểm tra xem IP đã được lưu chưa
    try {
      const response = await axiosInstance.get(
        "https://api64.ipify.org?format=json"
      );
      console.log("Địa chỉ IP hiện tại:", response.data.ip);
      currentIp = response.data.ip;
    } catch (error: any) {
      console.error("Lỗi khi lấy địa chỉ IP:", error.message);
    }
  }
  return currentIp;
}

setInterval(() => {
  main();
}, 30000); // Tăng lên 30 giây hoặc lâu hơn

async function checkSuiBalance(address: any) {
  const rpcUrl = "https://fullnode.testnet.sui.io:443";

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "suix_getBalance",
        params: [address],
      }),
    });

    const data = await response.json();
    const balanceMist = BigInt(data.result.totalBalance);
    const balanceSui = Number(balanceMist) / 10 ** 9;

    return balanceSui;
  } catch (error) {
    console.error("Balance check failed:", error);
    return null;
  }
}
