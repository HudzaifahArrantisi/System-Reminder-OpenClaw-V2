const { errorPayload } = require('../utils/apiResponse');

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Terjadi kesalahan pada server';
  const details = err.details || null;

  if (statusCode >= 500) {
    console.error(`[${res.locals.traceId}]`, err);
  }

  return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));
}

module.exports = { errorHandler };
