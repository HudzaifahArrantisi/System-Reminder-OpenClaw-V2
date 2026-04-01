function success(data, meta = {}, traceId = null) {
  return {
    success: true,
    data,
    meta,
    trace_id: traceId,
  };
}

function errorPayload(code, message, details = null, traceId = null) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    trace_id: traceId,
  };
}

module.exports = { success, errorPayload };
