import express from 'express';
import { getTrucks, addTruck, getTruck, updateTruckController } from '../controllers/truckController.js';
import { validateTruck } from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscription.js';

const router = express.Router();

// All truck routes require authentication AND active subscription
router.use(authenticate);
router.use(requireSubscription);

router.get('/', getTrucks);
router.post('/', validateTruck, addTruck);
router.get('/:id', getTruck);
router.put('/:id', validateTruck, updateTruckController);

export default router;

