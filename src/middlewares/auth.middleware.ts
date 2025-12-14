import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response.util';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication token required', 401);
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    (req as AuthRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    sendError(res, error.message || 'Invalid or expired token', 401);
  }
};

