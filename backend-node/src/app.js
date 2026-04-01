const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const { env } = require('./config/env');
const { requestContext } = require('./middlewares/requestContext');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const { success } = require('./utils/apiResponse');
const { apiRouter } = require('./modules');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use(requestContext);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  return res.status(200).json(success({ status: 'ok' }, { service: 'backend-node-modular' }, res.locals.traceId));
});

app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
