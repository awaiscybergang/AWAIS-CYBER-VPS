const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const monitoringService = require('../services/monitoringService');

class SocketManager {
  constructor(server) {
    this.io = null;
    this.connectedClients = new Map();
    this.initialize(server);
  }

  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5000',
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id} for user ${socket.userId}`);
      this.connectedClients.set(socket.userId, socket.id);

      this.setupEventHandlers(socket);
      
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.userId);
      });
    });

    this.startMonitoringBroadcast();
  }

  setupEventHandlers(socket) {
    // Join monitoring room
    socket.on('join-monitoring', () => {
      socket.join(`monitoring-${socket.userId}`);
      logger.debug(`User ${socket.userId} joined monitoring`);
    });

    // Leave monitoring room
    socket.on('leave-monitoring', () => {
      socket.leave(`monitoring-${socket.userId}`);
      logger.debug(`User ${socket.userId} left monitoring`);
    });

    // Terminal events
    socket.on('terminal-input', (data) => {
      socket.broadcast.to(`terminal-${data.sessionId}`).emit('terminal-output', data);
    });

    // Deployment events
    socket.on('deployment-status', (data) => {
      this.io.to(`user-${socket.userId}`).emit('deployment-update', data);
    });
  }

  startMonitoringBroadcast() {
    setInterval(async () => {
      try {
        const metrics = await monitoringService.getSystemMetrics();
        
        // Broadcast to all monitoring rooms
        for (const [userId, socketId] of this.connectedClients) {
          this.io.to(`monitoring-${userId}`).emit('metrics-update', metrics);
        }
      } catch (error) {
        logger.error('Error broadcasting metrics:', error);
      }
    }, 2000);
  }

  emitToUser(userId, event, data) {
    const socketId = this.connectedClients.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  emitToAll(event, data) {
    this.io.emit(event, data);
  }

  getIO() {
    return this.io;
  }
}

module.exports = SocketManager;
