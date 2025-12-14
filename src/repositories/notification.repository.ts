import { Notification, INotification } from '../models/notification.model';
import { NotificationType, NotificationQueryParams, PaginatedResponse } from '../types';

export class NotificationRepository {
  async create(notificationData: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
  }): Promise<INotification> {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async findById(notificationId: string): Promise<INotification | null> {
    return await Notification.findById(notificationId);
  }

  async findByUserId(
    userId: string,
    queryParams: NotificationQueryParams
  ): Promise<PaginatedResponse<INotification>> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { userId };

    if (queryParams.type) {
      filter.type = queryParams.type;
    }

    if (queryParams.isRead !== undefined) {
      filter.isRead = queryParams.isRead;
    }

    const sortBy = queryParams.sortBy || 'createdAt';
    const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      Notification.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return {
      data: data as unknown as INotification[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return result.modifiedCount;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  async deleteById(notificationId: string, userId: string): Promise<boolean> {
    const result = await Notification.findOneAndDelete({ _id: notificationId, userId });
    return !!result;
  }
}

