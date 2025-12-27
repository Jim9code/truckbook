import { getModels } from '../utils/models.js';
import { findOrCreateCustomer } from './customerService.js';

// Get all trips for a user with filters
export const getUserTrips = async (userId, filters = {}) => {
  const { Trip, Truck, Driver, Customer } = await getModels();
  const { Op } = await import('sequelize');
  
  const whereClause = { userId };
  
  // Date filter
  if (filters.date) {
    whereClause.date = filters.date;
  } else if (filters.dateFrom || filters.dateTo) {
    whereClause.date = {};
    if (filters.dateFrom) {
      whereClause.date[Op.gte] = filters.dateFrom;
    }
    if (filters.dateTo) {
      whereClause.date[Op.lte] = filters.dateTo;
    }
  }
  
  // Status filter
  if (filters.status) {
    whereClause.status = filters.status;
  }
  
  // Truck filter - need to find truck by name/plate format
  let truckFilter = null;
  if (filters.truck) {
    // Format is "Truck Name #Plate Number"
    const truckParts = filters.truck.split(' #');
    if (truckParts.length === 2) {
      const [truckName, plateNumber] = truckParts;
      const truck = await Truck.findOne({
        where: {
          userId,
          name: truckName.trim(),
          plateNumber: plateNumber.trim()
        }
      });
      if (truck) {
        truckFilter = truck.id;
      }
    }
  }
  
  // Driver filter
  let driverFilter = null;
  if (filters.driver) {
    const { Driver: DriverModel } = await getModels();
    const driver = await DriverModel.findOne({
      where: {
        userId,
        name: filters.driver.trim()
      }
    });
    if (driver) {
      driverFilter = driver.id;
    }
  }

  const trips = await Trip.findAll({
    where: {
      ...whereClause,
      ...(truckFilter && { truckId: truckFilter }),
      ...(driverFilter && { driverId: driverFilter })
    },
    include: [
      {
        model: Truck,
        as: 'truck',
        attributes: ['id', 'name', 'plateNumber']
      },
      {
        model: Driver,
        as: 'driver',
        attributes: ['id', 'name']
      },
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name']
      }
    ],
    order: [['date', 'DESC'], ['createdAt', 'DESC']]
  });

  return trips.map(trip => {
    const tripData = trip.toJSON();
    // Format truck as "Truck Name #Plate Number" for frontend
    if (tripData.truck) {
      tripData.truck = `${tripData.truck.name} #${tripData.truck.plateNumber}`;
    }
    // Format driver as name
    if (tripData.driver) {
      tripData.driver = tripData.driver.name;
    }
    // Format customer as name
    if (tripData.customer) {
      tripData.customer = tripData.customer.name;
    }
    return tripData;
  });
};

// Get single trip by ID
export const getTripById = async (tripId, userId) => {
  const { Trip, Truck, Driver, Customer } = await getModels();
  
  const trip = await Trip.findOne({
    where: {
      id: tripId,
      userId
    },
    include: [
      {
        model: Truck,
        as: 'truck',
        attributes: ['id', 'name', 'plateNumber']
      },
      {
        model: Driver,
        as: 'driver',
        attributes: ['id', 'name']
      },
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name']
      }
    ]
  });

  if (!trip) {
    return null;
  }

  const tripData = trip.toJSON();
  // Format for frontend
  if (tripData.truck) {
    tripData.truck = `${tripData.truck.name} #${tripData.truck.plateNumber}`;
  }
  if (tripData.driver) {
    tripData.driver = tripData.driver.name;
  }
  if (tripData.customer) {
    tripData.customer = tripData.customer.name;
  }
  
  return tripData;
};

// Create trip
export const createTrip = async (userId, tripData) => {
  const { Trip, Truck, Driver } = await getModels();
  const {
    date,
    truck: truckFormat,
    driver: driverName,
    customer: customerName,
    routeFrom,
    routeTo,
    status,
    agreedPrice,
    paymentType,
    amountReceivedBefore,
    amountReceivedAfter,
    fuelCost,
    maintenanceCost,
    otherCosts,
    notes
  } = tripData;

  // Parse truck from format "Truck Name #Plate Number"
  const truckParts = truckFormat.split(' #');
  if (truckParts.length !== 2) {
    throw new Error('Invalid truck format');
  }
  const [truckName, plateNumber] = truckParts;
  
  const truck = await Truck.findOne({
    where: {
      userId,
      name: truckName.trim(),
      plateNumber: plateNumber.trim()
    }
  });

  if (!truck) {
    throw new Error('Truck not found');
  }

  // Find driver
  const driver = await Driver.findOne({
    where: {
      userId,
      name: driverName.trim()
    }
  });

  if (!driver) {
    throw new Error('Driver not found');
  }

  // Find or create customer
  const customer = await findOrCreateCustomer(userId, customerName);

  // Calculate totals
  const totalCost = (parseFloat(fuelCost) || 0) + (parseFloat(maintenanceCost) || 0) + (parseFloat(otherCosts) || 0);
  const totalReceived = (parseFloat(amountReceivedBefore) || 0) + (parseFloat(amountReceivedAfter) || 0);

  // Create trip
  const trip = await Trip.create({
    userId,
    truckId: truck.id,
    driverId: driver.id,
    customerId: customer.id,
    date,
    routeFrom: routeFrom.trim(),
    routeTo: routeTo.trim(),
    status: status || 'Pending',
    agreedPrice: parseFloat(agreedPrice),
    paymentType: paymentType || 'full',
    amountReceivedBefore: parseFloat(amountReceivedBefore) || 0,
    amountReceivedAfter: parseFloat(amountReceivedAfter) || 0,
    fuelCost: parseFloat(fuelCost) || 0,
    maintenanceCost: parseFloat(maintenanceCost) || 0,
    otherCosts: parseFloat(otherCosts) || 0,
    totalCost,
    totalReceived,
    notes: notes || null
  });

  return trip.toJSON();
};

