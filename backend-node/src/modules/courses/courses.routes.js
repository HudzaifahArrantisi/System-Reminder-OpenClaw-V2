const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./courses.controller');

const router = Router();

router.get('/courses', authenticate, asyncHandler(controller.listCourses));
router.post('/courses', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createCourse));
router.get('/courses/:courseId', authenticate, asyncHandler(controller.getCourse));
router.patch('/courses/:courseId', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.updateCourse));
router.get('/courses/:courseId/pertemuan', authenticate, asyncHandler(controller.listMeetings));
router.get('/courses/:courseId/enrollments', authenticate, asyncHandler(controller.listEnrollments));
router.post('/courses/:courseId/enrollments', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.addEnrollment));
router.delete('/courses/:courseId/enrollments/:studentId', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.removeEnrollment));
router.get('/courses/:courseId/meetings', authenticate, asyncHandler(controller.listMeetings));
router.post('/courses/:courseId/meetings', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createMeeting));

module.exports = router;
