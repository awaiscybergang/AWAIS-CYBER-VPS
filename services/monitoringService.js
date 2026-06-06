const si = require('systeminformation');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class MonitoringService {
  constructor() {
    this.metricsHistory = [];
    this.maxHistorySize = 3600; // 1 hour at 1 second intervals
    this.alertThresholds = {
      cpu: 80,
      memory: 85,
      disk: 90
    };
  }

  async getSystemMetrics() {
    try {
      const [cpu, memory, disk, network, uptime, processes] = await Promise.all([
        this.getCPUInfo(),
        this.getMemoryInfo(),
        this.getDiskInfo(),
        this.getNetworkInfo(),
        this.getUptimeInfo(),
        this.getProcessInfo()
      ]);

      const metrics = {
        timestamp: Date.now(),
        cpu,
        memory,
        disk,
        network,
        uptime,
        processes,
        health: this.calculateHealthStatus({ cpu, memory, disk })
      };

      this.storeMetrics(metrics);
      this.checkAlerts(metrics);

      return metrics;
    } catch (error) {
      logger.error('Error getting system metrics:', error);
      return this.getFallbackMetrics();
    }
  }

  async getCPUInfo() {
    try {
      const load = await si.currentLoad();
      const cpuInfo = await si.cpu();
      
      return {
        usage: load.currentLoad,
        average: load.avgLoad,
        cores: cpuInfo.cores,
        speed: cpuInfo.speed,
        temperature: load.currentLoad,
        perCore: load.cpus?.map(c => c.load) || []
      };
    } catch (error) {
      return {
        usage: 0,
        average: [0, 0, 0],
        cores: os.cpus().length,
        speed: 0,
        temperature: 0,
        perCore: []
      };
    }
  }

  async getMemoryInfo() {
    try {
      const mem = await si.mem();
      const swap = await si.mem();
      
      return {
        total: mem.total,
        used: mem.active,
        free: mem.free,
        available: mem.available,
        usagePercent: ((mem.active / mem.total) * 100).toFixed(2),
        swapTotal: swap.swaptotal,
        swapUsed: swap.swapused,
        swapFree: swap.swapfree
      };
    } catch (error) {
      const total = os.totalmem();
      const free = os.freemem();
      return {
        total,
        used: total - free,
        free,
        available: free,
        usagePercent: ((total - free) / total * 100).toFixed(2),
        swapTotal: 0,
        swapUsed: 0,
        swapFree: 0
      };
    }
  }

  async getDiskInfo() {
    try {
      const disks = await si.fsSize();
      
      return disks.map(disk => ({
        mount: disk.mount,
        total: disk.size,
        used: disk.used,
        free: disk.available,
        usagePercent: disk.use,
        type: disk.type
      }));
    } catch (error) {
      return [];
    }
  }

  async getNetworkInfo() {
    try {
      const interfaces = await si.networkInterfaces();
      const stats = await si.networkStats();
      
      return {
        interfaces: interfaces.map(i => ({
          name: i.iface,
          ip: i.ip4,
          mac: i.mac,
          speed: i.speed,
          operational: i.operstate === 'up'
        })),
        traffic: stats[0] ? {
          rx: stats[0].rx_bytes,
          tx: stats[0].tx_bytes,
          rxSpeed: stats[0].rx_sec,
          txSpeed: stats[0].tx_sec
        } : null
      };
    } catch (error) {
      return {
        interfaces: [],
        traffic: null
      };
    }
  }

  async getUptimeInfo() {
    try {
      const time = await si.time();
      const processUptime = process.uptime();
      
      return {
        system: time.uptime,
        process: processUptime,
        bootTime: new Date(Date.now() - (time.uptime * 1000)).toISOString()
      };
    } catch (error) {
      return {
        system: os.uptime(),
        process: process.uptime(),
        bootTime: new Date(Date.now() - (os.uptime() * 1000)).toISOString()
      };
    }
  }

  async getProcessInfo() {
    try {
      const processes = await si.processes();
      
      return {
        total: processes.all,
        running: processes.running,
        sleeping: processes.sleeping,
        stopped: processes.stopped,
        zombie: processes.zombie,
        topCPU: processes.list?.slice(0, 10).map(p => ({
          pid: p.pid,
          name: p.command,
          cpu: p.cpu,
          memory: p.mem
        })) || [],
        topMemory: processes.list?.sort((a, b) => b.mem - a.mem).slice(0, 10).map(p => ({
          pid: p.pid,
          name: p.command,
          memory: p.mem
        })) || []
      };
    } catch (error) {
      return {
        total: 0,
        running: 0,
        sleeping: 0,
        stopped: 0,
        zombie: 0,
        topCPU: [],
        topMemory: []
      };
    }
  }

  calculateHealthStatus(metrics) {
    const warnings = [];
    const criticals = [];
    
    if (metrics.cpu.usage > this.alertThresholds.cpu) {
      criticals.push(`CPU usage at ${metrics.cpu.usage.toFixed(1)}%`);
    } else if (metrics.cpu.usage > this.alertThresholds.cpu - 20) {
      warnings.push(`CPU usage high: ${metrics.cpu.usage.toFixed(1)}%`);
    }
    
    if (metrics.memory.usagePercent > this.alertThresholds.memory) {
      criticals.push(`Memory usage at ${metrics.memory.usagePercent}%`);
    } else if (metrics.memory.usagePercent > this.alertThresholds.memory - 20) {
      warnings.push(`Memory usage high: ${metrics.memory.usagePercent}%`);
    }
    
    if (metrics.disk[0]?.usagePercent > this.alertThresholds.disk) {
      criticals.push(`Disk usage at ${metrics.disk[0].usagePercent}%`);
    }
    
    return {
      status: criticals.length > 0 ? 'critical' : (warnings.length > 0 ? 'warning' : 'healthy'),
      warnings,
      criticals
    };
  }

  storeMetrics(metrics) {
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
  }

  checkAlerts(metrics) {
    if (metrics.cpu.usage > this.alertThresholds.cpu) {
      logger.warn(`High CPU usage alert: ${metrics.cpu.usage.toFixed(1)}%`);
    }
    
    if (metrics.memory.usagePercent > this.alertThresholds.memory) {
      logger.warn(`High memory usage alert: ${metrics.memory.usagePercent}%`);
    }
  }

  getFallbackMetrics() {
    return {
      timestamp: Date.now(),
      cpu: { usage: 0, cores: os.cpus().length },
      memory: { total: os.totalmem(), used: os.totalmem() - os.freemem(), usagePercent: 0 },
      disk: [],
      network: { interfaces: [], traffic: null },
      uptime: { system: os.uptime(), process: process.uptime() },
      processes: { total: 0, running: 0 },
      health: { status: 'unknown', warnings: [], criticals: [] }
    };
  }

  getMetricsHistory(duration = 300) { // duration in seconds
    const now = Date.now();
    const cutoff = now - (duration * 1000);
    return this.metricsHistory.filter(m => m.timestamp > cutoff);
  }

  async getResourceUsage(userId) {
    // Get user-specific resource usage from database
    const Deployment = require('../models/Deployment');
    const deployments = await Deployment.find({ userId });
    
    const totalCPU = deployments.reduce((sum, d) => sum + (d.metrics?.cpu || 0), 0);
    const totalMemory = deployments.reduce((sum, d) => sum + (d.metrics?.memory || 0), 0);
    const totalRequests = deployments.reduce((sum, d) => sum + (d.metrics?.requests || 0), 0);
    
    return {
      cpu: totalCPU,
      memory: totalMemory,
      requests: totalRequests,
      deploymentCount: deployments.length
    };
  }
}

module.exports = new MonitoringService();
