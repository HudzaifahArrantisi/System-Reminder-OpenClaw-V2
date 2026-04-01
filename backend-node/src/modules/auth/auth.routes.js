const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const controller = require('./auth.controller');

const router = Router();

router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', asyncHandler(controller.logout));
router.get('/me', authenticate, asyncHandler(controller.me));

module.exports = router;
