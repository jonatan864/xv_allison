import { Router } from 'express';
import { login, me } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

export const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.get('/me', requireAuth, me);
