const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '../src/modules');

const files = {
  auth: `const { Router } = require('express');
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
`,
  users: `const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const controller = require('./users.controller');

const router = Router();

router.get('/me', authenticate, asyncHandler(controller.getMe));
router.patch('/me', authenticate, asyncHandler(controller.updateMe));

module.exports = router;
`,
  profiles: `const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./profiles.controller');

const router = Router();

router.get('/ortu/children', authenticate, authorizeRoles('ortu'), asyncHandler(controller.getChildren));
router.patch('/mahasiswa/me', authenticate, authorizeRoles('mahasiswa'), asyncHandler(controller.updateMahasiswaProfile));
router.patch('/dosen/me', authenticate, authorizeRoles('dosen'), asyncHandler(controller.updateDosenProfile));
router.patch('/admin/me', authenticate, authorizeRoles('admin'), asyncHandler(controller.updateAdminProfile));
router.patch('/ortu/me', authenticate, authorizeRoles('ortu'), asyncHandler(controller.updateOrtuProfile));
router.patch('/ukm/me', authenticate, authorizeRoles('ukm'), asyncHandler(controller.updateUkmProfile));
router.patch('/ormawa/me', authenticate, authorizeRoles('ormawa'), asyncHandler(controller.updateOrmawaProfile));
router.get('/:username', asyncHandler(controller.getPublicProfile));

module.exports = router;
`,
  feed: `const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./feed.controller');

const router = Router();

router.get('/posts', authenticate, asyncHandler(controller.listPosts));
router.post('/posts', authenticate, authorizeRoles('admin', 'ukm', 'ormawa'), asyncHandler(controller.createPost));
router.get('/posts/:postId', authenticate, asyncHandler(controller.getPost));
router.patch('/posts/:postId', authenticate, authorizeRoles('admin', 'ukm', 'ormawa'), asyncHandler(controller.updatePost));
router.delete('/posts/:postId', authenticate, authorizeRoles('admin', 'ukm', 'ormawa'), asyncHandler(controller.deletePost));
router.post('/posts/:postId/likes', authenticate, asyncHandler(controller.likePost));
router.delete('/posts/:postId/likes', authenticate, asyncHandler(controller.unlikePost));
router.get('/posts/:postId/comments', authenticate, asyncHandler(controller.listComments));
router.post('/posts/:postId/comments', authenticate, asyncHandler(controller.createComment));
router.patch('/comments/:commentId', authenticate, asyncHandler(controller.updateComment));
router.delete('/comments/:commentId', authenticate, asyncHandler(controller.deleteComment));

module.exports = router;
`,
  courses: `const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./courses.controller');

const router = Router();

router.get('/courses', authenticate, asyncHandler(controller.listCourses));
router.post('/courses', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createCourse));
router.get('/courses/:courseId', authenticate, asyncHandler(controller.getCourse));
router.patch('/courses/:courseId', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.updateCourse));
router.get('/courses/:courseId/enrollments', authenticate, asyncHandler(controller.listEnrollments));
router.post('/courses/:courseId/enrollments', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.addEnrollment));
router.delete('/courses/:courseId/enrollments/:studentId', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.removeEnrollment));
router.get('/courses/:courseId/meetings', authenticate, asyncHandler(controller.listMeetings));
router.post('/courses/:courseId/meetings', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createMeeting));

module.exports = router;
`,
  attendance: `const { Router } = require('express');
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
`,
  learning: `const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./learning.controller');

const router = Router();

router.get('/meetings/:meetingId/contents', authenticate, asyncHandler(controller.listMeetingContents));
router.post('/meetings/:meetingId/materials', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createMaterial));
router.post('/meetings/:meetingId/tasks', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createTask));
router.patch('/contents/:contentId', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.updateContent));
router.delete('/contents/:contentId', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.deleteContent));
router.get('/tasks/:taskId/submissions', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.listTaskSubmissions));
router.post('/tasks/:taskId/submissions', authenticate, authorizeRoles('mahasiswa'), asyncHandler(controller.createTaskSubmission));
router.patch('/submissions/:submissionId/grade', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.gradeSubmission));

module.exports = router;
`,
  finance: `const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./finance.controller');

const router = Router();

router.post('/ukt/invoices', authenticate, authorizeRoles('admin'), asyncHandler(controller.createInvoice));
router.get('/ukt/invoices', authenticate, asyncHandler(controller.listInvoices));
router.get('/ukt/invoices/:invoiceId', authenticate, asyncHandler(controller.getInvoice));
router.patch('/ukt/invoices/:invoiceId/cancel', authenticate, authorizeRoles('admin'), asyncHandler(controller.cancelInvoice));
router.post('/ukt/invoices/:invoiceId/payments', authenticate, asyncHandler(controller.createPayment));
router.get('/ukt/invoices/:invoiceId/payments', authenticate, asyncHandler(controller.listPayments));
router.post('/ukt/payments/webhook', asyncHandler(controller.paymentWebhook));

module.exports = router;
`,
  admin: `const { Router } = require('express');
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
`,
};

for (const [moduleName, content] of Object.entries(files)) {
  const outPath = path.join(base, moduleName, `${moduleName}.routes.js`);
  fs.writeFileSync(outPath, content, 'utf8');
}

console.log('Route files generated.');
