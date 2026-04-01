const { success, errorPayload } = require('../../utils/apiResponse');
const service = require('./profiles.service');

async function getPublicProfile(req, res) {
  const data = await service.getPublicProfile(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function updateMahasiswaProfile(req, res) {
  const data = await service.updateMahasiswaProfile(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function updateDosenProfile(req, res) {
  const data = await service.updateDosenProfile(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function updateAdminProfile(req, res) {
  const data = await service.updateAdminProfile(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function updateOrtuProfile(req, res) {
  const data = await service.updateOrtuProfile(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function updateUkmProfile(req, res) {
  const data = await service.updateUkmProfile(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function updateOrmawaProfile(req, res) {
  const data = await service.updateOrmawaProfile(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function getChildren(req, res) {
  const data = await service.getChildren(req);
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
  getPublicProfile,
  updateMahasiswaProfile,
  updateDosenProfile,
  updateAdminProfile,
  updateOrtuProfile,
  updateUkmProfile,
  updateOrmawaProfile,
  getChildren
};
