import http from 'http';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import config from './app/config';
import { socketHelper } from './app/helpers/socketHelper';
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
    await mongoose.connect(config.database_url as string);
    logger.info('Database connected successfully');

    server = http.createServer(app);

    const io = new SocketIOServer(server, {
      pingTimeout: 60000,
      pingInterval: 25000,
      cors: {
        origin: '*',
      },
      transports: ['websocket', 'polling'],
    });

    socketHelper.socket(io);

    (global as any).io = io;

    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    errorLogger.error('Failed to start server', error);
    process.exit(1);
  }
}

main();
