import type { NextFunction } from 'express';
import type { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest, NotificationQueryParams, NotificationType } from '../types';
import { sendSuccess } from '../utils/response.util';
import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validator.middleware';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  sendNotification = [
    validate([
      body('userId').notEmpty().withMessage('UserId is required'),
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('message').trim().notEmpty().withMessage('Message is required'),
      body('type').isIn(Object.values(NotificationType)).withMessage('Invalid notification type'),
    ]),
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const notification = await this.notificationService.sendNotification(req.body);
        sendSuccess(res, notification, 'Notification sent successfully', 201);
      } catch (error: any) {
        next(error);
      }
    },
  ];

  getUserNotifications = [
    validate([
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('type').optional().isIn(Object.values(NotificationType)).withMessage('Invalid notification type'),
      query('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
      query('sortBy').optional().isIn(['createdAt', 'readAt']).withMessage('Invalid sortBy field'),
      query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sortOrder'),
    ]),
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.user!.userId;
        const queryParams: NotificationQueryParams = {
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
          type: req.query.type as NotificationType,
          isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
          sortBy: req.query.sortBy as 'createdAt' | 'readAt',
          sortOrder: req.query.sortOrder as 'asc' | 'desc',
        };

        const result = await this.notificationService.getUserNotifications(userId, queryParams);
        sendSuccess(res, result, 'Notifications fetched successfully');
      } catch (error: any) {
        next(error);
      }
    },
  ];

  markAsRead = [
    validate([
      param('id').notEmpty().withMessage('Notification ID is required'),
    ]),
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.user!.userId;
        const notificationId = req.params.id;
        const notification = await this.notificationService.markAsRead(notificationId, userId);
        sendSuccess(res, notification, 'Notification marked as read');
      } catch (error: any) {
        next(error);
      }
    },
  ];

  getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const count = await this.notificationService.getUnreadCount(userId);
      sendSuccess(res, { count }, 'Unread count fetched successfully');
    } catch (error: any) {
      next(error);
    }
  };
}

