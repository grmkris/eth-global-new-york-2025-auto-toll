# x402 Client

A client for testing and interacting with x402-enabled proxy endpoints that support micropayments on Base Sepolia.

## Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Configure your wallet:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your mnemonic phrase:
   ```env
   MNEMONIC="your twelve word mnemonic phrase here"
   ACCOUNT_INDEX=0  # Optional: change to use different account
   API_URL=http://localhost:3000
   ```

3. **Get test tokens:**
   - Visit [Circle's Faucet](https://faucet.circle.com/)
   - Select Base Sepolia network
   - Request USDC tokens for your wallet address

## Quick Start

```bash
# Check your wallet address and balances
bun run wallet

# List all available endpoints
bun run list

# Test a specific endpoint
bun run test JWEXDNX-r4
bun run test http://localhost:3000/paid-proxy/JWEXDNX-r4

# Add a new endpoint
bun run add --name "Cat Facts" --url "https://catfact.ninja/fact" --auth "none"
```

## Commands

### 📋 List Endpoints
```bash
bun run list
```
Shows all registered API endpoints with their IDs, URLs, and payment requirements.

### ➕ Add Endpoint
```bash
bun run add --name <name> --url <url> --auth <type> [options]
```

**Required arguments:**
- `--name` - API endpoint name
- `--url` - Target API URL
- `--auth` - Authentication type: `none`, `bearer`, or `query_param`

**Optional arguments:**
- `--auth-key` - Auth parameter name (required for `query_param` auth)
- `--auth-value` - Auth token/API key value
- `--paid` - Mark as paid endpoint (default: free)
- `--price` - Price per request (default: $0.001)
- `--wallet` - Wallet address for payments (required for paid endpoints)

### 🧪 Test Endpoint
```bash
bun run test <endpoint-id|url>
```

Test a specific endpoint by ID or full URL:
- By ID: `bun run test JWEXDNX-r4`
- By URL: `bun run test http://localhost:3000/proxy/JWEXDNX-r4`

### 💳 Check Wallet
```bash
bun run wallet
```
Display your wallet address and current ETH/USDC balances.

## Examples

### Adding Endpoints

**Free public API:**
```bash
bun run add --name "Cat Facts" --url "https://catfact.ninja/fact" --auth "none"
```

**Paid API with bearer token:**
```bash
bun run add \
  --name "OpenAI GPT" \
  --url "https://api.openai.com/v1/completions" \
  --auth "bearer" \
  --auth-value "sk-..." \
  --paid \
  --price "$0.01" \
  --wallet "0x7E5Dc1F5d8AdAaceb0C8472E04228Ff0003A67bE"
```

**API with query parameter authentication:**
```bash
bun run add \
  --name "Weather API" \
  --url "https://api.openweathermap.org/data/2.5/weather" \
  --auth "query_param" \
  --auth-key "appid" \
  --auth-value "your_api_key" \
  --paid \
  --wallet "0x7E5Dc1F5d8AdAaceb0C8472E04228Ff0003A67bE"
```

### Testing Endpoints

1. **List available endpoints:**
   ```bash
   bun run list
   ```

2. **Test a specific endpoint:**
   ```bash
   # Using endpoint ID
   bun run test vjPw2fVLXA
   
   # Using full URL
   bun run test http://localhost:3000/paid-proxy/vjPw2fVLXA
   ```

## How It Works

### Endpoint Types

1. **Free Endpoints** (`/proxy/*`):
   - No payment required
   - Direct proxy to external APIs
   - Instant response

2. **Paid Endpoints** (`/paid-proxy/*`):
   - Requires USDC payment on Base Sepolia
   - Uses x402 protocol for automatic payment handling
   - Payment details included in response headers
   - Transactions are processed on-chain

### Payment Flow

When accessing paid endpoints:

1. Client makes request to `/paid-proxy/endpoint-id`
2. Server responds with 402 Payment Required + payment details
3. Client automatically:
   - Signs a USDC transfer transaction
   - Sends payment to the API provider
   - Retries request with payment proof
4. Server validates payment and returns API response

## Wallet Management

The client uses a hierarchical deterministic wallet from your mnemonic:

- **Default account**: Index 0
- **Change account**: Set `ACCOUNT_INDEX` in `.env`
- **Network**: Base Sepolia (testnet)
- **Currency**: USDC (test tokens)

## Troubleshooting

### No endpoints available
Run the server's seed script first:
```bash
cd ../server && bun scripts/seed-endpoints.ts
```

### Insufficient USDC balance
Get test tokens from [Circle's Faucet](https://faucet.circle.com/)

### Connection errors
Ensure the server is running:
```bash
cd ../server && bun dev
```

### Invalid proxy URL format
URLs must follow the pattern:
- Free: `http://localhost:3000/proxy/[endpoint-id]`
- Paid: `http://localhost:3000/paid-proxy/[endpoint-id]`

## Advanced Usage

### Custom API URL
Set a different server URL in `.env`:
```env
API_URL=https://your-server.com
```

### Multiple Wallets
Use different account indices:
```env
ACCOUNT_INDEX=1  # Uses second account from mnemonic
```

## Security Notes

- Never commit your `.env` file with real mnemonics
- This is for testnet use only
- Always use test tokens on testnets
- Production deployments should use secure key management