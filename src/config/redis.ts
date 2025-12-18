import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger.util';

export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('Redis disconnected successfully');
  } catch (error) {
    logger.error('Redis disconnection error:', error);
  }
};

