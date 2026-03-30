/**
 * ruleEngine.js — Logika aturan untuk perhitungan countdown & format pesan.
 */

function escapeHTML(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format tanggal ke standar Indonesia
 */
function formatDateFull(dateString) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Menghitung selisih hari antara d1 dan d2 (d2 - d1).
 * Mengabaikan waktu, hanya menghitung berdasarkan tanggal UTC.
 */
function getDaysDiff(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  
  // Reset jam untuk akurasi perbedaan hari kalender
  date1.setUTCHours(0, 0, 0, 0);
  date2.setUTCHours(0, 0, 0, 0);

  const diffTime = date2 - date1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Proses tugas dan kembalikan pesan Telegram jika masuk jadwal notifikasi.
 * @param {Object} task
 * @param {String} todayString - YYYY-MM-DD format (opsional, jika kosong pakai hari ini)
 * @returns {String|null} Teks pesan Telegram html atau null jika tidak ada reminder.
 */
function processTaskReminder(task, todayString = null) {
  const appBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const taskUrl = `${appBaseUrl}/mahasiswa/pengumpulan/${task.id}`;
  const _today = todayString ? new Date(todayString) : new Date();
  
  // Waktu start_date & deadline dari database (timezone-agnostic treatment)
  const startDate = new Date(task.start_date);
  const deadlineDate = new Date(task.deadline_date);

  // Cek apakah hari ini adalah start_date (H)
  const isStartDate = getDaysDiff(startDate, _today) === 0;
  
  // Selisih hari ke deadline
  const daysToDeadline = getDaysDiff(_today, deadlineDate);

  const eTitle = escapeHTML(task.title);
  const eCourse = escapeHTML(task.course_id);
  const eDesc = escapeHTML(task.description);
  const ePertemuan = escapeHTML(task.pertemuan);

  const startFmt = escapeHTML(formatDateFull(task.start_date));
  const deadlineFmt = escapeHTML(formatDateFull(task.deadline_date));

  // 1) Notifikasi "Tugas Baru" (H = hari diberikan)
  if (isStartDate) {
    return (
      `📣 <b>Tugas Baru Diberikan!</b> 📚\n\n` +
      `<b>Mata Kuliah:</b> ${eCourse}\n` +
      `<b>Pertemuan:</b> ${ePertemuan}\n` +
      `<b>Judul Tugas:</b> ${eTitle}\n` +
      `<b>Diberikan:</b> ${startFmt}\n` +
      `<b>Deadline:</b> ${deadlineFmt}\n\n` +
      `<b>Deskripsi:</b>\n${eDesc}\n\n` +
      `🔗 <b>Link Tugas:</b> ${taskUrl}`
    );
  }

  // 2) KONDISI REMINDER (H-3, H-2, H-1, H0)
  // Syarat: Bukan tugas baru dan sisa waktunya 0, 1, 2, atau 3 hari.
  if (daysToDeadline === 3) {
    return (
      `⏰ <b>Reminder Tugas (H-3)</b>\n\n` +
      `<b>Matkul:</b> ${eCourse} (Pertemuan ${ePertemuan})\n` +
      `<b>Tugas:</b> ${eTitle}\n` +
      `<b>Deadline:</b> ${deadlineFmt}\n\n` +
      `<i>Masih ada 3 hari lagi. Segera mulai kerjakan ya!</i> 💪\n\n` +
      `🔗 <b>Link Tugas:</b> ${taskUrl}`
    );
  } else if (daysToDeadline === 2) {
    return (
      `⏰ <b>Reminder Tugas (H-2)</b>\n\n` +
      `<b>Matkul:</b> ${eCourse} (Pertemuan ${ePertemuan})\n` +
      `<b>Tugas:</b> ${eTitle}\n` +
      `<b>Deadline:</b> lusa (${deadlineFmt})\n\n` +
      `<i>Sisa 2 hari lagi! Jangan ditunda.</i> ⏳\n\n` +
      `🔗 <b>Link Tugas:</b> ${taskUrl}`
    );
  } else if (daysToDeadline === 1) {
    return (
      `🚨 <b>Reminder Tugas (H-1)</b>\n\n` +
      `<b>Matkul:</b> ${eCourse} (Pertemuan ${ePertemuan})\n` +
      `<b>Tugas:</b> ${eTitle}\n` +
      `<b>Deadline:</b> besok (${deadlineFmt})\n\n` +
      `<i>Besok adalah deadline! Cek kembali jawabanmu.</i> 🔥\n\n` +
      `🔗 <b>Link Tugas:</b> ${taskUrl}`
    );
  } else if (daysToDeadline === 0) {
    return (
      `🔴 <b>DEADLINE HARI INI! (H0)</b>\n\n` +
      `<b>Matkul:</b> ${eCourse} (Pertemuan ${ePertemuan})\n` +
      `<b>Tugas:</b> ${eTitle}\n` +
      `<b>Batas Pengumpulan:</b> Hari ini (${deadlineFmt})\n\n` +
      `<i>Hari terakhir pengumpulan! Segera submit tugasmu sekarang!</i> ❗\n\n` +
      `🔗 <b>Link Tugas:</b> ${taskUrl}`
    );
  }

  // Jika kondisi tidak memenuhi (misal sisa H-5), jangan kirim reminder
  return null;
}

module.exports = { processTaskReminder, getDaysDiff };