// Update trip
export const updateTrip = async (tripId, userId, tripData) => {
  const { Trip, Truck, Driver } = await getModels();
  const {
    date,
    truck: truckFormat,
    driver: driverName,
    customer: customerName,
    routeFrom,
    routeTo,
    status,
    agreedPrice,
    paymentType,
    amountReceivedBefore,
    amountReceivedAfter,
    fuelCost,
    maintenanceCost,
    otherCosts,
    notes
  } = tripData;

  // Get existing trip
  const trip = await Trip.findOne({
    where: {
      id: tripId,
      userId
    }
  });

  if (!trip) {
    throw new Error('Trip not found');
  }

  // Parse truck if provided
  let truckId = trip.truckId;
  if (truckFormat) {
    const truckParts = truckFormat.split(' #');
    if (truckParts.length === 2) {
      const [truckName, plateNumber] = truckParts;
      const truck = await Truck.findOne({
        where: {
          userId,
          name: truckName.trim(),
          plateNumber: plateNumber.trim()
        }
      });
      if (!truck) {
        throw new Error('Truck not found');
      }
      truckId = truck.id;
    }
  }

  // Find driver if provided
  let driverId = trip.driverId;
  if (driverName) {
    const driver = await Driver.findOne({
      where: {
        userId,
        name: driverName.trim()
      }
    });
    if (!driver) {
      throw new Error('Driver not found');
    }
    driverId = driver.id;
  }

  // Find or create customer if provided
  let customerId = trip.customerId;
  if (customerName) {
    const customer = await findOrCreateCustomer(userId, customerName);
    customerId = customer.id;
  }

  // Calculate totals
  const totalCost = (parseFloat(fuelCost) || 0) + (parseFloat(maintenanceCost) || 0) + (parseFloat(otherCosts) || 0);
  const totalReceived = (parseFloat(amountReceivedBefore) || 0) + (parseFloat(amountReceivedAfter) || 0);

  // Update trip
  await trip.update({
    ...(date && { date }),
    ...(truckId && { truckId }),
    ...(driverId && { driverId }),
    ...(customerId && { customerId }),
    ...(routeFrom && { routeFrom: routeFrom.trim() }),
    ...(routeTo && { routeTo: routeTo.trim() }),
    ...(status && { status }),
    ...(agreedPrice !== undefined && { agreedPrice: parseFloat(agreedPrice) }),
    ...(paymentType && { paymentType }),
    ...(amountReceivedBefore !== undefined && { amountReceivedBefore: parseFloat(amountReceivedBefore) || 0 }),
    ...(amountReceivedAfter !== undefined && { amountReceivedAfter: parseFloat(amountReceivedAfter) || 0 }),
    ...(fuelCost !== undefined && { fuelCost: parseFloat(fuelCost) || 0 }),
    ...(maintenanceCost !== undefined && { maintenanceCost: parseFloat(maintenanceCost) || 0 }),
    ...(otherCosts !== undefined && { otherCosts: parseFloat(otherCosts) || 0 }),
    totalCost,
    totalReceived,
    ...(notes !== undefined && { notes: notes || null })
  });

  return trip.toJSON();
};

// Delete trip
export const deleteTrip = async (tripId, userId) => {
  const { Trip } = await getModels();
  
  const trip = await Trip.findOne({
    where: {
      id: tripId,
      userId
    }
  });

  if (!trip) {
    throw new Error('Trip not found');
  }

  await trip.destroy();
  return true;
};

// Get trip statistics for dashboard
export const getTripStatistics = async (userId, filters = {}) => {
  const { Trip } = await getModels();
  const { Op } = await import('sequelize');
  
  const whereClause = { userId };
  
  // Apply same filters as getUserTrips
  if (filters.date) {
    whereClause.date = filters.date;
  } else if (filters.dateFrom || filters.dateTo) {
    whereClause.date = {};
    if (filters.dateFrom) {
      whereClause.date[Op.gte] = filters.dateFrom;
    }
    if (filters.dateTo) {
      whereClause.date[Op.lte] = filters.dateTo;
    }
  }
  
  if (filters.status) {
    whereClause.status = filters.status;
  }

  const trips = await Trip.findAll({
    where: whereClause,
    attributes: [
      'agreedPrice',
      'totalReceived',
      'totalCost',
      'status'
    ]
  });

  const totalRevenue = trips.reduce((sum, trip) => sum + parseFloat(trip.agreedPrice || 0), 0);
  const totalProfit = trips.reduce((sum, trip) => {
    const profit = parseFloat(trip.totalReceived || 0) - parseFloat(trip.totalCost || 0);
    return sum + profit;
  }, 0);
  const activeTrips = trips.filter(trip => trip.status === 'Pending').length;
  const completedTrips = trips.filter(trip => trip.status === 'Completed').length;

  return {
    totalRevenue,
    totalProfit,
    activeTrips,
    completedTrips,
    totalTrips: trips.length
  };
};

