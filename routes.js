const express = require('express');
const { authenticate, authorize } = require('./6-middleware');
const authController = require('./3-auth');
const mainController = require('./5-controllers');
const fileManager = require('./7-file-manager');
const deploymentManager = require('./8-deployment');
const terminalManager = require('./9-terminal');

const router = express.Router();

// Auth routes
const authRoutes = express.Router();
authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);
authRoutes.get('/verify-email', authController.verifyEmail);
authRoutes.post('/forgot-password', authController.forgotPassword);
authRoutes.post('/reset-password', authController.resetPassword);
authRoutes.post('/refresh-token', authController.refreshToken);
authRoutes.post('/logout', authenticate, authController.logout);

// User routes
const userRoutes = express.Router();
userRoutes.get('/profile', authenticate, mainController.getProfile);
userRoutes.put('/profile', authenticate, mainController.updateProfile);
userRoutes.put('/change-password', authenticate, mainController.changePassword);
userRoutes.get('/resources', authenticate, mainController.getResources);
userRoutes.get('/usage', authenticate, mainController.getUsage);

// Deployment routes
const deploymentRoutes = express.Router();
deploymentRoutes.get('/', authenticate, mainController.getDeployments);
deploymentRoutes.post('/', authenticate, mainController.createDeployment);
deploymentRoutes.get('/:id', authenticate, mainController.getDeployment);
deploymentRoutes.put('/:id/start', authenticate, deploymentManager.startDeployment);
deploymentRoutes.put('/:id/stop', authenticate, deploymentManager.stopDeployment);
deploymentRoutes.put('/:id/restart', authenticate, deploymentManager.restartDeployment);
deploymentRoutes.delete('/:id', authenticate, deploymentManager.deleteDeployment);
deploymentRoutes.get('/:id/logs', authenticate, mainController.getDeploymentLogs);

// Database routes
const databaseRoutes = express.Router();
databaseRoutes.get('/', authenticate, mainController.getDatabases);
databaseRoutes.post('/', authenticate, mainController.createDatabase);
databaseRoutes.delete('/:id', authenticate, mainController.deleteDatabase);
databaseRoutes.post('/:id/backup', authenticate, mainController.backupDatabase);
databaseRoutes.post('/:id/restore', authenticate, mainController.restoreDatabase);
databaseRoutes.post('/:id/export', authenticate, mainController.exportDatabase);

// Domain routes
const domainRoutes = express.Router();
domainRoutes.get('/', authenticate, mainController.getDomains);
domainRoutes.post('/', authenticate, mainController.addDomain);
domainRoutes.delete('/:id', authenticate, mainController.removeDomain);
domainRoutes.post('/:id/ssl', authenticate, mainController.enableSSL);
domainRoutes.get('/:id/dns-status', authenticate, mainController.checkDNSStatus);

// File routes
const fileRoutes = express.Router();
fileRoutes.get('/list', authenticate, fileManager.listFiles);
fileRoutes.post('/upload', authenticate, fileManager.uploadFile);
fileRoutes.post('/folder', authenticate, fileManager.createFolder);
fileRoutes.delete('/', authenticate, fileManager.deleteFile);
fileRoutes.put('/rename', authenticate, fileManager.renameFile);
fileRoutes.post('/move', authenticate, fileManager.moveFile);
fileRoutes.post('/copy', authenticate, fileManager.copyFile);
fileRoutes.get('/download', authenticate, fileManager.downloadFile);
fileRoutes.put('/edit', authenticate, fileManager.editFile);
fileRoutes.post('/extract', authenticate, fileManager.extractZip);

// Terminal routes
const terminalRoutes = express.Router();
terminalRoutes.post('/command', authenticate, terminalManager.executeCommand);
terminalRoutes.get('/metrics', authenticate, terminalManager.getMetrics);
terminalRoutes.get('/processes', authenticate, terminalManager.getProcesses);
terminalRoutes.post('/kill-process', authenticate, terminalManager.killProcess);
terminalRoutes.get('/logs', authenticate, terminalManager.getLogs);

// Admin routes
const adminRoutes = express.Router();
adminRoutes.use(authenticate, authorize(['admin', 'superadmin']));
adminRoutes.get('/users', mainController.getAllUsers);
adminRoutes.post('/users', mainController.createUser);
adminRoutes.put('/users/:id/suspend', mainController.suspendUser);
adminRoutes.put('/users/:id/activate', mainController.activateUser);
adminRoutes.delete('/users/:id', mainController.deleteUser);
adminRoutes.get('/statistics', mainController.getSystemStats);
adminRoutes.post('/server/restart', mainController.restartServer);
adminRoutes.get('/logs', mainController.getSystemLogs);

module.exports = {
  authRoutes,
  userRoutes,
  deploymentRoutes,
  databaseRoutes,
  domainRoutes,
  fileRoutes,
  terminalRoutes,
  adminRoutes
};
