#!/usr/bin/env node

// Quick script to normalize emails in Railway database
// Usage: DATABASE_URL="your-railway-db-url" node normalize-railway-db.js

const { Client } = require('pg');

async function normalizeEmails() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is required');
    console.log('\nUsage:');
    console.log('  DATABASE_URL="postgresql://..." node normalize-railway-db.js');
    process.exit(1);
  }

  console.log('🔌 Connecting to Railway database...');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Show current emails
    console.log('📋 Current user emails:');
    const currentUsers = await client.query('SELECT id, name, email FROM users ORDER BY name');
    currentUsers.rows.forEach(user => {
      console.log(`  - ${user.name}: ${user.email}`);
    });

    console.log('\n🔄 Normalizing emails to lowercase...');

    // Normalize emails
    const result = await client.query('UPDATE users SET email = LOWER(TRIM(email))');
    console.log(`✅ Updated ${result.rowCount} user(s)\n`);

    // Show updated emails
    console.log('📋 Updated user emails:');
    const updatedUsers = await client.query('SELECT id, name, email FROM users ORDER BY name');
    updatedUsers.rows.forEach(user => {
      console.log(`  - ${user.name}: ${user.email}`);
    });

    console.log('\n🎉 Email normalization completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

normalizeEmails();
