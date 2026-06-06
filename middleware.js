const jwt = require('jsonwebtoken');
const { User } = require('./2-models');

const JWT_SECRET = process.env.JWT_SECRET || 'awais-cyber-super-secret-2026';

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || user.status === 'suspended') {
      return res.status(401).json({ error: 'Invalid or suspended account' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Rate limiting per user
const userRateLimit = new Map();
const rateLimitUser = (limit = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const userRequests = userRateLimit.get(userId) || [];
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= limit) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    recentRequests.push(now);
    userRateLimit.set(userId, recentRequests);
    next();
  };
};

// Input validation
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

// CORS headers
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

// CSRF Protection
const csrfProtection = (req, res, next) => {
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;
  
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    if (!csrfToken || csrfToken !== sessionToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
};

// Generate CSRF token
const generateCsrfToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
};

// Error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key error' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};

// Maintenance mode
let isMaintenanceMode = false;
const maintenanceMode = (req, res, next) => {
  if (isMaintenanceMode && req.path !== '/api/auth/login' && !req.user?.role?.includes('admin')) {
    return res.status(503).json({ error: 'Server is under maintenance', maintenance: true });
  }
  next();
};

const setMaintenanceMode = (mode) => {
  isMaintenanceMode = mode;
};

module.exports = {
  authenticate,
  authorize,
  rateLimitUser,
  validateInput,
  securityHeaders,
  csrfProtection,
  generateCsrfToken,
  requestLogger,
  errorHandler,
  maintenanceMode,
  setMaintenanceMode
};
