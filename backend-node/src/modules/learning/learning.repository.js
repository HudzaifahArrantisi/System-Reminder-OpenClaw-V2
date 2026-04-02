const path = require('path');
const { pool } = require('../../config/db');

const STATUS_ORDER = {
  new: 1,
  h3: 2,
  h2: 3,
  h1: 4,
  h0: 5,
  idle: 6,
};

function getDaysDiff(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  from.setUTCHours(0, 0, 0, 0);
  to.setUTCHours(0, 0, 0, 0);

  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function getTaskStage(tanggalUpload, deadline, todayValue = null) {
  const today = todayValue ? new Date(todayValue) : new Date();
  const totalGapDays = getDaysDiff(tanggalUpload, deadline);
  const isStartDate = getDaysDiff(tanggalUpload, today) === 0;
  const daysToDeadline = getDaysDiff(today, deadline);

  if (isStartDate) {
    return { statusCode: 'new', statusLabel: 'Tugas Baru', reminderType: 'instant' };
  }

  if (daysToDeadline === 0) {
    return { statusCode: 'h0', statusLabel: 'H0 Deadline', reminderType: 'h0' };
  }

  if (daysToDeadline === 1) {
    return { statusCode: 'h1', statusLabel: 'H-1 Deadline', reminderType: 'h1' };
  }

  if (totalGapDays === 2) {
    return { statusCode: 'idle', statusLabel: 'Monitoring', reminderType: null };
  }

  if (daysToDeadline === 2 && totalGapDays >= 3) {
    return { statusCode: 'h2', statusLabel: 'H-2 Deadline', reminderType: 'h2' };
  }

  if (daysToDeadline === 3 && totalGapDays >= 3) {
    return { statusCode: 'h3', statusLabel: 'H-3 Deadline', reminderType: 'h3' };
  }

  return { statusCode: 'idle', statusLabel: 'Monitoring', reminderType: null };
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDateForTelegram(dateValue) {
  if (!dateValue) return '-';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

async function dispatchInstantTelegramReminder(taskInfo) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    return;
  }

  const appBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const taskUrl = `${appBaseUrl}/mahasiswa/pengumpulan/${taskInfo.taskId}`;

  const message =
    `📢 <b>TUGAS BARU</b>\n\n` +
    `<b>Matkul:</b> ${escapeHtml(taskInfo.courseName)}\n` +
    `<b>Pertemuan:</b> ${escapeHtml(taskInfo.pertemuanKe)}\n` +
    `<b>Tugas:</b> ${escapeHtml(taskInfo.title)}\n` +
    `<b>Upload:</b> ${escapeHtml(formatDateForTelegram(taskInfo.tanggalUpload))}\n` +
    `<b>Deadline:</b> ${escapeHtml(formatDateForTelegram(taskInfo.deadline))}\n\n` +
    `<b>Deskripsi:</b>\n${escapeHtml(taskInfo.description || '-') }\n\n` +
    `🔗 <b>Buka tugas:</b> ${taskUrl}`;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: channelId,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.description || 'Gagal kirim notifikasi Telegram');
  }

  await pool.query(
    `
      INSERT INTO notification_log (tugas_id, sent_at_date, notification_type)
      VALUES ($1, CURRENT_DATE, 'instant')
      ON CONFLICT DO NOTHING
    `,
    [taskInfo.taskId]
  );
}

