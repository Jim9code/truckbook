import {
  createUser,
  emailExists,
  findUserByEmail,
  comparePassword,
  generateToken,
  findUserById,
  generateResetToken
} from '../services/authService.js';
import { checkSubscriptionStatus } from '../services/subscriptionService.js';
import { sendVerificationEmail, generateVerificationCode, sendPasswordResetEmail } from '../services/emailService.js';
import { getModels } from '../utils/models.js';

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

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date();
    codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 10); // 10 minutes expiry

    // Create user with verification code
    const user = await createUser({
      companyName,
      fullName,
      email,
      password,
      verificationCode,
      codeExpiresAt
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, fullName);
      console.log('Verification email sent successfully to:', email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      console.error('Email error details:', emailError.message);
      // Still return success, but log the error
      // User can still verify manually or request resend
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email for verification code.',
      data: {
        user,
        token,
        requiresVerification: true
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

// Verify email with code
export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId; // From auth middleware

    const { User } = await getModels();
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'Email already verified',
        data: { verified: true }
      });
    }

    // Check if code matches
    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Check if code expired
    if (new Date() > new Date(user.codeExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify email
    await user.update({
      isEmailVerified: true,
      verificationCode: null,
      codeExpiresAt: null
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: { verified: true }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Resend verification code
export const resendVerificationCode = async (req, res) => {
  try {
    const userId = req.userId;
    const { User } = await getModels();
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'Email already verified'
      });
    }

    // Generate new code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date();
    codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 10);

    // Update user
    await user.update({
      verificationCode,
      codeExpiresAt
    });

    // Send email
    try {
      await sendVerificationEmail(user.email, verificationCode, user.fullName);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully'
    });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending verification code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Forgot password controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await findUserByEmail(email);

    // Always return success to prevent email enumeration
    // Don't reveal if email exists or not
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour expiry

    // Update user with reset token
    await user.update({
      resetToken,
      resetTokenExpires
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.fullName);
      console.log('Password reset email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still return success to prevent email enumeration
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reset password controller
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Find user by reset token
    const { findUserByResetToken, updateUserPassword } = await import('../services/authService.js');
    const user = await findUserByResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link. Please request a new one.'
      });
    }

    // Update password
    await updateUserPassword(user.id, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

