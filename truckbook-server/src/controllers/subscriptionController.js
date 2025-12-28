import {
  createSubscription,
  checkSubscriptionStatus,
  getPlanPrice,
  updateSubscriptionWithFlutterwave,
  getSubscriptionByFlutterwaveId,
  getSubscriptionByTxRef,
  cancelSubscription,
  getActiveSubscription
} from '../services/subscriptionService.js';
import {
  createFlutterwaveSubscription,
  getFlutterwavePlanId,
  cancelFlutterwaveSubscription
} from '../services/flutterwaveService.js';
import { getModels } from '../utils/models.js';

// Create subscription
export const subscribe = async (req, res) => {
  try {
    const userId = req.userId;
    const { planType } = req.body;

    // Check if user already has an active subscription (only check active, not pending)
    const currentStatus = await checkSubscriptionStatus(userId);
    
    if (currentStatus.hasActiveSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }

    // Get plan price
    const price = getPlanPrice(planType);
    
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Get Flutterwave plan ID
    const flutterwavePlanId = getFlutterwavePlanId(planType);
    if (!flutterwavePlanId) {
      return res.status(500).json({
        success: false,
        message: 'Flutterwave plan ID not configured'
      });
    }

    // Get user data
    const { User } = await getModels();
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create Flutterwave subscription
    const flutterwaveResult = await createFlutterwaveSubscription(
      {
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        amount: price
      },
      flutterwavePlanId
    );

    if (!flutterwaveResult.success) {
      return res.status(500).json({
        success: false,
        message: flutterwaveResult.message || 'Failed to create Flutterwave subscription'
      });
    }

    const flutterwaveData = flutterwaveResult.data;
    
    // Extract tx_ref from the response (it's stored in the data object we return)
    const txRef = flutterwaveData.tx_ref || null;

    if (!txRef) {
      console.error('No tx_ref in Flutterwave response:', flutterwaveData);
      return res.status(500).json({
        success: false,
        message: 'Failed to get transaction reference from payment'
      });
    }

    // Create subscription in database
    // Note: We don't have subscription ID yet - Flutterwave creates it after payment
    // We'll update it via webhook using tx_ref
    const subscription = await createSubscription(userId, planType, {
      subscriptionId: null, // Will be updated by webhook after payment
      planId: flutterwavePlanId,
      paymentReference: txRef, // Store tx_ref for webhook lookup
      nextPaymentDate: null // Will be set by webhook
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully. Please complete payment.',
      data: {
        subscription,
        paymentLink: flutterwaveData.link || null,
        authorizationUrl: flutterwaveData.authorization?.authorization_url || null
      }
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get subscription status
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const status = await checkSubscriptionStatus(userId);

    res.json({
      success: true,
      data: {
        hasActiveSubscription: status.hasActiveSubscription,
        subscription: status.subscription
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Webhook handler for Flutterwave
export const handleWebhook = async (req, res) => {
  try {
    // Flutterwave sends the secret hash directly in verif-hash header
    const signature = req.headers['verif-hash'];
    
    console.log('Webhook received - verif-hash header:', signature ? 'Present' : 'Missing');

    // Verify webhook signature (simple string comparison)
    const { verifyWebhook } = await import('../services/flutterwaveService.js');
    const isValid = verifyWebhook(signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Payload is already parsed by express.json()
    const payload = req.body;

    // Log webhook for debugging
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    // Handle different event types
    const event = payload.event || payload.type;
    const data = payload.data || payload;

    console.log('Webhook event:', event);
    console.log('Webhook data:', JSON.stringify(data, null, 2));

    switch (event) {
      case 'charge.successful':
      case 'payment.successful':
      case 'charge.completed':
        // Payment successful - find subscription by tx_ref and update
        const txRef = data.tx_ref || data.txRef;
        if (txRef) {
          const subscription = await getSubscriptionByTxRef(txRef);
          
          if (subscription) {
            await updateSubscriptionWithFlutterwave(subscription.id, {
              status: 'active',
              subscriptionId: data.subscription_id || data.subscription?.id || null,
              paymentReference: txRef,
              nextPaymentDate: data.next_payment_date || data.nextPaymentDate || null
            });
            console.log('Subscription activated for tx_ref:', txRef);
          } else {
            console.error('Subscription not found for tx_ref:', txRef);
          }
        }
        break;

      case 'subscription.create':
        // Subscription created - find by subscription ID or tx_ref
        const subscriptionId = data.subscription_id || data.id;
        const subscriptionTxRef = data.tx_ref || data.txRef;
        
        let subscription = null;
        if (subscriptionId) {
          subscription = await getSubscriptionByFlutterwaveId(subscriptionId.toString());
        }
        
        // If not found by ID, try by tx_ref
        if (!subscription && subscriptionTxRef) {
          subscription = await getSubscriptionByTxRef(subscriptionTxRef);
        }
        
        if (subscription) {
          await updateSubscriptionWithFlutterwave(subscription.id, {
            status: 'active',
            subscriptionId: subscriptionId ? subscriptionId.toString() : subscription.flutterwaveSubscriptionId,
            paymentReference: subscriptionTxRef || subscription.paymentReference,
            nextPaymentDate: data.next_payment_date || data.nextPaymentDate || null
          });
          console.log('Subscription activated via subscription.create event');
        } else {
          console.error('Subscription not found for subscription.create event');
        }
        break;

      case 'subscription.notification':
        // Subscription payment notification
        if (data.subscription_id) {
          const subscription = await getSubscriptionByFlutterwaveId(data.subscription_id.toString());
          
          if (subscription) {
            await updateSubscriptionWithFlutterwave(subscription.id, {
              paymentReference: data.tx_ref || null,
              nextPaymentDate: data.next_payment_date || null,
              status: data.status === 'successful' ? 'active' : subscription.status
            });
          }
        }
        break;

      case 'subscription.disabled':
      case 'subscription.cancelled':
        // Subscription cancelled/disabled
        if (data.subscription_id) {
          const subscription = await getSubscriptionByFlutterwaveId(data.subscription_id.toString());
          
          if (subscription) {
            await updateSubscriptionWithFlutterwave(subscription.id, {
              status: 'inactive'
            });
          }
        }
        break;
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancel subscription
export const cancelSubscriptionController = async (req, res) => {
  try {
    const userId = req.userId;

    // Get active subscription
    const subscription = await getActiveSubscription(userId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel in Flutterwave if subscription ID exists
    if (subscription.flutterwaveSubscriptionId) {
      const flutterwaveResult = await cancelFlutterwaveSubscription(
        subscription.flutterwaveSubscriptionId
      );

      if (!flutterwaveResult.success) {
        console.error('Failed to cancel in Flutterwave:', flutterwaveResult.message);
        // Continue with local cancellation even if Flutterwave fails
      }
    }

    // Cancel in database
    const cancelledSubscription = await cancelSubscription(userId);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        subscription: cancelledSubscription
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

