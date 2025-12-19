import { NotificationRepository } from '../repositories/notification.repository';
import { CreateNotificationDto, NotificationQueryParams, PaginatedResponse } from '../types';
import { INotification } from '../models/notification.model';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger.util';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async sendNotification(notificationData: CreateNotificationDto): Promise<INotification> {
    const notification = await this.notificationRepository.create(notificationData);

    await this.broadcastNotification(notification);

    return notification;
  }

  async getUserNotifications(
    userId: string,
    queryParams: NotificationQueryParams
  ): Promise<PaginatedResponse<INotification>> {
    return await this.notificationRepository.findByUserId(userId, queryParams);
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await this.notificationRepository.markAsRead(notificationId, userId);
    if (!notification) {
      throw new Error('Notification not found or unauthorized');
    }
    return notification;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.getUnreadCount(userId);
  }

  private async broadcastNotification(notification: INotification): Promise<void> {
    try {
      const notificationData = {
        id: String(notification._id),
        userId: notification.userId.toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      };

      await redisClient.publish('notifications', JSON.stringify(notificationData));
      logger.debug(`Notification broadcasted for user ${notification.userId}`);
    } catch (error) {
      logger.error('Error broadcasting notification:', error);
    }
  }
}

