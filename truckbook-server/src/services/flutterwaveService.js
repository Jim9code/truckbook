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

// Create subscription in Flutterwave using proper Subscriptions API
// This creates a REAL subscription object (not just a recurring payment)
export const createFlutterwaveSubscription = async (userData, planId) => {
  try {
    // Convert planId to integer if it's a string
    const planIdInt = typeof planId === 'string' ? parseInt(planId, 10) : planId;
    
    // Validate plan ID
    if (!planIdInt || isNaN(planIdInt)) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    console.log('Creating Flutterwave subscription with plan ID:', planIdInt);
    console.log('Customer:', { email: userData.email, name: userData.fullName || userData.companyName });

    // Step 1: Create subscription explicitly using Flutterwave Subscriptions API
    // This creates a REAL subscription object, not just a recurring payment
    const subscriptionPayload = {
      customer: {
        email: userData.email,
        phone_number: userData.phone || null,
        name: userData.fullName || userData.companyName || userData.email
      },
      plan: planIdInt // Payment plan ID
    };

    // Create subscription using Flutterwave Subscriptions API
    const subscriptionResponse = await axios.post(
      'https://api.flutterwave.com/v3/subscriptions',
      subscriptionPayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (subscriptionResponse.data.status !== 'success') {
      console.error('Flutterwave subscription creation failed:', subscriptionResponse.data);
      return {
        success: false,
        message: subscriptionResponse.data.message || 'Failed to create subscription'
      };
    }

    const subscriptionData = subscriptionResponse.data.data;
    const subscriptionId = subscriptionData.id;

    console.log('✅ Subscription created successfully with ID:', subscriptionId);

    // Step 2: Get payment authorization link for the subscription
    // Flutterwave subscriptions need to be activated with a payment
    // We need to create a payment authorization for the first charge
    
    // Generate a unique transaction reference
    const txRef = `TRUCKBOOKS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create payment authorization for the subscription
    const paymentPayload = {
      tx_ref: txRef,
      amount: userData.amount.toString(),
      currency: 'NGN',
      payment_options: 'card,account,banktransfer,ussd',
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/callback?tx_ref=${txRef}&subscription_id=${subscriptionId}`,
      customer: {
        email: userData.email,
        name: userData.fullName || userData.companyName || userData.email
      },
      customizations: {
        title: `${userData.companyName || 'TruckBooks'} - Subscription`,
        description: `Monthly subscription for ${userData.companyName || 'your company'}`
      },
      // Link this payment to the subscription
      meta: {
        subscription_id: subscriptionId.toString()
      }
    };

    // Create payment link for subscription activation
    const paymentResponse = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      paymentPayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (paymentResponse.data.status !== 'success') {
      console.error('Failed to create payment link for subscription:', paymentResponse.data);
      // Try to cancel the subscription we just created
      try {
        await axios.put(
          `https://api.flutterwave.com/v3/subscriptions/${subscriptionId}/cancel`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ Cancelled subscription after payment link creation failed');
      } catch (cancelError) {
        console.error('Failed to cancel subscription after payment link creation failed:', cancelError);
      }

      return {
        success: false,
        message: paymentResponse.data.message || 'Failed to create payment link'
      };
    }

    const paymentData = paymentResponse.data.data;

    console.log('✅ Payment link created for subscription:', subscriptionId);
    console.log('Transaction reference:', txRef);

    return {
      success: true,
      data: {
        subscriptionId: subscriptionId.toString(), // REAL subscription ID!
        id: subscriptionId,
        link: paymentData.link || paymentData.authorization?.authorization_url,
        tx_ref: txRef,
        ...paymentData
      }
    };
  } catch (error) {
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
export const getSubscriptionIdByTxRef = async (txRef, customerEmail = null, paymentPlanId = null) => {
  try {
    // First, get the transaction details to get customer email and payment plan
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
      
      // Get customer email and payment plan from transaction if not provided
      const email = customerEmail || transaction?.customer?.email;
      const planId = paymentPlanId || transaction?.paymentPlan;
      
      // The subscription ID might be in the transaction data
      const subscriptionId = transaction?.subscription_id || null;
      
      if (subscriptionId) {
        return {
          success: true,
          subscriptionId: subscriptionId.toString()
        };
      }
      
      // If subscription ID not in transaction, fetch from subscriptions API
      if (email && planId) {
        try {
          console.log('Fetching subscriptions from Flutterwave API for email:', email, 'plan:', planId);
          
          // Fetch all subscriptions for this customer
          const subscriptionsResponse = await axios.get(
            `https://api.flutterwave.com/v3/subscriptions?email=${encodeURIComponent(email)}`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (subscriptionsResponse.data.status === 'success' && subscriptionsResponse.data.data) {
            const subscriptions = Array.isArray(subscriptionsResponse.data.data) 
              ? subscriptionsResponse.data.data 
              : [subscriptionsResponse.data.data];
            
            console.log(`Found ${subscriptions.length} subscription(s) for customer`);
            
            // Find subscription matching the payment plan
            const matchingSubscription = subscriptions.find(
              sub => sub.plan && (sub.plan.id === parseInt(planId) || sub.plan.id.toString() === planId.toString())
            );
            
            if (matchingSubscription && matchingSubscription.id) {
              console.log('✅ Found matching subscription ID:', matchingSubscription.id);
              return {
                success: true,
                subscriptionId: matchingSubscription.id.toString()
              };
            } else {
              console.warn('⚠️  No subscription found matching payment plan:', planId);
            }
          }
        } catch (subError) {
          console.error('Error fetching subscriptions:', subError.message);
          if (subError.response) {
            console.error('Response data:', subError.response.data);
          }
        }
      } else {
        console.warn('⚠️  Missing email or payment plan ID. Cannot fetch subscription from API.');
      }
    }
    
    return {
      success: false,
      message: 'Subscription ID not found in transaction or subscriptions API'
    };
  } catch (error) {
    console.error('Error fetching subscription ID by tx_ref:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error fetching subscription ID'
    };
  }
};

// List all subscriptions for a customer (for debugging)
export const listFlutterwaveSubscriptions = async (email) => {
  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/subscriptions?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.status === 'success') {
      const subscriptions = response.data.data;
      return Array.isArray(subscriptions) ? subscriptions : [subscriptions];
    }
    return [];
  } catch (error) {
    console.error('Error listing Flutterwave subscriptions:', error);
    return [];
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

