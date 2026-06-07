const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Deployment = require('../models/Deployment');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticate, authorize(['admin']));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;
    
    const user = new User({ username, email, password, fullName, role });
    await user.save();
    
    res.status(201).json({ id: user._id, username, email, fullName, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suspend user
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true });
    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate user
router.put('/users/:id/activate', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.json({ message: 'User activated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/statistics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDeployments = await Deployment.countDocuments();
    const activeDeployments = await Deployment.countDocuments({ status: 'running' });
    
    res.json({ totalUsers, totalDeployments, activeDeployments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
