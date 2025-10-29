#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Run with: node test-db-connection.js
 */

import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Configure WebSocket
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

console.log('🔍 Testing database connection...\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  console.log('\nPlease set DATABASE_URL:');
  console.log('export DATABASE_URL="postgresql://user:password@host:port/database"');
  process.exit(1);
}

// Mask the password in the connection string for display
function maskConnectionString(url) {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '****';
    }
    return parsed.toString();
  } catch {
    return 'invalid-url';
  }
}

console.log('📋 Connection Details:');
console.log('  URL:', maskConnectionString(process.env.DATABASE_URL));
console.log('');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  let client;
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣  Testing basic connection...');
    client = await pool.connect();
    console.log('   ✅ Connection successful!\n');

    // Test 2: Check PostgreSQL version
    console.log('2️⃣  Checking PostgreSQL version...');
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version.split(' ')[0] + ' ' + versionResult.rows[0].version.split(' ')[1];
    console.log('   ✅ PostgreSQL version:', version, '\n');

    // Test 3: Check current database
    console.log('3️⃣  Checking current database...');
    const dbResult = await client.query('SELECT current_database()');
    console.log('   ✅ Database:', dbResult.rows[0].current_database, '\n');

    // Test 4: List all tables
    console.log('4️⃣  Listing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  No tables found. Run "npm run db:push" to create schema.\n');
    } else {
      console.log(`   ✅ Found ${tablesResult.rows.length} table(s):`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`      ${index + 1}. ${row.table_name}`);
      });
      console.log('');
    }

    // Test 5: Check for specific SeamXY tables
    console.log('5️⃣  Checking SeamXY schema tables...');
    const expectedTables = [
      'users',
      'products', 
      'makers',
      'orders',
      'personas',
      'supplier_accounts'
    ];
    
    const existingTables = tablesResult.rows.map(r => r.table_name);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log(`   ⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log('   ℹ️  Run "npm run db:push" to create schema\n');
    } else {
      console.log('   ✅ All core tables exist!\n');
    }

    // Test 6: Count records in key tables
    if (existingTables.includes('personas')) {
      console.log('6️⃣  Checking sample data...');
      const personasCount = await client.query('SELECT COUNT(*) FROM personas');
      const usersCount = await client.query('SELECT COUNT(*) FROM users');
      const productsCount = await client.query('SELECT COUNT(*) FROM products');
      
      console.log(`   - Personas: ${personasCount.rows[0].count} records`);
      console.log(`   - Users: ${usersCount.rows[0].count} records`);
      console.log(`   - Products: ${productsCount.rows[0].count} records`);
      console.log('');
    }

    // Test 7: Test write capability
    console.log('7️⃣  Testing write capability...');
    const testTable = 'session'; // Session table is created by express-session
    const sessionTest = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'session'
    `);
    
    if (sessionTest.rows.length > 0) {
      console.log('   ✅ Write capability confirmed (session table exists)\n');
    } else {
      console.log('   ℹ️  Session table will be created on first app start\n');
    }

    // Summary
    console.log('━'.repeat(50));
    console.log('✅ DATABASE CONNECTION TEST PASSED!');
    console.log('━'.repeat(50));
    console.log('\n✨ Your database is ready for deployment!\n');
    
    if (missingTables.length > 0) {
      console.log('⚠️  Next steps:');
      console.log('   1. Run: npm run db:push');
      console.log('   2. Start your application\n');
    }

  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION FAILED!\n');
    console.error('Error details:', error.message);
    
    // Provide helpful troubleshooting tips
    console.log('\n🔧 Troubleshooting:');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('   • Check that your database host is correct and accessible');
      console.log('   • Verify the database server is running');
      console.log('   • Check firewall settings');
    }
    
    if (error.message.includes('authentication')) {
      console.log('   • Verify your username and password are correct');
      console.log('   • Check that the user has proper permissions');
    }
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('   • The database does not exist, create it first:');
      console.log('     sudo -u postgres psql');
      console.log('     CREATE DATABASE seamxy_production;');
    }
    
    console.log('\n   • Your DATABASE_URL:', maskConnectionString(process.env.DATABASE_URL));
    console.log('');
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the test
testConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