async function ensureLearningTables() {
  await pool.query(`
    DO $$
    DECLARE
      legacy_suffix text := to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS');
      pertemuan_course_id_type text;
      tugas_course_id_type text;
      tugas_dosen_id_type text;
      submissions_mahasiswa_id_type text;
    BEGIN
      IF to_regclass('public.pertemuan') IS NOT NULL THEN
        SELECT data_type
        INTO pertemuan_course_id_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pertemuan'
          AND column_name = 'course_id'
        LIMIT 1;

        IF pertemuan_course_id_type IS DISTINCT FROM 'uuid' THEN
          EXECUTE format('ALTER TABLE public.pertemuan RENAME TO %I', 'pertemuan_legacy_' || legacy_suffix);
        END IF;
      END IF;

      IF to_regclass('public.tugas') IS NOT NULL THEN
        SELECT data_type
        INTO tugas_course_id_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tugas'
          AND column_name = 'course_id'
        LIMIT 1;

        SELECT data_type
        INTO tugas_dosen_id_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tugas'
          AND column_name = 'dosen_id'
        LIMIT 1;

        IF tugas_course_id_type IS DISTINCT FROM 'uuid' OR tugas_dosen_id_type IS DISTINCT FROM 'uuid' THEN
          IF to_regclass('public.openclaw_task_status') IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.openclaw_task_status RENAME TO %I', 'openclaw_task_status_legacy_' || legacy_suffix);
          END IF;

          IF to_regclass('public.notification_log') IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.notification_log RENAME TO %I', 'notification_log_legacy_' || legacy_suffix);
          END IF;

          IF to_regclass('public.tugas_submissions') IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.tugas_submissions RENAME TO %I', 'tugas_submissions_legacy_' || legacy_suffix);
          END IF;

          EXECUTE format('ALTER TABLE public.tugas RENAME TO %I', 'tugas_legacy_' || legacy_suffix);
        END IF;
      END IF;

      IF to_regclass('public.tugas_submissions') IS NOT NULL THEN
        SELECT data_type
        INTO submissions_mahasiswa_id_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tugas_submissions'
          AND column_name = 'mahasiswa_id'
        LIMIT 1;

        IF submissions_mahasiswa_id_type IS DISTINCT FROM 'uuid' THEN
          EXECUTE format('ALTER TABLE public.tugas_submissions RENAME TO %I', 'tugas_submissions_legacy_' || legacy_suffix);
        END IF;
      END IF;
    END
    $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pertemuan (
      id SERIAL PRIMARY KEY,
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      pertemuan_ke SMALLINT NOT NULL CHECK (pertemuan_ke BETWEEN 1 AND 16),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (course_id, pertemuan_ke)
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_pertemuan_course_uuid
    ON pertemuan (course_id, pertemuan_ke)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tugas (
      id SERIAL PRIMARY KEY,
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      pertemuan_id INT NOT NULL REFERENCES pertemuan(id) ON DELETE CASCADE,
      dosen_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      tanggal_upload DATE NOT NULL,
      deadline DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tugas_pertemuan_deadline_uuid
    ON tugas (pertemuan_id, deadline, id DESC)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tugas_upload_uuid
    ON tugas (tanggal_upload DESC, id DESC)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tugas_submissions (
      id SERIAL PRIMARY KEY,
      tugas_id INT NOT NULL REFERENCES tugas(id) ON DELETE CASCADE,
      mahasiswa_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_size BIGINT,
      file_type VARCHAR(120),
      stored_path TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (tugas_id, mahasiswa_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_log (
      id SERIAL PRIMARY KEY,
      tugas_id INT REFERENCES tugas(id) ON DELETE CASCADE,
      sent_at_date DATE NOT NULL,
      notification_type TEXT NOT NULL DEFAULT 'generic',
      UNIQUE (tugas_id, sent_at_date, notification_type)
    )
  `);

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
    CREATE INDEX IF NOT EXISTS idx_openclaw_task_status_code_uuid
    ON openclaw_task_status (status_code, updated_at DESC)
  `);
}

async function upsertTaskStatus(taskId, stage, source = 'openclaw') {
  await pool.query(
    `
      INSERT INTO openclaw_task_status (tugas_id, status_code, status_label, reminder_type, updated_at, source)
      VALUES ($1, $2, $3, $4, now(), $5)
      ON CONFLICT (tugas_id)
      DO UPDATE SET
        status_code = EXCLUDED.status_code,
        status_label = EXCLUDED.status_label,
        reminder_type = EXCLUDED.reminder_type,
        updated_at = now(),
        source = EXCLUDED.source
    `,
    [taskId, stage.statusCode, stage.statusLabel, stage.reminderType, source]
  );
}

async function listMeetingContents(_req) {
  return null;
}

async function createMaterial(_req) {
  return null;
}

async function createTask(_req) {
  return null;
}

async function updateContent(_req) {
  return null;
}

async function deleteContent(_req) {
  return null;
}

async function listTaskSubmissions(req) {
  await ensureLearningTables();

  const { taskId } = req.params;
  const role = req.auth?.role;
  const requesterId = String(req.auth?.sub || '');

  const taskResult = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.tanggal_upload,
        t.deadline,
        t.pertemuan_id,
        t.dosen_id,
        c.name AS course_name,
        p.pertemuan_ke
      FROM tugas t
      JOIN courses c ON c.id::text = t.course_id::text
      JOIN pertemuan p ON p.id::text = t.pertemuan_id::text
      WHERE t.id = $1
      LIMIT 1
    `,
    [taskId]
  );

  if (taskResult.rows.length === 0) {
    return { taskNotFound: true };
  }

  const task = taskResult.rows[0];
  if (role === 'dosen' && String(task.dosen_id) !== requesterId) {
    return { forbidden: true };
  }

  const submissionsResult = await pool.query(
    `
      SELECT
        ts.id,
        ts.tugas_id,
        ts.mahasiswa_id,
        ts.file_name,
        ts.file_size,
        ts.file_type,
        ts.stored_path,
        ts.submitted_at,
        COALESCE(u.full_name, u.username, ul.name, 'Mahasiswa') AS mahasiswa_name,
        u.username AS mahasiswa_username,
        u.email AS mahasiswa_email
      FROM tugas_submissions ts
      LEFT JOIN users u ON u.id::text = ts.mahasiswa_id::text
      LEFT JOIN users_legacy ul ON ul.id::text = ts.mahasiswa_id::text
      WHERE ts.tugas_id = $1
      ORDER BY ts.submitted_at DESC, ts.id DESC
    `,
    [taskId]
  );

  const submissions = submissionsResult.rows.map((row) => {
    const storedPath = row.stored_path || '';
    const storedFileName = storedPath ? path.basename(storedPath) : null;

    return {
      ...row,
      file_url: storedFileName ? `/uploads/${encodeURIComponent(storedFileName)}` : null,
    };
  });

  return {
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
      tanggal_upload: task.tanggal_upload,
      deadline: task.deadline,
      course_name: task.course_name,
      pertemuan_ke: task.pertemuan_ke,
    },
    submissions,
  };
}

