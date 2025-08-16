const SERVER_URL = 'http://localhost:3000';

type CLIArgs = {
  name?: string;
  url?: string;
  auth?: string;
  authKey?: string;
  authValue?: string;
  paid?: boolean;
  price?: string;
  wallet?: string;
};

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};
  const argv = process.argv.slice(2);

  for (const [i, arg] of argv.entries()) {
    switch (arg) {
      case '--name':
        args.name = argv[i + 1];
        break;
      case '--url':
        args.url = argv[i + 1];
        break;
      case '--auth':
        args.auth = argv[i + 1];
        break;
      case '--auth-key':
        args.authKey = argv[i + 1];
        break;
      case '--auth-value':
        args.authValue = argv[i + 1];
        break;
      case '--paid':
        args.paid = true;
        break;
      case '--price':
        args.price = argv[i + 1];
        break;
      case '--wallet':
        args.wallet = argv[i + 1];
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function showUsage() {
  console.log(
    'Usage: bun run add --name <name> --url <url> --auth <type> [options]\n'
  );
  console.log('Required:');
  console.log('  --name <name>        API endpoint name');
  console.log('  --url <url>          Target API URL');
  console.log(
    '  --auth <type>        Authentication type: none, bearer, query_param\n'
  );
  console.log('Optional:');
  console.log(
    '  --auth-key <key>     Auth parameter name (for query_param auth)'
  );
  console.log('  --auth-value <value> Auth token/API key value');
  console.log('  --paid               Mark as paid endpoint (default: free)');
  console.log('  --price <price>      Price per request (default: $0.001)');
  console.log('  --wallet <address>   Wallet address for payments\n');
  console.log('Examples:');
  console.log('  # Free public API');
  console.log(
    '  bun run add --name "Cat Facts" --url "https://catfact.ninja/fact" --auth "none"\n'
  );
  console.log('  # Paid API with bearer token');
  console.log(
    '  bun run add --name "OpenAI GPT" --url "https://api.openai.com/v1/completions" \\'
  );
  console.log(
    '    --auth "bearer" --auth-value "sk-..." --paid --price "$0.01" \\'
  );
  console.log('    --wallet "0x7E5Dc1F5d8AdAaceb0C8472E04228Ff0003A67bE"\n');
  console.log('  # API with query parameter auth');
  console.log(
    '  bun run add --name "Weather API" --url "https://api.openweathermap.org/data/2.5/weather" \\'
  );
  console.log(
    '    --auth "query_param" --auth-key "appid" --auth-value "your_api_key" --paid'
  );
}

async function addEndpoint() {
  const args = parseArgs();

  // Validate required arguments
  if (!(args.name && args.url && args.auth)) {
    console.error('❌ Error: Missing required arguments\n');
    showUsage();
    process.exit(1);
  }

  // Validate auth type
  const validAuthTypes = ['none', 'bearer', 'query_param'];
  if (!validAuthTypes.includes(args.auth)) {
    console.error(`❌ Error: Invalid auth type "${args.auth}"`);
    console.log(`Valid types: ${validAuthTypes.join(', ')}\n`);
    showUsage();
    process.exit(1);
  }

  // Validate auth requirements
  if (args.auth === 'query_param' && !args.authKey) {
    console.error(
      '❌ Error: --auth-key is required when using query_param auth\n'
    );
    showUsage();
    process.exit(1);
  }

  if (args.auth !== 'none' && !args.authValue) {
    console.error(
      '❌ Error: --auth-value is required for authenticated endpoints\n'
    );
    showUsage();
    process.exit(1);
  }

  // Validate paid endpoint requirements
  if (args.paid && !args.wallet) {
    console.error('❌ Error: --wallet is required for paid endpoints\n');
    showUsage();
    process.exit(1);
  }

  console.log('📝 Registering New API Endpoint');
  console.log('==============================\n');

  const endpoint = {
    name: args.name,
    targetUrl: args.url,
    authType: args.auth,
    authKey: args.authKey || null,
    authValue: args.authValue || null,
    requiresPayment: args.paid,
    price: args.price || '$0.001',
    walletAddress: args.wallet || null,
  };

  console.log(`Name: ${endpoint.name}`);
  console.log(`URL: ${endpoint.targetUrl}`);
  console.log(`Auth: ${endpoint.authType}`);
  if (endpoint.authKey) {
    console.log(`Auth Key: ${endpoint.authKey}`);
  }
  console.log(`Type: ${endpoint.requiresPayment ? 'Paid' : 'Free'}`);
  if (endpoint.requiresPayment) {
    console.log(`Price: ${endpoint.price}`);
    console.log(`Wallet: ${endpoint.walletAddress}`);
  }
  console.log();

  try {
    const response = await fetch(`${SERVER_URL}/endpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(endpoint),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Successfully registered!');
      console.log(`\nEndpoint ID: ${result.id}`);
      console.log(`Proxy URL: ${SERVER_URL}${result.proxy_url}\n`);

      console.log('Test with:');
      console.log(`  bun run test ${result.id}`);
      console.log(`  curl ${SERVER_URL}${result.proxy_url}`);

      if (endpoint.requiresPayment) {
        console.log(
          `\n💰 This endpoint requires payment of ${endpoint.price} per request`
        );
      }
    } else {
      console.error('❌ Registration failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n⚠️  Make sure the server is running:');
    console.log('   cd ../server && bun dev');
    process.exit(1);
  }
}

// Run the script
addEndpoint().catch(console.error);
