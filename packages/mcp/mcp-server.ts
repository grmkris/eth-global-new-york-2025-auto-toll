#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  type Address,
  createPublicClient,
  formatEther,
  type Hex,
  http,
  type Network,
} from 'viem';
import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { decodeXPaymentResponse, wrapFetchWithPayment } from 'x402-fetch';
import { z } from 'zod/v3';
import { env } from './env';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const SERVER_URL = env.SERVER_URL;
const TEMP_DIR = '/tmp/autotoll';
const DOWNLOADS_DIR = join(homedir(), 'Downloads', 'autotoll');

// Ensure directories exist
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}
if (!existsSync(DOWNLOADS_DIR)) {
  mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// Helper function to get file extension from content type
function getFileExtension(contentType: string): string {
  const mimeMap: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'application/pdf': 'pdf',
    'application/octet-stream': 'bin',
  };
  
  const normalizedType = contentType.toLowerCase().split(';')[0].trim();
  return mimeMap[normalizedType] || 'bin';
}

// Helper function to save binary data to file
async function saveBinaryToFile(
  buffer: ArrayBuffer,
  contentType: string,
  apiId: string
): Promise<{ filepath: string; downloadPath: string; filename: string; size: number } | null> {
  try {
    const ext = getFileExtension(contentType);
    const timestamp = Date.now();
    const filename = `${apiId}-${timestamp}.${ext}`;
    const tempPath = join(TEMP_DIR, filename);
    const downloadPath = join(DOWNLOADS_DIR, filename);
    
    // Use Bun's file API to write the buffer directly (no string conversion)
    await Bun.write(tempPath, buffer);
    
    // Also copy to Downloads folder for easy access
    try {
      await Bun.write(downloadPath, buffer);
      console.error(`📁 Saved to Downloads: ${downloadPath}`);
    } catch (e) {
      console.error('Could not copy to Downloads:', e);
    }
    
    return {
      filepath: tempPath,
      downloadPath,
      filename,
      size: buffer.byteLength,
    };
  } catch (error) {
    console.error('Failed to save binary file:', error);
    return null;
  }
}

// Load or generate wallet
let MNEMONIC = env.MNEMONIC;

if (!MNEMONIC) {
  console.error(
    '⚠️  No MNEMONIC found in environment. Generating ephemeral wallet...'
  );
  MNEMONIC = generateMnemonic(english);
  console.error('Generated wallet mnemonic:');
  console.error(MNEMONIC);
  console.error('\nAdd this to your .env file to persist the wallet:');
  console.error(`MNEMONIC="${MNEMONIC}"`);
}

// Create account from mnemonic
const account = mnemonicToAccount(MNEMONIC, {
  accountIndex: env.ACCOUNT_INDEX,
  addressIndex: 0,
});

