const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('../utils/logger');

class ServerConfig {
  constructor(app) {
    this.app = app;
  }

  configure() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    
    // Compression
    this.app.use(compression());
    
    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
    }));
    
    // Body parsing
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));
    this.app.use(cookieParser());
    
    // Session
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'default-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      }
    }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api', limiter);
    
    // Static files
    this.app.use('/public', express.static(path.join(__dirname, '../../public')));
    this.app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
    this.app.use('/deployments', express.static(path.join(__dirname, '../../deployments')));
    
    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url} - ${req.ip}`);
      next();
    });
    
    // Error handling for JSON parsing
    this.app.use((err, req, res, next) => {
      if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
      next(err);
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
    
    // Global error handler
    this.app.use((err, req, res, next) => {
      logger.error('Unhandled error:', err);
      
      const status = err.status || 500;
      const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;
      
      res.status(status).json({ error: message });
    });
  }
}

module.exports = ServerConfig;
