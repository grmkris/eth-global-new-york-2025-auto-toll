import { createPublicClient, createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { env } from "./env";

// Check for mnemonic
if (!env.MNEMONIC) {
  console.error("❌ Please set MNEMONIC in .env file");
  console.log("Copy .env.example to .env and add your mnemonic phrase");
  process.exit(1);
}

// Create wallet account from mnemonic
export const account = mnemonicToAccount(env.MNEMONIC, {
  accountIndex: env.ACCOUNT_INDEX,
  addressIndex: 0,
});

// Create wallet client
export const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
})

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

// Export API URL
export const API_URL = env.API_URL;

// Create fetch with payment capabilities
export const fetchWithPayment = wrapFetchWithPayment(fetch, account);

// Helper to decode payment responses
export { decodeXPaymentResponse };

// Helper function to make protected API calls
export async function callProtectedEndpoint(endpoint: string) {
  const url = `${API_URL}${endpoint}`;
  
  console.log(`\n📡 Calling ${endpoint}...`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetchWithPayment(url, {
      method: "GET",
    });

    if (response.status === 402) {
      console.log("💰 Payment required - handling payment flow...");
    }

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Success! Response:", JSON.stringify(data, null, 2));
      
      const paymentResponseHeader = response.headers.get("x-payment-response");
      if (paymentResponseHeader) {
        const paymentResponse = decodeXPaymentResponse(paymentResponseHeader);
        console.log("💳 Payment details:", paymentResponse);
      }
      
      return data;
    } else {
      const error = await response.text();
      console.error("❌ Error:", error);
      throw new Error(error);
    }
  } catch (error) {
    console.error("❌ Request failed:", error);
    throw error;
  }
}