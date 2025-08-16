import { API_URL } from "../lib/wallet";

async function helloWorld() {
  console.log("🌍 Hello World Request");
  console.log("======================");
  console.log(`Endpoint: ${API_URL}/`);
  console.log("Type: Free endpoint (no payment required)\n");
  
  try {
    const response = await fetch(`${API_URL}/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ Response received:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Request failed:", error);
    console.log("\n💡 Make sure the server is running:");
    console.log("   cd server && bun dev");
  }
}

helloWorld().catch(console.error);