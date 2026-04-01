const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');

function buildUserPayload(user) {
  return {
    sub: user.id,
    role: user.role_code,
    email: user.email,
    username: user.username,
    name: user.full_name,
  };
}

function signAccessToken(userPayload) {
  return jwt.sign(
    {
      ...userPayload,
      token_type: 'access',
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_TTL,
    }
  );
}

function signRefreshToken(userPayload, jti) {
  return jwt.sign(
    {
      sub: userPayload.sub,
      token_type: 'refresh',
      jti,
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_TTL,
    }
  );
}

function verifyRefreshToken(refreshToken) {
  return jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
}

function decodeTokenUnsafe(token) {
  return jwt.decode(token) || null;
}

function createJti() {
  return crypto.randomUUID();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  buildUserPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  decodeTokenUnsafe,
  createJti,
  hashToken,
};
