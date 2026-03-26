/**
 * scheduler.js — Penjadwalan pengiriman reminder via cron.
 * Berjalan setiap jam (atau sesuai OPENCLAW_CRON_SCHEDULE).
 */

const cron = require('node-cron');
const { getActiveTasks, isNotificationSentToday, logNotificationSent } = require('./db');
const { processTaskReminder } = require('./ruleEngine');
const { sendMessage } = require('./bot/telegram');

const CRON_SCHEDULE = process.env.OPENCLAW_CRON_SCHEDULE || '0 * * * *'; // Default jalan setiap jam

/**
 * Jalankan proses pengiriman reminder sekali.
 */
async function runReminderJob() {
  console.log(`\n[${new Date().toISOString()}] 🔔 Cek tugas aktif...`);

  let tasks = [];
  try {
    tasks = await getActiveTasks();
  } catch (err) {
    console.error('❌ Gagal fetch active tasks:', err.message);
    return;
  }

  if (tasks.length === 0) {
    console.log('✅ Tidak ada tugas aktif hari ini.');
    return;
  }

  console.log(`📋 Memeriksa ${tasks.length} tugas aktif...`);

  let sentCount = 0;

  for (const task of tasks) {
    try {
      // 1. Dapatkan teks pesan (atau null jika tidak masuk rule H- / tugas baru)
      const message = processTaskReminder(task);
      
      // 2. Jika iya, cek apakah hari ini pesan untuk tugas ini sudah sukses dikirim
      if (message) {
        const alreadySent = await isNotificationSentToday(task.id);
        if (alreadySent) {
           console.log(`⏭️  Skip: Notifikasi [${task.course_id}] ${task.title} sudah dikirim hari ini.`);
           continue;
        }

        // 3. Kirim Telegram API
        await sendMessage(message);
        
        // 4. Catat di DB agar tidak dikirim ulang oleh instance lain atau cron berikutnya hari ini
        await logNotificationSent(task.id);
        
        console.log(`✅ Notifikasi Terkirim: [${task.course_id}] ${task.title}`);
        sentCount++;
        
        // Jeda 500ms agar bot Telegram santai
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (err) {
      console.error(`❌ Gagal parse/kirim [${task.course_id}] ${task.title}:`, err.message);
    }
  }

  console.log(`[${new Date().toISOString()}] 🏁 Selesai. (${sentCount} pesan terkirim)\n`);
}

/**
 * Start cron scheduler.
 */
function startScheduler() {
  console.log(`⏰ Scheduler aktif — jadwal: "${CRON_SCHEDULE}"`);

  // Langsung jalankan sekali saat start untuk test trigger
  runReminderJob();

  // Jadwalkan via cron
  cron.schedule(CRON_SCHEDULE, runReminderJob);
}

module.exports = { startScheduler, runReminderJob };