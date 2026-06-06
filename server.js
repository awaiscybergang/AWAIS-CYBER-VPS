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
const fs = require('fs-extra');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { exec } = require('child_process');
const si = require('systeminformation');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*", credentials: true }
});

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/awais-cyber-vps';
const JWT_SECRET = process.env.JWT_SECRET || 'awais-cyber-super-secret-2026';
const SESSION_SECRET = process.env.SESSION_SECRET || 'session-secret-2026';

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
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', req.user?.id || 'temp');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Import models
const User = require('./2-models').User;
const Deployment = require('./2-models').Deployment;
const Database = require('./2-models').Database;
const Domain = require('./2-models').Domain;
const Log = require('./2-models').Log;

// Import controllers
const authController = require('./3-auth');
const mainController = require('./5-controllers');
const fileManager = require('./7-file-manager');
const deploymentManager = require('./8-deployment');
const terminalManager = require('./9-terminal');

// API Routes
app.use('/api/auth', require('./4-routes').authRoutes);
app.use('/api/users', require('./4-routes').userRoutes);
app.use('/api/deployments', require('./4-routes').deploymentRoutes);
app.use('/api/databases', require('./4-routes').databaseRoutes);
app.use('/api/domains', require('./4-routes').domainRoutes);
app.use('/api/files', require('./4-routes').fileRoutes);
app.use('/api/terminal', require('./4-routes').terminalRoutes);
app.use('/api/admin', require('./4-routes').adminRoutes);

// Socket.IO for realtime monitoring
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe-monitoring', async (userId) => {
    socket.join(`monitoring-${userId}`);
    const interval = setInterval(async () => {
      const metrics = await terminalManager.getSystemMetrics();
      io.to(`monitoring-${userId}`).emit('metrics-update', metrics);
    }, 2000);
    
    socket.on('disconnect', () => clearInterval(interval));
  });
  
  socket.on('terminal-command', async (data) => {
    const result = await terminalManager.executeCommand(data.command, data.userId);
    io.to(`terminal-${data.userId}`).emit('terminal-output', result);
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '10-frontend.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('MongoDB connected');
  
  // Create admin user if not exists
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const adminUser = new User({
      username: 'admin',
      email: 'admin@awaicyber.com',
      password: 'Admin@123456',
      fullName: 'System Administrator',
      role: 'superadmin',
      status: 'active',
      emailVerified: true
    });
    await adminUser.save();
    console.log('Admin user created: admin@awaicyber.com / Admin@123456');
  }
  
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
