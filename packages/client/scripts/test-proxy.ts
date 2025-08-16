const SERVER_URL = "http://localhost:3000";

async function testProxy() {
  console.log("🧪 Testing Free Proxy Endpoints");
  console.log("================================\n");

  // First, get list of available endpoints
  console.log("📋 Fetching available endpoints...\n");
  
  try {
    const listResponse = await fetch(`${SERVER_URL}/endpoints/json`);
    const endpoints = await listResponse.json();
    
    if (endpoints.length === 0) {
      console.log("❌ No endpoints available. Please run the seed script first:");
      console.log("   cd ../server && bun scripts/seed-endpoints.ts");
      return;
    }
    
    // Find free endpoints for testing
    const freeEndpoints = endpoints.filter((e: any) => !e.requires_payment);
    
    if (freeEndpoints.length === 0) {
      console.log("⚠️  No free endpoints available for testing.");
      console.log("All endpoints require payment. Use test-paid-proxy.ts instead.");
      return;
    }
    
    console.log(`Found ${freeEndpoints.length} free endpoint(s) to test:\n`);
    
    // Test each free endpoint
    for (const endpoint of freeEndpoints) {
      console.log(`\n🔄 Testing: ${endpoint.name}`);
      console.log(`   Endpoint ID: ${endpoint.id}`);
      console.log(`   Proxy URL: ${SERVER_URL}${endpoint.proxy_url}`);
      console.log("-".repeat(50));
      
      try {
        const startTime = Date.now();
        const response = await fetch(`${SERVER_URL}${endpoint.proxy_url}`);
        const responseTime = Date.now() - startTime;
        
        if (!response.ok) {
          console.log(`❌ Request failed with status: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        console.log(`✅ Success! Response time: ${responseTime}ms`);
        console.log(`📦 Response:`);
        console.log(JSON.stringify(data, null, 2).substring(0, 500));
        
        if (JSON.stringify(data).length > 500) {
          console.log("... (truncated)");
        }
        
      } catch (error) {
        console.log(`❌ Error testing endpoint:`, error);
      }
    }
    
    // Also test a specific endpoint with parameters (if Chuck Norris API exists)
    const chuckNorris = endpoints.find((e: any) => e.name.includes("Chuck"));
    if (chuckNorris) {
      console.log(`\n\n🎯 Special Test: Chuck Norris API with category`);
      console.log("-".repeat(50));
      
      try {
        // Test with query parameter
        const response = await fetch(`${SERVER_URL}${chuckNorris.proxy_url}?category=dev`);
        const data = await response.json();
        
        console.log(`✅ Response with category=dev:`);
        console.log(JSON.stringify(data, null, 2));
      } catch (error) {
        console.log(`Note: Category parameter might not be supported`);
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    console.log("\n⚠️  Make sure the server is running:");
    console.log("   cd ../server && bun dev");
  }
  
  console.log("\n\n💡 Tips:");
  console.log("- These are free endpoints (no payment required)");
  console.log("- For paid endpoints, use test-paid-proxy.ts");
  console.log("- You can add query parameters to the proxy URL");
  console.log("- The proxy forwards all HTTP methods (GET, POST, etc.)");
}

// Run the script
testProxy().catch(console.error);