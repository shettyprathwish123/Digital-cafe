const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cafe Order API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is on http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
