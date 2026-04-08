require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const webhookRoutes = require('./routes/webhook');
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const bookingRoutes = require('./routes/bookings');
const menuRoutes = require('./routes/menu');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'GoaBot AI — WhatsApp Assistant API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      webhook: '/api/webhook',
      business: '/api/business',
      bookings: '/api/bookings',
      menu: '/api/menu',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WhatsApp Goa Assistant',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/menu', menuRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.listen(PORT, () => {
  console.log(`
  🚀 WhatsApp Goa Assistant Server
  ================================
  Port:     ${PORT}
  Env:      ${process.env.NODE_ENV}
  Webhook:  http://localhost:${PORT}/api/webhook
  Health:   http://localhost:${PORT}/api/health
  `);
});

module.exports = app;
