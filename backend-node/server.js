const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
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
  try {
    const result = await pool.query(`SELECT * FROM tugas WHERE pertemuan_id = $1`, [pertemuanId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Tugas
app.get('/api/tugas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, c.name as course_name, p.pertemuan_ke 
      FROM tugas t
      JOIN courses c ON t.course_id = c.id
      JOIN pertemuan p ON t.pertemuan_id = p.id
      ORDER BY t.tanggal_upload DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
      
      if (BOT_TOKEN && CHANNEL_ID) {
        const message = 
          `📣 <b>Tugas Baru Diberikan!</b> 📚\n\n` +
          `<b>Mata Kuliah:</b> ${dbInfo.course_name}\n` +
          `<b>Pertemuan:</b> ${pertemuanKe}\n` +
          `<b>Judul Tugas:</b> ${title}\n` +
          `<b>Diberikan:</b> ${new Date(uploadDate).toLocaleDateString('id-ID')}\n` +
          `<b>Deadline:</b> ${new Date(deadline).toLocaleDateString('id-ID')}\n\n` +
          `<b>Deskripsi:</b>\n${description}`;

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
