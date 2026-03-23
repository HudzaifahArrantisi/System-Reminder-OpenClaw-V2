/**
 * db.js — Koneksi ke PostgreSQL menggunakan pg Pool.
 * Menggunakan DATABASE_URL dari environment variable.
 */

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Log status koneksi
pool.on("connect", () => {
  console.log("✅ OpenClaw terhubung ke PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error koneksi database:", err.message);
});

module.exports = pool;
