const { spawn, exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const pidusage = require('pidusage');
const logger = require('../utils/logger');
const Deployment = require('../models/Deployment');

class DeploymentService {
  constructor() {
    this.activeProcesses = new Map();
    this.deploymentsDir = path.join(__dirname, '../../deployments');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.deploymentsDir);
  }

  async createDeployment(userId, deploymentData, files) {
    try {
      const deploymentPath = path.join(this.deploymentsDir, userId, deploymentData.name);
      await fs.ensureDir(deploymentPath);
      
      const port = deploymentData.port || Math.floor(3000 + Math.random() * 2000);
      
      const deployment = new Deployment({
        userId,
        ...deploymentData,
        port,
        path: deploymentPath,
        status: 'deploying',
        createdAt: new Date()
      });
      
      await deployment.save();
      
      if (files && files.zipFile) {
        await this.extractAndDeploy(deployment, files.zipFile);
      }
      
      logger.info(`Deployment created: ${deploymentData.name} for user ${userId}`);
      
      return deployment;
    } catch (error) {
      logger.error('Error creating deployment:', error);
      throw error;
    }
  }

  async extractAndDeploy(deployment, zipFilePath) {
    try {
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(deployment.path, true);
      
      deployment.status = 'stopped';
      await deployment.save();
      
      logger.info(`Files extracted for deployment: ${deployment.name}`);
      
      return true;
    } catch (error) {
      logger.error('Error extracting zip:', error);
      deployment.status = 'failed';
      await deployment.save();
      throw error;
    }
  }

  async startDeployment(deploymentId, userId) {
    try {
      const deployment = await Deployment.findOne({ _id: deploymentId, userId });
      if (!deployment) {
        throw new Error('Deployment not found');
      }
      
      if (deployment.status === 'running') {
        throw new Error('Deployment is already running');
      }
      
      let command;
      let args = [];
      let options = {
        cwd: deployment.path,
        env: {
          ...process.env,
          PORT: deployment.port,
          NODE_ENV: process.env.NODE_ENV || 'production',
          ...Object.fromEntries(deployment.env || new Map())
        }
      };
      
      switch (deployment.type) {
        case 'nodejs':
          command = 'node';
          args = this.findEntryPoint(deployment.path, 'server.js', 'app.js', 'index.js');
          break;
        case 'python':
          command = 'python3';
          args = this.findEntryPoint(deployment.path, 'app.py', 'main.py', 'wsgi.py');
          break;
        case 'php':
          command = 'php';
          args = ['-S', `0.0.0.0:${deployment.port}`, '-t', deployment.path];
          break;
        case 'static':
          command = 'npx';
          args = ['serve', '-s', deployment.path, '-l', deployment.port];
          break;
        default:
          command = 'node';
          args = ['server.js'];
      }
      
      const process = spawn(command, args, options);
      
      deployment.pid = process.pid;
      deployment.status = 'running';
      deployment.logs.push({
        message: `Deployment started on port ${deployment.port}`,
        type: 'info',
        timestamp: new Date()
      });
      
      this.setupProcessHandlers(process, deployment);
      this.activeProcesses.set(deployment._id.toString(), process);
      
      await deployment.save();
      
      this.startMetricsCollection(deployment);
      
      logger.info(`Deployment started: ${deployment.name} (PID: ${process.pid})`);
      
      return deployment;
    } catch (error) {
      logger.error('Error starting deployment:', error);
      throw error;
    }
  }

  findEntryPoint(directory, ...possibleFiles) {
    for (const file of possibleFiles) {
      const filePath = path.join(directory, file);
      if (fs.existsSync(filePath)) {
        return [file];
      }
    }
    return [possibleFiles[0]];
  }

  setupProcessHandlers(process, deployment) {
    process.stdout.on('data', (data) => {
      const message = data.toString();
      deployment.logs.push({
        message,
        type: 'info',
        timestamp: new Date()
      });
      this.trimLogs(deployment);
      deployment.save().catch(err => logger.error('Error saving log:', err));
    });
    
    process.stderr.on('data', (data) => {
      const message = data.toString();
      deployment.logs.push({
        message,
        type: 'error',
        timestamp: new Date()
      });
      this.trimLogs(deployment);
      deployment.save().catch(err => logger.error('Error saving log:', err));
    });
    
    process.on('exit', (code) => {
      deployment.status = 'stopped';
      deployment.logs.push({
        message: `Process exited with code ${code}`,
        type: 'info',
        timestamp: new Date()
      });
      deployment.save().catch(err => logger.error('Error saving log:', err));
      this.activeProcesses.delete(deployment._id.toString());
      logger.info(`Deployment stopped: ${deployment.name} (Exit code: ${code})`);
    });
    
    process.on('error', (error) => {
      deployment.status = 'failed';
      deployment.logs.push({
        message: `Process error: ${error.message}`,
        type: 'error',
        timestamp: new Date()
      });
      deployment.save().catch(err => logger.error('Error saving log:', err));
      logger.error(`Deployment error: ${deployment.name}`, error);
    });
  }

  trimLogs(deployment) {
    const MAX_LOGS = 1000;
    if (deployment.logs.length > MAX_LOGS) {
      deployment.logs = deployment.logs.slice(-MAX_LOGS);
    }
  }

  async startMetricsCollection(deployment) {
    const collectMetrics = async () => {
      if (deployment.status !== 'running') {
        return;
      }
      
      try {
        if (deployment.pid) {
          const stats = await pidusage(deployment.pid);
          deployment.metrics = {
            cpu: stats.cpu,
            memory: stats.memory,
            requests: (deployment.metrics?.requests || 0) + 1
          };
          await deployment.save();
        }
      } catch (error) {
        // Process might have died
      }
      
      setTimeout(collectMetrics, 5000);
    };
    
    collectMetrics();
  }

  async stopDeployment(deploymentId, userId) {
    try {
      const deployment = await Deployment.findOne({ _id: deploymentId, userId });
      if (!deployment) {
        throw new Error('Deployment not found');
      }
      
      const process = this.activeProcesses.get(deployment._id.toString());
      if (process) {
        process.kill('SIGTERM');
        this.activeProcesses.delete(deployment._id.toString());
      } else if (deployment.pid) {
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
      
      logger.info(`Deployment stopped: ${deployment.name}`);
      
      return deployment;
    } catch (error) {
      logger.error('Error stopping deployment:', error);
      throw error;
    }
  }

  async restartDeployment(deploymentId, userId) {
    try {
      await this.stopDeployment(deploymentId, userId);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await this.startDeployment(deploymentId, userId);
    } catch (error) {
      logger.error('Error restarting deployment:', error);
      throw error;
    }
  }

  async deleteDeployment(deploymentId, userId) {
    try {
      await this.stopDeployment(deploymentId, userId);
      
      const deployment = await Deployment.findOne({ _id: deploymentId, userId });
      if (!deployment) {
        throw new Error('Deployment not found');
      }
      
      await fs.remove(deployment.path);
      await deployment.deleteOne();
      
      logger.info(`Deployment deleted: ${deployment.name}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting deployment:', error);
      throw error;
    }
  }

  async getDeploymentLogs(deploymentId, userId, limit = 100) {
    try {
      const deployment = await Deployment.findOne({ _id: deploymentId, userId });
      if (!deployment) {
        throw new Error('Deployment not found');
      }
      
      const logs = deployment.logs.slice(-limit);
      return { logs, total: deployment.logs.length };
    } catch (error) {
      logger.error('Error getting deployment logs:', error);
      throw error;
    }
  }

  async getAllDeployments(userId) {
    try {
      const deployments = await Deployment.find({ userId }).sort({ createdAt: -1 });
      return deployments;
    } catch (error) {
      logger.error('Error getting deployments:', error);
      throw error;
    }
  }

  async updateEnvironment(deploymentId, userId, envVars) {
    try {
      const deployment = await Deployment.findOne({ _id: deploymentId, userId });
      if (!deployment) {
        throw new Error('Deployment not found');
      }
      
      deployment.env = new Map(Object.entries(envVars));
      await deployment.save();
      
      logger.info(`Environment updated for deployment: ${deployment.name}`);
      
      return deployment;
    } catch (error) {
      logger.error('Error updating environment:', error);
      throw error;
    }
  }
}

module.exports = new DeploymentService();
