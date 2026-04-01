const { errorPayload } = require('../utils/apiResponse');

function notFound(req, res) {
  return res.status(404).json(
    errorPayload('NOT_FOUND', `Route ${req.method} ${req.originalUrl} tidak ditemukan`, null, res.locals.traceId)
  );
}

module.exports = { notFound };
