const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
]);

const allowedExtensions = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.txt',
  '.zip',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext || '.bin';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isAllowed = allowedMimeTypes.has(file.mimetype) || allowedExtensions.has(ext);
    if (!isAllowed) {
      return cb(new Error('Format file tidak didukung'));
    }
    cb(null, true);
  },
});

const normalizeDatabaseUrl = (databaseUrl) => {
  if (!databaseUrl) return databaseUrl;

  // Keep current secure behavior and silence pg sslmode deprecation warning.
  return databaseUrl.replace(/sslmode=(?:prefer|require|verify-ca)\b/i, 'sslmode=verify-full');
};

const escapeHTML = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const formatDateLong = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false }
});

async function ensureSubmissionTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tugas_submissions (
      id SERIAL PRIMARY KEY,
      tugas_id INT NOT NULL REFERENCES tugas(id) ON DELETE CASCADE,
      mahasiswa_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_size BIGINT,
      file_type VARCHAR(120),
      submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (tugas_id, mahasiswa_id)
    )
  `);

  await pool.query(`
    ALTER TABLE tugas_submissions
    ADD COLUMN IF NOT EXISTS stored_path TEXT
  `);
}

async function ensureNotificationLogTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_log (
      id SERIAL PRIMARY KEY,
      tugas_id INT REFERENCES tugas(id) ON DELETE CASCADE,
      sent_at_date DATE NOT NULL,
      notification_type TEXT NOT NULL DEFAULT 'generic',
      UNIQUE(tugas_id, sent_at_date, notification_type)
    )
  `);

  await pool.query(`
    ALTER TABLE notification_log
    ADD COLUMN IF NOT EXISTS notification_type TEXT NOT NULL DEFAULT 'generic'
  `);

  // Backward compatibility: drop old 2-column unique constraint from older schema.
  await pool.query(`
    ALTER TABLE notification_log
    DROP CONSTRAINT IF EXISTS notification_log_tugas_id_sent_at_date_key
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_log_task_date_type
    ON notification_log (tugas_id, sent_at_date, notification_type)
  `);
}

