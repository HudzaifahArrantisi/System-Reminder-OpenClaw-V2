const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./admin.controller');

const router = Router();

router.get('/admin/users', authenticate, authorizeRoles('admin'), asyncHandler(controller.listUsers));
router.post('/admin/users', authenticate, authorizeRoles('admin'), asyncHandler(controller.createUser));
router.patch('/admin/users/:userId/status', authenticate, authorizeRoles('admin'), asyncHandler(controller.updateUserStatus));
router.get('/admin/audit-logs', authenticate, authorizeRoles('admin'), asyncHandler(controller.auditLogs));

module.exports = router;
