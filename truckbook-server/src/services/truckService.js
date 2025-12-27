import { Sequelize } from 'sequelize';
import { getModels } from '../utils/models.js';
import { findOrCreateDriver } from './driverService.js';

const { Op } = Sequelize;

// Get all trucks for a user
export const getUserTrucks = async (userId, searchQuery = '') => {
  const { Truck } = await getModels();
  
  const whereClause = { userId };
  
  if (searchQuery) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
      { plateNumber: { [Op.like]: `%${searchQuery}%` } }
    ];
  }

  const trucks = await Truck.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });

  return trucks.map(truck => truck.toJSON());
};

// Create truck
export const createTruck = async (userId, truckData) => {
  const { Truck } = await getModels();
  const { name, plateNumber, driverName } = truckData;

  const upperPlateNumber = plateNumber.trim().toUpperCase();

  // Check if plate number already exists for this user
  const existingTruck = await Truck.findOne({
    where: {
      userId,
      plateNumber: upperPlateNumber
    }
  });

  if (existingTruck) {
    throw new Error('A truck with this plate number already exists');
  }

  // Find or create driver
  const driver = await findOrCreateDriver(userId, driverName);

  // Create truck
  const truck = await Truck.create({
    userId,
    name: name.trim(),
    plateNumber: upperPlateNumber
  });

  return truck.toJSON();
};

// Get truck by ID
export const getTruckById = async (truckId, userId) => {
  const { Truck } = await getModels();
  
  const truck = await Truck.findOne({
    where: {
      id: truckId,
      userId
    }
  });

  if (!truck) {
    return null;
  }

  return truck.toJSON();
};

// Update truck
export const updateTruck = async (truckId, userId, truckData) => {
  const { Truck } = await getModels();
  const { name, plateNumber, driverName } = truckData;

  // Get existing truck
  const truck = await Truck.findOne({
    where: {
      id: truckId,
      userId
    }
  });

  if (!truck) {
    throw new Error('Truck not found');
  }

  // Check if plate number already exists for another truck
  if (plateNumber) {
    const upperPlateNumber = plateNumber.trim().toUpperCase();
    if (upperPlateNumber !== truck.plateNumber) {
      const existingTruck = await Truck.findOne({
        where: {
          userId,
          plateNumber: upperPlateNumber,
          id: { [Op.ne]: truckId }
        }
      });

      if (existingTruck) {
        throw new Error('A truck with this plate number already exists');
      }
    }
  }

  // Find or create driver if driverName provided
  if (driverName) {
    await findOrCreateDriver(userId, driverName);
  }

  // Update truck
  const upperPlateNumber = plateNumber ? plateNumber.trim().toUpperCase() : truck.plateNumber;
  await truck.update({
    name: name ? name.trim() : truck.name,
    plateNumber: upperPlateNumber
  });

  return truck.toJSON();
};