async function createTaskSubmission(_req) {
  return null;
}

async function gradeSubmission(_req) {
  return null;
}

async function listTugasByPertemuan(req) {
  await ensureLearningTables();

  const { pertemuanId } = req.params;
  const role = req.auth?.role;
  const mahasiswaId = req.auth?.sub;

  if (role === 'mahasiswa') {
    const result = await pool.query(
      `
        SELECT
          t.*, 
          c.name AS course_name,
          p.pertemuan_ke
        FROM tugas t
        JOIN courses c ON c.id::text = t.course_id::text
        JOIN pertemuan p ON p.id::text = t.pertemuan_id::text
        WHERE t.pertemuan_id = $1
          AND NOT EXISTS (
            SELECT 1
            FROM tugas_submissions ts
            WHERE ts.tugas_id = t.id
              AND ts.mahasiswa_id::text = $2
          )
        ORDER BY t.deadline ASC, t.id DESC
      `,
      [pertemuanId, String(mahasiswaId)]
    );

    return result.rows;
  }

  const result = await pool.query(
    `
      SELECT
        t.*, 
        c.name AS course_name,
        p.pertemuan_ke
      FROM tugas t
      JOIN courses c ON c.id::text = t.course_id::text
      JOIN pertemuan p ON p.id::text = t.pertemuan_id::text
      WHERE t.pertemuan_id = $1
      ORDER BY t.deadline ASC, t.id DESC
    `,
    [pertemuanId]
  );

  return result.rows;
}

async function listTugas(req) {
  await ensureLearningTables();

  const role = req.auth?.role;
  const mahasiswaId = req.auth?.sub;

  if (role === 'mahasiswa') {
    const result = await pool.query(
      `
        SELECT
          t.*, 
          c.name AS course_name,
          p.pertemuan_ke,
          (t.deadline::date - CURRENT_DATE) AS days_left
        FROM tugas t
        JOIN courses c ON c.id::text = t.course_id::text
        JOIN pertemuan p ON p.id::text = t.pertemuan_id::text
        WHERE NOT EXISTS (
          SELECT 1
          FROM tugas_submissions ts
          WHERE ts.tugas_id = t.id
            AND ts.mahasiswa_id::text = $1
        )
        ORDER BY t.deadline ASC, t.id DESC
      `,
      [String(mahasiswaId)]
    );

    return result.rows;
  }

  const result = await pool.query(
    `
      SELECT
        t.*, 
        c.name AS course_name,
        p.pertemuan_ke
      FROM tugas t
      JOIN courses c ON c.id::text = t.course_id::text
      JOIN pertemuan p ON p.id::text = t.pertemuan_id::text
      ORDER BY t.tanggal_upload DESC, t.id DESC
    `
  );

  return result.rows;
}

