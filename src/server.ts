import http from 'http';
import app from './app';
import config from './app/config';
import { errorLogger, logger } from './app/shared/logger';
import { emailWorker, emailQueue } from './queues/index';
import './queues/index';

let server: http.Server;

const shutdown = async () => {
  logger.info('Graceful shutdown started');

  try {
    await Promise.all([emailWorker.close()]);
    logger.info('Workers closed');

    await Promise.all([emailQueue.close()]);
    logger.info('Queues closed');

    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (error) {
    errorLogger.error('Shutdown error', error);
    process.exit(1);
  }
};

// handle uncaught exceptions
process.on('uncaughtException', (error) => {
  errorLogger.error('Uncaught exception detected', error);
  shutdown();
});

// handle unhandled rejections
process.on('unhandledRejection', (error) => {
  errorLogger.error('Unhandled rejection detected', error);
  shutdown();
});

// handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function main() {
  try {
    server = http.createServer(app);

    const port = Number(config.port) || 5000;
    const ip = config.ip;

    if (ip) {
      server.listen(port, ip, () => {
        logger.info(`Server running on http://${ip}:${port}`);
      });
    } else {
      server.listen(port, () => {
        logger.info(`Server running on port ${port}`);
      });
    }
  } catch (error) {
    errorLogger.error('Failed to start server', error);
    process.exit(1);
  }
}

main();
