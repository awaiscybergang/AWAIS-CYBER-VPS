const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

// Import configurations
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const deploymentRoutes = require('./routes/deployments');
const fileRoutes = require('./routes/files');
const databaseRoutes = require('./routes/databases');
const domainRoutes = require('./routes/domains');
const terminalRoutes = require('./routes/terminal');
const monitoringRoutes = require('./routes/monitoring');
const adminRoutes = require('./routes/admin');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { securityHeaders } = require('./middleware/security');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(limiter);
app.use(securityHeaders);

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/databases', databaseRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/deployments', express.static(path.join(__dirname, '../deployments')));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-monitoring', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined monitoring`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// Connect to MongoDB and start server
connectDB().then(() => {
  server.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 AWAIS CYBER VPS Server running on port ${process.env.PORT || 5000}`);
    console.log(`📍 http://localhost:${process.env.PORT || 5000}`);
    console.log(`🔐 Admin Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
