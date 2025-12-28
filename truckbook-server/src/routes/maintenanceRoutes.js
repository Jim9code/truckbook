import express from 'express';
import { getMaintenance, addMaintenance, deleteMaintenance } from '../controllers/maintenanceController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscription.js';

const router = express.Router();

// All routes require authentication AND active subscription
router.use(authenticate);
router.use(requireSubscription);

// Get all maintenance records for a truck
router.get('/trucks/:id/maintenance', getMaintenance);

// Add maintenance record to a truck
router.post('/trucks/:id/maintenance', addMaintenance);

// Delete maintenance record
router.delete('/trucks/:id/maintenance/:maintenanceId', deleteMaintenance);

export default router;

