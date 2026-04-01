const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { errorPayload } = require('../utils/apiResponse');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json(errorPayload('UNAUTHORIZED', 'Token tidak tersedia', null, res.locals.traceId));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.token_type && payload.token_type !== 'access') {
      return res.status(401).json(errorPayload('INVALID_TOKEN_TYPE', 'Token bukan access token', null, res.locals.traceId));
    }
    req.auth = payload;
    return next();
  } catch (_error) {
    return res.status(401).json(errorPayload('INVALID_TOKEN', 'Token tidak valid atau kadaluarsa', null, res.locals.traceId));
  }
}

module.exports = { authenticate };
