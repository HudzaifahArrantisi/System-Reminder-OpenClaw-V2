const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function normalizeDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return databaseUrl;
  return databaseUrl.replace(/sslmode=(?:prefer|require|verify-ca)\b/i, 'sslmode=verify-full');
}

async function runMigrations() {
  const migrationsDir = path.resolve(__dirname, './migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  const client = new Client({
    connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying migration: ${file}`);
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
    }
    console.log('All migrations applied successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

runMigrations();
