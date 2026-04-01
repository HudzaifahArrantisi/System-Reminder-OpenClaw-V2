const { Router } = require('express');
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
