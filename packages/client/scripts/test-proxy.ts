import { formatEther, formatUnits } from 'viem';
import { decodeXPaymentResponse } from 'x402-fetch';
import { account, fetchWithPayment, publicClient } from '../lib/wallet';

const SERVER_URL = 'http://localhost:3000';
const BASESCAN_URL = 'https://sepolia.basescan.org/tx/';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;
const USDC_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type Endpoint = {
  id: string;
  name: string;
  baseUrl: string;
  proxy_url: string;
  price: string | null;
  requires_payment: boolean;
};

async function parseInput(
  input?: string
): Promise<{ url?: string; endpointId?: string; isPaid?: boolean }> {
  await Promise.resolve();
  if (!input) {
    return {};
  }

  // Check if it's a full URL
  if (input.startsWith('http://') || input.startsWith('https://')) {
    const url = new URL(input);
    const pathMatch = url.pathname.match(/^\/(paid-proxy|proxy)\/([^/]+)/);

    if (pathMatch) {
      return {
        url: input,
        endpointId: pathMatch[2],
        isPaid: pathMatch[1] === 'paid-proxy',
      };
    }

    throw new Error(`Invalid proxy URL format: ${input}`);
  }

  // Otherwise treat it as an endpoint ID
  return { endpointId: input };
}

async function showWalletInfo() {
  console.log('\n💳 Your Wallet:');
  console.log(`Address: ${account.address}`);

  try {
    const ethBalance = await publicClient.getBalance({
      address: account.address,
    });
    const usdcBalance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });

    console.log(`ETH Balance: ${formatEther(ethBalance)} ETH`);
    console.log(`USDC Balance: ${formatUnits(usdcBalance, 6)} USDC`);
  } catch (error) {
    console.log('Balance check failed (network issue)');
  }
}

async function testEndpoint(endpoint: Endpoint, url?: string) {
  const proxyUrl = url || `${SERVER_URL}${endpoint.proxy_url}`;

  console.log(`\n🔄 Testing: ${endpoint.name}`);
  console.log(`   Endpoint ID: ${endpoint.id}`);
  console.log(`   Proxy URL: ${proxyUrl}`);
  if (endpoint.requires_payment) {
    console.log(`   Price: ${endpoint.price} per request`);
  }
  console.log('-'.repeat(50));

  if (endpoint.requires_payment) {
    console.log('\n⚠️  This will charge your wallet!');
    console.log('Proceeding with payment in 3 seconds...\n');
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  try {
    const startTime = Date.now();

    // Use appropriate fetch method based on payment requirement
    const response = endpoint.requires_payment
      ? await fetchWithPayment(proxyUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      : await fetch(proxyUrl);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      console.log(`❌ Request failed with status: ${response.status}`);
      const error = await response.text();
      console.log('Error:', error);
      return;
    }

    const data = await response.json();

    console.log(`✅ Success! Response time: ${responseTime}ms`);
    console.log('📦 Response:');
    console.log(JSON.stringify(data, null, 2).substring(0, 500));

    if (JSON.stringify(data).length > 500) {
      console.log('... (truncated)');
    }

    // Check payment details for paid endpoints
    if (endpoint.requires_payment) {
      const paymentHeader = response.headers.get('x-payment-response');
      if (paymentHeader) {
        console.log('\n💰 Payment Details:');
        const payment = decodeXPaymentResponse(paymentHeader);
        const txHash = payment.transaction || 'Processing...';
        console.log(`Transaction: ${txHash}`);
        if (txHash !== 'Processing...') {
          console.log(`Explorer: ${BASESCAN_URL}${txHash}`);
        }
        console.log('Network: base-sepolia');
      }
    }
  } catch (error: any) {
    console.log('❌ Error testing endpoint:', error.message || error);

    if (endpoint.requires_payment && error.message?.includes('insufficient')) {
      console.log('\n💡 You need Base Sepolia USDC to make payments.');
      console.log('Get testnet tokens from: https://faucet.circle.com/');
    }
  }
}

async function testProxy() {
  const input = process.argv[2];

  // Check if parameter was provided
  if (!input) {
    console.error('❌ Error: Endpoint ID or URL required\n');
    console.log('Usage:');
    console.log('  bun run test <endpoint-id>');
    console.log('  bun run test <proxy-url>\n');
    console.log('Examples:');
    console.log('  bun run test JWEXDNX-r4');
    console.log('  bun run test http://localhost:3000/proxy/JWEXDNX-r4');
    console.log('  bun run test http://localhost:3000/paid-proxy/JWEXDNX-r4\n');
    console.log('To see available endpoints, run:');
    console.log('  bun run list');
    process.exit(1);
  }

  const { url, endpointId, isPaid } = await parseInput(input);

  console.log('🧪 Testing Proxy Endpoint');
  console.log('========================\n');

  try {
    const listResponse = await fetch(`${SERVER_URL}/endpoints/json`);
    const endpoints: Endpoint[] = await listResponse.json();

    if (endpoints.length === 0) {
      console.log(
        '❌ No endpoints available. Please run the seed script first:'
      );
      console.log('   cd ../server && bun scripts/seed-endpoints.ts');
      return;
    }

    const endpoint = endpoints.find((e) => e.id === endpointId);

    if (!endpoint) {
      console.log(`❌ Endpoint with ID "${endpointId}" not found.\n`);
      console.log('Available endpoints:');
      for (const e of endpoints) {
        console.log(
          `  ${e.id}: ${e.name} (${e.requires_payment ? 'paid' : 'free'})`
        );
      }
      console.log('\nRun "bun run list" for more details.');
      process.exit(1);
    }

    // Show wallet info for paid endpoints
    if (endpoint.requires_payment) {
      await showWalletInfo();
    }

    // Test the specific endpoint
    await testEndpoint(endpoint, url);
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n⚠️  Make sure the server is running:');
    console.log('   cd ../server && bun dev');
    process.exit(1);
  }
}

// Run the script
testProxy().catch(console.error);
