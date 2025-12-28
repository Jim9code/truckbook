import express from 'express';
import { getDrivers, addDriver, getDriver } from '../controllers/driverController.js';
import { validateDriver } from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscription.js';

const router = express.Router();

// All driver routes require authentication AND active subscription
router.use(authenticate);
router.use(requireSubscription);

router.get('/', getDrivers);
router.post('/', validateDriver, addDriver);
router.get('/:id', getDriver);

export default router;

