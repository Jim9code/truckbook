import express from 'express';
import { signup, login, getMe, verifyEmail, resendVerificationCode } from '../controllers/authController.js';
import { validateSignup, validateLogin, validateVerifyEmail } from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/verify-email', authenticate, validateVerifyEmail, verifyEmail);
router.post('/resend-code', authenticate, resendVerificationCode);

export default router;

