# 🤖💰 AutoToll: Where AI Agents Get Crypto Wallets

<div align="center">

**The First MCP Server with Integrated Crypto Payments**

[![ETHGlobal NYC 2025](https://img.shields.io/badge/ETHGlobal-NYC%202025-blue)](https://ethglobal.com)
[![x402 Protocol](https://img.shields.io/badge/x402-Protocol-green)](https://x402.io)
[![Base Sepolia](https://img.shields.io/badge/Base-Sepolia-orange)](https://base.org)
[![MCP Integration](https://img.shields.io/badge/MCP-Claude%20Desktop-purple)](https://modelcontextprotocol.org)

**🎯 Live Wallet:** `0xc1a777CAbbd71401A7c5B86F32Cfd578086E7338`  
**💰 Balance:** 1.94 USDC | 0.002 ETH  
**🌐 Network:** Base Sepolia

</div>

---

## 🎪 The Magic Show: Watch AI Pay for APIs in Real-Time

### Just Generated These Using AutoToll (With Real Payments!)

```json
🤖 Chuck Norris Joke API Call
{
  "joke": "Lance Armstrong finally admitted to his steroid use simply because Chuck Norris warned him that he would bite the other one off.",
  "cost": "$0.0011",
  "tx": "0xecf5ccd306101f9d7ee42ef46ee561c0f2f8da024a228b78f6581e2c2f5f7d8c"
}

🐱 Cat Facts API Call  
{
  "fact": "When a cat drinks, its tongue - which has tiny barbs on it - scoops the liquid up backwards.",
  "cost": "$0.0012",
  "tx": "0xf32516e87594aa80531bc0563303d2c21f4976863878d2d9924d44a63f15b4f5"
}
```

**These aren't mock responses - these are REAL API calls with REAL crypto payments happening automatically!**

---

## 🚀 The Problem We're Solving

**Before AutoToll:**
- 🔑 AI agents can't manage API keys
- 💳 They can't handle payments
- 🤯 Every API integration needs custom code
- 😩 Developers manually handle billing

**With AutoToll:**
- ✅ AI agents have their own crypto wallets
- ✅ Automatic micropayments per API call
- ✅ Any API becomes AI-accessible instantly
- ✅ API providers get paid automatically

---

## 🏗️ How It Works

```
┌──────────────────┐
│  Claude/AI Agent │  "I need weather data"
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   MCP Tools      │  wallet_info, list_apis, call_api
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ AutoToll Gateway │  Handles auth & payments transparently
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Any API │ │ USDC Pay │ Automatic micropayments
└─────────┘ └──────────┘
```

---

## 📺 Live Demo: See It In Action

### 1️⃣ Check AI Agent's Wallet
```bash
# Claude can check its own balance
> "What's my wallet balance?"

Wallet: 0xc1a777CAbbd71401A7c5B86F32Cfd578086E7338
Balance: 1.94 USDC | 0.002 ETH
Network: Base Sepolia
```

### 2️⃣ Browse the API Marketplace
```bash
# Claude discovers available APIs
> "List available APIs"

🎯 Chuck Norris Jokes - $0.0011 per request
🐱 Cat Facts - $0.0012 per request  
🎙️ ElevenLabs TTS - $0.014 per request
🔊 Sound Effects - $0.015 per request
🤖 Replicate AI - $0.003 per request
```

### 3️⃣ Call Any API (Payment Automatic!)
```bash
# Claude uses an API and pays automatically
> "Get me a Chuck Norris joke"

Response: [joke here]
Payment: $0.0011 sent
TX: 0xecf5ccd306101f9d7ee42ef46ee561c0f2f8da024a228b78f6581e2c2f5f7d8c
```

---

## 🎯 Why This Changes Everything

### For AI Developers
- **Zero Configuration**: No API keys to manage
- **Instant Access**: Use any API immediately
- **Transparent Costs**: See exactly what you're paying
- **One Integration**: All APIs through one gateway

### For API Providers
- **Instant Monetization**: Start earning in 30 seconds
- **No Billing Infrastructure**: We handle everything
- **Flexible Pricing**: Set your own rates
- **Direct Payments**: USDC straight to your wallet

### For the AI Economy
- **Autonomous Agents**: AIs can transact independently
- **Micropayments**: Pay only for what you use
- **Open Marketplace**: Anyone can list their API
- **Decentralized**: No middleman controls access

---

## 🚀 Quick Start

### For Claude Desktop Users (2 Minutes)

1. **Install MCP Server**
```bash
cd packages/mcp
bun install
```

2. **Add to Claude Config**
```json
{
  "mcpServers": {
    "x402-marketplace": {
      "command": "bun",
      "args": ["/path/to/packages/mcp/mcp-server.ts"],
      "env": {
        "MNEMONIC": "your twelve word mnemonic",
        "SERVER_URL": "http://localhost:3000"
      }
    }
  }
}
```

3. **Start Using APIs in Claude**
```
"List available APIs"
"Call the joke API"
"Check my wallet balance"
```

### For API Providers (30 Seconds)

```bash
# Register your API
cd packages/client
bun run add \
  --name "Your API" \
  --url "https://api.example.com" \
  --price "$0.001"

# Start earning immediately!
```

---

## 💡 Real Use Cases

### 🎨 AI Art Generation
```javascript
// Replicate API - $0.003 per image
await callAPI("Lut2zppmh6", {
  path: "/predictions",
  body: { 
    model: "stability-ai/sdxl",
    input: { prompt: "cyberpunk city" }
  }
})
```

### 🎙️ Voice Generation
```javascript
// ElevenLabs TTS - $0.014 per request
await callAPI("xFzOnwaKMu", {
  path: "/text-to-speech",
  body: { 
    text: "Hello from AutoToll!",
    voice: "rachel"
  }
})
```

### 📊 Data APIs
```javascript
// Any data API - pay per request
await callAPI("your-api-id", {
  path: "/data/latest",
  params: { format: "json" }
})
```

---

## 🛠️ Technical Architecture

### Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| MCP Server | TypeScript/Bun | Claude Desktop integration |
| Gateway | Hono/Node.js | API proxy & payment processor |
| Payments | x402 Protocol | HTTP 402 implementation |
| Blockchain | Base Sepolia | Fast, cheap transactions |
| Currency | USDC | Stable payments |

### Smart Contracts
- **Network**: Base Sepolia (Chain ID: 84532)
- **USDC Contract**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Payment Protocol**: x402 (HTTP 402 Payment Required)

### How x402 Works
1. Client requests API → Receives 402 Payment Required
2. Client signs payment authorization
3. Server verifies and processes payment
4. API response delivered
5. All automatic, sub-second!

---

## 🏆 ETHGlobal NYC 2025 Tracks

### 🪙 Coinbase CDP Track
- Using x402 protocol and CDP wallets
- Seamless USDC payments on Base
- Non-custodial wallet management

### 🤖 Best AI Experience
- First MCP with integrated payments
- AI agents with financial autonomy
- Zero-friction API marketplace

### 🌉 Cross-chain Ready
- LayerZero/Chainlink integration ready
- Multi-chain payment support planned
- Universal API access layer

### 🏗️ Infrastructure Track
- Core payment rails for API economy
- Decentralized API marketplace
- Developer-first design

---

## 📦 Repository Structure

```
autotoll/
├── packages/
│   ├── mcp/          # MCP server for Claude Desktop
│   ├── server/       # AutoToll gateway & x402 handler
│   └── client/       # CLI tools & utilities
├── assets/           # Demo files & examples
└── experiments/      # Hackathon experiments
```

---

## 🎮 Try It Now!

### Live Endpoints (No Setup Required!)

```bash
# Get a joke (requires payment)
curl http://localhost:3000/paid-proxy/eSAs8uq77Q

# Get cat facts (requires payment)
curl http://localhost:3000/paid-proxy/ByxMm-Cntm

# List all APIs
curl http://localhost:3000/endpoints
```

### Fund Your Test Wallet
- **ETH**: [Base Sepolia Faucet](https://www.basefaucet.com/)
- **USDC**: [Circle Faucet](https://faucet.circle.com/)

---

## 🎬 Demo Script for Judges

### 1. The Problem (30 seconds)
"AI agents like Claude can write code, analyze data, but they can't use APIs because they can't manage API keys or handle payments."

### 2. The Solution (30 seconds)
"AutoToll gives AI agents their own crypto wallets. They can discover APIs, make payments, and access any service autonomously."

### 3. Live Demo (1 minute)
1. Show Claude's wallet balance
2. Browse available APIs
3. Make an API call with automatic payment
4. Show the transaction on Base Sepolia

### 4. For Developers (30 seconds)
"Any developer can register their API in 30 seconds and start earning. No billing infrastructure needed."

### 5. The Vision (30 seconds)
"We're building the payment rails for the AI economy. Every API becomes a toll road, every request pays automatically."

---

## 🌟 What Makes AutoToll Special

1. **First of Its Kind**: The only MCP server with integrated crypto payments
2. **Real Transactions**: Not a demo - real money, real APIs, real value
3. **Developer Friendly**: APIs monetized in seconds, not months
4. **AI Native**: Built for autonomous agents from day one
5. **Open Protocol**: Based on x402 standard, not proprietary

---

## 🚧 Hackathon Journey

Built with ❤️ at ETHGlobal New York 2025 by Kristjan

**Timeline:**
- Hour 1-4: x402 protocol implementation
- Hour 5-8: MCP server development  
- Hour 9-12: API marketplace & gateway
- Hour 13-16: Testing & demo preparation
- Hour 17-20: Documentation & presentation
- Hour 21-24: Polish & ship!

---

## 📞 Contact & Links

- **GitHub**: [AutoToll Repository](https://github.com/your-repo)
- **Demo Video**: [Watch on YouTube](#)
- **X/Twitter**: [@your-handle](#)
- **ETHGlobal Project**: [AutoToll Submission](#)

---

<div align="center">

**🛣️ Every API is a road. Every request pays a toll. Welcome to AutoToll.**

Built for the future where AI agents have economic agency.

</div>