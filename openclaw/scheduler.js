/**
 * scheduler.js — Penjadwal otomatis menggunakan node-cron.
 * Mengecek data tugas dari database setiap interval,
 * memproses melalui rule engine, dan mengirim notifikasi via Telegram bot.
 */

const cron = require("node-cron");
const pool = require("./db");
const { processReminders } = require("./ruleEngine");
const { sendReminder } = require("./bot/telegram");

/**
 * Mengambil semua tugas dari database.
 * @returns {Array} Daftar tugas
 */
async function fetchTugas() {
  try {
    const result = await pool.query(
      "SELECT id, matkul, pertemuan, nama_tugas, tanggal_dibuat::text, deadline::text FROM tugas"
    );
    return result.rows;
  } catch (err) {
    console.error("❌ Gagal fetch data tugas:", err.message);
    return [];
  }
}

/**
 * Proses utama: fetch tugas → cek rule → kirim reminder
 */
async function checkAndNotify() {
  console.log(`\n🔄 [${new Date().toISOString()}] Mengecek tugas...`);

  const tugasList = await fetchTugas();
  console.log(`📦 Ditemukan ${tugasList.length} tugas`);

  const reminders = processReminders(tugasList);
  console.log(`🔔 ${reminders.length} reminder perlu dikirim`);

  for (const { tugas, reminderType } of reminders) {
    await sendReminder(tugas, reminderType);
  }
}

/**
 * Menjalankan scheduler.
 * Cron: setiap jam pada menit ke-0 (0 * * * *)
 */
function startScheduler() {
  console.log("⏰ Scheduler dimulai — cek setiap jam");

  // Jalankan segera saat startup
  checkAndNotify();

  // Jadwalkan cek setiap jam
  cron.schedule("0 * * * *", () => {
    checkAndNotify();
  });
}

module.exports = { startScheduler };
