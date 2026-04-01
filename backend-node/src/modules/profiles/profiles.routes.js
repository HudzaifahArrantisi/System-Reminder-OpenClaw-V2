const { Router } = require('express');
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
