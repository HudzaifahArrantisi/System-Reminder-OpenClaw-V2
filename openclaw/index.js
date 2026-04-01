/**
 * OpenClaw Automation Engine
 * Entry point — menjalankan scheduler reminder tugas ke Telegram.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { startScheduler } = require('./scheduler');

console.log('🦞 OpenClaw Reminder Engine starting...');
startScheduler().catch((error) => {
  console.error('❌ OpenClaw gagal start:', error.message);
  process.exit(1);
});