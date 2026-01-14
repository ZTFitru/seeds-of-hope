const express = require('express');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./routes/contact');
const donationRoutes = require('./routes/donations');
const ticketRoutes = require('./routes/tickets');
const paypalWebhookRoutes = require('./routes/paypalWebhook');
const { sequelize, testConnection, syncDatabase } = require('./config/database');
const models = require('./models');

const app = express();

// Initialize database connection
(async () => {
  try {
    console.log('Initializing database connection...');
    const connected = await testConnection();
    if (connected) {
      // Optionally sync database on startup (only if DB_AUTO_SYNC is enabled)
      // This is disabled by default - use initDatabase.js script instead
      if (process.env.DB_AUTO_SYNC === 'true') {
        console.log('Auto-sync enabled. Synchronizing database schema...');
        await syncDatabase(false); // Don't force (don't drop existing tables)
      }
      console.log('Database ready.');
    } else {
      console.warn('Database connection failed, but server will continue to start.');
      console.warn('Some features may not work until database is connected.');
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
    console.warn('Server will continue to start, but database features may be unavailable.');
  }
})();

// Middleware
// CORS configuration - supports both development and production
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || 
        allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    
    // In production, allow same-origin requests (for /backend path)
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
// Support both /health and /backend/health for flexibility
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});
app.get('/backend/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes
// Support both /api/* and /backend/api/* paths
// This handles different routing scenarios:
// 1. Direct Node.js server: /api/*
// 2. Passenger with full path: /backend/api/*
// 3. Passenger with stripped path: /api/* (handled by first route)

// Contact routes
app.use('/api/contact', contactRoutes);
app.use('/backend/api/contact', contactRoutes);

// Donation routes
app.use('/api/donations', donationRoutes);
app.use('/backend/api/donations', donationRoutes);

// Ticket routes
app.use('/api/tickets', ticketRoutes);
app.use('/backend/api/tickets', ticketRoutes);

// PayPal webhook (needs raw body for signature verification)
app.use('/api/paypal', paypalWebhookRoutes);
app.use('/backend/api/paypal', paypalWebhookRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || process.env.PORT_NUMBER || 3000;

// Handle cPanel/Passenger environment
// In cPanel with Passenger, the port is automatically assigned
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Process PID: ${process.pid}`);
});

// Enhanced error handling for server startup
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
    console.error('Set PORT environment variable to a different value.');
    process.exit(1);
  } else if (error.code === 'EACCES') {
    console.error(`Permission denied to use port ${PORT}.`);
    console.error('Try using a port number above 1024.');
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);
  server.close(async () => {
    console.log('HTTP server closed');
    try {
      await sequelize.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
