const bcrypt = require('bcrypt');

const repository = require('./auth.repository');
const {
  buildUserPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  decodeTokenUnsafe,
  createJti,
  hashToken,
} = require('./auth.tokens');

function normalizeUser(user) {
  return {
    id: user.id,
    role: user.role_code,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url || null,
    is_active: user.is_active,
  };
}

async function issueTokensAndPersistSession({ user, req, previousJti = null }) {
  const userPayload = buildUserPayload(user);
  const jti = createJti();
  const refreshToken = signRefreshToken(userPayload, jti);
  const accessToken = signAccessToken(userPayload);

  const decodedRefresh = decodeTokenUnsafe(refreshToken);
  const expSeconds = Number(decodedRefresh?.exp || 0);
  const expiresAt = new Date(expSeconds * 1000);

  await repository.storeRefreshToken({
    userId: user.id,
    jti,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    ipAddress: req.ip || null,
    userAgent: req.headers['user-agent'] || null,
  });

  if (previousJti) {
    await repository.revokeRefreshTokenByJti({ jti: previousJti, replacedByJti: jti });
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
  };
}

async function register(req) {
  const { role_code, username, email, password, full_name } = req.body || {};

  if (!role_code || !username || !email || !password || !full_name) {
    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      payload: {
        message: 'role_code, username, email, password, dan full_name wajib diisi',
      },
    };
  }

  const roleExists = await repository.roleExists(role_code);
  if (!roleExists) {
    return {
      statusCode: 400,
      errorCode: 'INVALID_ROLE',
      payload: {
        message: 'role_code tidak valid',
      },
    };
  }

  const existing = await repository.findByEmailOrUsername(email) || await repository.findByEmailOrUsername(username);
  if (existing) {
    return {
      statusCode: 409,
      errorCode: 'USER_ALREADY_EXISTS',
      payload: {
        message: 'Email atau username sudah terdaftar',
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await repository.createUser({
      roleCode: role_code,
      username,
      email,
      passwordHash,
      fullName: full_name,
    });

    const tokens = await issueTokensAndPersistSession({ user, req });

    return {
      statusCode: 201,
      payload: {
        user: normalizeUser(user),
        tokens,
      },
    };
  } catch (error) {
    if (error.code === '23505') {
      return {
        statusCode: 409,
        errorCode: 'USER_ALREADY_EXISTS',
        payload: {
          message: 'Email atau username sudah terdaftar',
        },
      };
    }
    throw error;
  }
}

async function login(req) {
  const identifier = req.body?.identifier || req.body?.email || req.body?.username;
  const { password } = req.body || {};

  if (!identifier || !password) {
    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      payload: {
        message: 'identifier dan password wajib diisi',
      },
    };
  }

  const user = await repository.findByEmailOrUsername(identifier);
  if (!user || !user.is_active || user.deleted_at) {
    return {
      statusCode: 401,
      errorCode: 'INVALID_CREDENTIALS',
      payload: {
        message: 'Identifier atau password salah',
      },
    };
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return {
      statusCode: 401,
      errorCode: 'INVALID_CREDENTIALS',
      payload: {
        message: 'Identifier atau password salah',
      },
    };
  }

  await repository.updateLastLogin(user.id);
  const tokens = await issueTokensAndPersistSession({ user, req });

  return {
    statusCode: 200,
    payload: {
      user: normalizeUser(user),
      tokens,
    },
  };
}

async function refresh(req) {
  const refreshToken = req.body?.refreshToken;
  if (!refreshToken) {
    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      payload: {
        message: 'refreshToken wajib diisi',
      },
    };
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_error) {
    return {
      statusCode: 401,
      errorCode: 'INVALID_REFRESH_TOKEN',
      payload: {
        message: 'Refresh token tidak valid atau kadaluarsa',
      },
    };
  }

  if (payload.token_type !== 'refresh' || !payload.jti || !payload.sub) {
    return {
      statusCode: 401,
      errorCode: 'INVALID_REFRESH_TOKEN',
      payload: {
        message: 'Refresh token tidak valid',
      },
    };
  }

  const tokenRow = await repository.findValidRefreshToken({
    userId: payload.sub,
    jti: payload.jti,
  });

  if (!tokenRow || tokenRow.revoked_at) {
    return {
      statusCode: 401,
      errorCode: 'REFRESH_TOKEN_REVOKED',
      payload: {
        message: 'Refresh token sudah tidak aktif',
      },
    };
  }

  if (new Date(tokenRow.expires_at).getTime() <= Date.now()) {
    return {
      statusCode: 401,
      errorCode: 'REFRESH_TOKEN_EXPIRED',
      payload: {
        message: 'Refresh token sudah kadaluarsa',
      },
    };
  }

  const currentHash = hashToken(refreshToken);
  if (currentHash !== tokenRow.token_hash) {
    return {
      statusCode: 401,
      errorCode: 'REFRESH_TOKEN_MISMATCH',
      payload: {
        message: 'Refresh token tidak cocok',
      },
    };
  }

  const user = await repository.findById(payload.sub);
  if (!user || !user.is_active) {
    return {
      statusCode: 401,
      errorCode: 'USER_INACTIVE',
      payload: {
        message: 'Akun tidak aktif',
      },
    };
  }

  const tokens = await issueTokensAndPersistSession({
    user,
    req,
    previousJti: payload.jti,
  });

  return {
    statusCode: 200,
    payload: {
      user: normalizeUser(user),
      tokens,
    },
  };
}

async function logout(req) {
  const refreshToken = req.body?.refreshToken;
  if (!refreshToken) {
    return {
      statusCode: 200,
      payload: {
        message: 'Logout berhasil',
      },
    };
  }

  const tokenHash = hashToken(refreshToken);
  await repository.revokeRefreshTokenByHash(tokenHash);

  return {
    statusCode: 200,
    payload: {
      message: 'Logout berhasil',
    },
  };
}

async function me(req) {
  const userId = req.auth?.sub;
  if (!userId) {
    return {
      statusCode: 401,
      errorCode: 'UNAUTHORIZED',
      payload: {
        message: 'Token tidak memiliki subject user',
      },
    };
  }

  const user = await repository.findById(userId);
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
      user: normalizeUser(user),
    },
  };
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
