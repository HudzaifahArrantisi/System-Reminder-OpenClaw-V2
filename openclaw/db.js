/**
 * db.js — Koneksi PostgreSQL untuk OpenClaw scheduler.
 */

const { Pool } = require('pg');

function normalizeDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return databaseUrl;
  return databaseUrl.replace(/sslmode=(?:prefer|require|verify-ca)\b/i, 'sslmode=verify-full');
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
});

async function ensureOpenClawTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS openclaw_task_status (
      tugas_id INT PRIMARY KEY REFERENCES tugas(id) ON DELETE CASCADE,
      status_code TEXT NOT NULL,
      status_label TEXT NOT NULL,
      reminder_type TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      source TEXT NOT NULL DEFAULT 'openclaw'
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_openclaw_task_status_code
    ON openclaw_task_status (status_code, updated_at DESC)
  `);
}

async function getActiveTasks() {
  const query = `
    SELECT
      t.id,
      COALESCE(ul.name, uv2.full_name, uv2.username) AS dosen_name,
      COALESCE(c.name, cl.name, 'Mata Kuliah') AS course_name,
      p.pertemuan_ke AS pertemuan,
      t.pertemuan_id,
      t.title,
      t.description,
      t.tanggal_upload AS start_date,
      t.deadline AS deadline_date
    FROM tugas t
    LEFT JOIN courses c ON c.id::text = t.course_id::text
    LEFT JOIN courses_legacy cl ON cl.id::text = t.course_id::text
    LEFT JOIN pertemuan p ON p.id::text = t.pertemuan_id::text
    LEFT JOIN users_legacy ul ON ul.id = t.dosen_id
    LEFT JOIN users uv2 ON uv2.id::text = t.dosen_id::text
    WHERE CURRENT_DATE >= t.tanggal_upload
      AND CURRENT_DATE <= t.deadline
      AND COALESCE(ul.role, uv2.role_code) = 'dosen'
  `;

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    ...row,
    course_id: row.course_name,
    dosen_id: row.dosen_name,
  }));
}

async function upsertTaskStatus(taskId, stage) {
  await pool.query(
    `
      INSERT INTO openclaw_task_status (tugas_id, status_code, status_label, reminder_type, updated_at, source)
      VALUES ($1, $2, $3, $4, now(), 'openclaw')
      ON CONFLICT (tugas_id)
      DO UPDATE SET
        status_code = EXCLUDED.status_code,
        status_label = EXCLUDED.status_label,
        reminder_type = EXCLUDED.reminder_type,
        updated_at = now(),
        source = 'openclaw'
    `,
    [taskId, stage.statusCode, stage.label, stage.notificationType]
  );
}

async function isNotificationSentToday(taskId, notificationType) {
  const query = `
    SELECT 1 FROM notification_log
    WHERE tugas_id = $1
      AND sent_at_date = CURRENT_DATE
      AND notification_type = $2
  `;
  const result = await pool.query(query, [taskId, notificationType]);
  return result.rows.length > 0;
}

async function logNotificationSent(taskId, notificationType) {
  const query = `
    INSERT INTO notification_log (tugas_id, sent_at_date, notification_type)
    VALUES ($1, CURRENT_DATE, $2)
    ON CONFLICT DO NOTHING
  `;
  await pool.query(query, [taskId, notificationType]);
}

module.exports = {
  pool,
  ensureOpenClawTables,
  getActiveTasks,
  upsertTaskStatus,
  isNotificationSentToday,
  logNotificationSent,
};