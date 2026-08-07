import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@workspace/db";
import { logger } from "./lib/logger";

// ── connection string ──────────────────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required but not set. " +
    "Set it to your Postgres connection string before starting the server."
  );
}

// ── parse URL for driver selection and startup logging ─────────────────────────
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

// ── driver selection ───────────────────────────────────────────────────────────
// Neon hostnames are *.neon.tech (including *.aws.neon.tech).
// endsWith('.neon.tech') correctly matches all of these.
// Any other hostname falls back to standard pg with a warning so the operator
// knows the fallback was taken rather than discovering it from a query error.
const isNeon = hostname.endsWith('.neon.tech');

if (!isNeon) {
  logger.warn(
    { hostname },
    "DATABASE_URL host is not a recognised Neon hostname " +
    "(*.neon.tech) — falling back to standard PostgreSQL driver. " +
    "If this is unexpected, check your DATABASE_URL."
  );
}

export let pool: NeonPool | PgPool;
export let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;

if (isNeon) {
  neonConfig.webSocketConstructor = ws;

  const neonPool = new NeonPool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  neonPool.on('error', (err: Error) => {
    logger.error({ err }, 'Unexpected Neon database pool error');
  });

  pool = neonPool;
  db = drizzleNeon({ client: neonPool, schema });
} else {
  const pgPool = new PgPool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pgPool.on('error', (err: Error) => {
    logger.error({ err }, 'Unexpected PostgreSQL pool error');
  });

  pool = pgPool;
  db = drizzlePg(pgPool, { schema });
}

logger.info(
  { driver: isNeon ? 'neon-serverless' : 'pg', host: hostname },
  'Database configured'
);
