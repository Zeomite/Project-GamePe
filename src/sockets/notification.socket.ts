import { SocketManager } from './socketManager';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger.util';
import { INotification } from '../models/notification.model';

export class NotificationSocket {
  private socketManager: SocketManager;

  constructor(socketManager: SocketManager) {
    this.socketManager = socketManager;
    this.setupRedisSubscriber();
  }

  private setupRedisSubscriber(): void {
    const subscriber = redisClient.duplicate();

    subscriber.subscribe('notifications', (err) => {
      if (err) {
        logger.error('Redis subscription error:', err);
      } else {
        logger.info('Subscribed to notifications channel');
      }
    });

    subscriber.on('message', (channel, message) => {
      if (channel === 'notifications') {
        try {
          const notification = JSON.parse(message);
          this.socketManager.emitToUser(notification.userId, 'notification', notification);
        } catch (error) {
          logger.error('Error parsing notification message:', error);
        }
      }
    });

    subscriber.on('error', (error) => {
      logger.error('Redis subscriber error:', error);
    });
  }

  public emitNotification(notification: INotification): void {
    const notificationData = {
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };

    this.socketManager.emitToUser(notification.userId.toString(), 'notification', notificationData);
  }
}

