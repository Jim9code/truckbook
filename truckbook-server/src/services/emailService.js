import * as brevo from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Brevo API client
let apiInstance;
if (process.env.BREVO_API_KEY) {
  apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

// Generate 5-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code, fullName) => {
  try {
    if (!apiInstance) {
      throw new Error('Brevo API not configured. Please set BREVO_API_KEY in environment variables.');
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = 'Verify Your TruckBooks Account';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">TruckBooks</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827; margin-top: 0;">Welcome to TruckBooks!</h2>
          <p style="color: #4b5563; font-size: 16px;">Hi ${fullName},</p>
          <p style="color: #4b5563; font-size: 16px;">Thank you for signing up. Please use the following code to verify your email address:</p>
          <div style="background-color: #f3f4f6; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px; border: 2px dashed #d1d5db;">
            <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 12px; margin: 0; font-weight: bold;">${code}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">If you didn't create an account, please ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© 2024 TruckBooks. All rights reserved.</p>
        </div>
      </div>
    `;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'TruckBooks',
      email: process.env.BREVO_SENDER_EMAIL
    };
    sendSmtpEmail.to = [{ email }];

    console.log('Sending verification email to:', email);
    console.log('From:', process.env.BREVO_SENDER_EMAIL);
    console.log('Verification code:', code);

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('Email sent successfully! Message ID:', result.body?.messageId || result.messageId);
    
    return { success: true, messageId: result.body?.messageId || result.messageId };
  } catch (error) {
    console.error('Error sending email - Full error:', error);
    console.error('Error response:', error.response?.data || error.message);
    console.error('Error status:', error.response?.status);
    
    // More specific error message
    if (error.response?.status === 400) {
      throw new Error(`Invalid email configuration: ${error.response.data?.message || 'Check sender email is verified in Brevo'}`);
    }
    
    throw new Error(`Failed to send verification email: ${error.response?.data?.message || error.message}`);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, fullName) => {
  try {
    if (!apiInstance) {
      throw new Error('Brevo API not configured. Please set BREVO_API_KEY in environment variables.');
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = 'Reset Your TruckBooks Password';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">TruckBooks</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px;">Hi ${fullName},</p>
          <p style="color: #4b5563; font-size: 16px;">We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Or copy and paste this link into your browser:</p>
          <p style="color: #2563eb; font-size: 12px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This link will expire in 1 hour.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© 2024 TruckBooks. All rights reserved.</p>
        </div>
      </div>
    `;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'TruckBooks',
      email: process.env.BREVO_SENDER_EMAIL
    };
    sendSmtpEmail.to = [{ email }];

    console.log('Sending password reset email to:', email);

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('Password reset email sent successfully! Message ID:', result.body?.messageId || result.messageId);
    
    return { success: true, messageId: result.body?.messageId || result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error.response?.data?.message || error.message}`);
  }
};

