import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getModels } from '../utils/models.js';

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Check if email exists
export const emailExists = async (email) => {
  const { User } = await getModels();
  const user = await User.findOne({ where: { email } });
  return !!user;
};

// Create user
export const createUser = async (userData) => {
  const { User } = await getModels();
  const hashedPassword = await hashPassword(userData.password);
  
  const user = await User.create({
    companyName: userData.companyName,
    fullName: userData.fullName,
    email: userData.email,
    password: hashedPassword,
    verificationCode: userData.verificationCode || null,
    isEmailVerified: false,
    codeExpiresAt: userData.codeExpiresAt || null
  });

  // Remove password and verification code from response
  const userResponse = user.toJSON();
  delete userResponse.password;
  delete userResponse.verificationCode;

  return userResponse;
};

// Find user by email
export const findUserByEmail = async (email) => {
  const { User } = await getModels();
  return await User.findOne({ where: { email } });
};

// Find user by ID
export const findUserById = async (userId) => {
  const { User } = await getModels();
  const user = await User.findByPk(userId);
  if (user) {
    const userResponse = user.toJSON();
    delete userResponse.password;
    return userResponse;
  }
  return null;
};

