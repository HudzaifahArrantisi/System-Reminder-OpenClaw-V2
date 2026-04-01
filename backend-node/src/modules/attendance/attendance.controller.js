const { success, errorPayload } = require('../../utils/apiResponse');
const service = require('./attendance.service');

async function createSession(req, res) {
  const data = await service.createSession(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function openSession(req, res) {
  const data = await service.openSession(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function closeSession(req, res) {
  const data = await service.closeSession(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function getSession(req, res) {
  const data = await service.getSession(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function scanAttendance(req, res) {
  const data = await service.scanAttendance(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function manualRecord(req, res) {
  const data = await service.manualRecord(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function courseRecap(req, res) {
  const data = await service.courseRecap(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function studentRecap(req, res) {
  const data = await service.studentRecap(req);
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
  createSession,
  openSession,
  closeSession,
  getSession,
  scanAttendance,
  manualRecord,
  courseRecap,
  studentRecap
};
