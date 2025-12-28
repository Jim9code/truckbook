import express from 'express';
import { subscribe, getSubscriptionStatus, handleWebhook } from '../controllers/subscriptionController.js';
import { validateSubscription } from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Webhook route - NO authentication required (Flutterwave calls this)
router.post('/webhook', handleWebhook);

// All other subscription routes require authentication
router.use(authenticate);

router.post('/', validateSubscription, subscribe);
router.get('/status', getSubscriptionStatus);

export default router;

