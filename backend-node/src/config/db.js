const { Pool } = require('pg');
const { env } = require('./env');

function normalizeDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return databaseUrl;
  return databaseUrl.replace(/sslmode=(?:prefer|require|verify-ca)\b/i, 'sslmode=verify-full');
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = { pool };