async function ensureFeedTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      role_creator TEXT NOT NULL CHECK (role_creator IN ('ukm', 'ormawa', 'admin')),
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      title TEXT,
      caption TEXT NOT NULL,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_likes (
      post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (post_id, user_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_comments (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function ensureOpenClawStatusTable() {
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

async function ensureTables() {
  await ensureSubmissionTable();
  await ensureNotificationLogTable();
  await ensureFeedTables();
  await ensureOpenClawStatusTable();
}

async function upsertOpenClawTaskStatusNew(tugasId) {
  await pool.query(
    `
      INSERT INTO openclaw_task_status (tugas_id, status_code, status_label, reminder_type, updated_at, source)
      VALUES ($1, 'new', 'Tugas Baru', 'instant', now(), 'openclaw')
      ON CONFLICT (tugas_id)
      DO UPDATE SET
        status_code = 'new',
        status_label = 'Tugas Baru',
        reminder_type = 'instant',
        updated_at = now(),
        source = 'openclaw'
    `,
    [tugasId]
  );
}

async function markInstantNotificationSent(tugasId) {
  await pool.query(
    `
      INSERT INTO notification_log (tugas_id, sent_at_date, notification_type)
      VALUES ($1, CURRENT_DATE, 'instant')
      ON CONFLICT DO NOTHING
    `,
    [tugasId]
  );
}

async function sendInstantTelegramTaskMessage(task) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
  if (!BOT_TOKEN || !CHANNEL_ID) {
    return false;
  }

  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const taskUrl = `${appUrl}/mahasiswa/pengumpulan/${task.id}`;

  const message =
    `📢 <b>TUGAS BARU DOSEN</b>\n\n` +
    `<b>Matkul:</b> ${escapeHTML(task.course_name)}\n` +
    `<b>Pertemuan:</b> ${escapeHTML(task.pertemuan_ke)}\n` +
    `<b>Judul Tugas:</b> ${escapeHTML(task.title)}\n` +
    `<b>Deskripsi:</b> ${escapeHTML(task.description || '-')}` +
    `\n<b>Tanggal Upload:</b> ${escapeHTML(formatDateLong(task.tanggal_upload))}` +
    `\n<b>Deadline:</b> ${escapeHTML(formatDateLong(task.deadline))}` +
    `\n\n🔗 <b>Link Tugas:</b> ${taskUrl}`;

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Telegram API error ${response.status}: ${body}`);
  }

  return true;
}

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { name, password, role } = req.body;
  try {
    const query = `SELECT * FROM users WHERE name = $1 AND password = $2 AND role = $3`;
    const result = await pool.query(query, [name, password, role]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feed: List Posts
app.get('/api/posts', async (req, res) => {
  const userId = Number(req.query.user_id) || null;

  try {
    const result = await pool.query(
      `
        SELECT
          p.id,
          p.role_creator,
          p.user_id,
          p.title,
          p.caption,
          p.image_url,
          p.created_at,
          COALESCE(u.name, u.full_name, u.username, 'Unknown') AS author_name,
          COUNT(DISTINCT pl.user_id)::INT AS likes_count,
          COUNT(DISTINCT pc.id)::INT AS comments_count,
          CASE
            WHEN $1::INT IS NULL THEN false
            ELSE EXISTS (
              SELECT 1 FROM post_likes z
              WHERE z.post_id = p.id AND z.user_id = $1::INT
            )
          END AS liked_by_me
        FROM posts p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN post_likes pl ON pl.post_id = p.id
        LEFT JOIN post_comments pc ON pc.post_id = p.id
        GROUP BY p.id, u.id
        ORDER BY p.created_at DESC, p.id DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feed: Create Post (only ukm/ormawa/admin)
app.post('/api/posts', async (req, res) => {
  const { role_creator, user_id, title, caption, image_url } = req.body;
  const allowedRoles = new Set(['ukm', 'ormawa', 'admin']);

  if (!allowedRoles.has(role_creator)) {
    return res.status(403).json({ error: 'Hanya UKM, ORMAWA, dan ADMIN yang boleh posting feed' });
  }

  if (!caption || !String(caption).trim()) {
    return res.status(400).json({ error: 'caption wajib diisi' });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO posts (role_creator, user_id, title, caption, image_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [role_creator, user_id || null, title || null, caption, image_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feed: Like Post
app.post('/api/posts/:postId/likes', async (req, res) => {
  const { postId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id wajib diisi' });
  }

  try {
    await pool.query(
      `
        INSERT INTO post_likes (post_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `,
      [postId, user_id]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feed: Unlike Post
app.delete('/api/posts/:postId/likes', async (req, res) => {
  const { postId } = req.params;
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: 'user_id wajib diisi' });
  }

  try {
    await pool.query(`DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feed: List Comments per Post
app.get('/api/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT
          pc.id,
          pc.post_id,
          pc.user_id,
          pc.comment,
          pc.created_at,
          COALESCE(u.name, u.full_name, u.username, 'Unknown') AS user_name
        FROM post_comments pc
        LEFT JOIN users u ON u.id = pc.user_id
        WHERE pc.post_id = $1
        ORDER BY pc.created_at ASC, pc.id ASC
      `,
      [postId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feed: Create Comment
app.post('/api/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { user_id, comment } = req.body;

  if (!user_id || !comment || !String(comment).trim()) {
    return res.status(400).json({ error: 'user_id dan comment wajib diisi' });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO post_comments (post_id, user_id, comment)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [postId, user_id, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User's Courses
app.get('/api/courses', async (req, res) => {
  const { role, user_id } = req.query;
  try {
    let result;
    if (role === 'dosen') {
      result = await pool.query(`SELECT * FROM courses WHERE dosen_id = $1`, [user_id]);
    } else {
      // Mahasiswa sees all courses
      result = await pool.query(`SELECT * FROM courses`);
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pertemuan by Course
app.get('/api/courses/:courseId/pertemuan', async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM pertemuan WHERE course_id = $1 ORDER BY pertemuan_ke ASC`, [courseId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Tugas by Pertemuan
app.get('/api/pertemuan/:pertemuanId/tugas', async (req, res) => {
  const { pertemuanId } = req.params;
  const { role, user_id } = req.query;

  try {
    let result;

    if (role === 'mahasiswa' && user_id) {
      result = await pool.query(
        `
          SELECT t.*
          FROM tugas t
          WHERE t.pertemuan_id = $1
            AND NOT EXISTS (
              SELECT 1
              FROM tugas_submissions ts
              WHERE ts.tugas_id = t.id
                AND ts.mahasiswa_id = $2
            )
          ORDER BY t.deadline ASC, t.id DESC
        `,
        [pertemuanId, user_id]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM tugas WHERE pertemuan_id = $1 ORDER BY deadline ASC, id DESC`,
        [pertemuanId]
      );
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Tugas
app.get('/api/tugas', async (req, res) => {
  const { role, user_id } = req.query;

  try {
    let result;

    if (role === 'mahasiswa' && user_id) {
      result = await pool.query(
        `
          SELECT
            t.*, 
            c.name as course_name,
            p.pertemuan_ke,
            (t.deadline::date - CURRENT_DATE) AS days_left
          FROM tugas t
          JOIN courses c ON t.course_id = c.id
          JOIN pertemuan p ON t.pertemuan_id = p.id
          WHERE NOT EXISTS (
            SELECT 1
            FROM tugas_submissions ts
            WHERE ts.tugas_id = t.id
              AND ts.mahasiswa_id = $1
          )
          ORDER BY t.deadline ASC, t.id DESC
        `,
        [user_id]
      );
    } else {
      result = await pool.query(`
        SELECT t.*, c.name as course_name, p.pertemuan_ke
        FROM tugas t
        JOIN courses c ON t.course_id = c.id
        JOIN pertemuan p ON t.pertemuan_id = p.id
        ORDER BY t.tanggal_upload DESC
      `);
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OpenClaw Task Status Panel (single source from OpenClaw engine)
async function listOpenClawTaskStatus(req, res) {
  const { role, user_id } = req.query;

  const userFilterClause = role === 'mahasiswa' && user_id
    ? `
      AND NOT EXISTS (
        SELECT 1
        FROM tugas_submissions ts
        WHERE ts.tugas_id = t.id
          AND ts.mahasiswa_id = $1
      )
    `
    : '';

  const params = role === 'mahasiswa' && user_id ? [user_id] : [];

  try {
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
        FROM openclaw_task_status s
        JOIN tugas t ON t.id = s.tugas_id
        LEFT JOIN courses c ON c.id::text = t.course_id::text
        LEFT JOIN pertemuan p ON p.id::text = t.pertemuan_id::text
        WHERE s.status_code IN ('new', 'h3', 'h2', 'h1', 'h0')
          ${userFilterClause}
        ORDER BY
          CASE s.status_code
            WHEN 'new' THEN 1
            WHEN 'h3' THEN 2
            WHEN 'h2' THEN 3
            WHEN 'h1' THEN 4
            WHEN 'h0' THEN 5
            ELSE 6
          END,
          t.deadline ASC,
          s.updated_at DESC
      `,
      params
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

app.get('/api/tugas/reminders', listOpenClawTaskStatus);
app.get('/api/openclaw/task-status', listOpenClawTaskStatus);

// Submit Tugas (Mahasiswa)
app.post('/api/tugas/:tugasId/submit', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Ukuran file maksimal 20 MB' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (err) {
      return res.status(400).json({ error: err.message || 'Upload file gagal' });
    }

    const { tugasId } = req.params;
    const mahasiswaId = parseInt(req.body.mahasiswa_id, 10);
    const file = req.file;

    if (!Number.isInteger(mahasiswaId) || !file) {
      return res.status(400).json({ error: 'Mahasiswa dan file wajib diisi' });
    }

    try {
      const tugasCheck = await pool.query('SELECT id FROM tugas WHERE id = $1', [tugasId]);
      if (tugasCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tugas tidak ditemukan' });
      }

      const submitResult = await pool.query(
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
          `uploads/${file.filename}`,
        ]
      );

      if (submitResult.rows.length === 0) {
        return res.status(409).json({ error: 'Tugas sudah pernah dikumpulkan' });
      }

      res.status(201).json({ message: 'Tugas berhasil dikumpulkan', submission: submitResult.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Upload Tugas (Dosen Only)
app.post('/api/tugas', async (req, res) => {
  const { pertemuan_id, dosen_id, title, description, tanggal_upload, deadline } = req.body;
  
  if (!pertemuan_id || !dosen_id || !title || !deadline) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const uploadDate = tanggal_upload || new Date().toISOString().split('T')[0];

  try {
    // Cari course_id, pertemuan_ke, dan nama matkul berdasarkan pertemuan_id
    const pInfo = await pool.query(
      `
        SELECT p.course_id, p.pertemuan_ke, c.name AS course_name
        FROM pertemuan p
        JOIN courses c ON c.id = p.course_id
        WHERE p.id = $1
      `,
      [pertemuan_id]
    );

    if (pInfo.rows.length === 0) {
      return res.status(404).json({ error: "Pertemuan tidak ditemukan" });
    }

    const realCourseId = pInfo.rows[0].course_id;
    const pertemuanKe = pInfo.rows[0].pertemuan_ke;
    const courseName = pInfo.rows[0].course_name;

    const query = `
      INSERT INTO tugas (course_id, pertemuan_id, dosen_id, title, description, tanggal_upload, deadline)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const result = await pool.query(query, [realCourseId, pertemuan_id, dosen_id, title, description, uploadDate, deadline]);
    const newTask = result.rows[0];

    await upsertOpenClawTaskStatusNew(newTask.id);

    try {
      const sent = await sendInstantTelegramTaskMessage({
        ...newTask,
        pertemuan_ke: pertemuanKe,
        course_name: courseName,
      });

      if (sent) {
        await markInstantNotificationSent(newTask.id);
      }
    } catch (notifyError) {
      console.error('Gagal mengirim notifikasi instant Telegram:', notifyError.message);
    }

    res.status(201).json({ message: 'Tugas created successfully', tugas: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;

async function startServer() {
  try {
    await ensureTables();
    app.listen(PORT, () => {
      console.log(`Backend Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Gagal menyiapkan tabel database:', error.message);
    process.exit(1);
  }
}

startServer();
