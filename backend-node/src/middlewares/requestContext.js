const { randomUUID } = require('crypto');

function requestContext(req, res, next) {
  const traceId = req.headers['x-trace-id'] || randomUUID();
  res.locals.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
}

module.exports = { requestContext };
