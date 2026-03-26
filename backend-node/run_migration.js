const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Neon DB.");
    
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'init.sql'), 'utf8');
    await client.query(sql);
    
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

runMigration();
