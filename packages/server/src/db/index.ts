import { drizzle } from "drizzle-orm/bun-sql";
import { sql } from "drizzle-orm";
import { SQL } from "bun";
import { env } from "../env";
import * as schema from "./schema";

// Create Bun SQL client with environment variable
const client = new SQL(env.DATABASE_URL);

// Create drizzle instance with Bun SQL
export const db = drizzle({ client, schema: schema });

export async function testConnection() {
  try {
    // Test with Drizzle's sql operator
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connected successfully with Bun SQL");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}