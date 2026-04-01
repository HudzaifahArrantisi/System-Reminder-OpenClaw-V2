const repository = require('./users.repository');

async function getMe(req) {
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

  const user = await repository.getMe(userId);
  if (!user) {
    return {
      statusCode: 404,
      errorCode: 'USER_NOT_FOUND',
      payload: {
        message: 'User tidak ditemukan',
      },
    };
  }

  return {
    statusCode: 200,
    payload: {
      user,
    },
  };
}

async function updateMe(req) {
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

  const payload = req.body || {};
  const updates = {
    full_name: payload.full_name,
    avatar_url: payload.avatar_url,
  };

  const hasUpdates = Object.values(updates).some((value) => value !== undefined);
  if (!hasUpdates) {
    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      payload: {
        message: 'Minimal satu field harus diisi: full_name atau avatar_url',
      },
    };
  }

  try {
    const user = await repository.updateMe(userId, updates);
    if (!user) {
      return {
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
        payload: {
          message: 'User tidak ditemukan',
        },
      };
    }

    return {
      statusCode: 200,
      payload: {
        user,
      },
    };
  } catch (error) {
    if (error.code === '23505') {
      return {
        statusCode: 409,
        errorCode: 'DUPLICATE_VALUE',
        payload: {
          message: 'Data duplikat terdeteksi',
        },
      };
    }
    throw error;
  }
}

module.exports = {
  getMe,
  updateMe,
};
