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

const escapeHTML = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

ensureSubmissionTable().catch((error) => {
  console.error('Gagal menyiapkan tabel tugas_submissions:', error.message);
});

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
    // Cari course_id asli berdasarkan pertemuan_id
    const pInfo = await pool.query('SELECT course_id, pertemuan_ke FROM pertemuan WHERE id = $1', [pertemuan_id]);
    if (pInfo.rows.length === 0) {
      return res.status(404).json({ error: "Pertemuan tidak ditemukan" });
    }
    const realCourseId = pInfo.rows[0].course_id;
    const pertemuanKe = pInfo.rows[0].pertemuan_ke;

    // 1. Insert tugas menggunakan realCourseId, BUKAN course_id dari frontend.
    const query = `
      INSERT INTO tugas (course_id, pertemuan_id, dosen_id, title, description, tanggal_upload, deadline)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const result = await pool.query(query, [realCourseId, pertemuan_id, dosen_id, title, description, uploadDate, deadline]);
    const newTask = result.rows[0];

    // 2. Fetch data course name untuk detail pesan
    const details = await pool.query(`
      SELECT name as course_name FROM courses WHERE id = $1
    `, [realCourseId]);
    
    if (details.rows.length > 0) {
      const dbInfo = details.rows[0];

      // 3. Siapkan pesan Telegram Instan
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
      const APP_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
      const taskUrl = `${APP_URL}/mahasiswa/pengumpulan/${newTask.id}`;
      
      if (BOT_TOKEN && CHANNEL_ID) {
        const safeCourse = escapeHTML(dbInfo.course_name);
        const safeTitle = escapeHTML(title);
        const safeDescription = escapeHTML(description || '-');
        const message = 
          `📣 <b>Tugas Baru Diberikan!</b> 📚\n\n` +
          `<b>Mata Kuliah:</b> ${safeCourse}\n` +
          `<b>Pertemuan:</b> ${pertemuanKe}\n` +
          `<b>Judul Tugas:</b> ${safeTitle}\n` +
          `<b>Diberikan:</b> ${new Date(uploadDate).toLocaleDateString('id-ID')}\n` +
          `<b>Deadline:</b> ${new Date(deadline).toLocaleDateString('id-ID')}\n\n` +
          `<b>Deskripsi:</b>\n${safeDescription}\n\n` +
          `🔗 <b>Link Tugas:</b> ${taskUrl}`;

        try {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: CHANNEL_ID,
              text: message,
              parse_mode: 'HTML',
            }),
          });
          
          // 4. Catat di notification_log agar OpenClaw Cron tidak mengirim tugas baru yang sama 
          await pool.query(
            `INSERT INTO notification_log (tugas_id, sent_at_date) VALUES ($1, CURRENT_DATE) ON CONFLICT DO NOTHING`,
            [newTask.id]
          );
        } catch (botErr) {
          console.error("Gagal mengirim pesan bot Telegram instantly:", botErr.message);
        }
      }
    }

    res.status(201).json({ message: 'Tugas created successfully', tugas: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
