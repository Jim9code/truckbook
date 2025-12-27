import { getModels } from '../utils/models.js';

// Get all maintenance records for a truck
export const getTruckMaintenance = async (truckId, userId) => {
  const { MaintenanceRecord } = await getModels();
  
  const maintenanceRecords = await MaintenanceRecord.findAll({
    where: {
      truckId,
      userId
    },
    order: [['date', 'DESC'], ['createdAt', 'DESC']]
  });

  return maintenanceRecords.map(record => record.toJSON());
};

// Get total maintenance cost for a truck
export const getTruckMaintenanceTotal = async (truckId, userId) => {
  const { MaintenanceRecord } = await getModels();
  
  const result = await MaintenanceRecord.sum('amount', {
    where: {
      truckId,
      userId
    }
  });

  return parseFloat(result) || 0;
};

// Create maintenance record
export const createMaintenanceRecord = async (userId, truckId, maintenanceData) => {
  const { MaintenanceRecord, Truck } = await getModels();
  const { description, amount, date } = maintenanceData;

  // Verify truck belongs to user
  const truck = await Truck.findOne({
    where: {
      id: truckId,
      userId
    }
  });

  if (!truck) {
    throw new Error('Truck not found');
  }

  // Create maintenance record
  const maintenanceRecord = await MaintenanceRecord.create({
    userId,
    truckId,
    description: description.trim(),
    amount: parseFloat(amount),
    date: date || new Date()
  });

  return maintenanceRecord.toJSON();
};

// Delete maintenance record
export const deleteMaintenanceRecord = async (maintenanceId, userId) => {
  const { MaintenanceRecord } = await getModels();
  
  const maintenanceRecord = await MaintenanceRecord.findOne({
    where: {
      id: maintenanceId,
      userId
    }
  });

  if (!maintenanceRecord) {
    throw new Error('Maintenance record not found');
  }

  await maintenanceRecord.destroy();
  return true;
};

