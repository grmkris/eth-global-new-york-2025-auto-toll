#!/usr/bin/env bun

/**
 * Register an API endpoint that receives x402 payments
 * The payments go to your CDP seller wallet
 */

import { env } from "../../lib/env";

const SERVER_URL = env.SERVER_URL;

async function loadSellerWallet() {
  try {
    const file = Bun.file(".seller-wallet.json");
    const content = await file.text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function registerAPI() {
  console.log("📝 Register API Endpoint for x402 Payments");
  console.log("==========================================\n");
  
  // Load seller wallet
  const sellerWallet = await loadSellerWallet();
  
  if (!sellerWallet) {
    console.error("❌ No seller wallet found!");
    console.log("\nFirst create a seller wallet:");
    console.log("  bun scripts/endpoint-management/create-seller-wallet.ts");
    process.exit(1);
  }
  
  console.log(`💼 Using seller wallet: ${sellerWallet.address}\n`);
  
  // Get API details from user
  console.log("Enter API details:");
  const name = prompt("API Name: ") || "My API";
  const targetUrl = prompt("Target URL (e.g., https://api.example.com/endpoint): ") || "";
  
  if (!targetUrl) {
    console.error("❌ Target URL is required!");
    process.exit(1);
  }
  
  const authType = prompt("Auth Type (none/header/bearer/query_param) [none]: ") || "none";
  
  let authKey = "";
  let authValue = "";
  
  if (authType !== "none") {
    authKey = prompt("Auth Key Name: ") || "";
    authValue = prompt("Auth Value/Token: ") || "";
  }
  
  const requiresPayment = (prompt("Require payment? (y/n) [y]: ") || "y").toLowerCase() === "y";
  const price = requiresPayment ? (prompt("Price in USDC [$0.001]: ") || "$0.001") : "$0";
  
  // Register the API
  try {
    console.log("\n📡 Registering API...");
    
    const response = await fetch(`${SERVER_URL}/endpoints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        targetUrl,
        authType,
        authKey,
        authValue,
        walletAddress: sellerWallet.address, // Payments go to seller wallet
        price,
        requiresPayment
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to register API");
    }
    
    const result = await response.json();
    
    console.log("\n✅ API Registered Successfully!");
    console.log("================================");
    console.log(`📌 API ID: ${result.id}`);
    console.log(`🔗 Proxy URL: ${SERVER_URL}${result.proxy_url}`);
    console.log(`💰 Price: ${price}`);
    console.log(`📍 Payments to: ${sellerWallet.address}`);
    
    if (requiresPayment) {
      console.log("\n💳 Your API is ready to receive x402 payments!");
      console.log("Buyers will automatically pay when calling your API.");
    } else {
      console.log("\n🆓 Your API is registered as free (no payment required).");
    }
    
    console.log("\n📋 Test your API:");
    if (requiresPayment) {
      console.log(`curl -X GET "${SERVER_URL}${result.proxy_url}"`);
      console.log("(Will return 402 Payment Required)");
      console.log("\nBuyers can use x402-fetch or our MCP client to pay automatically.");
    } else {
      console.log(`curl -X GET "${SERVER_URL}${result.proxy_url}"`);
    }
    
    // Save registration info
    const registrationData = {
      id: result.id,
      name,
      proxyUrl: `${SERVER_URL}${result.proxy_url}`,
      targetUrl,
      price,
      requiresPayment,
      walletAddress: sellerWallet.address,
      registered: new Date().toISOString()
    };
    
    const filename = `api-${result.id}.json`;
    await Bun.write(filename, JSON.stringify(registrationData, null, 2));
    console.log(`\n✅ Registration details saved to ${filename}`);
    
  } catch (error: any) {
    console.error("\n❌ Failed to register API:", error.message);
  }
}

registerAPI().catch(console.error);