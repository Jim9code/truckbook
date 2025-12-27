import express from 'express';
import { getMaintenance, addMaintenance, deleteMaintenance } from '../controllers/maintenanceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all maintenance records for a truck
router.get('/trucks/:id/maintenance', getMaintenance);

// Add maintenance record to a truck
router.post('/trucks/:id/maintenance', addMaintenance);

// Delete maintenance record
router.delete('/trucks/:id/maintenance/:maintenanceId', deleteMaintenance);

export default router;

