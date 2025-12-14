import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

router.post('/', authenticate, ...notificationController.sendNotification);
router.get('/', authenticate, ...notificationController.getUserNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.patch('/:id/read', authenticate, ...notificationController.markAsRead);

export default router;

