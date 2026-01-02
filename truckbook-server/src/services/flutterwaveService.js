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

// Create subscription in Flutterwave (using Standard Payments with subscription plan)
export const createFlutterwaveSubscription = async (userData, planId) => {
  try {
    // Generate a unique transaction reference
    const txRef = `TRUCKBOOKS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Log plan ID for debugging
    console.log('Creating payment with plan ID:', planId);
    console.log('Plan ID type:', typeof planId);
    
    // Convert planId to integer if it's a string
    const planIdInt = typeof planId === 'string' ? parseInt(planId, 10) : planId;
    
    // Validate plan ID
    if (!planIdInt || isNaN(planIdInt)) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }
    
    const payload = {
      tx_ref: txRef,
      amount: userData.amount.toString(), // Ensure amount is string
      currency: 'NGN',
      payment_options: 'card,account,banktransfer,ussd',
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/callback?tx_ref=${txRef}`,
      customer: {
        email: userData.email,
        name: userData.fullName || userData.companyName || userData.email
      },
      customizations: {
        title: `${userData.companyName || 'TruckBooks'} - Subscription`,
        description: `Monthly subscription for ${userData.companyName || 'your company'}`
      },
      // Include payment plan for subscription - use integer
      payment_plan: planIdInt
    };

    // Log payload for debugging (without sensitive data)
    console.log('Payment payload:', {
      ...payload,
      customer: { email: payload.customer.email, name: payload.customer.name }
    });

    // Use Flutterwave Standard Payments API (supports payment_plan)
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
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
      // Log full error for debugging
      console.error('Flutterwave API Error:', JSON.stringify(response.data, null, 2));
      return {
        success: false,
        message: response.data.message || 'Failed to create subscription payment link'
      };
    }
  } catch (error) {
    // Enhanced error logging
    console.error('Flutterwave subscription creation error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error creating Flutterwave subscription'
    };
  }
};

// Verify webhook signature
// Flutterwave sends the secret hash directly in verif-hash header
// No HMAC, no hashing - just simple string comparison!
export const verifyWebhook = (signature) => {
  try {
    if (!signature) {
      console.error('Missing verif-hash header');
      return false;
    }

    // Simple string comparison - Flutterwave sends the secret hash directly
    const isValid = signature === process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    
    if (!isValid) {
      console.error('Invalid webhook signature:', {
        received: signature,
        expected: process.env.FLUTTERWAVE_WEBHOOK_SECRET ? 'Set' : 'Not set'
      });
    } else {
      console.log('✅ Webhook signature verified successfully');
    }
    
    return isValid;
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

// Get subscription ID from transaction reference
export const getSubscriptionIdByTxRef = async (txRef) => {
  try {
    // First, get the transaction details
    const transactionResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions?tx_ref=${txRef}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (transactionResponse.data.status === 'success' && transactionResponse.data.data) {
      const transaction = Array.isArray(transactionResponse.data.data) 
        ? transactionResponse.data.data[0] 
        : transactionResponse.data.data;
      
      // The subscription ID might be in the transaction data
      const subscriptionId = transaction?.subscription_id || 
                             transaction?.payment_plan?.id || // This might be plan ID, not subscription ID
                             null;
      
      if (subscriptionId) {
        return {
          success: true,
          subscriptionId: subscriptionId.toString()
        };
      }
    }
    
    return {
      success: false,
      message: 'Subscription ID not found in transaction'
    };
  } catch (error) {
    console.error('Error fetching subscription ID by tx_ref:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error fetching subscription ID'
    };
  }
};

// Cancel subscription in Flutterwave
export const cancelFlutterwaveSubscription = async (subscriptionId) => {
  try {
    // Use Flutterwave REST API to cancel subscription
    const response = await axios.put(
      `https://api.flutterwave.com/v3/subscriptions/${subscriptionId}/cancel`,
      {},
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
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to cancel subscription'
      };
    }
  } catch (error) {
    console.error('Flutterwave cancellation error:', error);
    console.error('Error details:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error cancelling subscription'
    };
  }
};

