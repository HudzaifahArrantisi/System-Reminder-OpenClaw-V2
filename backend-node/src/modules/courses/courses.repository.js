const { pool } = require('../../config/db');

async function ensureAcademicTables() {
  await pool.query(`
    DO $$
    DECLARE
      course_id_type text;
      legacy_name text;
    BEGIN
      IF to_regclass('public.pertemuan') IS NOT NULL THEN
        SELECT data_type
        INTO course_id_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pertemuan'
          AND column_name = 'course_id'
        LIMIT 1;

        IF course_id_type IS DISTINCT FROM 'uuid' THEN
          legacy_name := 'pertemuan_legacy_' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS');
          EXECUTE format('ALTER TABLE public.pertemuan RENAME TO %I', legacy_name);
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
}

async function listCourses(req) {
  await ensureAcademicTables();

  const result = await pool.query(
    `
      SELECT c.id, c.code, c.name, c.lecturer_user_id
      FROM courses c
      WHERE c.deleted_at IS NULL
      ORDER BY c.name ASC
    `
  );

  const rows = result.rows;
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

  await pool.query(
    `
      INSERT INTO pertemuan (course_id, pertemuan_ke)
      SELECT c.id, slot
      FROM courses c
      CROSS JOIN generate_series(1, 16) AS slot
      WHERE c.id::text = $1
        AND c.deleted_at IS NULL
      ON CONFLICT (course_id, pertemuan_ke) DO NOTHING
    `,
    [req.params.courseId]
  );

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
