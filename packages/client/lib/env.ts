import { z } from "zod";

const envSchema = z.object({
  // For local wallet scripts (optional - only needed for some scripts)
  MNEMONIC: z.string().optional(),
  
  // Server configuration
  API_URL: z.string().url().default("http://localhost:3000"),
  SERVER_URL: z.string().url().default("http://localhost:3000"),
  
  // Wallet configuration
  ACCOUNT_INDEX: z.coerce.number().default(0),
  
  // Test configuration
  ENDPOINT_ID: z.string().optional(),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(Bun.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

// Export type for use in other files
export type Env = typeof env;