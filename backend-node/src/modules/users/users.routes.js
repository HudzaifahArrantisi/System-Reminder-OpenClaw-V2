const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const controller = require('./users.controller');

const router = Router();

router.get('/me', authenticate, asyncHandler(controller.getMe));
router.patch('/me', authenticate, asyncHandler(controller.updateMe));

module.exports = router;
