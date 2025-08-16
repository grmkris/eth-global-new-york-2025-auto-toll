#!/usr/bin/env bun
import { nanoid } from "nanoid";
import { db } from "../src/db";
import { endpoints, type Endpoint } from "../src/db/schema";

async function seedEndpoints() {
  console.log("🌱 Seeding test endpoints...");

  const testEndpoints : Endpoint[] = [
    {
      id: nanoid(10),
      name: "Chuck Norris Jokes",
      targetUrl: "https://api.chucknorris.io/jokes/random",
      authType: "none",
      authKey: null,
      authValue: null,
      requiresPayment: false,
      price: "$0.000",
      walletAddress: "0x0000000000000000000000000000000000000000", // Free API, no wallet needed
      createdAt: new Date()
    },
    {
      id: nanoid(10),
      name: "Cat Facts",
      targetUrl: "https://catfact.ninja/fact",
      authType: "none",
      authKey: null,
      authValue: null,
      requiresPayment: true,
      createdAt: new Date(),
      price: "$0.001",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3", // Example wallet 1
    },
    {
      id: nanoid(10),
      name: "Random User Generator",
      targetUrl: "https://randomuser.me/api",
      authType: "none",
      authKey: null,
      authValue: null,
      requiresPayment: true,
      createdAt: new Date(),
      price: "$0.002",
      walletAddress: "0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed", // Example wallet 2
    },
    {
      id: nanoid(10),
      name: "JSONPlaceholder Posts",
      targetUrl: "https://jsonplaceholder.typicode.com/posts",
      authType: "none",
      authKey: null,
      authValue: null,
      requiresPayment: false,
      createdAt: new Date(),
      price: "$0.000",
      walletAddress: "0x0000000000000000000000000000000000000000", // Free API, no wallet needed
    },
    {
      id: nanoid(10),
      name: "Bored API",
      targetUrl: "https://www.boredapi.com/api/activity",
      authType: "none",
      authKey: null,
      authValue: null,
      requiresPayment: true,
      createdAt: new Date(),
      price: "$0.001",
      walletAddress: "0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206", // Will use default wallet from env
    }
  ];

  // Clear existing endpoints first (optional)
  console.log("🧹 Clearing existing endpoints...");
  await db.delete(endpoints);

  // Insert all endpoints
  for (const endpoint of testEndpoints) {
    try {
      await db.insert(endpoints).values(endpoint);
      console.log(`✅ Registered: ${endpoint.name}`);
      console.log(`   ID: ${endpoint.id}`);
      console.log(`   Proxy URL: ${endpoint.requiresPayment ? `/paid-proxy/${endpoint.id}` : `/proxy/${endpoint.id}`}`);
      console.log(`   Payment: ${endpoint.requiresPayment ? `Required (${endpoint.price})` : 'Free'}`);
      if (endpoint.walletAddress) {
        console.log(`   Wallet: ${endpoint.walletAddress}`);
      }
    } catch (error) {
      console.error(`❌ Error registering ${endpoint.name}:`, error);
    }
  }

  // List all endpoints
  console.log("\n📋 All registered endpoints:");
  
  try {
    const allEndpoints = await db.query.endpoints.findMany();
    
    console.log(`\nFound ${allEndpoints.length} endpoints:`);
    allEndpoints.forEach((ep) => {
      console.log(`- ${ep.name} (${ep.id})`);
      console.log(`  URL: ${ep.requiresPayment ? `/paid-proxy/${ep.id}` : `/proxy/${ep.id}`}`);
      console.log(`  Payment: ${ep.requiresPayment ? ep.price : 'Free'}`);
      if (ep.walletAddress) {
        console.log(`  Wallet: ${ep.walletAddress}`);
      }
    });
  } catch (error) {
    console.error("Failed to list endpoints:", error);
  }

  console.log("\n✨ Seeding complete!");
  process.exit(0);
}

// Run seeding
seedEndpoints().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});