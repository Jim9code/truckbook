import {
  createSubscription,
  checkSubscriptionStatus,
  getPlanPrice,
  updateSubscriptionWithFlutterwave,
  getSubscriptionByFlutterwaveId,
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

    // Check if user already has an active subscription
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

    // Create subscription in database
    const subscription = await createSubscription(userId, planType, {
      subscriptionId: flutterwaveData.id?.toString(),
      planId: flutterwavePlanId,
      paymentReference: flutterwaveData.tx_ref || null,
      nextPaymentDate: flutterwaveData.next_payment_date || null
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
    const signature = req.headers['verif-hash'] || req.headers['flutterwave-signature'];
    const payload = req.body;

    // Verify webhook signature
    const { verifyWebhook } = await import('../services/flutterwaveService.js');
    const isValid = verifyWebhook(payload, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Handle different event types
    const event = payload.event || payload.type;
    const data = payload.data || payload;

    switch (event) {
      case 'subscription.create':
      case 'charge.successful':
        // Subscription created or payment successful
        if (data.subscription_id || data.subscription?.id) {
          const subscriptionId = data.subscription_id || data.subscription?.id;
          const subscription = await getSubscriptionByFlutterwaveId(subscriptionId.toString());
          
          if (subscription) {
            await updateSubscriptionWithFlutterwave(subscription.id, {
              status: 'active',
              paymentReference: data.tx_ref || data.txRef || null,
              nextPaymentDate: data.next_payment_date || data.nextPaymentDate || null
            });
          }
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

