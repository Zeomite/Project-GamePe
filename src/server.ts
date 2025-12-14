import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { SocketManager } from './sockets/socketManager';
import { NotificationSocket } from './sockets/notification.socket';
import { logger } from './utils/logger.util';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisClient } from './config/redis';

let httpServer: http.Server;
let socketManager: SocketManager;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const app = createApp();
    httpServer = http.createServer(app);

    const pubClient = redisClient;
    const subClient = redisClient.duplicate();

    socketManager = new SocketManager(httpServer);
    const io = socketManager.getIO();
    io.adapter(createAdapter(pubClient, subClient));

    new NotificationSocket(socketManager);

    httpServer.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  return new Promise((resolve) => {
    httpServer.close(async () => {
      logger.info('HTTP server closed');

      try {
        if (socketManager) {
          socketManager.getIO().close();
          logger.info('Socket.io server closed');
        }

        await disconnectDatabase();
        await disconnectRedis();

        logger.info('Graceful shutdown completed');
        resolve();
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

