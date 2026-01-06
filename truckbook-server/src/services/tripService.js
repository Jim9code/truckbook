import { getModels } from '../utils/models.js';
import { findOrCreateCustomer } from './customerService.js';
import { getTruckMaintenanceTotal } from './maintenanceService.js';

// Get all trips for a user with filters
export const getUserTrips = async (userId, filters = {}, planType = null) => {
  const { Trip, Truck, Driver, Customer } = await getModels();
  const { Op } = await import('sequelize');
  
  const whereClause = { userId };
  
  // Starter plan: Limit to 3 months of historical data
  if (planType === 'starter') {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);
    
    // If no date filter specified, apply 3-month limit
    if (!filters.date && !filters.dateFrom && !filters.dateTo) {
      whereClause.date = {
        [Op.gte]: threeMonthsAgo.toISOString().split('T')[0]
      };
    } else if (filters.dateFrom) {
      // If dateFrom is provided, ensure it's not older than 3 months
      const dateFrom = new Date(filters.dateFrom);
      const effectiveDateFrom = dateFrom < threeMonthsAgo ? threeMonthsAgo : dateFrom;
      whereClause.date = {
        [Op.gte]: effectiveDateFrom.toISOString().split('T')[0]
      };
      if (filters.dateTo) {
        whereClause.date[Op.lte] = filters.dateTo;
      }
    } else if (filters.date) {
      // If single date filter, check if it's within 3 months
      const filterDate = new Date(filters.date);
      if (filterDate >= threeMonthsAgo) {
        whereClause.date = filters.date;
      } else {
        // Date is older than 3 months, return empty result
        return [];
      }
    }
  } else {
    // Large Fleet: No date limit, use filters as provided
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

  // Get maintenance costs for all trucks in parallel
  // IMPORTANT: We need to sort trips by date ASC first to calculate maintenance per period
  const tripsSorted = [...trips].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB;
    }
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });

  // Create a map to track previous trip dates per truck
  const truckPreviousTripDates = new Map();

  const tripsWithMaintenance = await Promise.all(tripsSorted.map(async (trip) => {
    const tripData = trip.toJSON();
    
    // Format truck as "Truck Name #Plate Number" for frontend
    if (tripData.truck) {
      const truckId = trip.truckId || (trip.truck && trip.truck.id);
      tripData.truck = `${tripData.truck.name} #${tripData.truck.plateNumber}`;
      
      // Get maintenance cost for this truck (only for this trip period, not cumulative)
      if (truckId) {
        try {
          const { MaintenanceRecord } = await getModels();
          const { Op } = await import('sequelize');
          
          const tripDate = new Date(tripData.date || new Date());
          const previousTripDate = truckPreviousTripDates.get(truckId);
          
          // Calculate maintenance cost between previous trip and this trip
          const maintenanceWhere = {
            truckId,
            userId,
            date: {
              [Op.lte]: tripDate
            }
          };
          
          if (previousTripDate) {
            maintenanceWhere.date[Op.gt] = previousTripDate;
          }
          
          const maintenanceTotal = await MaintenanceRecord.sum('amount', {
            where: maintenanceWhere
          });
          
          tripData.truckMaintenanceCost = parseFloat(maintenanceTotal) || 0;
          
          // Update the previous trip date for this truck
          truckPreviousTripDates.set(truckId, tripDate);
        } catch (error) {
          console.error(`Error fetching maintenance for truck ${truckId}:`, error);
          tripData.truckMaintenanceCost = 0;
        }
      } else {
        tripData.truckMaintenanceCost = 0;
      }
    } else {
      tripData.truckMaintenanceCost = 0;
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
  }));
  
  // Re-sort by original order (date DESC, createdAt DESC)
  tripsWithMaintenance.sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB - dateA;
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
  
  return tripsWithMaintenance;
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
  
  // Parse routes if it's a string
  if (tripData.routes && typeof tripData.routes === 'string') {
    try {
      tripData.routes = JSON.parse(tripData.routes);
    } catch (e) {
      tripData.routes = [];
    }
  }
  // If no routes but has routeFrom/routeTo, convert to routes array
  if ((!tripData.routes || tripData.routes.length === 0) && tripData.routeFrom && tripData.routeTo) {
    tripData.routes = [{ from: tripData.routeFrom, to: tripData.routeTo, date: tripData.date }];
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
    routes,
    returnDate,
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

  // Handle routes - use new routes array if provided, otherwise convert old format
  let routesArray = [];
  if (routes && Array.isArray(routes) && routes.length > 0) {
    routesArray = routes.map(r => ({
      from: r.from?.trim() || '',
      to: r.to?.trim() || '',
      date: r.date || date
    }));
  } else if (routeFrom && routeTo) {
    // Backward compatibility: convert old single route format
    routesArray = [{ from: routeFrom.trim(), to: routeTo.trim(), date: date }];
  }

  // Auto-set returnDate when status is Completed
  let finalReturnDate = returnDate;
  if (status === 'Completed' && !finalReturnDate) {
    finalReturnDate = new Date().toISOString().split('T')[0];
  }

  // Create trip
  const trip = await Trip.create({
    userId,
    truckId: truck.id,
    driverId: driver.id,
    customerId: customer.id,
    date,
    routeFrom: routesArray.length > 0 ? routesArray[0].from : (routeFrom?.trim() || ''),
    routeTo: routesArray.length > 0 ? routesArray[routesArray.length - 1].to : (routeTo?.trim() || ''),
    routes: routesArray,
    returnDate: finalReturnDate || null,
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

  const tripResult = trip.toJSON();
  // Ensure routes is parsed if it's a string
  if (tripResult.routes && typeof tripResult.routes === 'string') {
    try {
      tripResult.routes = JSON.parse(tripResult.routes);
    } catch (e) {
      tripResult.routes = [];
    }
  }
  return tripResult;
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
    routes,
    returnDate,
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

  // Handle routes - use new routes array if provided, otherwise convert old format or keep existing
  let routesArray = trip.routes || [];
  if (routes && Array.isArray(routes) && routes.length > 0) {
    routesArray = routes.map(r => ({
      from: r.from?.trim() || '',
      to: r.to?.trim() || '',
      date: r.date || date || trip.date
    }));
  } else if (routeFrom && routeTo) {
    // Backward compatibility: convert old single route format
    routesArray = [{ from: routeFrom.trim(), to: routeTo.trim(), date: date || trip.date }];
  }

  // Auto-set returnDate when status changes to Completed
  let finalReturnDate = returnDate;
  const oldStatus = trip.status;
  if (status === 'Completed' && oldStatus !== 'Completed' && !finalReturnDate) {
    finalReturnDate = new Date().toISOString().split('T')[0];
  }

  // Update routeFrom and routeTo for backward compatibility (first and last route)
  const updatedRouteFrom = routesArray.length > 0 ? routesArray[0].from : (routeFrom?.trim() || trip.routeFrom);
  const updatedRouteTo = routesArray.length > 0 ? routesArray[routesArray.length - 1].to : (routeTo?.trim() || trip.routeTo);

  // Update trip
  await trip.update({
    ...(date && { date }),
    ...(truckId && { truckId }),
    ...(driverId && { driverId }),
    ...(customerId && { customerId }),
    ...(updatedRouteFrom && { routeFrom: updatedRouteFrom }),
    ...(updatedRouteTo && { routeTo: updatedRouteTo }),
    routes: routesArray,
    ...(finalReturnDate !== undefined && { returnDate: finalReturnDate || null }),
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

  const tripResult = trip.toJSON();
  // Ensure routes is parsed if it's a string
  if (tripResult.routes && typeof tripResult.routes === 'string') {
    try {
      tripResult.routes = JSON.parse(tripResult.routes);
    } catch (e) {
      tripResult.routes = [];
    }
  }
  return tripResult;
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
export const getTripStatistics = async (userId, filters = {}, planType = null) => {
  const { Trip } = await getModels();
  const { Op } = await import('sequelize');
  
  const whereClause = { userId };
  
  // Starter plan: Limit to 3 months of historical data (same logic as getUserTrips)
  if (planType === 'starter') {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);
    
    // If no date filter specified, apply 3-month limit
    if (!filters.date && !filters.dateFrom && !filters.dateTo) {
      whereClause.date = {
        [Op.gte]: threeMonthsAgo.toISOString().split('T')[0]
      };
    } else if (filters.dateFrom) {
      // If dateFrom is provided, ensure it's not older than 3 months
      const dateFrom = new Date(filters.dateFrom);
      const effectiveDateFrom = dateFrom < threeMonthsAgo ? threeMonthsAgo : dateFrom;
      whereClause.date = {
        [Op.gte]: effectiveDateFrom.toISOString().split('T')[0]
      };
      if (filters.dateTo) {
        whereClause.date[Op.lte] = filters.dateTo;
      }
    } else if (filters.date) {
      // If single date filter, check if it's within 3 months
      const filterDate = new Date(filters.date);
      if (filterDate < threeMonthsAgo) {
        // Date is older than 3 months, return empty stats
        return {
          totalTrips: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          activeTrips: 0,
          completedTrips: 0
        };
      } else {
        whereClause.date = filters.date;
      }
    }
  } else {
    // Large Fleet: No date limit, use filters as provided
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
  }
  
  if (filters.status) {
    whereClause.status = filters.status;
  }

  // Get trips with truck information for maintenance calculation
  const trips = await Trip.findAll({
    where: whereClause,
    include: [
      {
        model: (await getModels()).Truck,
        as: 'truck',
        attributes: ['id']
      }
    ],
    attributes: [
      'id',
      'agreedPrice',
      'totalReceived',
      'totalCost',
      'status',
      'date',
      'truckId',
      'createdAt'
    ],
    order: [['date', 'ASC'], ['createdAt', 'ASC']]
  });

  // Calculate maintenance cost per trip (non-cumulative)
  const { MaintenanceRecord } = await getModels();
  const truckPreviousTripDates = new Map();
  const tripsWithMaintenance = await Promise.all(trips.map(async (trip) => {
    const tripData = trip.toJSON();
    
    const tripDate = new Date(trip.date || new Date());
    const previousTripDate = trip.truckId ? truckPreviousTripDates.get(trip.truckId) : null;
    
    // Calculate maintenance for this trip period only
    let maintenanceCost = 0;
    if (trip.truckId) {
      const maintenanceWhere = {
        truckId: trip.truckId,
        userId,
        date: {
          [Op.lte]: tripDate
        }
      };
      
      if (previousTripDate) {
        maintenanceWhere.date[Op.gt] = previousTripDate;
      }
      
      maintenanceCost = await MaintenanceRecord.sum('amount', {
        where: maintenanceWhere
      }) || 0;
      
      // Update the previous trip date for this truck
      truckPreviousTripDates.set(trip.truckId, tripDate);
    }
    
    return {
      ...tripData,
      maintenanceCost: parseFloat(maintenanceCost)
    };
  }));

  const totalRevenue = tripsWithMaintenance.reduce((sum, trip) => sum + parseFloat(trip.agreedPrice || 0), 0);
  const totalProfit = tripsWithMaintenance.reduce((sum, trip) => {
    const operationalCost = parseFloat(trip.totalCost || 0);
    const maintenanceCost = parseFloat(trip.maintenanceCost || 0);
    const totalCost = operationalCost + maintenanceCost;
    const profit = parseFloat(trip.totalReceived || 0) - totalCost;
    return sum + profit;
  }, 0);
  const activeTrips = tripsWithMaintenance.filter(trip => trip.status === 'Pending').length;
  const completedTrips = tripsWithMaintenance.filter(trip => trip.status === 'Completed').length;

  return {
    totalRevenue,
    totalProfit,
    activeTrips,
    completedTrips,
    totalTrips: tripsWithMaintenance.length
  };
};

