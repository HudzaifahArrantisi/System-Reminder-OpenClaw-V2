/**
 * bot/telegram.js — Integrasi Bot Telegram.
 * Mengirim pesan ke channel/group menggunakan Telegram Bot API.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

if (!BOT_TOKEN) {
  console.warn('⚠️  TELEGRAM_BOT_TOKEN tidak diset di environment');
}
if (!CHANNEL_ID) {
  console.warn('⚠️  TELEGRAM_CHANNEL_ID tidak diset di environment');
}

/**
 * Kirim pesan ke Telegram channel/group.
 * @param {string} message - Pesan dalam format Markdown
 * @returns {Promise<boolean>} true jika berhasil
 */
async function sendMessage(message) {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error('TELEGRAM_BOT_TOKEN atau TELEGRAM_CHANNEL_ID belum diset');
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }

  return true;
}

module.exports = { sendMessage };