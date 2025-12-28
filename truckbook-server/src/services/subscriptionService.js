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
export const createSubscription = async (userId, planType, flutterwaveData = null) => {
  const { Subscription } = await getModels();
  const price = getPlanPrice(planType);
  if (!price) {
    throw new Error('Invalid plan type');
  }

  const startDate = new Date();
  const endDate = calculateEndDate(startDate);

  const subscriptionData = {
    userId,
    planType,
    price,
    status: flutterwaveData ? 'pending' : 'active',
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };

  // Add Flutterwave data if provided
  if (flutterwaveData) {
    subscriptionData.flutterwaveSubscriptionId = flutterwaveData.subscriptionId;
    subscriptionData.flutterwavePlanId = flutterwaveData.planId;
    subscriptionData.paymentReference = flutterwaveData.paymentReference;
    if (flutterwaveData.nextPaymentDate) {
      subscriptionData.nextPaymentDate = flutterwaveData.nextPaymentDate;
    }
  }

  const subscription = await Subscription.create(subscriptionData);

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

// Update subscription with Flutterwave data
export const updateSubscriptionWithFlutterwave = async (subscriptionId, flutterwaveData) => {
  const { Subscription } = await getModels();
  
  const subscription = await Subscription.findByPk(subscriptionId);
  if (!subscription) {
    throw new Error('Subscription not found');
  }

  const updateData = {};
  if (flutterwaveData.subscriptionId) {
    updateData.flutterwaveSubscriptionId = flutterwaveData.subscriptionId;
  }
  if (flutterwaveData.planId) {
    updateData.flutterwavePlanId = flutterwaveData.planId;
  }
  if (flutterwaveData.paymentReference) {
    updateData.paymentReference = flutterwaveData.paymentReference;
  }
  if (flutterwaveData.nextPaymentDate) {
    updateData.nextPaymentDate = flutterwaveData.nextPaymentDate;
  }
  if (flutterwaveData.status) {
    updateData.status = flutterwaveData.status;
  }

  await subscription.update(updateData);
  return subscription.toJSON();
};

// Get subscription by Flutterwave subscription ID
export const getSubscriptionByFlutterwaveId = async (flutterwaveSubscriptionId) => {
  const { Subscription } = await getModels();
  const subscription = await Subscription.findOne({
    where: {
      flutterwaveSubscriptionId
    }
  });

  return subscription ? subscription.toJSON() : null;
};

// Cancel subscription
export const cancelSubscription = async (userId) => {
  const { Subscription } = await getModels();
  
  const subscription = await Subscription.findOne({
    where: {
      userId,
      status: 'active'
    },
    order: [['createdAt', 'DESC']]
  });

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  // Update status to inactive
  await subscription.update({ status: 'inactive' });

  return subscription.toJSON();
};

