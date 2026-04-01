const { success, errorPayload } = require('../../utils/apiResponse');
const service = require('./auth.service');

async function register(req, res) {
  const data = await service.register(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function login(req, res) {
  const data = await service.login(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function refresh(req, res) {
  const data = await service.refresh(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function logout(req, res) {
  const data = await service.logout(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function me(req, res) {
  const data = await service.me(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
