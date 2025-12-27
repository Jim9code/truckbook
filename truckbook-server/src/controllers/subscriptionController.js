import {
  createSubscription,
  checkSubscriptionStatus,
  getPlanPrice
} from '../services/subscriptionService.js';

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

    // Create subscription
    // TODO: Add payment processing here (Stripe, Paystack, etc.)
    const subscription = await createSubscription(userId, planType);

    res.status(201).json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        subscription
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

