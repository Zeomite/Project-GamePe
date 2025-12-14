import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../utils/jwt.util';
import { JWTPayload } from '../types';
import { logger } from '../utils/logger.util';

interface AuthenticatedSocket {
  userId: string;
  email: string;
}

export class SocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verifyToken(token) as JWTPayload;
        (socket as any).user = {
          userId: decoded.userId,
          email: decoded.email,
        };

        next();
      } catch (error: any) {
        logger.error('Socket authentication error:', error);
        next(new Error('Invalid or expired token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      const user = (socket as any).user as AuthenticatedSocket;
      const userId = user.userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      logger.info(`User ${userId} connected with socket ${socket.id}`);

      socket.on('disconnect', () => {
        const userSockets = this.userSockets.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.userSockets.delete(userId);
          }
        }
        logger.info(`User ${userId} disconnected socket ${socket.id}`);
      });

      socket.on('error', (error) => {
        logger.error(`Socket error for user ${userId}:`, error);
      });
    });
  }

  public emitToUser(userId: string, event: string, data: any): void {
    const userSockets = this.userSockets.get(userId);
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        this.io.to(socketId).emit(event, data);
      });
      logger.debug(`Emitted ${event} to user ${userId} on ${userSockets.size} socket(s)`);
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public getConnectedUsersCount(): number {
    return this.userSockets.size;
  }
}

