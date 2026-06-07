const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const { authenticate } = require('../middleware/auth');
const Deployment = require('../models/Deployment');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all deployments
router.get('/', authenticate, async (req, res) => {
  try {
    const deployments = await Deployment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(deployments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create deployment
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { name, type } = req.body;
    const deploymentPath = path.join(__dirname, '../../deployments', req.user._id.toString(), name);
    
    await fs.ensureDir(deploymentPath);
    
    if (req.file) {
      const zip = new AdmZip(req.file.path);
      zip.extractAllTo(deploymentPath, true);
      await fs.remove(req.file.path);
    }
    
    const port = Math.floor(3000 + Math.random() * 2000);
    
    const deployment = new Deployment({
      userId: req.user._id,
      name,
      type,
      port,
      path: deploymentPath,
      status: 'stopped'
    });
    
    await deployment.save();
    
    res.status(201).json(deployment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start deployment
router.put('/:id/start', authenticate, async (req, res) => {
  try {
    const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    
    let command, args;
    
    switch (deployment.type) {
      case 'nodejs':
        command = 'node';
        args = ['server.js'];
        break;
      case 'python':
        command = 'python3';
        args = ['app.py'];
        break;
      default:
        command = 'npx';
        args = ['serve', '-s', '.', '-l', deployment.port];
    }
    
    const process = spawn(command, args, {
      cwd: deployment.path,
      env: { ...process.env, PORT: deployment.port }
    });
    
    deployment.pid = process.pid;
    deployment.status = 'running';
    deployment.logs.push({ message: `Started on port ${deployment.port}`, type: 'info' });
    
    process.stdout.on('data', (data) => {
      deployment.logs.push({ message: data.toString(), type: 'info' });
      if (deployment.logs.length > 100) deployment.logs.shift();
      deployment.save();
    });
    
    process.stderr.on('data', (data) => {
      deployment.logs.push({ message: data.toString(), type: 'error' });
      deployment.save();
    });
    
    process.on('exit', () => {
      deployment.status = 'stopped';
      deployment.save();
    });
    
    await deployment.save();
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop deployment
router.put('/:id/stop', authenticate, async (req, res) => {
  try {
    const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    
    if (deployment.pid) {
      try { process.kill(deployment.pid); } catch(e) {}
    }
    
    deployment.status = 'stopped';
    deployment.logs.push({ message: 'Stopped by user', type: 'info' });
    await deployment.save();
    
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restart deployment
router.put('/:id/restart', authenticate, async (req, res) => {
  try {
    const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    
    if (deployment.pid) {
      try { process.kill(deployment.pid); } catch(e) {}
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let command, args;
    
    switch (deployment.type) {
      case 'nodejs':
        command = 'node';
        args = ['server.js'];
        break;
      case 'python':
        command = 'python3';
        args = ['app.py'];
        break;
      default:
        command = 'npx';
        args = ['serve', '-s', '.', '-l', deployment.port];
    }
    
    const process = spawn(command, args, {
      cwd: deployment.path,
      env: { ...process.env, PORT: deployment.port }
    });
    
    deployment.pid = process.pid;
    deployment.status = 'running';
    deployment.logs.push({ message: `Restarted on port ${deployment.port}`, type: 'info' });
    await deployment.save();
    
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete deployment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    
    if (deployment.pid) {
      try { process.kill(deployment.pid); } catch(e) {}
    }
    
    await fs.remove(deployment.path);
    await deployment.deleteOne();
    
    res.json({ message: 'Deployment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logs
router.get('/:id/logs', authenticate, async (req, res) => {
  try {
    const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    
    res.json({ logs: deployment.logs.slice(-100) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
