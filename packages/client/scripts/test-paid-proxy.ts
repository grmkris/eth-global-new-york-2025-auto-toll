import { account, publicClient, fetchWithPayment } from "../lib/wallet";
import { formatEther, formatUnits } from "viem";
import { decodeXPaymentResponse } from "x402-fetch";

const SERVER_URL = "http://localhost:3000";
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

async function testPaidProxy() {
  console.log("💎 Testing Paid Proxy Endpoints (with x402)");
  console.log("============================================\n");

  // Show wallet info
  console.log("💳 Your Wallet:");
  console.log(`Address: ${account.address}`);
  
  try {
    const ethBalance = await publicClient.getBalance({ address: account.address });
    const usdcBalance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [account.address],
    });
    
    console.log(`ETH Balance: ${formatEther(ethBalance)} ETH`);
    console.log(`USDC Balance: ${formatUnits(usdcBalance, 6)} USDC`);
  } catch (error) {
    console.log("Balance check failed (network issue)");
  }
  
  console.log("\n📋 Fetching paid endpoints...\n");
  
  try {
    const listResponse = await fetch(`${SERVER_URL}/endpoints/json`);
    const endpoints = await listResponse.json();
    
    if (endpoints.length === 0) {
      console.log("❌ No endpoints available. Please run the seed script first:");
      console.log("   cd ../server && bun scripts/seed-endpoints.ts");
      return;
    }
    
    // Find paid endpoints
    const paidEndpoints = endpoints.filter((e: any) => e.requires_payment);
    
    if (paidEndpoints.length === 0) {
      console.log("⚠️  No paid endpoints available.");
      console.log("All endpoints are free. Use test-proxy.ts instead.");
      return;
    }
    
    console.log(`Found ${paidEndpoints.length} paid endpoint(s):\n`);
    
    paidEndpoints.forEach((ep: any) => {
      console.log(`- ${ep.name}: ${ep.price}`);
    });
    
    // Test the first paid endpoint
    const testEndpoint = paidEndpoints[0];
    
    console.log(`\n\n🔄 Testing: ${testEndpoint.name}`);
    console.log(`   Price: ${testEndpoint.price} per request`);
    console.log(`   Proxy URL: ${SERVER_URL}${testEndpoint.proxy_url}`);
    console.log("-".repeat(50));
    
    console.log("\n⚠️  This will charge your wallet!");
    console.log("Proceeding with payment in 3 seconds...\n");
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      console.log("💸 Making paid request...");
      
      // Use fetchWithPayment for automatic payment handling
      const response = await fetchWithPayment(
        `${SERVER_URL}${testEndpoint.proxy_url}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!response.ok) {
        console.log(`❌ Request failed with status: ${response.status}`);
        const error = await response.text();
        console.log("Error:", error);
        return;
      }
      
      const data = await response.json();
      
      console.log(`\n✅ Success! Payment processed.`);
      console.log(`📦 Response:`);
      console.log(JSON.stringify(data, null, 2).substring(0, 500));
      
      if (JSON.stringify(data).length > 500) {
        console.log("... (truncated)");
      }
      
      // Check payment details from response headers
      const paymentHeader = response.headers.get("x-payment-response");
      if (paymentHeader) {
        console.log("\n💰 Payment Details:");
        const payment = decodeXPaymentResponse(paymentHeader);
        console.log(`Transaction: ${payment.txHash || "Processing..."}`);
        console.log(`Network: base-sepolia`);
      }
      
    } catch (error: any) {
      console.log(`\n❌ Error:`, error.message || error);
      
      if (error.message?.includes("insufficient")) {
        console.log("\n💡 You need Base Sepolia USDC to make payments.");
        console.log("Get testnet tokens from: https://faucet.circle.com/");
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    console.log("\n⚠️  Make sure the server is running:");
    console.log("   cd ../server && bun dev");
  }
  
  console.log("\n\n💡 Tips:");
  console.log("- Each request costs the specified amount in USDC");
  console.log("- Payments are processed on Base Sepolia testnet");
  console.log("- Get test USDC from: https://faucet.circle.com/");
  console.log("- Transaction details are included in response headers");
}

// Run the script
testPaidProxy().catch(console.error);