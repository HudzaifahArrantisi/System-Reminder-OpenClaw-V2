/**
 * scheduler.js — Penjadwalan pengiriman reminder via cron.
 * Berjalan setiap jam (atau sesuai OPENCLAW_CRON_SCHEDULE).
 */

const cron = require('node-cron');
const {
  ensureOpenClawTables,
  getActiveTasks,
  upsertTaskStatus,
  isNotificationSentToday,
  logNotificationSent,
} = require('./db');
const { processTaskReminder, getTaskStage } = require('./ruleEngine');
const { sendMessage } = require('./bot/telegram');

const CRON_SCHEDULE = process.env.OPENCLAW_CRON_SCHEDULE || '0 * * * *';

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
      const courseLabel = task.course_id || 'Mata Kuliah';
      const taskTitle = task.title || `Tugas #${task.id}`;

      const stage = getTaskStage(task);
      await upsertTaskStatus(task.id, stage);

      const reminderDecision = processTaskReminder(task);
      if (!reminderDecision) {
        continue;
      }

      const { notificationType, message } = reminderDecision;
      const alreadySent = await isNotificationSentToday(task.id, notificationType);
      if (alreadySent) {
        console.log(`⏭️  Skip: Notifikasi [${notificationType}] [${courseLabel}] ${taskTitle} sudah dikirim hari ini.`);
        continue;
      }

      await sendMessage(message);
      await logNotificationSent(task.id, notificationType);

      console.log(`✅ Notifikasi Terkirim: [${notificationType}] [${courseLabel}] ${taskTitle}`);
      sentCount++;

      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      const courseLabel = task.course_id || 'Mata Kuliah';
      const taskTitle = task.title || `Tugas #${task.id}`;
      console.error(`❌ Gagal parse/kirim [${courseLabel}] ${taskTitle}:`, err.message);
    }
  }

  console.log(`[${new Date().toISOString()}] 🏁 Selesai. (${sentCount} pesan terkirim)\n`);
}

async function startScheduler() {
  await ensureOpenClawTables();
  console.log(`⏰ Scheduler aktif — jadwal: "${CRON_SCHEDULE}"`);

  runReminderJob();
  cron.schedule(CRON_SCHEDULE, runReminderJob);
}

module.exports = { startScheduler, runReminderJob };