import http from 'http';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import config from './app/config';
import seedSuperAdmin from './app/DB';
import { socketHelper } from './app/helpers/socketHelper';
import { errorLogger, logger } from './app/shared/logger';
import { emailWorker, emailQueue } from './queues/index';
import './queues/index';

let server: http.Server;

const shutdown = async () => {
  logger.info('🛑 Graceful shutdown started...');

  try {
    // close BullMQ workers
    await Promise.all([emailWorker.close()]);

    logger.info('✅ Workers closed');

    // close BullMQ queues
    await Promise.all([emailQueue.close()]);

    logger.info('✅ Queues closed');

    // close HTTP server
    if (server) {
      server.close(() => {
        logger.info('✅ HTTP server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (error) {
    errorLogger.error('❌ Shutdown error', error);
    process.exit(1);
  }
};

// uncaught exception
process.on('uncaughtException', (error) => {
  errorLogger.error('👿 uncaughtException detected', error);
  shutdown();
});

// unhandled rejection
process.on('unhandledRejection', (error) => {
  errorLogger.error('👿 unhandledRejection detected', error);
  shutdown();
});

// kill signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function main() {
  try {
    // DB connection
    await mongoose.connect(config.database_url as string);

    logger.info('🐘 Database connected successfully');

    // seed admin
    await seedSuperAdmin();

    // seed default credit settings
    const { CreditSettingServices } = require('./app/modules/creditSetting/creditSetting.service');
    await CreditSettingServices.seedDefaultCreditSettings();

    // create HTTP server
    server = http.createServer(app);

    // socket.io setup
    const io = new SocketIOServer(server, {
      pingTimeout: 60000,
      pingInterval: 25000,
      cors: {
        origin: '*',
      },
      transports: ['websocket', 'polling'],
    });

    socketHelper.socket(io);

    // global socket access
    (global as any).io = io;

    // start server
    server.listen(config.port, () => {
      logger.info(`🚀 Server running on port: ${config.port}`);
    });
  } catch (error) {
    errorLogger.error('❌ Failed to start server', error);
    process.exit(1);
  }
}

main();
