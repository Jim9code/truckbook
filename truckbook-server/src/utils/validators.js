import { body, validationResult } from 'express-validator';

// Validation middleware handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Signup validation rules
export const validateSignup = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters'),
  
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  
  handleValidationErrors
];

// Login validation rules
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Subscription validation rules
export const validateSubscription = [
  body('planType')
    .notEmpty()
    .withMessage('Plan type is required')
    .isIn(['starter', 'large-fleet'])
    .withMessage('Plan type must be either "starter" or "large-fleet"'),
  
  handleValidationErrors
];

// Truck validation rules
export const validateTruck = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Truck name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Truck name must be between 2 and 255 characters'),
  
  body('plateNumber')
    .trim()
    .notEmpty()
    .withMessage('Plate number is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Plate number must be between 2 and 50 characters'),
  
  body('driverName')
    .trim()
    .notEmpty()
    .withMessage('Driver name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Driver name must be between 2 and 255 characters'),
  
  handleValidationErrors
];

// Driver validation rules
export const validateDriver = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Driver name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Driver name must be between 2 and 255 characters'),
  
  handleValidationErrors
];

