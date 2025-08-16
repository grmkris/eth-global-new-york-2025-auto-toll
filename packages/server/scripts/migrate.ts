#!/usr/bin/env bun
import { migrate } from "drizzle-orm/bun-sql/migrator";
import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";
import { env } from "../src/env";

async function runMigrations() {
  console.log("🔄 Running database migrations...");
  console.log(`📍 Database: ${env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);
  
  try {
    // Create a connection specifically for migrations
    const migrationClient = new SQL(env.DATABASE_URL);
    const migrationDb = drizzle({ client: migrationClient });
    
    // Run migrations
    await migrate(migrationDb, {
      migrationsFolder: "./src/db/migrations",
    });
    
    console.log("✅ Migrations completed successfully!");
    
    // Close the connection
    migrationClient.close();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();