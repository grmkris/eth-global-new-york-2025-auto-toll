#!/usr/bin/env bun

import { mnemonicToAccount, english, generateMnemonic } from "viem/accounts";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import type { Account } from "viem";

/**
 * Client-side wallet for x402 payments
 * This wallet runs entirely on the client side - no server dependency
 */

// Generate a new random wallet with mnemonic
export function generateWallet() {
  const mnemonic = generateMnemonic(english);
  const account = mnemonicToAccount(mnemonic);
  
  return {
    mnemonic,
    address: account.address,
    account
  };
}

// Get wallet balance
export async function getBalance(address: `0x${string}`) {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  
  const balance = await publicClient.getBalance({ address });
  
  return {
    wei: balance,
    eth: formatEther(balance)
  };
}

// Save wallet to file (for persistence)
export async function saveWallet(mnemonic: string, filename = ".wallet.json") {
  const wallet = {
    mnemonic,
    network: "base-sepolia",
    created: new Date().toISOString()
  };
  
  await Bun.write(filename, JSON.stringify(wallet, null, 2));
  console.log(`✅ Wallet saved to ${filename}`);
}


// Helper to make x402 protected API calls
export async function callProtectedEndpoint(
  endpoint: string,
  account: Account,
  baseUrl = "http://localhost:3000"
) {
  const fetchWithPayment = wrapFetchWithPayment(fetch, account);
  const url = `${baseUrl}${endpoint}`;
  
  console.log(`📡 Calling protected endpoint: ${endpoint}`);
  
  try {
    const response = await fetchWithPayment(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    
    const data = await response.json();
    
    // Check for payment info
    const paymentHeader = response.headers.get("x-payment-response");
    if (paymentHeader) {
      const paymentInfo = decodeXPaymentResponse(paymentHeader);
      return { data, paymentInfo };
    }
    
    return { data, paymentInfo: null };
  } catch (error) {
    console.error("❌ Request failed:", error);
    throw error;
  }
}

// Export helper functions
export { decodeXPaymentResponse };

// Display wallet info
export function displayWallet(wallet: { address: string; mnemonic: string }) {
  console.log("🔑 Client Wallet Generated");
  console.log("========================");
  console.log(`Address: ${wallet.address}`);
  console.log(`\nMnemonic (12 words):`);
  console.log(`${wallet.mnemonic}`);
  console.log(`\nNetwork: Base Sepolia (Chain ID: 84532)`);
  console.log("\n⚠️  IMPORTANT: Save your mnemonic phrase securely!");
  console.log("This is your wallet backup - write it down!");
  console.log("\n💰 Get testnet funds:");
  console.log("- ETH: https://www.basefaucet.com/");
  console.log("- USDC: https://faucet.circle.com/");
}