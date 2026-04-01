const { errorPayload } = require('../utils/apiResponse');

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.auth?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json(
        errorPayload('FORBIDDEN', 'Anda tidak memiliki akses ke resource ini', { allowedRoles }, res.locals.traceId)
      );
    }
    return next();
  };
}

module.exports = { authorizeRoles };
