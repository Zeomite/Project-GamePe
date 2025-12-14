import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response.util';
import { body } from 'express-validator';
import { validate } from '../middlewares/validator.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = [
    validate([
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('name').trim().notEmpty().withMessage('Name is required'),
    ]),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { email, password, name } = req.body;
        const result = await this.authService.register(email, password, name);
        sendSuccess(res, { user: { id: result.user._id, email: result.user.email, name: result.user.name }, token: result.token }, 'User registered successfully', 201);
      } catch (error: any) {
        next(error);
      }
    },
  ];

  login = [
    validate([
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').notEmpty().withMessage('Password is required'),
    ]),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { email, password } = req.body;
        const result = await this.authService.login(email, password);
        sendSuccess(res, { user: { id: result.user._id, email: result.user.email, name: result.user.name }, token: result.token }, 'Login successful');
      } catch (error: any) {
        next(error);
      }
    },
  ];
}

