import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './src/config/database.js';
import db from './src/models/index.js';
import authRoutes from './src/routes/authRoutes.js';
import subscriptionRoutes from './src/routes/subscriptionRoutes.js';
import truckRoutes from './src/routes/truckRoutes.js';
import driverRoutes from './src/routes/driverRoutes.js';
import tripRoutes from './src/routes/tripRoutes.js';
import maintenanceRoutes from './src/routes/maintenanceRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'TruckBooks API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', maintenanceRoutes);
// app.use('/api/customers', customerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Load all models
    await db;
    console.log('✅ Models loaded successfully.');

    // Sync database (creates tables if they don't exist)
    // Use { force: true } to drop and recreate tables (DANGEROUS - only for development)
    // Use { alter: true } to alter tables to match models (safer)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

