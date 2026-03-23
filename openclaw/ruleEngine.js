/**
 * ruleEngine.js — Logika reminder berdasarkan deadline tugas.
 *
 * Rules:
 * - H-3 : Kirim reminder 3 hari sebelum deadline
 * - H-1 : Kirim reminder 1 hari sebelum deadline
 * - H   : Kirim reminder pada hari deadline
 */

/**
 * Menghitung selisih hari antara hari ini dan deadline.
 * @param {string} deadlineStr - Tanggal deadline dalam format YYYY-MM-DD
 * @returns {number} Selisih hari (positif = deadline di masa depan)
 */
function getDaysUntilDeadline(deadlineStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Memproses daftar tugas dan mengembalikan tugas yang perlu direminder.
 * @param {Array} tugasList - Array of tugas objects dari database
 * @returns {Array} Array of { tugas, reminderType } yang perlu dikirim
 */
function processReminders(tugasList) {
  const reminders = [];

  for (const tugas of tugasList) {
    const daysLeft = getDaysUntilDeadline(tugas.deadline);

    if (daysLeft === 3) {
      reminders.push({ tugas, reminderType: "H-3" });
    } else if (daysLeft === 1) {
      reminders.push({ tugas, reminderType: "H-1" });
    } else if (daysLeft === 0) {
      reminders.push({ tugas, reminderType: "Hari H" });
    }
  }

  return reminders;
}

module.exports = { processReminders, getDaysUntilDeadline };
