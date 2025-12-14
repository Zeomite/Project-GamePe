import type { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
  body: any;
  query: any;
  params: any;
}

export interface JWTPayload extends JwtPayload {
  userId: string;
  email: string;
}

export enum NotificationType {
  INFO = 'INFO',
  ALERT = 'ALERT',
  SYSTEM = 'SYSTEM',
}

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  sortBy?: 'createdAt' | 'readAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

