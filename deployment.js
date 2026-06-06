const fs = require('fs-extra');
const path = require('path');
const { spawn, exec } = require('child_process');
const { Deployment, Log } = require('./2-models');

// Start deployment
const startDeployment = async (req, res) => {
  try {
    const deployment = await Deployment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    
    if (deployment.status === 'running') {
      return res.status(400).json({ error: 'Deployment is already running' });
    }
    
    let command;
    let args = [];
    
    switch (deployment.type) {
      case 'nodejs':
        command = 'node';
        args = ['server.js'];
        break;
      case 'python':
        command = 'python3';
        args = ['app.py'];
        break;
      case 'php':
        command = 'php';
        args = ['-S', `localhost:${deployment.port}`, '-t', deployment.path];
        break;
      case 'static':
        command = 'npx';
        args = ['serve', '-s', deployment.path, '-l', deployment.port];
        break;
      default:
        command = 'node';
        args = ['server.js'];
    }
    
    const process = spawn(command, args, {
      cwd: deployment.path,
      env: { ...process.env, PORT: deployment.port, ...Object.fromEntries(deployment.env) }
    });
    
    deployment.pid = process.pid;
    deployment.status = 'running';
    deployment.logs.push({
      message: `Deployment started on port ${deployment.port}`,
      type: 'info',
      timestamp: new Date()
    });
    
    process.stdout.on('data', (data) => {
      deployment.logs.push({
        message: data.toString(),
        type: 'info',
        timestamp: new Date()
      });
      if (deployment.logs.length > 1000) deployment.logs.shift();
    });
    
    process.stderr.on('data', (data) => {
      deployment.logs.push({
        message: data.toString(),
        type: 'error',
        timestamp: new Date()
      });
    });
    
    process.on('exit', (code) => {
      deployment.status = 'stopped';
      deployment.logs.push({
        message: `Process exited with code ${code}`,
        type: 'info',
        timestamp: new Date()
      });
      deployment.save();
    });
    
    await deployment.save();
    
    await Log.create({
      userId: req.user.id,
      type: 'deployment',
      message: `Started deployment: ${deployment.name}`,
      details: { deploymentId: deployment._id, port: deployment.port }
    });
    
    res.json({ message: 'Deployment started', deployment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stop deployment
const stopDeployment = async (req, res) => {
  try {
    const deployment = await Deployment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    
    if (deployment.pid) {
      try {
        process.kill(deployment.pid);
      } catch (e) {
        // Process already dead
      }
    }
    
    deployment.status = 'stopped';
    deployment.logs.push({
      message: 'Deployment stopped by user',
      type: 'info',
      timestamp: new Date()
    });
    
    await deployment.save();
    
    await Log.create({
      userId: req.user.id,
      type: 'deployment',
      message: `Stopped deployment: ${deployment.name}`,
      details: { deploymentId: deployment._id }
    });
    
    res.json({ message: 'Deployment stopped', deployment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restart deployment
const restartDeployment = async (req, res) => {
  try {
    await stopDeployment(req, res);
    setTimeout(async () => {
      await startDeployment(req, res);
    }, 2000);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete deployment
const deleteDeployment = async (req, res) => {
  try {
    const deployment = await Deployment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    
    if (deployment.pid) {
      try {
        process.kill(deployment.pid);
      } catch (e) {}
    }
    
    await fs.remove(deployment.path);
    await deployment.deleteOne();
    
    await Log.create({
      userId: req.user.id,
      type: 'deployment',
      message: `Deleted deployment: ${deployment.name}`,
      details: { deploymentId: deployment._id }
    });
    
    res.json({ message: 'Deployment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deploy from ZIP
const deployFromZip = async (req, res) => {
  try {
    const { name, type, zipPath } = req.body;
    const deploymentPath = path.join(__dirname, '../deployments', req.user.id, name);
    
    await fs.ensureDir(deploymentPath);
    
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(deploymentPath, true);
    
    const port = Math.floor(3000 + Math.random() * 2000);
    
    const deployment = new Deployment({
      userId: req.user.id,
      name,
      type,
      port,
      path: deploymentPath,
      status: 'stopped'
    });
    
    await deployment.save();
    
    res.json({ message: 'Deployment created from ZIP', deployment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get deployment logs
const getDeploymentLogs = async (req, res) => {
  try {
    const deployment = await Deployment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    
    res.json({ logs: deployment.logs.slice(-100) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Monitor deployments
const monitorDeployments = async (req, res) => {
  try {
    const deployments = await Deployment.find({ userId: req.user.id, status: 'running' });
    const metrics = [];
    
    for (const deployment of deployments) {
      if (deployment.pid) {
        try {
          const pidusage = require('pidusage');
          const stat = await pidusage(deployment.pid);
          deployment.metrics = {
            cpu: stat.cpu,
            memory: stat.memory,
            requests: deployment.metrics.requests + 1
          };
          await deployment.save();
          metrics.push({ id: deployment._id, metrics: deployment.metrics });
        } catch (e) {}
      }
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  startDeployment,
  stopDeployment,
  restartDeployment,
  deleteDeployment,
  deployFromZip,
  getDeploymentLogs,
  monitorDeployments
};
