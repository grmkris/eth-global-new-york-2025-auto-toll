const SERVER_URL = "http://localhost:3000";

async function registerAPI() {
  console.log("📝 Registering New API Endpoint");
  console.log("==============================\n");

  // Example: Register a weather API with API key
  const weatherAPI = {
    name: "OpenWeather API",
    targetUrl: "https://api.openweathermap.org/data/2.5/weather",
    authType: "query_param",
    authKey: "appid",
    authValue: "your_actual_api_key_here", // Replace with real API key
    requiresPayment: true,
    price: "$0.003"
  };

  // Example: Register a free public API
  const dogAPI = {
    name: "Dog Facts API",
    targetUrl: "https://dog-api.kinduff.com/api/facts",
    authType: "none",
    requiresPayment: false
  };

  // Register the APIs
  for (const api of [dogAPI, weatherAPI]) {
    console.log(`\n🔄 Registering: ${api.name}`);
    console.log(`Target URL: ${api.targetUrl}`);
    console.log(`Auth Type: ${api.authType}`);
    console.log(`Payment Required: ${api.requiresPayment}`);
    
    try {
      const response = await fetch(`${SERVER_URL}/endpoints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(api),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`\n✅ Successfully registered!`);
        console.log(`ID: ${result.id}`);
        console.log(`Proxy URL: ${SERVER_URL}${result.proxy_url}`);
        console.log(`Message: ${result.message}`);
        
        if (api.requiresPayment) {
          console.log(`💰 Cost per request: ${api.price || "$0.001"}`);
        }
      } else {
        console.error(`\n❌ Registration failed:`, result.error);
      }
    } catch (error) {
      console.error(`\n❌ Error:`, error);
    }
  }

  console.log("\n\n💡 Usage Examples:");
  console.log("- Free endpoint: curl http://localhost:3000/proxy/{id}");
  console.log("- Paid endpoint: curl http://localhost:3000/paid-proxy/{id}");
  console.log("\nNote: Replace {id} with the actual endpoint ID");
}

// Run the script
registerAPI().catch(console.error);