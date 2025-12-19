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

let isShuttingDown = false;

const gracefulShutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  const timeout = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);

  try {
    if (socketManager) {
      socketManager.getIO().close();
      logger.info('Socket.io server closed');
    }

    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => {
        if (err) return reject(err);
        logger.info('HTTP server closed');
        resolve();
      });
    });

    await disconnectDatabase();
    await disconnectRedis();

    clearTimeout(timeout);
    logger.info('Graceful shutdown completed');
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

process.on('SIGTERM', async () => {
  try {
    await gracefulShutdown('SIGTERM');
    process.exit(0);
  } catch {
    process.exit(1);
  }
});

process.on('SIGINT', async() => {
  try {
    await gracefulShutdown('SIGINT');
    process.exit(0);
  } catch {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

