#!/usr/bin/env bun

/**
 * Create a CDP wallet for API sellers to receive x402 payments
 * This wallet is managed by Coinbase with keys in TEE
 */

import { env } from "../../lib/env";

const SERVER_URL = env.SERVER_URL;

async function createSellerWallet() {
  console.log("💰 Creating CDP Wallet for API Seller");
  console.log("=====================================\n");
  console.log("This wallet will receive payments when your API is called.");
  console.log("Keys are secured by Coinbase in Trusted Execution Environment.\n");
  
  try {
    console.log("📡 Contacting server to create CDP wallet...");
    
    const response = await fetch(`${SERVER_URL}/api/wallet/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || "Failed to create wallet");
    }
    
    const wallet = await response.json();
    
    console.log("\n✅ CDP Wallet Created Successfully!");
    console.log("====================================");
    console.log(`🔑 API Key: ${wallet.apiKey}`);
    console.log(`📍 Address: ${wallet.address}`);
    console.log(`🌐 Network: ${wallet.network}`);
    console.log(`📝 Account: ${wallet.accountName}`);
    
    console.log("\n💾 Save this API key for managing your wallet!");
    console.log("You'll use it to:");
    console.log("- Check wallet balance");
    console.log("- Fund wallet from testnet faucet");
    console.log("- Register APIs that receive payments");
    
    console.log("\n📋 Next Steps:");
    console.log("1. Save the API key securely");
    console.log("2. Fund the wallet: bun scripts/endpoint-management/fund-seller-wallet.ts");
    console.log("3. Register your API: bun scripts/endpoint-management/register-api.ts");
    
    // Save to file
    const saveData = {
      apiKey: wallet.apiKey,
      address: wallet.address,
      network: wallet.network,
      accountName: wallet.accountName,
      created: new Date().toISOString()
    };
    
    await Bun.write(".seller-wallet.json", JSON.stringify(saveData, null, 2));
    console.log("\n✅ Wallet details saved to .seller-wallet.json");
    
  } catch (error: any) {
    console.error("\n❌ Failed to create CDP wallet:", error.message);
    console.log("\n🔍 Troubleshooting:");
    console.log("1. Ensure server is running: cd server && bun dev");
    console.log("2. Check server has CDP credentials in .env");
    console.log("3. Verify server URL:", SERVER_URL);
  }
}

createSellerWallet().catch(console.error);