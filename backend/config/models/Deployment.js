const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['nodejs', 'python', 'static'],
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'stopped', 'deploying', 'failed'],
    default: 'stopped'
  },
  port: Number,
  path: String,
  pid: Number,
  logs: [{
    message: String,
    type: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deployment', deploymentSchema);
