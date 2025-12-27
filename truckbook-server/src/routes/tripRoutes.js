import express from 'express';
import {
  getTrips,
  getStats,
  getTrip,
  addTrip,
  updateTripController,
  deleteTripController
} from '../controllers/tripController.js';
import { validateTrip } from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All trip routes require authentication
router.use(authenticate);

router.get('/stats', getStats);
router.get('/', getTrips);
router.get('/:id', getTrip);
router.post('/', validateTrip, addTrip);
router.put('/:id', validateTrip, updateTripController);
router.delete('/:id', deleteTripController);

export default router;

