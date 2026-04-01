const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./learning.controller');

const router = Router();

const uploadDir = path.resolve(__dirname, '../../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'image/png',
	'image/jpeg',
	'image/webp',
	'text/plain',
	'application/zip',
	'application/x-zip-compressed',
]);

const allowedExtensions = new Set([
	'.pdf',
	'.doc',
	'.docx',
	'.ppt',
	'.pptx',
	'.xls',
	'.xlsx',
	'.png',
	'.jpg',
	'.jpeg',
	'.webp',
	'.txt',
	'.zip',
]);

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname || '').toLowerCase();
		const safeExt = ext || '.bin';
		cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 20 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		const ext = path.extname(file.originalname || '').toLowerCase();
		const isAllowed = allowedMimeTypes.has(file.mimetype) || allowedExtensions.has(ext);

		if (!isAllowed) {
			return cb(new Error('Format file tidak didukung'));
		}

		cb(null, true);
	},
});

router.get('/meetings/:meetingId/contents', authenticate, asyncHandler(controller.listMeetingContents));
router.post('/meetings/:meetingId/materials', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createMaterial));
router.post('/meetings/:meetingId/tasks', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createTask));
router.patch('/contents/:contentId', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.updateContent));
router.delete('/contents/:contentId', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.deleteContent));
router.get('/tasks/:taskId/submissions', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.listTaskSubmissions));
router.post('/tasks/:taskId/submissions', authenticate, authorizeRoles('mahasiswa'), asyncHandler(controller.createTaskSubmission));
router.patch('/submissions/:submissionId/grade', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.gradeSubmission));
router.get('/pertemuan/:pertemuanId/tugas', authenticate, asyncHandler(controller.listTugasByPertemuan));
router.get('/tugas', authenticate, asyncHandler(controller.listTugas));
router.post('/tugas', authenticate, authorizeRoles('admin', 'dosen'), asyncHandler(controller.createLegacyTask));
router.post('/tugas/:tugasId/submit', authenticate, authorizeRoles('mahasiswa'), upload.single('file'), asyncHandler(controller.submitLegacyTask));
router.get('/openclaw/task-status', authenticate, asyncHandler(controller.listOpenClawTaskStatus));
router.get('/tugas/reminders', authenticate, asyncHandler(controller.listOpenClawTaskStatus));

module.exports = router;
