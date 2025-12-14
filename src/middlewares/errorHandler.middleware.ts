import type { Request, NextFunction } from 'express';
import { Response } from 'express';
import { sendError } from '../utils/response.util';
import { logger } from '../utils/logger.util';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error('Error:', err);

  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation error', 400, err);
  }

  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400, err);
  }

  if (err.message.includes('duplicate key')) {
    return sendError(res, 'Resource already exists', 409, err);
  }

  return sendError(res, err.message || 'Internal server error', 500, err);
};

