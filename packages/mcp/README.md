# x402 MCP Server for Claude

This MCP (Model Context Protocol) server enables Claude to interact with the x402 API marketplace, providing wallet management and automatic payment handling for paid APIs.

## Features

- 🔑 Local wallet management with mnemonic phrases
- 💰 Automatic x402 payment handling for paid APIs
- 🔍 Browse and search available APIs
- 📡 Call APIs with automatic payment if required
- 💳 Check wallet balance (ETH and USDC)
- 🔄 Generate new wallets on demand

## Available Tools

### `wallet_info`
Get your local wallet address and balance on Base Sepolia.

### `generate_wallet`
Generate a new wallet for x402 payments. Returns a mnemonic phrase that should be saved securely.

### `list_apis`
Browse available APIs in the marketplace. Supports optional search filtering.

### `call_api`
Call an API endpoint with automatic x402 payment handling if required.

### `api_info`
Get detailed information about a specific API including pricing and endpoint details.

## Setup

### 1. Install Dependencies

```bash
cd packages/mcp
bun install
```

### 2. Configure Environment

Create a `.env` file in the MCP package directory:

```env
# Optional: Your wallet mnemonic (will generate if not provided)
MNEMONIC="your twelve word mnemonic phrase here"

# Server URL (default: http://localhost:3000)
SERVER_URL=http://localhost:3000

# Wallet configuration
ACCOUNT_INDEX=0
```

### 3. Build the MCP Server

```bash
bun run build
```

### 4. Configure Claude Desktop

Add the MCP server to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "x402-marketplace": {
      "command": "node",
      "args": ["/path/to/packages/mcp/dist/mcp-server.js"],
      "env": {
        "MNEMONIC": "your wallet mnemonic here",
        "SERVER_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Development

### Run in Development Mode

```bash
bun run dev
```

### Testing

Test the MCP server connectivity:

```bash
bun mcp-server.ts
```

## Wallet Management

### Getting Testnet Funds

- **ETH (Base Sepolia)**: https://www.basefaucet.com/
- **USDC (Base Sepolia)**: https://faucet.circle.com/

### Security

- Store your mnemonic phrase securely
- Never share your mnemonic phrase
- Use a dedicated wallet for testing
- Keep only small amounts for API payments

## Network Information

- **Network**: Base Sepolia
- **Chain ID**: 84532
- **USDC Contract**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Troubleshooting

### Wallet not found
If you see "No MNEMONIC found", the server will generate an ephemeral wallet. Save the generated mnemonic to persist the wallet.

### Insufficient funds
Ensure your wallet has sufficient ETH for gas and USDC for API payments. Use the testnet faucets listed above.

### Connection issues
Verify the SERVER_URL points to your running x402 marketplace server.

## License

MIT