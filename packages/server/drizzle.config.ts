import { defineConfig } from 'drizzle-kit';
import { env } from './src/env';
import './compression-polyfill'; // bun doesn't have compression-polyfill yet https://github.com/drizzle-team/drizzle-orm/issues/3880 https://github.com/oven-sh/bun/issues/1723#issuecomment-1774174194
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
