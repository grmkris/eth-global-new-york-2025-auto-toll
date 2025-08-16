CREATE TABLE "api_calls" (
	"id" text PRIMARY KEY NOT NULL,
	"api_key" text,
	"endpoint_id" text,
	"cost" numeric(20, 6),
	"tx_hash" text,
	"request_path" text,
	"response_status" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "endpoints" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"target_url" text NOT NULL,
	"auth_type" text NOT NULL,
	"auth_key" text,
	"auth_value" text,
	"wallet_address" text,
	"price" text DEFAULT '$0.001',
	"requires_payment" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcp_sessions" (
	"session_id" text PRIMARY KEY NOT NULL,
	"api_key" text,
	"mcp_server_state" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"api_key" text PRIMARY KEY NOT NULL,
	"account_address" text NOT NULL,
	"account_name" text,
	"network" text DEFAULT 'base-sepolia',
	"balance_cache" numeric(20, 6) DEFAULT '0',
	"total_spent" numeric(20, 6) DEFAULT '0',
	"api_calls_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used" timestamp
);
--> statement-breakpoint
ALTER TABLE "api_calls" ADD CONSTRAINT "api_calls_api_key_wallets_api_key_fk" FOREIGN KEY ("api_key") REFERENCES "public"."wallets"("api_key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_calls" ADD CONSTRAINT "api_calls_endpoint_id_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."endpoints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_sessions" ADD CONSTRAINT "mcp_sessions_api_key_wallets_api_key_fk" FOREIGN KEY ("api_key") REFERENCES "public"."wallets"("api_key") ON DELETE no action ON UPDATE no action;