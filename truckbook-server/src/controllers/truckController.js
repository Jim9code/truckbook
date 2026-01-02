import {
  getUserTrucks,
  createTruck,
  getTruckById,
  updateTruck
} from '../services/truckService.js';

// Get all trucks for authenticated user
export const getTrucks = async (req, res) => {
  try {
    const userId = req.userId;
    const searchQuery = req.query.search || '';

    const trucks = await getUserTrucks(userId, searchQuery);

    res.json({
      success: true,
      data: trucks
    });
  } catch (error) {
    console.error('Get trucks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trucks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new truck
export const addTruck = async (req, res) => {
  try {
    const userId = req.userId;
    const planType = req.planType; // Get plan type from middleware
    const { name, plateNumber, driverName } = req.body;

    // Check truck limit for Starter plan (5 trucks max)
    if (planType === 'starter') {
      const { getUserTrucks } = await import('../services/truckService.js');
      const existingTrucks = await getUserTrucks(userId);
      
      if (existingTrucks.length >= 5) {
        return res.status(403).json({
          success: false,
          message: 'Starter plan is limited to 5 trucks. Please upgrade to Large Fleet plan for unlimited trucks.',
          requiresUpgrade: true
        });
      }
    }

    const truck = await createTruck(userId, { name, plateNumber, driverName });

    res.status(201).json({
      success: true,
      message: 'Truck added successfully',
      data: truck
    });
  } catch (error) {
    console.error('Create truck error:', error);
    
    // Handle duplicate plate number error
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating truck',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single truck by ID
export const getTruck = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const truck = await getTruckById(parseInt(id), userId);

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck not found'
      });
    }

    res.json({
      success: true,
      data: truck
    });
  } catch (error) {
    console.error('Get truck error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching truck',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update truck
export const updateTruckController = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, plateNumber, driverName } = req.body;

    const truck = await updateTruck(parseInt(id), userId, { name, plateNumber, driverName });

    res.json({
      success: true,
      message: 'Truck updated successfully',
      data: truck
    });
  } catch (error) {
    console.error('Update truck error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating truck',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

