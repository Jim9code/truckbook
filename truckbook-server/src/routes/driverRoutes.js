import express from 'express';
import { getDrivers, addDriver, getDriver } from '../controllers/driverController.js';
import { validateDriver } from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All driver routes require authentication
router.use(authenticate);

router.get('/', getDrivers);
router.post('/', validateDriver, addDriver);
router.get('/:id', getDriver);

export default router;

