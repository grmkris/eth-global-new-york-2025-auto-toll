import { z } from "zod";

const envSchema = z.object({
  // Wallet mnemonic (optional - will generate if not provided)
  MNEMONIC: z.string().optional(),
  
  // Wallet configuration
  ACCOUNT_INDEX: z.coerce.number().default(0),
  
  // Server configuration  
  SERVER_URL: z.string().url().default("http://localhost:3000"),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid MCP environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

// Export type for use in other files
export type MCPEnv = typeof env;