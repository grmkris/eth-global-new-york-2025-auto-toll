import { Hono } from 'hono'
import { getCdpWalletService } from '../cdp-wallet'
import { env } from '../env'

const app = new Hono()

// Wallet creation endpoint
app.post('/create', async (c) => {
  console.log('\n🔐 [WALLET CREATE] New CDP wallet creation request received')
  
  try {
    console.log('📡 [WALLET CREATE] Initializing CDP wallet service...')
    const walletService = getCdpWalletService()
    
    console.log('🚀 [WALLET CREATE] Creating new CDP wallet on', env.NETWORK || 'base-sepolia')
    const { apiKey, address, accountName, network } = await walletService.createWallet()
    
    console.log('✅ [WALLET CREATE] CDP wallet created successfully:')
    console.log(`   📍 Address: ${address}`)
    console.log(`   🔑 API Key: ${apiKey}`)
    console.log(`   📝 Account: ${accountName}`)
    console.log(`   🌐 Network: ${network}`)
    
    const baseUrl = env.BASE_URL || `http://localhost:${env.PORT}`
    
    return c.json({
      apiKey,
      address,
      accountName,
      network,
      instructions: [
        "1. Save your wallet address - you'll receive payments here",
        "2. Register your API endpoints using the /register endpoint",
        "3. Set your desired price per API call (e.g., $0.001)",
        "4. Share your proxy URL with buyers",
        "5. Monitor your earnings as buyers call your APIs"
      ]
    })
  } catch (error) {
    console.error("❌ [WALLET CREATE] Failed to create wallet:", error)
    return c.json({ 
      error: "Failed to create wallet", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500)
  }
})

// Wallet info endpoint
app.get('/info', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const apiKey = authHeader.substring(7)
  
  try {
    const walletService = getCdpWalletService()
    const info = await walletService.getWalletInfo(apiKey)
    
    if (!info) {
      return c.json({ error: 'Wallet not found' }, 404)
    }
    
    return c.json(info)
  } catch (error) {
    return c.json({ error: 'Failed to get wallet info' }, 500)
  }
})

// Wallet fund endpoint
app.post('/fund', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const apiKey = authHeader.substring(7)
  console.log(`\n💸 [WALLET FUND] Funding request for wallet ${apiKey.substring(0, 12)}...`)
  
  try {
    const { token = 'usdc' } = await c.req.json()
    console.log(`📡 [WALLET FUND] Requesting ${token.toUpperCase()} from testnet faucet...`)
    
    const walletService = getCdpWalletService()
    const result = await walletService.fundWallet(apiKey, token)
    
    console.log(`✅ [WALLET FUND] Successfully funded with ${token.toUpperCase()}`)
    console.log(`   📝 Transaction: ${result.transactionHash}`)
    
    return c.json(result)
  } catch (error) {
    console.error('Failed to fund wallet:', error)
    return c.json({ 
      error: 'Failed to fund wallet', 
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500)
  }
})

// List all wallets endpoint
app.get('/list', async (c) => {
  console.log('\n📋 [WALLET LIST] Fetching all wallets...')
  
  try {
    const walletService = getCdpWalletService()
    const wallets = await walletService.getAllWallets()
    
    console.log(`✅ [WALLET LIST] Found ${wallets.length} wallets`)
    
    // Return wallets with masked API keys for security
    const maskedWallets = wallets.map(wallet => ({
      ...wallet,
      apiKey: wallet.apiKey ? `${wallet.apiKey.substring(0, 8)}...${wallet.apiKey.substring(wallet.apiKey.length - 4)}` : '',
      fullApiKey: wallet.apiKey // Include full key but client should handle securely
    }))
    
    return c.json(maskedWallets)
  } catch (error) {
    console.error('❌ [WALLET LIST] Failed to list wallets:', error)
    return c.json({ 
      error: 'Failed to list wallets', 
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500)
  }
})

export default app