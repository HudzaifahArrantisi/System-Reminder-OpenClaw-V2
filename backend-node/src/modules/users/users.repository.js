const { pool } = require('../../config/db');

async function getMe(userId) {
  const result = await pool.query(
    `
      SELECT id, role_code, username, email, full_name, avatar_url, is_active, last_login_at, created_at, updated_at
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

async function updateMe(userId, updates) {
  const entries = Object.entries(updates).filter(([, value]) => value !== undefined);
  if (!entries.length) {
    return getMe(userId);
  }

  const setClauses = entries.map(([key], idx) => `${key} = $${idx + 2}`);
  const values = entries.map(([, value]) => value);

  const result = await pool.query(
    `
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, role_code, username, email, full_name, avatar_url, is_active, last_login_at, created_at, updated_at
    `,
    [userId, ...values]
  );

  return result.rows[0] || null;
}

module.exports = {
  getMe,
  updateMe,
};
