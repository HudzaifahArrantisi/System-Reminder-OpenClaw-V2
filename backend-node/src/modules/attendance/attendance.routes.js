const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./attendance.controller');

const router = Router();

router.post('/courses/:courseId/attendance-sessions', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createSession));
router.patch('/attendance-sessions/:sessionId/open', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.openSession));
router.patch('/attendance-sessions/:sessionId/close', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.closeSession));
router.get('/attendance-sessions/:sessionId', authenticate, asyncHandler(controller.getSession));
router.post('/attendance-sessions/:sessionId/scan', authenticate, authorizeRoles('mahasiswa'), asyncHandler(controller.scanAttendance));
router.post('/attendance-sessions/:sessionId/manual-record', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.manualRecord));
router.get('/courses/:courseId/attendance-recap', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.courseRecap));
router.get('/students/:studentId/attendance-recap', authenticate, asyncHandler(controller.studentRecap));

module.exports = router;
