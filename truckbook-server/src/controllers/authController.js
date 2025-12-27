import {
  createUser,
  emailExists,
  findUserByEmail,
  comparePassword,
  generateToken,
  findUserById
} from '../services/authService.js';
import { checkSubscriptionStatus } from '../services/subscriptionService.js';

// Signup controller
export const signup = async (req, res) => {
  try {
    const { companyName, fullName, email, password } = req.body;

    // Check if email already exists
    if (await emailExists(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.'
      });
    }

    // Create user
    const user = await createUser({
      companyName,
      fullName,
      email,
      password
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get subscription status
    const subscriptionStatus = await checkSubscriptionStatus(user.id);

    // Generate token
    const token = generateToken(user.id);

    // Remove password from user object
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        subscriptionStatus: subscriptionStatus.hasActiveSubscription ? 'active' : 'inactive',
        subscription: subscriptionStatus.subscription
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user (me)
export const getMe = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get subscription status
    const subscriptionStatus = await checkSubscriptionStatus(userId);

    res.json({
      success: true,
      data: {
        user,
        subscriptionStatus: subscriptionStatus.hasActiveSubscription ? 'active' : 'inactive',
        subscription: subscriptionStatus.subscription
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

