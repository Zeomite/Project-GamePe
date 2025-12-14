import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { JWTPayload } from '../types';

export const generateToken = (userId: string, email: string): string => {
  const payload = { userId, email };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

