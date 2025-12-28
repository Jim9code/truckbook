import { checkSubscriptionStatus } from '../services/subscriptionService.js';

// Middleware to require active subscription
export const requireSubscription = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check subscription status
    const subscriptionStatus = await checkSubscriptionStatus(userId);

    if (!subscriptionStatus.hasActiveSubscription) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required to access this resource',
        requiresSubscription: true
      });
    }

    // Attach subscription to request for use in controllers
    req.subscription = subscriptionStatus.subscription;

    next();
  } catch (error) {
    console.error('Subscription middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};

