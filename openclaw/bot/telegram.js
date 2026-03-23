/**
 * bot/telegram.js — Integrasi Telegram Bot untuk mengirim notifikasi.
 * Menggunakan node-telegram-bot-api.
 */

const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Inisialisasi bot (polling mode tidak diperlukan, hanya kirim pesan)
let bot = null;

/**
 * Menginisialisasi bot Telegram.
 */
function initBot() {
  if (!token || token === "xxxx") {
    console.warn("⚠️  TELEGRAM_BOT_TOKEN belum dikonfigurasi. Bot tidak aktif.");
    return;
  }
  bot = new TelegramBot(token);
  console.log("✅ Telegram Bot diinisialisasi");
}

/**
 * Mengirim pesan reminder ke Telegram.
 * @param {Object} tugas - Objek tugas
 * @param {string} reminderType - Tipe reminder (H-3, H-1, Hari H)
 */
async function sendReminder(tugas, reminderType) {
  if (!bot) {
    console.log(`[DRY RUN] [${reminderType}] Tugas: ${tugas.nama_tugas} - ${tugas.matkul}, Deadline: ${tugas.deadline}`);
    return;
  }

  if (!chatId || chatId === "xxxx") {
    console.warn("⚠️  TELEGRAM_CHAT_ID belum dikonfigurasi.");
    return;
  }

  const message =
    `📋 *[REMINDER - ${reminderType}]*\n\n` +
    `📚 Mata Kuliah: *${tugas.matkul}*\n` +
    `📝 Tugas: *${tugas.nama_tugas}*\n` +
    `📅 Pertemuan: ${tugas.pertemuan}\n` +
    `⏰ Deadline: *${tugas.deadline}*\n\n` +
    `Jangan lupa kerjakan tugasmu! 💪`;

  try {
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    console.log(`✅ Reminder ${reminderType} terkirim untuk: ${tugas.nama_tugas}`);
  } catch (err) {
    console.error(`❌ Gagal kirim reminder: ${err.message}`);
  }
}

module.exports = { initBot, sendReminder };
