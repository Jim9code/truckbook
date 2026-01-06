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

// Email verification validation rules
export const validateVerifyEmail = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 5, max: 5 })
    .withMessage('Verification code must be 5 digits')
    .isNumeric()
    .withMessage('Verification code must contain only numbers'),
  
  handleValidationErrors
];

// Trip validation rules
export const validateTrip = [
  body('date')
    .notEmpty()
    .withMessage('Trip date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('truck')
    .trim()
    .notEmpty()
    .withMessage('Truck is required'),
  
  body('driver')
    .trim()
    .notEmpty()
    .withMessage('Driver is required'),
  
  body('customer')
    .trim()
    .notEmpty()
    .withMessage('Customer is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Customer name must be between 2 and 255 characters'),
  
  // Make routeFrom and routeTo optional (for backward compatibility)
  body('routeFrom')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Route (From) must be between 2 and 255 characters'),
  
  body('routeTo')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Route (To) must be between 2 and 255 characters'),
  
  // Validate routes array (new format)
  body('routes')
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage('Routes must be an array')
    .custom((routes) => {
      if (!routes || routes.length === 0) {
        return true; // Allow empty array, will be validated by custom check
      }
      // Validate each route object
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        if (!route.from || typeof route.from !== 'string' || route.from.trim().length < 2) {
          throw new Error(`Route ${i + 1}: "from" must be a string with at least 2 characters`);
        }
        if (!route.to || typeof route.to !== 'string' || route.to.trim().length < 2) {
          throw new Error(`Route ${i + 1}: "to" must be a string with at least 2 characters`);
        }
        if (route.date && !/^\d{4}-\d{2}-\d{2}$/.test(route.date)) {
          throw new Error(`Route ${i + 1}: "date" must be in YYYY-MM-DD format`);
        }
      }
      return true;
    }),
  
  // Custom validation: ensure at least one route is provided (either routes array or routeFrom/routeTo)
  body().custom((body) => {
    const hasRoutes = body.routes && Array.isArray(body.routes) && body.routes.length > 0;
    const hasOldFormat = body.routeFrom && body.routeTo;
    
    if (!hasRoutes && !hasOldFormat) {
      throw new Error('Either routes array or routeFrom/routeTo must be provided');
    }
    return true;
  }),
  
  body('status')
    .optional()
    .isIn(['Pending', 'Completed'])
    .withMessage('Status must be either "Pending" or "Completed"'),
  
  body('agreedPrice')
    .notEmpty()
    .withMessage('Agreed price is required')
    .isFloat({ min: 0 })
    .withMessage('Agreed price must be a positive number'),
  
  body('paymentType')
    .optional()
    .isIn(['full', 'part'])
    .withMessage('Payment type must be either "full" or "part"'),
  
  body('amountReceivedBefore')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount received before must be a non-negative number'),
  
  body('amountReceivedAfter')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount received after must be a non-negative number'),
  
  body('fuelCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fuel cost must be a non-negative number'),
  
  body('maintenanceCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maintenance cost must be a non-negative number'),
  
  body('otherCosts')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other costs must be a non-negative number'),
  
  body('returnDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Return date must be a valid date'),
  
  handleValidationErrors
];

