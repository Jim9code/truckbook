import { getModels } from '../utils/models.js';

// Find or create customer by name
export const findOrCreateCustomer = async (userId, customerName) => {
  const { Customer } = await getModels();
  
  // Try to find existing customer
  let customer = await Customer.findOne({
    where: {
      userId,
      name: customerName.trim()
    }
  });

  // If not found, create new customer
  if (!customer) {
    customer = await Customer.create({
      userId,
      name: customerName.trim()
    });
  }

  return customer;
};

// Get all customers for a user
export const getUserCustomers = async (userId, searchQuery = '') => {
  const { Customer } = await getModels();
  const { Op } = await import('sequelize');
  
  const whereClause = { userId };
  
  if (searchQuery) {
    whereClause.name = { [Op.like]: `%${searchQuery}%` };
  }

  const customers = await Customer.findAll({
    where: whereClause,
    order: [['name', 'ASC']]
  });

  return customers.map(customer => customer.toJSON());
};

