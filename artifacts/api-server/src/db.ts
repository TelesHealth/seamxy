// Database configuration - supports both Neon (serverless) and regular PostgreSQL
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@workspace/db";

// Prefer SUPABASE_DATABASE_URL if set, fall back to DATABASE_URL
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect if using Neon serverless or regular PostgreSQL
const isNeon = connectionString.includes('neon.tech') || 
               connectionString.includes('neon.database');

export let pool: NeonPool | PgPool;
export let db: any;

if (isNeon) {
  // Use Neon serverless driver
  console.log('Using Neon serverless PostgreSQL driver');
  neonConfig.webSocketConstructor = ws;
  
  const neonPool = new NeonPool({ 
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  
  pool = neonPool;
  db = drizzleNeon({ client: neonPool, schema });
  
  // Handle pool errors
  neonPool.on('error', (err: Error) => {
    console.error('Unexpected database pool error:', err);
  });
} else {
  // Use regular PostgreSQL driver for Docker/local/VPS PostgreSQL
  console.log('Using standard PostgreSQL driver');
  
  const pgPool = new PgPool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  
  pool = pgPool;
  db = drizzlePg(pgPool, { schema });
  
  // Handle pool errors
  pgPool.on('error', (err: Error) => {
    console.error('Unexpected database pool error:', err);
  });
}
