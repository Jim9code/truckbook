import {
  getTruckMaintenance,
  createMaintenanceRecord,
  deleteMaintenanceRecord
} from '../services/maintenanceService.js';

// Get all maintenance records for a truck
export const getMaintenance = async (req, res) => {
  try {
    const { id: truckId } = req.params;
    const userId = req.userId;

    const maintenanceRecords = await getTruckMaintenance(truckId, userId);

    res.json({
      success: true,
      data: maintenanceRecords
    });
  } catch (error) {
    console.error('Get maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add maintenance record
export const addMaintenance = async (req, res) => {
  try {
    const { id: truckId } = req.params;
    const userId = req.userId;
    const { description, amount, date } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const maintenanceRecord = await createMaintenanceRecord(userId, truckId, {
      description,
      amount,
      date
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance record added successfully',
      data: maintenanceRecord
    });
  } catch (error) {
    console.error('Add maintenance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding maintenance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete maintenance record
export const deleteMaintenance = async (req, res) => {
  try {
    const { maintenanceId } = req.params;
    const userId = req.userId;

    await deleteMaintenanceRecord(maintenanceId, userId);

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting maintenance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

