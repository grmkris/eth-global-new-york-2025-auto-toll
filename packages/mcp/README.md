# AutoToll MCP Server for Claude Desktop

MCP server that enables Claude to interact with AutoToll payment-enabled APIs and manage onchain wallets on Base Sepolia. Every API is a road, every request pays a toll - all automated for AI agents.

## Quick Setup for Claude Desktop

### 1. Install Dependencies

```bash
cd packages/mcp
bun install
```

### 2. Configure Claude Desktop

Add to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "x402-marketplace": {
      "command": "bun",
      "args": [
        "/absolute/path/to/packages/mcp/mcp-server.ts"
      ],
      "env": {
        "MNEMONIC": "your twelve word mnemonic phrase goes here",
        "SERVER_URL": "http://localhost:3000",
        "ACCOUNT_INDEX": "0"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/` with your actual project path.

### 3. Set Up Wallet

**Option A: Use existing wallet**
- Add your mnemonic to the config above

**Option B: Generate new wallet**
- Start without MNEMONIC - it will generate one
- Copy the generated mnemonic and add to config
- Fund wallet with testnet tokens:
  - ETH: https://www.basefaucet.com/
  - USDC: https://faucet.circle.com/

### 4. Start Services

First, start the x402 server:
```bash
cd ../server
bun dev
```

Then restart Claude Desktop to load the MCP server.

## Available MCP Tools

### `wallet_info`
Check your wallet balance and address
- Shows ETH and USDC balances
- Displays wallet address
- Network: Base Sepolia

### `generate_wallet`
Generate a new wallet for x402 payments
- Creates new mnemonic phrase
- Returns wallet address
- Save the mnemonic securely!

### `list_apis`
Browse available APIs in the marketplace
- Optional search parameter
- Shows API names, IDs, and prices
- Indicates free vs paid endpoints

### `api_info`
Get detailed information about a specific API
- Input: API ID
- Returns full endpoint details
- Shows payment requirements

### `call_api`
Execute API calls with automatic x402 payment
- Handles both free and paid endpoints
- Automatic payment for x402-protected APIs
- Supports GET, POST, PUT, DELETE
- Returns response and payment details

## Example Usage in Claude

Ask Claude:
- "List available APIs"
- "Get info about API xyz123"
- "Call API xyz123 with path /data"
- "Check my wallet balance"
- "Generate a new wallet"

## Development Mode

For testing with bun directly:
```bash
cd packages/mcp
bun dev
```

## Production Build

To build for production:
```bash
bun build mcp-server.ts --outdir dist --target node
```

Then update Claude config to use:
```json
{
  "command": "node",
  "args": ["/path/to/packages/mcp/dist/mcp-server.js"]
}
```

## Troubleshooting

1. **MCP not showing in Claude**: Restart Claude Desktop after config changes
2. **Wallet has no funds**: Get testnet tokens from faucets above
3. **Server connection failed**: Ensure x402 server is running on port 3000
4. **Payment failed**: Check USDC balance for paid endpoints
5. **Path issues**: Use absolute paths in Claude config

## Network

- Chain: Base Sepolia
- Chain ID: 84532
- USDC Contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e