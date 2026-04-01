const { pool } = require('../../config/db');

const DEFAULT_COURSES = [
  { code: 'IF201', name: 'Rekayasa Perangkat Lunak' },
  { code: 'IF202', name: 'Basis Data' },
  { code: 'IF203', name: 'Jaringan Komputer' },
  { code: 'IF204', name: 'Kecerdasan Buatan' },
  { code: 'IF205', name: 'Pemrograman Web' },
  { code: 'IF206', name: 'Struktur Data' },
  { code: 'IF207', name: 'Matematika Diskrit' },
  { code: 'IF208', name: 'Sistem Operasi' },
];

async function ensureAcademicTables() {
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
    CREATE INDEX IF NOT EXISTS idx_pertemuan_course
    ON pertemuan (course_id, pertemuan_ke)
  `);
}

async function findAnyLecturerId() {
  const result = await pool.query(
    `
      SELECT id
      FROM users
      WHERE role_code = 'dosen' AND is_active = true AND deleted_at IS NULL
      ORDER BY created_at ASC
      LIMIT 1
    `
  );

  return result.rows[0]?.id || null;
}

async function ensureDefaultCourses(lecturerUserId) {
  for (const course of DEFAULT_COURSES) {
    await pool.query(
      `
        INSERT INTO courses (code, name, lecturer_user_id, semester, academic_year, credits)
        VALUES ($1, $2, $3, 2, '2026/2027', 3)
        ON CONFLICT (code)
        DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = now(),
          deleted_at = NULL
      `,
      [course.code, course.name, lecturerUserId]
    );
  }

  const codes = DEFAULT_COURSES.map((course) => course.code);
  const coursesResult = await pool.query(
    `
      SELECT id, code, name, lecturer_user_id
      FROM courses
      WHERE code = ANY($1::text[])
      ORDER BY array_position($1::text[], code)
    `,
    [codes]
  );

  for (const course of coursesResult.rows) {
    await pool.query(
      `
        INSERT INTO pertemuan (course_id, pertemuan_ke)
        SELECT $1::uuid, slot
        FROM generate_series(1, 16) AS slot
        ON CONFLICT (course_id, pertemuan_ke) DO NOTHING
      `,
      [course.id]
    );
  }

  return coursesResult.rows;
}

async function listCourses(req) {
  await ensureAcademicTables();

  const role = req.auth?.role;
  const requesterId = req.auth?.sub;

  const lecturerUserId = role === 'dosen' ? requesterId : await findAnyLecturerId();
  if (!lecturerUserId) {
    return [];
  }

  const rows = await ensureDefaultCourses(lecturerUserId);
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    dosen_id: row.lecturer_user_id,
  }));
}

async function createCourse(_req) {
  return null;
}

async function getCourse(req) {
  await ensureAcademicTables();

  const result = await pool.query(
    `
      SELECT id, code, name, lecturer_user_id AS dosen_id, semester, academic_year, credits
      FROM courses
      WHERE id::text = $1
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [req.params.courseId]
  );

  return result.rows[0] || null;
}

async function updateCourse(_req) {
  return null;
}

async function listEnrollments(_req) {
  return null;
}

async function addEnrollment(_req) {
  return null;
}

async function removeEnrollment(_req) {
  return null;
}

async function listMeetings(req) {
  await ensureAcademicTables();

  const result = await pool.query(
    `
      SELECT id, course_id, pertemuan_ke
      FROM pertemuan
      WHERE course_id::text = $1
      ORDER BY pertemuan_ke ASC
    `,
    [req.params.courseId]
  );

  return result.rows;
}

async function createMeeting(_req) {
  return null;
}

module.exports = {
  listCourses,
  createCourse,
  getCourse,
  updateCourse,
  listEnrollments,
  addEnrollment,
  removeEnrollment,
  listMeetings,
  createMeeting
};
