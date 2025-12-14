import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(morgan('combined'));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use(errorHandler);

  return app;
};

