# Experiments Context

## Overview
The experiments directory is where we test and demonstrate AutoToll's capabilities by creating practical examples using the MCP (Model Context Protocol) integration to interact with APIs through the x402 marketplace.

## Directory Structure
```
experiments/
├── context.md                 # This file - explains experiment framework
├── 001-landing-page/          # First experiment
│   ├── index.html            # Landing page with AI-generated assets
│   ├── narration.mp3         # Generated voice file
│   └── experiment-log.md     # Detailed tracking of API usage and costs
└── [future experiments]/
```

## How Experiments Work

### 1. **MCP Integration**
We use MCP tools to interact with the AutoToll marketplace:
- `mcp__x402-marketplace__list_apis` - Browse available APIs
- `mcp__x402-marketplace__call_api` - Call APIs with automatic payment
- `mcp__x402-marketplace__api_info` - Get API details
- `mcp__x402-marketplace__wallet_info` - Check wallet balance

### 2. **API Access Pattern**
```javascript
// Example: Generate an image
mcp__x402-marketplace__call_api({
  apiId: "replicate-flux-schnell",
  method: "POST",
  body: { input: { prompt: "your prompt" } }
})
// Returns prediction ID, payment details, transaction hash
```

### 3. **Cost Tracking**
Every experiment includes an `experiment-log.md` with:
- API usage table (Tool, API ID, Cost, Transaction Hash, Timestamp)
- Total experiment cost
- Generated asset details
- Key learnings

### 4. **Available APIs**

#### Free APIs
- **ElevenLabs TTS - Rachel** (`elevenlabs-rachel`) - Voice generation
- **Chuck Norris Jokes** (`IvpCdnikHc`) - Random jokes
- **JSONPlaceholder Posts** (`CWzt_0KGqz`) - Mock API data

#### Paid APIs (with x402 micropayments)
- **Replicate FLUX** (`replicate-flux-schnell`) - $0.003 - Image generation
- **Replicate SDXL** (`replicate-sdxl`) - $0.003 - Stable Diffusion
- **ElevenLabs TTS (Premium voices)** - $0.002 - Josh, Bella, Adam
- **Replicate Whisper** (`replicate-whisper`) - $0.002 - Audio transcription
- **Replicate LLaMA 3** (`replicate-llama-3`) - $0.005 - LLM text generation
- **Replicate Base API** (`BAWqc3ehGM`) - $0.001 - General Replicate access

### 5. **Replicate API Pattern**
Replicate uses async processing:
1. **Create prediction**: POST to `/predictions` → returns ID
2. **Poll for result**: GET `/predictions/{id}` → check status
3. **Get output**: When status="succeeded", extract output URL

Use the base Replicate API (`BAWqc3ehGM`) for polling support:
```javascript
// Create prediction
POST /paid-proxy/BAWqc3ehGM/predictions

// Poll for completion
GET /paid-proxy/BAWqc3ehGM/predictions/{id}
```

### 6. **File Storage**
- Generated files are saved to: `/Users/kristjangrm/Downloads/autotoll/`
- Copy files to experiment directory for persistence
- Binary files (images, audio) are automatically downloaded

## Creating New Experiments

### Template Structure
1. Create directory: `experiments/XXX-experiment-name/`
2. Generate assets using MCP tools
3. Create main file (HTML, script, etc.)
4. Document in `experiment-log.md`

### Experiment Log Template
```markdown
# Experiment XXX: [Title]

## Overview
[Brief description]

## MCP API Usage Log
| Tool | API ID | Cost | Transaction Hash | Timestamp | Status |
|------|--------|------|-----------------|-----------|---------|
| ... | ... | ... | ... | ... | ✅/❌ |

## Generated Assets
- **Asset 1**: [Description, URL, size]
- **Asset 2**: [Description, URL, size]

## Cost Summary
| Category | Amount |
|----------|--------|
| Total | $X.XXX |

## Key Learnings
- [Learning 1]
- [Learning 2]
```

## Best Practices

1. **Track Everything**: Document all API calls, costs, and outputs
2. **Use Free APIs First**: Test with free endpoints when possible
3. **Handle Async**: For Replicate, always implement polling logic
4. **Save Locally**: Copy generated files to experiment directory
5. **Calculate Costs**: Sum up all paid API calls in the log
6. **Test Small**: Start with minimal prompts/inputs to reduce costs

## Common Patterns

### Image Generation
```javascript
// 1. Create prediction with FLUX
const result = await mcp.call_api({
  apiId: "BAWqc3ehGM",
  method: "POST",
  path: "/predictions",
  body: {
    version: "black-forest-labs/flux-schnell",
    input: { prompt: "..." }
  }
});

// 2. Poll until complete
const prediction = await mcp.call_api({
  apiId: "BAWqc3ehGM",
  method: "GET",
  path: `/predictions/${result.id}`
});

// 3. Use prediction.output[0] as image URL
```

### Voice Generation
```javascript
// Simple TTS (returns audio file directly)
const audio = await mcp.call_api({
  apiId: "elevenlabs-rachel",
  method: "POST",
  body: { text: "Your text here" }
});
// File saved to Downloads/autotoll/
```

### Cost Monitoring
- Check wallet balance: `mcp__x402-marketplace__wallet_info`
- Each paid call shows transaction hash
- View on explorer: `https://sepolia.basescan.org/tx/{hash}`

## Network Details
- **Blockchain**: Base Sepolia (testnet)
- **Currency**: USDC
- **Payment Protocol**: x402 (HTTP 402 Payment Required)
- **Facilitator**: Handles micropayments automatically

## Troubleshooting

**Image not loading?**
- Check if prediction completed (status="succeeded")
- Verify image URL is accessible
- Use fallback/placeholder while polling

**Payment failed?**
- Check wallet balance
- Verify API requires payment
- Check transaction on block explorer

**API not found?**
- List all APIs: `mcp__x402-marketplace__list_apis`
- Check exact API ID
- Verify endpoint is registered

## Next Experiment Ideas
- Multi-model comparison (FLUX vs SDXL)
- Voice cloning experiments
- Video generation with SeedDance
- LLM integration for content generation
- Webhook integration for async processing
- Cost optimization strategies

---

**Remember**: When creating experiments, focus on demonstrating AutoToll's seamless micropayment capabilities and how AI agents can autonomously consume paid APIs.