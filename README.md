# 🛣️ AutoToll

**Every API is a road. Every request pays a toll.**

AutoToll is an automated micropayment protocol for APIs, enabling seamless discovery and consumption for both AI agents and developers. Built on the x402 protocol with USDC payments on Base, AutoToll transforms APIs into toll roads where access is instant, payments are automatic, and monetization is frictionless.

## 🎯 ETHGlobal New York 2025

Built for the AI agent economy where autonomous systems need to discover, access, and pay for APIs without human intervention.

## ✨ Key Features

### For API Consumers (Agents & Developers)
- **🤖 Agent-First Design** - AI agents can discover and use APIs autonomously
- **💳 Automatic Payments** - No manual payment setup, just like EZ-Pass for APIs
- **🔍 Seamless Discovery** - Browse and test APIs instantly through MCP or web interface
- **⚡ Instant Access** - Start using APIs immediately, pay per request

### For API Providers
- **💰 Instant Monetization** - Turn any API into a revenue stream
- **🎛️ Flexible Pricing** - Set your own toll rates per request
- **🔒 Built-in Auth Handling** - We manage API keys and authentication
- **📊 Zero Setup** - Just provide your API URL and start collecting tolls

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  AI Agents/     │────▶│   AutoToll   │────▶│  External APIs  │
│  Developers     │◀────│   Gateway    │◀────│  (Your APIs)    │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │                      │                       │
        └──────────────────────┴───────────────────────┘
                    Automatic USDC Payments
                      (Base Sepolia)
```

## 🚀 Quick Start

### For API Consumers

1. **Install MCP for Claude Desktop**
   ```bash
   cd packages/mcp
   bun install
   # Add to Claude Desktop config
   ```

2. **Use the Client CLI**
   ```bash
   cd packages/client
   bun install
   
   # List available APIs
   bun run list
   
   # Test an API (automatic payment)
   bun run test <api-id>
   ```

### For API Providers

1. **Register Your API**
   ```bash
   cd packages/client
   bun run add --name "Your API" --url "https://api.example.com" --price "$0.001"
   ```

2. **Start Collecting Tolls**
   - Every request automatically processes payment
   - Funds go directly to your wallet
   - Monitor earnings in real-time

## 📦 Packages

- **`/packages/server`** - AutoToll gateway server
- **`/packages/client`** - CLI for testing and managing APIs  
- **`/packages/mcp`** - MCP server for Claude Desktop integration

## 🛠️ Technologies

- **x402 Protocol** - HTTP 402 Payment Required standard
- **Base Sepolia** - L2 for fast, cheap transactions
- **USDC** - Stable payments in USD
- **MCP** - Model Context Protocol for AI agents
- **Hono** - Lightweight web framework
- **Bun** - Fast JavaScript runtime

## 🎪 Use Cases

- **AI Agents** - Autonomous systems that need to pay for API access
- **API Marketplaces** - Monetize any API instantly
- **Microservices** - Charge for compute-intensive operations
- **Data Feeds** - Sell access to real-time data
- **Tool Libraries** - Monetize developer tools and utilities

## 🏆 Hackathon Tracks

AutoToll is competing in:
- **Coinbase CDP** - Using x402 and CDP Wallets
- **Best AI Experience** - MCP integration for autonomous agents
- **Cross-chain** - LayerZero/Chainlink for multi-chain support
- **Infrastructure** - Core payment rails for the API economy

## 📄 License

MIT

---

Built with ❤️ at ETHGlobal New York 2025