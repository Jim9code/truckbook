import {
  getUserTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStatistics
} from '../services/tripService.js';

// Get all trips for authenticated user
export const getTrips = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      date,
      dateFrom,
      dateTo,
      truck,
      driver,
      status
    } = req.query;

    const filters = {};
    if (date) filters.date = date;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (truck) filters.truck = truck;
    if (driver) filters.driver = driver;
    if (status) filters.status = status;

    const planType = req.planType; // Get plan type from middleware
    const trips = await getUserTrips(userId, filters, planType);

    res.json({
      success: true,
      data: trips
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trips',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get trip statistics
export const getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      date,
      dateFrom,
      dateTo,
      status
    } = req.query;

    const filters = {};
    if (date) filters.date = date;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (status) filters.status = status;

    const planType = req.planType; // Get plan type from middleware
    const stats = await getTripStatistics(userId, filters, planType);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get trip statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single trip by ID
export const getTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const trip = await getTripById(parseInt(id), userId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new trip
export const addTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const tripData = req.body;

    const trip = await createTrip(userId, tripData);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip
    });
  } catch (error) {
    console.error('Create trip error:', error);
    
    if (error.message.includes('not found') || error.message.includes('Invalid')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update trip
export const updateTripController = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const tripData = req.body;

    const trip = await updateTrip(parseInt(id), userId, tripData);

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: trip
    });
  } catch (error) {
    console.error('Update trip error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete trip
export const deleteTripController = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    await deleteTrip(parseInt(id), userId);

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

