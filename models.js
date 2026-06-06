const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  apiKey: String,
  plan: { type: String, enum: ['starter', 'professional', 'enterprise'], default: 'starter' },
  resources: {
    cpu: { type: Number, default: 1 },
    ram: { type: Number, default: 1024 },
    storage: { type: Number, default: 10240 },
    bandwidth: { type: Number, default: 102400 }
  },
  usage: {
    cpu: { type: Number, default: 0 },
    ram: { type: Number, default: 0 },
    storage: { type: Number, default: 0 },
    bandwidth: { type: Number, default: 0 }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};

// Deployment Model
const deploymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['nodejs', 'python', 'php', 'static', 'api'], required: true },
  status: { type: String, enum: ['running', 'stopped', 'deploying', 'failed'], default: 'deploying' },
  port: { type: Number, required: true },
  domain: String,
  subdomain: String,
  path: { type: String, required: true },
  env: { type: Map, of: String, default: {} },
  pid: Number,
  logs: [{
    message: String,
    type: String,
    timestamp: { type: Date, default: Date.now }
  }],
  metrics: {
    cpu: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    requests: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Database Model
const databaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['mongodb', 'mysql', 'postgresql', 'redis'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'backing_up'], default: 'active' },
  host: String,
  port: Number,
  username: String,
  password: String,
  size: { type: Number, default: 0 },
  backupSchedule: {
    enabled: Boolean,
    frequency: String,
    lastBackup: Date
  },
  createdAt: { type: Date, default: Date.now }
});

// Domain Model
const domainSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true, unique: true },
  deploymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deployment' },
  status: { type: String, enum: ['active', 'pending', 'failed'], default: 'pending' },
  sslEnabled: { type: Boolean, default: false },
  sslExpiry: Date,
  dnsStatus: { type: String, enum: ['verified', 'pending', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Log Model
const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['info', 'error', 'warning', 'deployment', 'auth'], required: true },
  message: { type: String, required: true },
  details: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

// Analytics Model
const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metric: { type: String, required: true },
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Deployment: mongoose.model('Deployment', deploymentSchema),
  Database: mongoose.model('Database', databaseSchema),
  Domain: mongoose.model('Domain', domainSchema),
  Log: mongoose.model('Log', logSchema),
  Analytics: mongoose.model('Analytics', analyticsSchema)
};
