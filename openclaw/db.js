/**
 * db.js — Koneksi PostgreSQL untuk OpenClaw scheduler.
 * Menggunakan pg library untuk query READ-ONLY langsung ke NeonDB.
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
});

/**
 * Mengambil semua tugas yang sedang aktif.
 * Tugas aktif = rentang hari ini (today) berada di antara tanggal_dibuat dan deadline.
 * Query menggunakan JOIN ke matkul agar mendapatkan nama_matkul (course_id).
 */
async function getActiveTasks() {
  const query = `
    SELECT 
        t.id, 
        u.name AS dosen_id, 
        c.name AS course_id, 
        p.pertemuan_ke AS pertemuan,
        t.pertemuan_id,
        t.title, 
        t.description, 
        t.tanggal_upload AS start_date, 
        t.deadline AS deadline_date
    FROM tugas t
    JOIN courses c ON t.course_id = c.id
    JOIN pertemuan p ON t.pertemuan_id = p.id
    JOIN users u ON t.dosen_id = u.id
    WHERE CURRENT_DATE >= t.tanggal_upload 
      AND CURRENT_DATE <= t.deadline
      AND u.role = 'dosen';
  `;
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Cek apakah pesan untuk task ini sudah dikirim HARI INI.
 */
async function isNotificationSentToday(taskId) {
  const query = `
    SELECT 1 FROM notification_log 
    WHERE tugas_id = $1 AND sent_at_date = CURRENT_DATE
  `;
  const result = await pool.query(query, [taskId]);
  return result.rows.length > 0;
}

/**
 * Catat bahwa pesan untuk task ini sudah dikirim HARI INI.
 */
async function logNotificationSent(taskId) {
  const query = `
    INSERT INTO notification_log (tugas_id, sent_at_date) 
    VALUES ($1, CURRENT_DATE) 
    ON CONFLICT DO NOTHING
  `;
  await pool.query(query, [taskId]);
}

module.exports = { pool, getActiveTasks, isNotificationSentToday, logNotificationSent };