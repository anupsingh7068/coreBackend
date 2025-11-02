import { Router } from 'express';
import * as authController from './authController';
import { authenticate } from '../../core/middleware/auth';
import { validateRegister, validateLogin } from '../../core/validation/authValidation';

const router = Router();

router.post('/register', validateRegister, authController.register);

router.post('/login', validateLogin, authController.login);

router.get('/profile', authenticate, authController.getProfile);

router.put('/profile', authenticate, authController.updateProfile);

export default router;