async function createLegacyTask(req) {
  await ensureLearningTables();

  const { pertemuan_id: pertemuanId, title, description, deadline } = req.body || {};
  const dosenId = req.auth?.sub;
  const uploadDate = new Date().toISOString().slice(0, 10);

  if (!pertemuanId || !title || !deadline) {
    return { missingFields: true };
  }

  const meetingInfo = await pool.query(
    `
      SELECT
        p.course_id,
        p.pertemuan_ke,
        c.name AS course_name
      FROM pertemuan p
      JOIN courses c ON c.id::text = p.course_id::text
      WHERE p.id = $1
      LIMIT 1
    `,
    [pertemuanId]
  );

  if (meetingInfo.rows.length === 0) {
    return { pertemuanNotFound: true };
  }

  const insertResult = await pool.query(
    `
      INSERT INTO tugas (course_id, pertemuan_id, dosen_id, title, description, tanggal_upload, deadline)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [meetingInfo.rows[0].course_id, pertemuanId, dosenId, title, description || null, uploadDate, deadline]
  );

  const tugas = insertResult.rows[0];
  const stage = getTaskStage(tugas.tanggal_upload, tugas.deadline);
  await upsertTaskStatus(tugas.id, stage);

  await dispatchInstantTelegramReminder({
    taskId: tugas.id,
    title: tugas.title,
    description: tugas.description,
    courseName: meetingInfo.rows[0].course_name,
    pertemuanKe: meetingInfo.rows[0].pertemuan_ke,
    tanggalUpload: tugas.tanggal_upload,
    deadline: tugas.deadline,
  }).catch((error) => {
    console.error('Gagal kirim notifikasi Telegram instan:', error.message);
  });

  return {
    tugas,
    course_name: meetingInfo.rows[0].course_name,
    pertemuan_ke: meetingInfo.rows[0].pertemuan_ke,
  };
}

async function submitLegacyTask(req) {
  await ensureLearningTables();

  const { tugasId } = req.params;
  const mahasiswaId = req.auth?.sub;
  const file = req.file;

  if (!file) {
    return { fileMissing: true };
  }

  const tugasCheck = await pool.query(`SELECT id FROM tugas WHERE id = $1 LIMIT 1`, [tugasId]);
  if (tugasCheck.rows.length === 0) {
    return { tugasNotFound: true };
  }

  const insertResult = await pool.query(
    `
      INSERT INTO tugas_submissions (tugas_id, mahasiswa_id, file_name, file_size, file_type, stored_path)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (tugas_id, mahasiswa_id) DO NOTHING
      RETURNING *
    `,
    [
      tugasId,
      mahasiswaId,
      file.originalname,
      file.size || null,
      file.mimetype || null,
      file.path,
    ]
  );

  if (insertResult.rows.length === 0) {
    return { alreadySubmitted: true };
  }

  return { submission: insertResult.rows[0] };
}

async function listOpenClawTaskStatus(req) {
  await ensureLearningTables();

  const role = req.auth?.role;
  const mahasiswaId = req.auth?.sub;

  const params = [];
  let filterClause = '';

  if (role === 'mahasiswa') {
    params.push(String(mahasiswaId));
    filterClause = `
      WHERE NOT EXISTS (
        SELECT 1
        FROM tugas_submissions ts
        WHERE ts.tugas_id = t.id
          AND ts.mahasiswa_id::text = $1
      )
    `;
  }

  const result = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.deadline,
        t.tanggal_upload,
        c.name AS course_name,
        p.pertemuan_ke,
        s.status_code,
        s.status_label,
        s.reminder_type,
        s.updated_at,
        s.source
      FROM tugas t
      JOIN courses c ON c.id::text = t.course_id::text
      JOIN pertemuan p ON p.id::text = t.pertemuan_id::text
      LEFT JOIN openclaw_task_status s ON s.tugas_id = t.id
      ${filterClause}
      ORDER BY t.deadline ASC, t.id DESC
    `,
    params
  );

  const enriched = [];
  for (const row of result.rows) {
    const stage = getTaskStage(row.tanggal_upload, row.deadline);
    await upsertTaskStatus(row.id, stage);

    if (stage.statusCode === 'idle') {
      continue;
    }

    enriched.push({
      id: row.id,
      title: row.title,
      deadline: row.deadline,
      tanggal_upload: row.tanggal_upload,
      course_name: row.course_name,
      pertemuan_ke: row.pertemuan_ke,
      status_code: stage.statusCode,
      status_label: stage.statusLabel,
      reminder_type: stage.reminderType,
      updated_at: new Date().toISOString(),
      source: 'openclaw',
    });
  }

  return enriched.sort((left, right) => {
    const leftWeight = STATUS_ORDER[left.status_code] || 99;
    const rightWeight = STATUS_ORDER[right.status_code] || 99;
    if (leftWeight !== rightWeight) return leftWeight - rightWeight;

    const leftDeadline = new Date(left.deadline).getTime();
    const rightDeadline = new Date(right.deadline).getTime();
    return leftDeadline - rightDeadline;
  });
}

module.exports = {
  listMeetingContents,
  createMaterial,
  createTask,
  updateContent,
  deleteContent,
  listTaskSubmissions,
  createTaskSubmission,
  gradeSubmission,
  listTugasByPertemuan,
  listTugas,
  createLegacyTask,
  submitLegacyTask,
  listOpenClawTaskStatus,
};
