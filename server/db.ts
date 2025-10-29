// Database configuration - supports both Neon (serverless) and regular PostgreSQL
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect if using Neon serverless or regular PostgreSQL
const isNeon = process.env.DATABASE_URL.includes('neon.tech') || 
               process.env.DATABASE_URL.includes('neon.database');

let pool: NeonPool | PgPool;
let db: any;

if (isNeon) {
  // Use Neon serverless driver
  console.log('Using Neon serverless PostgreSQL driver');
  neonConfig.webSocketConstructor = ws;
  neonConfig.poolQueryViaFetch = true;
  
  pool = new NeonPool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  
  db = drizzleNeon({ client: pool, schema });
} else {
  // Use regular PostgreSQL driver for Docker/local/VPS PostgreSQL
  console.log('Using standard PostgreSQL driver');
  
  pool = new PgPool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  
  db = drizzlePg(pool, { schema });
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export { pool, db };
