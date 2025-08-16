import { account, publicClient, walletClient } from "../lib/wallet";
import { formatEther, formatUnits } from "viem";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const USDC_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function getAddress() {
  console.log("🔑 Wallet Information");
  console.log("====================");
  console.log(`Address: ${account.address}`);
  console.log(`Network: Base Sepolia`);
  
  try {
    // Get ETH balance
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`ETH Balance: ${formatEther(balance)} ETH`);
    
    // Get USDC balance
    const usdcBalance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [account.address],
    });
    console.log(`USDC Balance: ${formatUnits(usdcBalance, 6)} USDC`);
  } catch (error) {
    console.log("Balance: Unable to fetch (network connection issue)");
  }
  
  console.log("\n📝 Notes:");
  console.log("- Make sure you have Base Sepolia ETH for gas fees");
  console.log("- Make sure you have Base Sepolia USDC for payments");
  console.log("- Get testnet tokens from: https://faucet.circle.com/");
}

getAddress().catch(console.error);