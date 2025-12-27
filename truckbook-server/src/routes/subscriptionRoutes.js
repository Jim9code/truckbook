import express from 'express';
import { subscribe, getSubscriptionStatus } from '../controllers/subscriptionController.js';
import { validateSubscription } from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All subscription routes require authentication
router.use(authenticate);

router.post('/', validateSubscription, subscribe);
router.get('/status', getSubscriptionStatus);

export default router;

