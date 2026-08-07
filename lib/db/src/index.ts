import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// ── connection string ──────────────────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required but not set. " +
    "Set it to your Postgres connection string before running migrations."
  );
}

// ── parse URL for startup logging ──────────────────────────────────────────────
let hostname: string;
try {
  hostname = new URL(connectionString).hostname;
} catch {
  throw new Error(
    `DATABASE_URL is not a valid URL. ` +
    `Expected a connection string of the form ` +
    `postgres://user:password@host/dbname. ` +
    `Received: ${connectionString.slice(0, 40)}…`
  );
}

// lib/db uses the standard pg driver for drizzle-kit migrations and push.
// Neon accepts standard PostgreSQL wire-protocol connections on port 5432,
// so this works against Neon databases without the serverless driver.
console.log(`[db] driver=pg host=${hostname}`);

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
