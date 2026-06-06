const { exec, spawn } = require('child_process');
const util = require('util');
const os = require('os');
const fs = require('fs-extra');
const logger = require('../utils/logger');

const execPromise = util.promisify(exec);

class TerminalService {
  constructor() {
    this.activeSessions = new Map();
    this.allowedCommands = [
      'ls', 'pwd', 'cd', 'cat', 'echo', 'grep', 'find',
      'mkdir', 'touch', 'rm', 'cp', 'mv', 'chmod', 'chown',
      'ps', 'top', 'htop', 'df', 'du', 'free', 'uptime',
      'whoami', 'hostname', 'uname', 'date', 'cal',
      'git', 'npm', 'node', 'python', 'pip', 'composer',
      'pm2', 'docker', 'systemctl', 'service'
    ];
    
    this.blockedCommands = [
      'rm -rf /', 'sudo rm', 'dd if=', 'mkfs', 'format',
      ':(){:|:&};:', 'chmod 777 /', 'chown -R', '> /dev/sda',
      'shutdown', 'reboot', 'halt', 'poweroff', 'init 0'
    ];
  }

  async executeCommand(command, userId, sessionId = null) {
    try {
      // Security checks
      this.validateCommand(command);
      
      // Sanitize command
      const sanitizedCommand = this.sanitizeCommand(command);
      
      const options = {
        cwd: this.getUserWorkingDirectory(userId),
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 30000, // 30 seconds
        shell: '/bin/bash',
        env: {
          ...process.env,
          HOME: `/home/${userId}`,
          USER: userId
        }
      };
      
      const { stdout, stderr } = await execPromise(sanitizedCommand, options);
      
      const output = stdout || stderr || 'Command executed successfully';
      
      this.logCommand(userId, command, output);
      
      return {
        success: true,
        output: output,
        error: stderr || null,
        sessionId: sessionId || this.generateSessionId(userId)
      };
    } catch (error) {
      logger.error(`Command execution error for user ${userId}:`, error);
      
      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message,
        sessionId: sessionId || this.generateSessionId(userId)
      };
    }
  }

  validateCommand(command) {
    // Check for blocked commands
    for (const blocked of this.blockedCommands) {
      if (command.includes(blocked)) {
        throw new Error(`Command not allowed: ${blocked}`);
      }
    }
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /&&\s*(sudo|rm|dd|mkfs)/,
      /\|\s*(sudo|rm|dd|mkfs)/,
      /;\s*(sudo|rm|dd|mkfs)/,
      /`.*`/,
      /\$\(.*\)/
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        throw new Error('Dangerous command pattern detected');
      }
    }
  }

  sanitizeCommand(command) {
    // Remove multiple spaces
    let sanitized = command.replace(/\s+/g, ' ').trim();
    
    // Escape special characters
    sanitized = sanitized.replace(/[;&|`$]/g, '\\$&');
    
    return sanitized;
  }

  getUserWorkingDirectory(userId) {
    const baseDir = process.env.DEPLOYMENTS_PATH || './deployments';
    const userDir = path.join(baseDir, userId);
    
    if (fs.existsSync(userDir)) {
      return userDir;
    }
    
    return os.homedir();
  }

  generateSessionId(userId) {
    return `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  logCommand(userId, command, output) {
    logger.info(`User ${userId} executed: ${command}`);
    
    // Log to file for audit
    const logDir = path.join(__dirname, '../../logs');
    const logFile = path.join(logDir, `terminal_${new Date().toISOString().split('T')[0]}.log`);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      command,
      output: output.substring(0, 500), // Truncate output
      ip: 'internal'
    };
    
    fs.appendFile(logFile, JSON.stringify(logEntry) + '\n').catch(err => {
      logger.error('Error writing terminal log:', err);
    });
  }

  async getRunningProcesses() {
    try {
      const { stdout } = await execPromise('ps aux --sort=-%cpu | head -20');
      const lines = stdout.split('\n').slice(1);
      
      const processes = [];
      for (const line of lines) {
        if (line.trim()) {
          const parts = line.trim().split(/\s+/);
          processes.push({
            user: parts[0],
            pid: parseInt(parts[1]),
            cpu: parseFloat(parts[2]),
            mem: parseFloat(parts[3]),
            vsz: parseInt(parts[4]),
            rss: parseInt(parts[5]),
            tty: parts[6],
            stat: parts[7],
            start: parts[8],
            time: parts[9],
            command: parts.slice(10).join(' ')
          });
        }
      }
      
      return processes;
    } catch (error) {
      logger.error('Error getting processes:', error);
      return [];
    }
  }

  async killProcess(pid) {
    try {
      await execPromise(`kill -9 ${pid}`);
      logger.info(`Process ${pid} killed`);
      return { success: true, message: `Process ${pid} terminated` };
    } catch (error) {
      logger.error(`Error killing process ${pid}:`, error);
      throw new Error(`Failed to kill process: ${error.message}`);
    }
  }

  async getSystemInfo() {
    try {
      const [osInfo, cpuInfo, memInfo, diskInfo] = await Promise.all([
        this.getOSInfo(),
        this.getCPUInfo(),
        this.getMemoryInfo(),
        this.getDiskInfo()
      ]);
      
      return {
        os: osInfo,
        cpu: cpuInfo,
        memory: memInfo,
        disk: diskInfo,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error getting system info:', error);
      throw error;
    }
  }

  async getOSInfo() {
    const { stdout: osRelease } = await execPromise('cat /etc/os-release | grep PRETTY_NAME | cut -d"=" -f2');
    return {
      platform: process.platform,
      release: os.release(),
      hostname: os.hostname(),
      arch: os.arch(),
      osName: osRelease.replace(/"/g, '').trim(),
      uptime: os.uptime()
    };
  }

  async getCPUInfo() {
    const cpus = os.cpus();
    const { stdout: loadAvg } = await execPromise('uptime | awk -F "load average:" "{print $2}"');
    
    return {
      cores: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0,
      loadAverage: loadAvg.trim(),
      usage: await this.getCPUUsage()
    };
  }

  async getCPUUsage() {
    try {
      const { stdout } = await execPromise("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1");
      return parseFloat(stdout);
    } catch (error) {
      return 0;
    }
  }

  async getMemoryInfo() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usagePercent: (usedMem / totalMem * 100).toFixed(2)
    };
  }

  async getDiskInfo() {
    try {
      const { stdout } = await execPromise("df -h / | awk 'NR==2 {print $5}' | sed 's/%//'");
      return {
        usagePercent: parseInt(stdout),
        total: await this.getDiskTotal(),
        used: await this.getDiskUsed()
      };
    } catch (error) {
      return { usagePercent: 0, total: 0, used: 0 };
    }
  }

  async getDiskTotal() {
    try {
      const { stdout } = await execPromise("df -BG / | awk 'NR==2 {print $2}' | sed 's/G//'");
      return parseInt(stdout) * 1024 * 1024 * 1024;
    } catch (error) {
      return 0;
    }
  }

  async getDiskUsed() {
    try {
      const { stdout } = await execPromise("df -BG / | awk 'NR==2 {print $3}' | sed 's/G//'");
      return parseInt(stdout) * 1024 * 1024 * 1024;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = new TerminalService();
