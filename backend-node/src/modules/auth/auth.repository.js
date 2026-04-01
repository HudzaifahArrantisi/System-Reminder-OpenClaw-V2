const { pool } = require('../../config/db');

async function roleExists(roleCode) {
  const result = await pool.query(
    `SELECT 1 FROM roles WHERE code = $1 LIMIT 1`,
    [roleCode]
  );
  return result.rowCount > 0;
}

async function findByEmailOrUsername(identifier) {
  const result = await pool.query(
    `
      SELECT id, role_code, username, email, password_hash, full_name, avatar_url, is_active, deleted_at
      FROM users
      WHERE deleted_at IS NULL
        AND (LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1))
      LIMIT 1
    `,
    [identifier]
  );
  return result.rows[0] || null;
}

async function findById(userId) {
  const result = await pool.query(
    `
      SELECT id, role_code, username, email, full_name, avatar_url, is_active, created_at, updated_at
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

async function createUser({ roleCode, username, email, passwordHash, fullName }) {
  const result = await pool.query(
    `
      INSERT INTO users (role_code, username, email, password_hash, full_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, role_code, username, email, full_name, avatar_url, is_active, created_at
    `,
    [roleCode, username, email, passwordHash, fullName]
  );
  return result.rows[0];
}

async function updateLastLogin(userId) {
  await pool.query(
    `UPDATE users SET last_login_at = now() WHERE id = $1`,
    [userId]
  );
}

async function storeRefreshToken({ userId, jti, tokenHash, expiresAt, ipAddress, userAgent }) {
  await pool.query(
    `
      INSERT INTO auth_refresh_tokens (user_id, jti, token_hash, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [userId, jti, tokenHash, expiresAt, ipAddress, userAgent]
  );
}

async function findValidRefreshToken({ userId, jti }) {
  const result = await pool.query(
    `
      SELECT id, user_id, jti, token_hash, expires_at, revoked_at
      FROM auth_refresh_tokens
      WHERE user_id = $1
        AND jti = $2
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [userId, jti]
  );
  return result.rows[0] || null;
}

async function revokeRefreshTokenByJti({ jti, replacedByJti = null }) {
  await pool.query(
    `
      UPDATE auth_refresh_tokens
      SET revoked_at = COALESCE(revoked_at, now()), replaced_by_jti = COALESCE($2, replaced_by_jti)
      WHERE jti = $1
        AND deleted_at IS NULL
    `,
    [jti, replacedByJti]
  );
}

async function revokeRefreshTokenByHash(tokenHash) {
  await pool.query(
    `
      UPDATE auth_refresh_tokens
      SET revoked_at = COALESCE(revoked_at, now())
      WHERE token_hash = $1
        AND deleted_at IS NULL
    `,
    [tokenHash]
  );
}

module.exports = {
  roleExists,
  findByEmailOrUsername,
  findById,
  createUser,
  updateLastLogin,
  storeRefreshToken,
  findValidRefreshToken,
  revokeRefreshTokenByJti,
  revokeRefreshTokenByHash,
};
