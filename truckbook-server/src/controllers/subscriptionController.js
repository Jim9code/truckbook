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
    const txRef = flutterwaveData.tx_ref || null;

    if (!txRef) {
      console.error('No tx_ref in Flutterwave response:', flutterwaveData);
      return res.status(500).json({
        success: false,
        message: 'Failed to get transaction reference from payment'
      });
    }

    // Create subscription in database
    // Subscription ID will be null initially - will be set via webhook after payment
    const subscription = await createSubscription(userId, planType, {
      subscriptionId: null, // Will be set by webhook after successful payment
      planId: flutterwavePlanId,
      paymentReference: txRef,
      nextPaymentDate: null // Will be set by webhook
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully. Please complete payment.',
      data: {
        subscription,
        paymentLink: flutterwaveData.link || null,
        authorizationUrl: flutterwaveData.authorization?.authorization_url || null,
        subscriptionId: subscriptionId.toString() // Include in response for debugging
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
    // Flutterwave sends event.type or status in the root payload
    const eventType = payload['event.type'] || payload.event || payload.type;
    const status = payload.status;
    const txRef = payload.txRef || payload.tx_ref || payload.data?.txRef || payload.data?.tx_ref;
    
    console.log('Webhook event type:', eventType);
    console.log('Webhook status:', status);
    console.log('Webhook txRef:', txRef);

    // Handle successful payments - check status or event type
    if (status === 'successful' || eventType === 'CARD_TRANSACTION' || eventType === 'charge.successful' || eventType === 'charge.completed') {
      // Payment successful - find subscription by tx_ref and update
      if (txRef) {
        const subscription = await getSubscriptionByTxRef(txRef);
        
        if (subscription) {
          // Try to extract subscription ID from various possible fields
          // Flutterwave might send it in different places depending on webhook type
          const subscriptionId = payload.data?.subscription_id || 
                                payload.data?.id || 
                                payload.subscription_id || 
                                payload.id ||
                                payload.data?.subscription?.id ||
                                null;
          
          console.log('Payment webhook - attempting to extract subscription ID');
          console.log('Available fields:', {
            'payload.data.subscription_id': payload.data?.subscription_id,
            'payload.data.id': payload.data?.id,
            'payload.subscription_id': payload.subscription_id,
            'payload.id': payload.id,
            'payload.data.subscription.id': payload.data?.subscription?.id,
            'payload.paymentPlan': payload.paymentPlan // This is the plan ID, not subscription ID
          });
          
          await updateSubscriptionWithFlutterwave(subscription.id, {
            status: 'active',
            subscriptionId: subscriptionId ? subscriptionId.toString() : null, // Use actual subscription ID, not paymentPlan
            paymentReference: txRef,
            nextPaymentDate: payload.nextPaymentDate || payload.data?.next_payment_date || null
          });
          
          if (subscriptionId) {
            console.log('✅ Subscription activated for tx_ref:', txRef, 'with subscription ID:', subscriptionId);
          } else {
            console.warn('⚠️  Subscription activated but subscription ID not found in webhook. Attempting to fetch from Flutterwave API...');
            
            // Enhanced fallback: Try multiple methods to get subscription ID
            try {
              const { getSubscriptionIdByTxRef, listFlutterwaveSubscriptions } = await import('../services/flutterwaveService.js');
              
              // Get customer email and payment plan from payload
              const customerEmail = payload.customer?.email || payload.data?.customer?.email;
              const paymentPlanId = payload.paymentPlan || payload.data?.paymentPlan;
              
              // Method 1: Try to get by tx_ref
              const txRefResult = await getSubscriptionIdByTxRef(txRef, customerEmail, paymentPlanId);
              
              if (txRefResult.success && txRefResult.subscriptionId) {
                await updateSubscriptionWithFlutterwave(subscription.id, {
                  subscriptionId: txRefResult.subscriptionId
                });
                console.log('✅ Successfully fetched and set subscription ID from Flutterwave API (by tx_ref):', txRefResult.subscriptionId);
              } else if (customerEmail) {
                // Method 2: List all subscriptions for this customer and find matching one
                console.log('Attempting to fetch subscription ID by listing customer subscriptions...');
                const allSubs = await listFlutterwaveSubscriptions(customerEmail);
                
                if (allSubs && allSubs.length > 0) {
                  // Find the most recent active subscription matching the plan
                  const matchingSub = allSubs.find(sub => {
                    const planMatches = sub.plan && (
                      sub.plan.id === parseInt(paymentPlanId) || 
                      sub.plan.id.toString() === paymentPlanId.toString()
                    );
                    const isActive = sub.status === 'active' || sub.status === 'ACTIVE';
                    return planMatches && isActive;
                  });
                  
                  if (matchingSub && matchingSub.id) {
                    await updateSubscriptionWithFlutterwave(subscription.id, {
                      subscriptionId: matchingSub.id.toString()
                    });
                    console.log('✅ Successfully fetched and set subscription ID from Flutterwave API (by listing):', matchingSub.id);
                  } else {
                    // Use the most recent subscription if no exact match
                    const mostRecent = allSubs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                    if (mostRecent && mostRecent.id) {
                      await updateSubscriptionWithFlutterwave(subscription.id, {
                        subscriptionId: mostRecent.id.toString()
                      });
                      console.log('✅ Set subscription ID from most recent subscription:', mostRecent.id);
                    } else {
                      console.warn('⚠️  Could not find matching subscription in Flutterwave. Will be set when subscription.create webhook arrives.');
                    }
                  }
                } else {
                  console.warn('⚠️  No subscriptions found for customer. Will be set when subscription.create webhook arrives.');
                }
              } else {
                console.warn('⚠️  Missing customer email. Cannot fetch subscription ID from Flutterwave API.');
              }
            } catch (error) {
              console.warn('⚠️  Error fetching subscription ID from Flutterwave API:', error.message);
            }
          }
        } else {
          console.error('❌ Subscription not found for tx_ref:', txRef);
        }
      } else {
        console.error('❌ No txRef found in webhook payload');
      }
    }

    // Also handle subscription-specific events
    switch (eventType) {
      case 'charge.successful':
      case 'payment.successful':
      case 'charge.completed':
        // Already handled above, but keep for compatibility
        break;

      case 'subscription.create':
        // Subscription created - find by subscription ID or tx_ref
        const subscriptionId = payload.data?.subscription_id || 
                              payload.data?.id || 
                              payload.subscription_id || 
                              payload.id ||
                              payload.data?.subscription?.id ||
                              null;
        const subscriptionTxRef = payload.txRef || payload.tx_ref || payload.data?.tx_ref || payload.data?.txRef;
        
        console.log('subscription.create webhook - subscription ID:', subscriptionId, 'tx_ref:', subscriptionTxRef);
        
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
            nextPaymentDate: payload.data?.next_payment_date || payload.nextPaymentDate || payload.data?.nextPaymentDate || null
          });
          console.log('✅ Subscription activated via subscription.create event with ID:', subscriptionId);
        } else {
          console.error('❌ Subscription not found for subscription.create event');
          console.error('Searched for subscription ID:', subscriptionId, 'or tx_ref:', subscriptionTxRef);
        }
        break;

      case 'subscription.notification':
        // Subscription payment notification
        if (payload.subscription_id) {
          const subscription = await getSubscriptionByFlutterwaveId(payload.subscription_id.toString());
          
          if (subscription) {
            await updateSubscriptionWithFlutterwave(subscription.id, {
              paymentReference: payload.txRef || payload.tx_ref || null,
              nextPaymentDate: payload.nextPaymentDate || null,
              status: payload.status === 'successful' ? 'active' : subscription.status
            });
          }
        }
        break;

      case 'subscription.disabled':
      case 'subscription.cancelled':
        // Subscription cancelled/disabled - sync local state
        if (payload.subscription_id) {
          const { Subscription } = await getModels();
          const subscription = await Subscription.findOne({
            where: {
              flutterwaveSubscriptionId: payload.subscription_id.toString()
            }
          });
          
          if (subscription) {
            const today = new Date();
            const endDate = new Date(subscription.endDate);
            
            // Mark as cancelled but keep active if still within billing period
            await subscription.update({
              cancelled: true,
              status: endDate < today ? 'inactive' : 'active'
            });
            
            console.log('✅ Synced subscription cancellation from Flutterwave webhook');
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

    // Idempotency: If already cancelled, return success
    if (subscription.cancelled) {
      return res.json({
        success: true,
        message: 'Subscription is already cancelled. You will retain access until the end of your current billing period.',
        data: {
          subscription
        }
      });
    }

    let flutterwaveCancelled = false;
    let flutterwaveError = null;

    // Attempt to cancel in Flutterwave if subscription ID exists
    if (subscription.flutterwaveSubscriptionId) {
      try {
        const flutterwaveResult = await cancelFlutterwaveSubscription(
          subscription.flutterwaveSubscriptionId
        );

        if (flutterwaveResult.success) {
          flutterwaveCancelled = true;
          console.log('✅ Successfully cancelled Flutterwave subscription:', subscription.flutterwaveSubscriptionId);
        } else {
          flutterwaveError = flutterwaveResult.message;
          
          // Handle specific error cases gracefully
          const errorMessage = flutterwaveResult.message?.toLowerCase() || '';
          
          if (errorMessage.includes('non existent') || 
              errorMessage.includes('invalid subscription') ||
              errorMessage.includes('not found')) {
            // Subscription doesn't exist in Flutterwave - might be test data or already cancelled
            console.warn('⚠️  Flutterwave subscription not found:', subscription.flutterwaveSubscriptionId);
            console.warn('Proceeding with local cancellation. This might be test data or subscription was never properly created.');
            // Allow local cancellation to proceed
          } else if (errorMessage.includes('already cancelled') || 
                     errorMessage.includes('already disabled')) {
            // Already cancelled in Flutterwave - sync local state
            console.log('ℹ️  Flutterwave subscription already cancelled. Syncing local state.');
            flutterwaveCancelled = true; // Treat as success for sync
          } else {
            // Other errors - log but allow local cancellation as fallback
            console.error('❌ Failed to cancel in Flutterwave:', flutterwaveError);
            console.warn('⚠️  Proceeding with local cancellation as fallback. User should contact support if charges continue.');
          }
        }
      } catch (error) {
        // Network or unexpected errors
        flutterwaveError = error.message;
        console.error('❌ Error calling Flutterwave API:', error.message);
        console.warn('⚠️  Proceeding with local cancellation as fallback.');
      }
    } else {
      console.warn('⚠️  No Flutterwave subscription ID found. This might be a pending subscription.');
    }

    // Cancel locally (always proceed - graceful degradation)
    const cancelledSubscription = await cancelSubscription(userId);

    // Determine response message based on Flutterwave result
    let message = 'Subscription cancelled successfully. You will retain access until the end of your current billing period.';
    
    if (flutterwaveError && !flutterwaveCancelled) {
      message += ' Note: There was an issue cancelling with the payment provider. If you continue to be charged, please contact support.';
    }

    res.json({
      success: true,
      message,
      data: {
        subscription: cancelledSubscription,
        flutterwaveCancelled // Include this so frontend can show appropriate message
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