// Create public client for balance checks
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// Main async function to set up MCP server
async function main() {
  console.error(`Initialized wallet with address: ${account.address}`);

  // Check balance
  try {
    const balance = await publicClient.getBalance({ address: account.address });
    console.error(`Wallet balance: ${formatEther(balance)} ETH`);
  } catch (error) {
    console.error('Failed to check balance:', error);
  }

  // Create fetch wrapper with x402 payment capability
  const fetchWithPayment = wrapFetchWithPayment(fetch, account);

  // Create MCP server
  const server = new McpServer({
    name: 'autotoll',
    version: '1.0.0',
  });

  // Tool: Get wallet information
  server.registerTool(
    'wallet_info',
    {
      title: 'Get Wallet Information',
      description: 'Get your local wallet address and balance',
    },
    async () => {
      try {
        const balance = await publicClient.getBalance({
          address: account.address,
        });

        // Get USDC balance too
        const USDC_ADDRESS =
          '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`;
        const usdcBalance = (await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: [
            {
              name: 'balanceOf',
              type: 'function',
              stateMutability: 'view',
              inputs: [{ name: 'account', type: 'address' }],
              outputs: [{ name: 'balance', type: 'uint256' }],
            },
          ],
          functionName: 'balanceOf',
          args: [account.address],
        })) as bigint;

        return {
          content: [
            {
              type: 'text',
              text: `Wallet Information:
Address: ${account.address}
Network: Base Sepolia (Chain ID: 84532)
ETH Balance: ${formatEther(balance)} ETH
USDC Balance: ${Number(usdcBalance) / 1_000_000} USDC

⚠️  Wallet secured with mnemonic phrase.
Keep your mnemonic backup safe!

Get testnet funds:
- ETH: https://www.basefaucet.com/
- USDC: https://faucet.circle.com/`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Tool: List available APIs
  server.registerTool(
    'list_apis',
    {
      title: 'List Available APIs',
      description: 'Browse APIs available in the marketplace',
      inputSchema: {
        search: z.string().optional(),
      },
    },
    async ({ search }) => {
      try {
        const res = await fetch(`${SERVER_URL}/endpoints/json`);

        if (!res.ok) {
          throw new Error('Failed to fetch API list');
        }

        let apis = await res.json();

        // Filter by search term if provided
        if (search) {
          apis = apis.filter((api: any) =>
            api.name.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (apis.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: search
                  ? `No APIs found matching "${search}"`
                  : 'No APIs available',
              },
            ],
          };
        }

        const formatted = apis
          .map(
            (api: any) =>
              `• ${api.name}
  ID: ${api.id}
  Price: ${api.requires_payment ? api.price : 'FREE'}
  Endpoint: ${api.proxy_url}`
          )
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${apis.length} API(s):\n\n${formatted}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Tool: Call API with x402 payment
  server.registerTool(
    'call_api',
    {
      title: 'Call API',
      description:
        'Call an API endpoint with automatic x402 payment if required',
      inputSchema: {
        apiId: z.string(),
        path: z.string().default(''),
        params: z.record(z.any()).optional(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
        body: z.any().optional(),
        headers: z.record(z.string()).optional(),
      },
    },
    async ({ apiId, path, params, method, body, headers }) => {
      try {
        // First, get API info to determine if it's paid
        const listRes = await fetch(`${SERVER_URL}/endpoints/json`);
        const apis = await listRes.json();
        const api = apis.find((a: any) => a.id === apiId);

        if (!api) {
          throw new Error(`API with ID "${apiId}" not found`);
        }

        // Build the URL - handle trailing slashes properly
        const proxyPath = api.requires_payment ? 'paid-proxy' : 'proxy';
        const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
        const url = new URL(`${SERVER_URL}/${proxyPath}/${apiId}${cleanPath}`);

        // Add query parameters
        if (params) {
          for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, String(value));
          }
        }

        // Prepare headers - only set Content-Type if not provided
        const requestHeaders: Record<string, string> = { ...headers };
        
        // Prepare body and auto-detect Content-Type if needed
        let requestBody: any = undefined;
        
        if (body !== undefined && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          // If body is already a string, pass it through
          if (typeof body === 'string') {
            requestBody = body;
            // Only set Content-Type if not already set
            if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
              // Try to detect if it's JSON
              try {
                JSON.parse(body);
                requestHeaders['Content-Type'] = 'application/json';
              } catch {
                // Not JSON, assume plain text
                requestHeaders['Content-Type'] = 'text/plain';
              }
            }
          } else if (body !== null) {
            // Object or array - stringify as JSON
            requestBody = JSON.stringify(body);
            if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
              requestHeaders['Content-Type'] = 'application/json';
            }
          }
        }

        // Prepare request options
        const requestOptions: RequestInit = {
          method,
          headers: requestHeaders,
        };

        if (requestBody !== undefined) {
          requestOptions.body = requestBody;
        }

        // Log request details for debugging
        console.error(`📡 [MCP] API Request Details:
  API: ${api.name} (${apiId})
  URL: ${url.toString()}
  Method: ${method}
  Headers: ${JSON.stringify(requestHeaders, null, 2)}
  Body: ${requestBody ? (typeof requestBody === 'string' ? requestBody.substring(0, 200) : JSON.stringify(requestBody).substring(0, 200)) : 'none'}`);

        // Make the request
        let response: Response;
        let paymentInfo: {
          success: boolean;
          transaction: Hex;
          network: Network;
          payer: Address;
        } | null = null;

        if (api.requires_payment) {
          // Use x402-fetch for paid endpoints
          console.error(`💳 Making paid request to ${api.name}...`);
          response = await fetchWithPayment(url.toString(), requestOptions);

          // Decode payment info if present
          const paymentHeader = response.headers.get('x-payment-response');
          if (paymentHeader) {
            paymentInfo = decodeXPaymentResponse(paymentHeader);
          }
        } else {
          // Regular fetch for free endpoints
          response = await fetch(url.toString(), requestOptions);
        }

        // Parse response based on content type
        const contentType = response.headers.get('content-type') || '';
        let data: string;
        let responseFormat = 'text';

        console.error(`📥 Response Content-Type: ${contentType}`);

        if (contentType.includes('application/json')) {
          try {
            const json = await response.json();
            data = JSON.stringify(json, null, 2);
            responseFormat = 'json';
          } catch (e) {
            // Failed to parse as JSON, treat as text
            data = await response.text();
          }
        } else if (
          contentType.includes('audio/') || 
          contentType.includes('image/') || 
          contentType.includes('video/') ||
          contentType.includes('application/octet-stream')
        ) {
          // Binary response - save to file
          const buffer = await response.arrayBuffer();
          const fileInfo = await saveBinaryToFile(buffer, contentType, apiId);
          
          if (fileInfo) {
            // Successfully saved to file
            const sizeKB = (fileInfo.size / 1024).toFixed(1);
            data = `Binary file saved successfully
Temp: ${fileInfo.filepath}
Downloads: ${fileInfo.downloadPath}
Size: ${sizeKB} KB
Type: ${contentType}

To play/view the file:
${contentType.includes('audio/') ? `• Play: afplay "${fileInfo.downloadPath}"` : ''}
${contentType.includes('image/') ? `• View: open "${fileInfo.downloadPath}"` : ''}
${contentType.includes('video/') ? `• Play: open "${fileInfo.downloadPath}"` : ''}`;
            responseFormat = 'binary_file';
          } else {
            // Fallback to base64 if file saving failed
            const base64 = Buffer.from(buffer).toString('base64');
            data = `[Binary data - ${buffer.byteLength} bytes]
Base64: ${base64.substring(0, 100)}...${base64.length > 100 ? '(truncated)' : ''}
Content-Type: ${contentType}`;
            responseFormat = 'binary';
            
            // For audio responses, provide a data URI that can be played
            if (contentType.includes('audio/')) {
              data += `\n\nAudio Data URI (for playback): data:${contentType};base64,${base64.substring(0, 200)}...`;
            }
          }
        } else {
          // Default to text
          data = await response.text();
        }

        // Format result
        let resultText = `API: ${api.name}
Status: ${response.status} ${response.statusText}
Response Format: ${responseFormat}
Response:
${data}`;

        if (paymentInfo) {
          const explorerUrl = `https://sepolia.basescan.org/tx/${paymentInfo.transaction}`;
          resultText += `\n\n💰 Payment Details:
Amount: ${api.price}
Transaction: ${paymentInfo.transaction || 'Processing...'}
Explorer: ${explorerUrl}
Network: base-sepolia`;
        }

        return {
          content: [
            {
              type: 'text',
              text: resultText,
            },
          ],
        };
      } catch (error: any) {
        // Enhanced error reporting
        const errorDetails = `Error calling API: ${error.message}
API ID: ${apiId}
Path: ${path || '/'}
Method: ${method}
Error Stack: ${error.stack?.split('\n').slice(0, 3).join('\n')}`;
        
        console.error(`❌ [MCP] API Call Error:`, error);
        
        return {
          content: [
            {
              type: 'text',
              text: errorDetails,
            },
          ],
        };
      }
    }
  );

  // Tool: Get API details
  server.registerTool(
    'api_info',
    {
      title: 'Get API Details',
      description: 'Get detailed information about a specific API',
      inputSchema: {
        apiId: z.string(),
      },
    },
    async ({ apiId }) => {
      try {
        const res = await fetch(`${SERVER_URL}/endpoints/json`);
        const apis = await res.json();
        const api = apis.find((a: any) => a.id === apiId);

        if (!api) {
          return {
            content: [
              {
                type: 'text',
                text: `API with ID "${apiId}" not found`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `API Details:
Name: ${api.name}
ID: ${api.id}
Endpoint: ${SERVER_URL}${api.proxy_url}
Price: ${api.requires_payment ? api.price : 'FREE'}
Payment Required: ${api.requires_payment ? 'Yes' : 'No'}
${api.wallet_address ? `Receives Payments: ${api.wallet_address}` : ''}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP server connected and ready');
}

// Run the server
main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
