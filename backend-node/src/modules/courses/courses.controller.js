const { success, errorPayload } = require('../../utils/apiResponse');
const service = require('./courses.service');

async function listCourses(req, res) {
  const data = await service.listCourses(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function createCourse(req, res) {
  const data = await service.createCourse(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function getCourse(req, res) {
  const data = await service.getCourse(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function updateCourse(req, res) {
  const data = await service.updateCourse(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function listEnrollments(req, res) {
  const data = await service.listEnrollments(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function addEnrollment(req, res) {
  const data = await service.addEnrollment(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function removeEnrollment(req, res) {
  const data = await service.removeEnrollment(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function listMeetings(req, res) {
  const data = await service.listMeetings(req);
  const statusCode = data.statusCode || 200;
  if (statusCode >= 400) {
    const code = data.errorCode || 'REQUEST_FAILED';
    const message = data.payload?.message || 'Request gagal';
    const details = data.payload?.details || null;
    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
  }
  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));
}

async function createMeeting(req, res) {
  const data = await service.createMeeting(req);
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
  listCourses,
  createCourse,
  getCourse,
  updateCourse,
  listEnrollments,
  addEnrollment,
  removeEnrollment,
  listMeetings,
  createMeeting
};
