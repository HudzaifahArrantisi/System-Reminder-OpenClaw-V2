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

function formatDateFull(dateString) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getDaysDiff(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  date1.setUTCHours(0, 0, 0, 0);
  date2.setUTCHours(0, 0, 0, 0);

  const diffTime = date2 - date1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getTaskStage(task, todayString = null) {
  const today = todayString ? new Date(todayString) : new Date();
  const startDate = new Date(task.start_date);
  const deadlineDate = new Date(task.deadline_date);

  const totalGapDays = getDaysDiff(startDate, deadlineDate);
  const isStartDate = getDaysDiff(startDate, today) === 0;
  const daysToDeadline = getDaysDiff(today, deadlineDate);

  if (isStartDate) {
    return { statusCode: 'new', label: 'Tugas Baru', notificationType: 'instant' };
  }

  if (daysToDeadline === 0) {
    return { statusCode: 'h0', label: 'H0 Deadline', notificationType: 'h0' };
  }

  if (daysToDeadline === 1) {
    return { statusCode: 'h1', label: 'H-1 Deadline', notificationType: 'h1' };
  }

  // Aturan khusus: jika gap total hanya 2 hari, tidak ada H-2; langsung H-1 lalu H0.
  if (totalGapDays === 2) {
    return { statusCode: 'idle', label: 'Monitoring', notificationType: null };
  }

  if (daysToDeadline === 2 && totalGapDays >= 3) {
    return { statusCode: 'h2', label: 'H-2 Deadline', notificationType: 'h2' };
  }

  if (daysToDeadline === 3 && totalGapDays >= 3) {
    return { statusCode: 'h3', label: 'H-3 Deadline', notificationType: 'h3' };
  }

  return { statusCode: 'idle', label: 'Monitoring', notificationType: null };
}

function processTaskReminder(task, todayString = null) {
  const appBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const taskPathTemplate = process.env.FRONTEND_TASK_PATH || '/mahasiswa/matkul';
  const taskPath = taskPathTemplate.includes(':taskId')
    ? taskPathTemplate.replace(':taskId', String(task.id))
    : taskPathTemplate;
  const taskUrl = `${appBaseUrl}${taskPath}`;

  const stage = getTaskStage(task, todayString);
  if (!stage.notificationType) {
    return null;
  }

  const eTitle = escapeHTML(task.title);
  const eCourse = escapeHTML(task.course_id);
  const eDesc = escapeHTML(task.description);
  const ePertemuan = escapeHTML(task.pertemuan);

  const startFmt = escapeHTML(formatDateFull(task.start_date));
  const deadlineFmt = escapeHTML(formatDateFull(task.deadline_date));

  if (stage.notificationType === 'instant') {
    return {
      notificationType: 'instant',
      message:
        `📢 <b>TUGAS BARU</b>\n\n` +
        `<b>Matkul:</b> ${eCourse}\n` +
        `<b>Pertemuan:</b> ${ePertemuan}\n` +
        `<b>Tugas:</b> ${eTitle}\n` +
        `<b>Upload:</b> ${startFmt}\n` +
        `<b>Deadline:</b> ${deadlineFmt}\n\n` +
        `<b>Deskripsi:</b>\n${eDesc}\n\n` +
        `🔗 <b>Kerjakan:</b> ${taskUrl}`,
    };
  }

  if (stage.notificationType === 'h3') {
    return {
      notificationType: 'h3',
      message:
        `⏰ <b>H-3 DEADLINE</b>\n\n` +
        `<b>Tugas:</b> ${eTitle}\n` +
        `<b>Matkul:</b> ${eCourse}\n` +
        `<b>Deadline:</b> ${deadlineFmt}\n\n` +
        `🔗 <b>Kerjakan:</b> ${taskUrl}`,
    };
  }

  if (stage.notificationType === 'h2') {
    return {
      notificationType: 'h2',
      message:
        `⚠️ <b>H-2 DEADLINE</b>\n\n` +
        `<b>Tugas:</b> ${eTitle}\n` +
        `<b>Matkul:</b> ${eCourse}\n` +
        `<b>Deadline:</b> ${deadlineFmt}\n\n` +
        `🔗 <b>Kerjakan:</b> ${taskUrl}`,
    };
  }

  if (stage.notificationType === 'h1') {
    return {
      notificationType: 'h1',
      message:
        `🔥 <b>H-1 DEADLINE</b>\n\n` +
        `<b>Tugas:</b> ${eTitle}\n` +
        `<b>Matkul:</b> ${eCourse}\n` +
        `<b>Deadline:</b> ${deadlineFmt}\n\n` +
        `🔗 <b>Kerjakan:</b> ${taskUrl}`,
    };
  }

  return {
    notificationType: 'h0',
    message:
      `🚨 <b>H0 DEADLINE HARI INI</b>\n\n` +
      `<b>Tugas:</b> ${eTitle}\n` +
      `<b>Matkul:</b> ${eCourse}\n` +
      `<b>Deadline:</b> ${deadlineFmt}\n\n` +
      `🔗 <b>Kerjakan:</b> ${taskUrl}`,
  };
}

module.exports = { processTaskReminder, getTaskStage, getDaysDiff };