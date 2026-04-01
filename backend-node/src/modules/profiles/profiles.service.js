const repository = require('./profiles.repository');

async function getPublicProfile(req) {
  const username = req.params?.username;
  if (!username) {
    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      payload: {
        message: 'username wajib diisi',
      },
    };
  }

  const user = await repository.findPublicUserByUsername(username);
  if (!user) {
    return {
      statusCode: 404,
      errorCode: 'PROFILE_NOT_FOUND',
      payload: {
        message: 'Profil tidak ditemukan',
      },
    };
  }

  const roleProfile = await repository.findRoleProfileByUserId(user.role_code, user.id);

  return {
    statusCode: 200,
    payload: {
      user,
      profile: roleProfile,
    },
  };
}

async function updateProfileByRole(req, roleCode, allowedFields) {
  const userId = req.auth?.sub;
  if (!userId) {
    return {
      statusCode: 401,
      errorCode: 'UNAUTHORIZED',
      payload: {
        message: 'Token tidak valid',
      },
    };
  }

  const body = req.body || {};
  const updates = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      payload: {
        message: `Minimal satu field harus diisi: ${allowedFields.join(', ')}`,
      },
    };
  }

  try {
    const profile = await repository.upsertRoleProfile(roleCode, userId, updates);
    return {
      statusCode: 200,
      payload: {
        profile,
      },
    };
  } catch (error) {
    if (error.code === '23505') {
      return {
        statusCode: 409,
        errorCode: 'DUPLICATE_VALUE',
        payload: {
          message: 'Data profil duplikat terdeteksi',
        },
      };
    }
    throw error;
  }
}

async function updateMahasiswaProfile(req) {
  return updateProfileByRole(req, 'mahasiswa', ['nim', 'program_studi', 'fakultas', 'angkatan', 'birth_date', 'phone', 'address']);
}

async function updateDosenProfile(req) {
  return updateProfileByRole(req, 'dosen', ['nidn', 'fakultas', 'bidang_keahlian', 'phone', 'office_room']);
}

async function updateAdminProfile(req) {
  return updateProfileByRole(req, 'admin', ['job_title', 'unit_kerja', 'phone']);
}

async function updateOrtuProfile(req) {
  return updateProfileByRole(req, 'ortu', ['occupation', 'phone', 'address']);
}

async function updateUkmProfile(req) {
  return updateProfileByRole(req, 'ukm', ['org_name', 'category', 'description']);
}

async function updateOrmawaProfile(req) {
  return updateProfileByRole(req, 'ormawa', ['org_name', 'category', 'description']);
}

async function getChildren(req) {
  const userId = req.auth?.sub;
  if (!userId) {
    return {
      statusCode: 401,
      errorCode: 'UNAUTHORIZED',
      payload: {
        message: 'Token tidak valid',
      },
    };
  }

  const children = await repository.getChildren(userId);

  return {
    statusCode: 200,
    payload: {
      children,
    },
  };
}

module.exports = {
  getPublicProfile,
  updateMahasiswaProfile,
  updateDosenProfile,
  updateAdminProfile,
  updateOrtuProfile,
  updateUkmProfile,
  updateOrmawaProfile,
  getChildren,
};
