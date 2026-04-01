const { Router } = require('express');

const authRoutes = require('./auth/auth.routes');
const usersRoutes = require('./users/users.routes');
const profilesRoutes = require('./profiles/profiles.routes');
const feedRoutes = require('./feed/feed.routes');
const coursesRoutes = require('./courses/courses.routes');
const attendanceRoutes = require('./attendance/attendance.routes');
const learningRoutes = require('./learning/learning.routes');
const financeRoutes = require('./finance/finance.routes');
const adminRoutes = require('./admin/admin.routes');

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/profiles', profilesRoutes);
apiRouter.use('/', feedRoutes);
apiRouter.use('/', coursesRoutes);
apiRouter.use('/', attendanceRoutes);
apiRouter.use('/', learningRoutes);
apiRouter.use('/', financeRoutes);
apiRouter.use('/', adminRoutes);

module.exports = { apiRouter };
