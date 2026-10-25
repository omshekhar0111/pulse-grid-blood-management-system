const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./config/db');
const { seedDatabase } = require('./seed/seedData');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'PULSE GRID — Blood Management System',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/contact', require('./routes/contact'));

// Global 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Startup Database and Server
async function startServer() {
  try {
    console.log('🔄 Initializing PULSE GRID relational database...');
    await initDatabase();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  🩸 PULSE GRID — Blood Management System (BCC-351)`);
      console.log(`  🚀 Backend API Server running on port ${PORT}`);
      console.log(`  🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
