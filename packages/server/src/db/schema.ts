import { pgTable, text, timestamp, boolean, decimal, integer, jsonb } from "drizzle-orm/pg-core";
import type { Address} from "viem"
export const endpoints = pgTable("endpoints", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  targetUrl: text("target_url").notNull(),
  authType: text("auth_type").notNull(), // query_param | header | bearer | none
  authKey: text("auth_key"),
  authValue: text("auth_value"),
  walletAddress: text("wallet_address").notNull().$type<Address>(), // Payment recipient wallet
  price: text("price").default("$0.001").notNull(), // TODO let's make price enum 
  requiresPayment: boolean("requires_payment").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Claude wallets (buyers) - CDP v2 managed accounts
export const wallets = pgTable("wallets", {
  apiKey: text("api_key").primaryKey(), // wlt_xxxxxxxxxxxx (our internal key)
  accountAddress: text("account_address").notNull(), // CDP account address
  accountName: text("account_name"), // Optional CDP account name for retrieval
  network: text("network").default("base-sepolia"),
  balanceCache: decimal("balance_cache", { precision: 20, scale: 6 }).default("0"),
  totalSpent: decimal("total_spent", { precision: 20, scale: 6 }).default("0"),
  apiCallsCount: integer("api_calls_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
});

// API call history
export const apiCalls = pgTable("api_calls", {
  id: text("id").primaryKey(),
  apiKey: text("api_key").references(() => wallets.apiKey),
  endpointId: text("endpoint_id").references(() => endpoints.id),
  cost: decimal("cost", { precision: 20, scale: 6 }),
  txHash: text("tx_hash"),
  requestPath: text("request_path"),
  responseStatus: integer("response_status"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// MCP sessions (store in DB, not memory)
export const mcpSessions = pgTable("mcp_sessions", {
  sessionId: text("session_id").primaryKey(),
  apiKey: text("api_key").references(() => wallets.apiKey),
  mcpServerState: jsonb("mcp_server_state"), // Any MCP-specific state
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export type Endpoint = typeof endpoints.$inferSelect;