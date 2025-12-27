import {
  getUserDrivers,
  createDriver,
  getDriverById
} from '../services/driverService.js';

// Get all drivers for authenticated user
export const getDrivers = async (req, res) => {
  try {
    const userId = req.userId;
    const searchQuery = req.query.search || '';

    const drivers = await getUserDrivers(userId, searchQuery);

    res.json({
      success: true,
      data: drivers
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new driver
export const addDriver = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    const driver = await createDriver(userId, { name });

    res.status(201).json({
      success: true,
      message: 'Driver added successfully',
      data: driver
    });
  } catch (error) {
    console.error('Create driver error:', error);
    
    // Handle duplicate driver name error
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating driver',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single driver by ID
export const getDriver = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const driver = await getDriverById(parseInt(id), userId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching driver',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

