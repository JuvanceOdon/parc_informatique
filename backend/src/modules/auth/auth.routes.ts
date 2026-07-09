import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authController } from './auth.controller.js';
import { loginSchema, logoutSchema, refreshTokenSchema } from './auth.validation.js';

const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), authController.login);
authRoutes.post('/refresh', validate(refreshTokenSchema), authController.refresh);
authRoutes.post('/logout', authenticate, validate(logoutSchema), authController.logout);
authRoutes.get('/profile', authenticate, authController.profile);

export default authRoutes;
