#!/usr/bin/env bun

import { mnemonicToAccount } from "viem/accounts";
import { 
  callProtectedEndpoint,
  getBalance
} from "../../lib/client-wallet";
import { env } from "../../lib/env";

async function main() {
  console.log("🚀 Testing x402 Payment with Client Wallet");
  console.log("==========================================\n");
  
  // Check for mnemonic
  const mnemonic = env.MNEMONIC;
  
  if (!mnemonic) {
    console.error("❌ No MNEMONIC found in .env file");
    console.log("\n💡 First generate a wallet:");
    console.log("   bun scripts/client/generate-wallet.ts");
    console.log("\nThen add the mnemonic to your .env file:");
    console.log("   MNEMONIC=\"word1 word2 ... word12\"");
    process.exit(1);
  }
  
  // Create wallet from mnemonic
  const account = mnemonicToAccount(mnemonic, {
    addressIndex: 0,
  });
  
    console.log("💼 Using Client Wallet:");
    console.log(`Address: ${account.address}`);
  
  // Check balance
  console.log("\n📊 Checking balance...");
  const balance = await getBalance(account.address);
  console.log(`ETH: ${balance.eth}`);
  
  if (parseFloat(balance.eth) < 0.001) {
    console.warn("\n⚠️  Low ETH balance. You may need to fund your wallet:");
    console.log("https://www.basefaucet.com/");
  }
  
  // Test payment
  const endpointId = env.ENDPOINT_ID || "M-FbI0K5P4"; // Premium Chuck Norris Jokes
  
  console.log("\n💳 Making x402 payment call...");
  console.log(`Endpoint: /paid-proxy/${endpointId}`);
  
  try {
    const { data, paymentInfo } = await callProtectedEndpoint(
      `/paid-proxy/${endpointId}`,
      account
    );
    
    console.log("\n✅ Payment successful!");
    console.log("\n📦 API Response:");
    console.log(JSON.stringify(data, null, 2));
    
    if (paymentInfo) {
      console.log("\n💰 Payment Details:");
      console.log(`Transaction: ${paymentInfo.transaction || "Processing..."}`);
      
      if (paymentInfo.transaction) {
        console.log(`View on explorer: https://sepolia.basescan.org/tx/${paymentInfo.transaction}`);
      }
    }
    
    // Check balance after payment
    console.log("\n📊 Balance after payment:");
    const newBalance = await getBalance(account.address);
    console.log(`ETH: ${newBalance.eth}`);
    
  } catch (error: any) {
    console.error("\n❌ Payment failed:", error.message);
    
    if (error.message.includes("insufficient")) {
      console.log("\n💡 Insufficient balance. Fund your wallet:");
      console.log("- ETH: https://www.basefaucet.com/");
      console.log("- USDC: https://faucet.circle.com/");
    }
  }
}

main().catch(console.error);