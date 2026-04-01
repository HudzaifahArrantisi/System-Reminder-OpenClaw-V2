const { success, errorPayload } = require('../../utils/apiResponse');
const service = require('./learning.service');

async function listMeetingContents(req, res) {
  const data = await service.listMeetingContents(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function createMaterial(req, res) {
  const data = await service.createMaterial(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function createTask(req, res) {
  const data = await service.createTask(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function updateContent(req, res) {
  const data = await service.updateContent(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function deleteContent(req, res) {
  const data = await service.deleteContent(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function listTaskSubmissions(req, res) {
  const data = await service.listTaskSubmissions(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function createTaskSubmission(req, res) {
  const data = await service.createTaskSubmission(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function gradeSubmission(req, res) {
  const data = await service.gradeSubmission(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function listTugasByPertemuan(req, res) {
  const data = await service.listTugasByPertemuan(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function listTugas(req, res) {
  const data = await service.listTugas(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function createLegacyTask(req, res) {
  const data = await service.createLegacyTask(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function submitLegacyTask(req, res) {
  const data = await service.submitLegacyTask(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function listOpenClawTaskStatus(req, res) {
  const data = await service.listOpenClawTaskStatus(req);
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
  listMeetingContents,
  createMaterial,
  createTask,
  updateContent,
  deleteContent,
  listTaskSubmissions,
  createTaskSubmission,
  gradeSubmission,
  listTugasByPertemuan,
  listTugas,
  createLegacyTask,
  submitLegacyTask,
  listOpenClawTaskStatus,
};
