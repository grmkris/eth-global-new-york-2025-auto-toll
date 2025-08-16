const SERVER_URL = 'http://localhost:3000';

async function listAPIs() {
  console.log('📋 Available API Endpoints');
  console.log('==========================\n');

  try {
    const response = await fetch(`${SERVER_URL}/endpoints/json`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const endpoints = await response.json();

    if (endpoints.length === 0) {
      console.log('No endpoints registered yet.');
      console.log('\n💡 Tip: Run the seed script first:');
      console.log('   cd ../server && bun scripts/seed-endpoints.ts');
      return;
    }

    console.log(`Found ${endpoints.length} endpoint(s):\n`);

    endpoints.forEach((endpoint: any, index: number) => {
      console.log(`${index + 1}. ${endpoint.name}`);
      console.log(`   ID: ${endpoint.id}`);
      console.log(`   Proxy URL: ${SERVER_URL}${endpoint.proxy_url}`);
      console.log(
        `   Payment: ${endpoint.requires_payment ? `Required (${endpoint.price})` : 'FREE'}`
      );
      console.log('');
    });

    console.log('\n📖 How to use:');
    console.log('================');
    console.log('\nFree endpoints:');
    console.log('  curl http://localhost:3000/proxy/{id}');
    console.log('\nPaid endpoints (requires x402 payment):');
    console.log('  curl http://localhost:3000/paid-proxy/{id}');
    console.log('\n💡 Replace {id} with the actual endpoint ID from above');
  } catch (error) {
    console.error('❌ Failed to fetch endpoints:', error);
    console.log('\n⚠️  Make sure the server is running:');
    console.log('   cd ../server && bun dev');
  }
}

// Run the script
listAPIs().catch(console.error);
