const { app } = require('./app');
const { env } = require('./config/env');

const server = app.listen(env.PORT, () => {
  console.log(`Modular backend running on port ${env.PORT}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('HTTP server stopped.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
