import { getModels } from '../utils/models.js';

// Plan prices
const PLAN_PRICES = {
  'starter': 39000.00,
  'large-fleet': 99000.00
};

// Get plan price
export const getPlanPrice = (planType) => {
  return PLAN_PRICES[planType] || null;
};

// Calculate end date (30 days from start)
export const calculateEndDate = (startDate) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);
  return endDate;
};

// Create subscription
export const createSubscription = async (userId, planType) => {
  const { Subscription } = await getModels();
  const price = getPlanPrice(planType);
  if (!price) {
    throw new Error('Invalid plan type');
  }

  const startDate = new Date();
  const endDate = calculateEndDate(startDate);

  const subscription = await Subscription.create({
    userId,
    planType,
    price,
    status: 'active',
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });

  return subscription.toJSON();
};

// Get active subscription for user
export const getActiveSubscription = async (userId) => {
  const { Subscription } = await getModels();
  const subscription = await Subscription.findOne({
    where: {
      userId,
      status: 'active'
    },
    order: [['createdAt', 'DESC']]
  });

  if (!subscription) {
    return null;
  }

  // Check if subscription has expired
  const today = new Date();
  const endDate = new Date(subscription.endDate);

  if (endDate < today) {
    // Update status to expired
    await subscription.update({ status: 'expired' });
    return null;
  }

  return subscription.toJSON();
};

// Check subscription status
export const checkSubscriptionStatus = async (userId) => {
  const subscription = await getActiveSubscription(userId);
  
  return {
    hasActiveSubscription: !!subscription,
    subscription: subscription || null
  };
};

