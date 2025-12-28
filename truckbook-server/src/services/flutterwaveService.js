import Flutterwave from 'flutterwave-node-v3';
import crypto from 'crypto';
import axios from 'axios';

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

// Create subscription in Flutterwave (using PaymentLink with subscription plan)
export const createFlutterwaveSubscription = async (userData, planId) => {
  try {
    // Generate a unique transaction reference
    const txRef = `TRUCKBOOKS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const payload = {
      tx_ref: txRef,
      amount: userData.amount,
      currency: 'NGN',
      title: `${userData.companyName || 'TruckBooks'} - Subscription`,
      description: `Monthly subscription for ${userData.companyName || 'your company'}`,
      payment_plan: planId, // This links to your subscription plan
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/callback?tx_ref=${txRef}`,
      customer: {
        email: userData.email,
        name: userData.fullName || userData.companyName || userData.email
      }
    };

    // Use Flutterwave REST API directly to create payment link
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payment-links',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.status === 'success') {
      return {
        success: true,
        data: {
          id: response.data.data.id,
          link: response.data.data.link, // This is the payment URL to redirect user to
          tx_ref: txRef,
          ...response.data.data
        }
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to create subscription payment link'
      };
    }
  } catch (error) {
    console.error('Flutterwave subscription creation error:', error);
    console.error('Error details:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error creating Flutterwave subscription'
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
    // Use get method (correct API for flutterwave-node-v3)
    const response = await flw.Subscription.get({ subscription_id: subscriptionId });
    
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

