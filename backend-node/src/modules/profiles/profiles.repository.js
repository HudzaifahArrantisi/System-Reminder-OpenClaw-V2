const { pool } = require('../../config/db');

const PROFILE_CONFIG = {
  mahasiswa: {
    table: 'mahasiswa_profiles',
    fields: ['nim', 'program_studi', 'fakultas', 'angkatan', 'birth_date', 'phone', 'address'],
  },
  dosen: {
    table: 'dosen_profiles',
    fields: ['nidn', 'fakultas', 'bidang_keahlian', 'phone', 'office_room'],
  },
  admin: {
    table: 'admin_profiles',
    fields: ['job_title', 'unit_kerja', 'phone'],
  },
  ortu: {
    table: 'ortu_profiles',
    fields: ['occupation', 'phone', 'address'],
  },
  ukm: {
    table: 'ukm_profiles',
    fields: ['org_name', 'category', 'description'],
  },
  ormawa: {
    table: 'ormawa_profiles',
    fields: ['org_name', 'category', 'description'],
  },
};

async function findPublicUserByUsername(username) {
  const result = await pool.query(
    `
      SELECT id, role_code, username, full_name, avatar_url
      FROM users
      WHERE LOWER(username) = LOWER($1)
        AND is_active = true
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [username]
  );
  return result.rows[0] || null;
}

async function findRoleProfileByUserId(roleCode, userId) {
  const cfg = PROFILE_CONFIG[roleCode];
  if (!cfg) {
    return null;
  }

  const columns = ['id', 'user_id', ...cfg.fields, 'created_at', 'updated_at'];
  const result = await pool.query(
    `
      SELECT ${columns.join(', ')}
      FROM ${cfg.table}
      WHERE user_id = $1 AND deleted_at IS NULL
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

async function upsertRoleProfile(roleCode, userId, updates) {
  const cfg = PROFILE_CONFIG[roleCode];
  if (!cfg) {
    return null;
  }

  const entries = Object.entries(updates).filter(([key, value]) => cfg.fields.includes(key) && value !== undefined);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingResult = await client.query(
      `
        SELECT id
        FROM ${cfg.table}
        WHERE user_id = $1 AND deleted_at IS NULL
        LIMIT 1
      `,
      [userId]
    );

    if (existingResult.rowCount > 0) {
      if (entries.length > 0) {
        const setClause = entries.map(([key], idx) => `${key} = $${idx + 2}`).join(', ');
        const values = entries.map(([, value]) => value);

        await client.query(
          `
            UPDATE ${cfg.table}
            SET ${setClause}
            WHERE user_id = $1 AND deleted_at IS NULL
          `,
          [userId, ...values]
        );
      }
    } else {
      const columns = ['user_id', ...entries.map(([key]) => key)];
      const placeholders = columns.map((_, idx) => `$${idx + 1}`);
      const values = [userId, ...entries.map(([, value]) => value)];

      await client.query(
        `
          INSERT INTO ${cfg.table} (${columns.join(', ')})
          VALUES (${placeholders.join(', ')})
        `,
        values
      );
    }

    await client.query('COMMIT');
    return findRoleProfileByUserId(roleCode, userId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getChildren(ortuUserId) {
  const result = await pool.query(
    `
      SELECT
        u.id AS student_user_id,
        u.username,
        u.full_name,
        u.avatar_url,
        mp.nim,
        mp.program_studi,
        mp.fakultas,
        mp.angkatan,
        l.relation_type,
        l.is_primary
      FROM ortu_student_links l
      JOIN users u ON u.id = l.mahasiswa_user_id AND u.deleted_at IS NULL
      LEFT JOIN mahasiswa_profiles mp ON mp.user_id = u.id AND mp.deleted_at IS NULL
      WHERE l.ortu_user_id = $1
      ORDER BY l.is_primary DESC, u.full_name ASC
    `,
    [ortuUserId]
  );
  return result.rows;
}

module.exports = {
  findPublicUserByUsername,
  findRoleProfileByUserId,
  upsertRoleProfile,
  getChildren,
};
