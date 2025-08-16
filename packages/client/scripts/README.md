# Client Scripts Documentation

This directory contains scripts for the x402 API marketplace, organized by use case.

## Architecture Overview

The x402 marketplace uses two different wallet types:

1. **Client Wallets** (for API buyers/Claude Code) - Local viem wallets that make x402 payments
2. **Seller Wallets** (for API sellers) - CDP wallets that receive payments, managed by Coinbase

## Directory Structure

```
scripts/
├── client/                    # For API buyers (Claude Code users)
│   ├── generate-wallet.ts     # Generate local wallet for payments
│   └── test-payment.ts        # Test x402 payments
│
├── endpoint-management/        # For API sellers
│   ├── create-seller-wallet.ts # Create CDP wallet to receive payments
│   └── register-api.ts        # Register API with payment wallet
│
├── deprecated-cdp/            # Old CDP client scripts (no longer used)
│
└── *.ts                      # General utility scripts
```

## For API Buyers (Claude Code Users)

These scripts use **local wallets** with x402-fetch for automatic payment handling.

### 🔑 Generate Client Wallet

```bash
bun scripts/client/generate-wallet.ts
```
- Generates a new local wallet using viem
- Private key stored locally (not on server)
- Used for making x402 payments to APIs

### 💳 Test x402 Payment

```bash
# First set your private key in .env
echo "PRIVATE_KEY=0x..." >> .env

# Then test a payment
bun scripts/client/test-payment.ts
```
- Makes a test payment to a registered API
- Uses x402-fetch for automatic payment flow
- Shows transaction details and response

## For API Sellers

These scripts use **CDP wallets** managed by Coinbase to receive payments.

### 💰 Create Seller Wallet

```bash
bun scripts/endpoint-management/create-seller-wallet.ts
```
- Creates a CDP wallet via server
- Keys secured in Coinbase's TEE
- Returns API key for wallet management
- This wallet receives payments when your API is called

### 📝 Register API Endpoint

```bash
bun scripts/endpoint-management/register-api.ts
```
- Registers your API in the marketplace
- Sets up x402 payment requirement
- Payments go to your CDP seller wallet
- Returns proxy URL for buyers to use

## General Utility Scripts

### 📋 List Available APIs

```bash
bun scripts/list-apis.ts
```
Shows all registered APIs in the marketplace.

### 🏠 Get Wallet Address

```bash
bun scripts/get-address.ts
```
### Execute 

```bash
bun scripts/test-proxy.ts 
```


Shows your local wallet address and balance.

## Quick Start Flows

### For API Buyers (Claude Code)

1. **Generate a wallet:**
   ```bash
   bun scripts/client/generate-wallet.ts
   ```

2. **Add private key to .env:**
   ```bash
   echo "PRIVATE_KEY=0x..." >> .env
   ```

3. **Fund wallet with testnet tokens:**
   - ETH: https://www.basefaucet.com/
   - USDC: https://faucet.circle.com/

4. **Make x402 payments:**
   ```bash
   bun scripts/client/test-payment.ts
   ```

### For API Sellers

1. **Create CDP wallet to receive payments:**
   ```bash
   bun scripts/endpoint-management/create-seller-wallet.ts
   ```

2. **Register your API:**
   ```bash
   bun scripts/endpoint-management/register-api.ts
   ```

3. **Share your API endpoint:**
   - Buyers can call your proxy URL
   - Payments automatically go to your CDP wallet

## Network Information

All scripts use **Base Sepolia** testnet:
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

## Key Differences from Old Architecture

### Old (Deprecated)
- CDP wallets used for both buyers and sellers
- Server managed all wallet operations
- Complex signing delegation

### New (Current)
- **Buyers**: Local viem wallets, no server dependency
- **Sellers**: CDP wallets for receiving payments only
- Clean separation of concerns
- Follows x402 best practices from Coinbase docs

## Troubleshooting

**"Server is not running"**
```bash
cd server && bun dev
```

**"No CDP credentials"**
- Only needed for sellers
- Add to server/.env: CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET

**"Insufficient balance"**
- Fund your wallet using the faucet links above

**"Cannot find module"**
```bash
cd client && bun install
```