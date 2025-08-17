import type { Resource } from 'x402-hono';
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5433/api_marketplace'),

  // Wallet for receiving payments (default seller wallet)
  WALLET_ADDRESS: z
    .string()
    .default('0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206'),

  // Server
  PORT: z.coerce.number().default(3000),

  // Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // x402 Facilitator URL
  FACILITATOR_URL: z.custom<Resource>(),

  // CDP v2 Configuration (for buyer wallets)
  CDP_API_KEY_ID: z.string().optional(),
  CDP_API_KEY_SECRET: z.string().optional(),
  CDP_WALLET_SECRET: z.string().optional(),

  // Network configuration
  NETWORK: z.enum(['base-sepolia', 'base']).default('base-sepolia'),

  // Base URL for MCP config
  BASE_URL: z.string().optional(),

  // External API Keys
  ELEVENLABS_API_KEY: z.string(),
  REPLICATE_API_TOKEN: z.string(),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

// Export type for use in other files
export type Env = typeof env;

// Log configuration in development
if (env.NODE_ENV === 'development') {
  console.log('🔧 Environment Configuration:');
  console.log(
    `  DATABASE_URL: ${env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`
  );
  console.log(`  WALLET_ADDRESS: ${env.WALLET_ADDRESS}`);
  console.log(`  PORT: ${env.PORT}`);
  console.log(`  NODE_ENV: ${env.NODE_ENV}`);
}
