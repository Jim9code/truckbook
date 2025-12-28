import Flutterwave from 'flutterwave-node-v3';
import crypto from 'crypto';

// Initialize Flutterwave
const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

// Get plan ID from env based on plan type
export const getFlutterwavePlanId = (planType) => {
  const planMap = {
    'starter': process.env.FLUTTERWAVE_PLAN_ID_STARTER,
    'large-fleet': process.env.FLUTTERWAVE_PLAN_ID_LARGE_FLEET
  };
  return planMap[planType];
};

// Create subscription in Flutterwave
export const createFlutterwaveSubscription = async (userData, planId) => {
  try {
    const payload = {
      email: userData.email,
      amount: userData.amount,
      plan: planId,
      currency: 'NGN'
    };

    const response = await flw.Subscription.create(payload);
    
    if (response.status === 'success') {
      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to create subscription'
      };
    }
  } catch (error) {
    console.error('Flutterwave subscription creation error:', error);
    return {
      success: false,
      message: error.message || 'Error creating Flutterwave subscription'
    };
  }
};

// Verify webhook signature
export const verifyWebhook = (payload, signature) => {
  try {
    const hash = crypto
      .createHmac('sha256', process.env.FLUTTERWAVE_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
};

// Get subscription details from Flutterwave
export const getFlutterwaveSubscription = async (subscriptionId) => {
  try {
    const response = await flw.Subscription.fetch({ id: subscriptionId });
    
    if (response.status === 'success') {
      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to fetch subscription'
      };
    }
  } catch (error) {
    console.error('Flutterwave subscription fetch error:', error);
    return {
      success: false,
      message: error.message || 'Error fetching Flutterwave subscription'
    };
  }
};

