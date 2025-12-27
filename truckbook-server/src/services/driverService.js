import { Sequelize } from 'sequelize';
import { getModels } from '../utils/models.js';

const { Op } = Sequelize;

// Get all drivers for a user
export const getUserDrivers = async (userId, searchQuery = '') => {
  const { Driver } = await getModels();
  
  const whereClause = { userId };
  
  if (searchQuery) {
    whereClause.name = { [Op.like]: `%${searchQuery}%` };
  }

  const drivers = await Driver.findAll({
    where: whereClause,
    order: [['name', 'ASC']]
  });

  return drivers.map(driver => driver.toJSON());
};

// Find or create driver (used when creating truck with driverName)
export const findOrCreateDriver = async (userId, driverName) => {
  const { Driver } = await getModels();
  
  // Try to find existing driver
  let driver = await Driver.findOne({
    where: {
      userId,
      name: driverName.trim()
    }
  });

  // If not found, create new driver
  if (!driver) {
    driver = await Driver.create({
      userId,
      name: driverName.trim()
    });
  }

  return driver;
};

// Create driver
export const createDriver = async (userId, driverData) => {
  const { Driver } = await getModels();
  const { name } = driverData;

  // Check if driver already exists for this user
  const existingDriver = await Driver.findOne({
    where: {
      userId,
      name: name.trim()
    }
  });

  if (existingDriver) {
    throw new Error('A driver with this name already exists');
  }

  // Create driver
  const driver = await Driver.create({
    userId,
    name: name.trim()
  });

  return driver.toJSON();
};

// Get driver by ID
export const getDriverById = async (driverId, userId) => {
  const { Driver } = await getModels();
  
  const driver = await Driver.findOne({
    where: {
      id: driverId,
      userId
    }
  });

  if (!driver) {
    return null;
  }

  return driver.toJSON();
};

