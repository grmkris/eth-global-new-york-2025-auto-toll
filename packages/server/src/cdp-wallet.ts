import { CdpClient } from "@coinbase/cdp-sdk";
import { nanoid } from 'nanoid';
import { db } from './db';
import { wallets } from './db/schema';
import { eq, sql } from 'drizzle-orm';
import { env } from './env';

interface CreateCdpWalletServiceParams {
  apiKeyId: string;
  apiKeySecret: string;
  walletSecret: string;
  network?: string;
}

export function createCdpWalletService(params: CreateCdpWalletServiceParams) {
  console.log("🔐 Initializing REAL CDP Client with credentials");
  
  // Initialize CDP client with v2 credentials - REAL CDP, NO MOCKING!
  const cdp = new CdpClient({
    apiKeyId: params.apiKeyId,
    apiKeySecret: params.apiKeySecret,
    walletSecret: params.walletSecret,
  });
  
  const network = params.network || "base-sepolia";
  console.log(`📍 Using network: ${network}`);
  
  return {
    async createWallet() {
      try {
        console.log("🚀 Creating REAL CDP wallet on Base Sepolia...");
        
        // Generate a unique name for this account (for retrieval)
        // CDP requires alphanumeric + hyphens only, no underscores
        const accountName = `agent-wallet-${nanoid(8).replace(/_/g, '-').toLowerCase()}`;
        console.log(`📝 Account name: ${accountName}`);
        
        // Create REAL EVM account with CDP - THIS IS REAL, NOT MOCK!
        console.log("⚡ Calling CDP API to create account...");
        const account = await cdp.evm.getOrCreateAccount({ 
          name: accountName,
        });
        
        console.log(`✅ REAL CDP account created: ${account.address}`);
        console.log(`🔍 Verify on explorer: https://sepolia.basescan.org/address/${account.address}`);
        
        // Generate our internal API key
        const apiKey = `wlt_${nanoid(24)}`;
        
        // Store account reference (no private keys!)
        await db.insert(wallets).values({
          apiKey,
          accountAddress: account.address,
          accountName, // Store name for retrieval
          network,
          balanceCache: "0"
        });
        
        console.log("💾 Wallet info saved to database");
        
        return {
          apiKey,
          address: account.address,
          accountName,
          network
        };
      } catch (error) {
        console.error("❌ Failed to create REAL CDP wallet:", error);
        throw new Error(`Failed to create REAL CDP wallet: ${JSON.stringify(error)}`);
      }
    },
    
    async getAccount(apiKey: string) {
      const [record] = await db.select()
        .from(wallets)
        .where(eq(wallets.apiKey, apiKey))
        .limit(1);
      
      if (!record) return null;
      
      // Update last used
      await db.update(wallets)
        .set({ lastUsed: new Date() })
        .where(eq(wallets.apiKey, apiKey));
      
      try {
        // Retrieve account by name from CDP
        if (record.accountName) {
          const account = await cdp.evm.getOrCreateAccount({ 
            name: record.accountName 
          });
          return account;
        }
        
        // If no name, we can only return the address
        return { address: record.accountAddress };
      } catch (error) {
        console.error("Failed to get account:", error);
        return { address: record.accountAddress };
      }
    },
    
    async getBalance(apiKey: string) {
      const [record] = await db.select()
        .from(wallets)
        .where(eq(wallets.apiKey, apiKey))
        .limit(1);
      
      if (!record) throw new Error("Wallet not found");
      
      try {
        // Get account from CDP
        const account = record.accountName 
          ? await cdp.evm.getOrCreateAccount({ name: record.accountName })
          : null;
        
        if (!account) {
          // Return cached balance if we can't get account
          return record.balanceCache || "0";
        }
        
        // Get balance directly from account
        // Note: v2 SDK doesn't have a direct balance method in docs
        // We'll need to use a different approach or cache the balance
        // For now, return cached balance
        return record.balanceCache || "0";
      } catch (error) {
        console.error("Failed to get balance:", error);
        return record.balanceCache || "0";
      }
    },
    
    async fundWallet(apiKey: string, token: string = "usdc") {
      const [record] = await db.select()
        .from(wallets)
        .where(eq(wallets.apiKey, apiKey))
        .limit(1);
      
      if (!record) throw new Error("Wallet not found");
      
      try {
        console.log(`💸 Requesting REAL ${token.toUpperCase()} from CDP faucet...`);
        console.log(`📍 Target address: ${record.accountAddress}`);
        
        // Request REAL testnet funds using CDP faucet - THIS IS REAL!
        const faucetResponse = await cdp.evm.requestFaucet({
          address: record.accountAddress,
          network: network as any, // base-sepolia
          token: token as any // eth or usdc
        });
        
        console.log(`✅ REAL faucet request successful!`);
        console.log(`📝 TX Hash: ${faucetResponse.transactionHash}`);
        console.log(`🔍 View on explorer: https://sepolia.basescan.org/tx/${faucetResponse.transactionHash}`);
        
        return {
          success: true,
          transactionHash: faucetResponse.transactionHash,
          amount: token.toUpperCase(),
          network
        };
      } catch (error) {
        console.error(`❌ REAL CDP faucet request failed for ${token}:`, error);
        throw new Error(`Failed to fund REAL wallet with ${token}: ${JSON.stringify(error)}`);
      }
    },
    
    
    async getWalletInfo(apiKey: string) {
      const [record] = await db.select()
        .from(wallets)
        .where(eq(wallets.apiKey, apiKey))
        .limit(1);
      
      if (!record) return null;
      
      return {
        address: record.accountAddress,
        accountName: record.accountName,
        network: record.network,
        balanceCache: record.balanceCache,
        totalSpent: record.totalSpent,
        apiCallsCount: record.apiCallsCount,
        createdAt: record.createdAt,
        lastUsed: record.lastUsed
      };
    },
    
    async updateWalletStats(apiKey: string, cost: number) {
      await db.update(wallets)
        .set({
          totalSpent: sql`${wallets.totalSpent} + ${cost}`,
          apiCallsCount: sql`${wallets.apiCallsCount} + 1`,
          lastUsed: new Date()
        })
        .where(eq(wallets.apiKey, apiKey));
    },
    
    async updateBalanceCache(apiKey: string, balance: string) {
      await db.update(wallets)
        .set({ balanceCache: balance })
        .where(eq(wallets.apiKey, apiKey));
    }
  };
}

// Create singleton instance
let walletServiceInstance: ReturnType<typeof createCdpWalletService> | null = null;

export function getCdpWalletService() {
  if (!walletServiceInstance) {
    if (!env.CDP_API_KEY_ID || !env.CDP_API_KEY_SECRET || !env.CDP_WALLET_SECRET) {
      console.error("❌ CDP credentials missing! Cannot use REAL CDP wallets.");
      throw new Error("CDP credentials not configured. Set CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET in environment.");
    }
    
    console.log("✅ CDP credentials found - initializing REAL CDP wallet service");
    console.log(`🔑 API Key ID: ${env.CDP_API_KEY_ID.substring(0, 8)}...`);
    console.log(`🌐 Network: ${env.NETWORK || "base-sepolia"}`);
    
    walletServiceInstance = createCdpWalletService({
      apiKeyId: env.CDP_API_KEY_ID,
      apiKeySecret: env.CDP_API_KEY_SECRET,
      walletSecret: env.CDP_WALLET_SECRET,
      network: env.NETWORK || "base-sepolia"
    });
    
    console.log("🎉 REAL CDP wallet service initialized successfully!");
  }
  
  return walletServiceInstance;
}