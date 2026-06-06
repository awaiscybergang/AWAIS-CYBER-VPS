const { exec } = require('child_process');
const si = require('systeminformation');
const os = require('os');
const { Log } = require('./2-models');

// Execute command
const executeCommand = async (req, res) => {
  try {
    const { command } = req.body;
    
    // Security: Block dangerous commands
    const dangerousCommands = ['rm -rf', 'dd if=', 'mkfs', ':(){:|:&};:', 'chmod 777', 'sudo'];
    if (dangerousCommands.some(dangerous => command.includes(dangerous))) {
      return res.status(403).json({ error: 'Command not allowed for security reasons' });
    }
    
    exec(command, { cwd: os.homedir(), maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      const output = stdout || stderr || (error ? error.message : '');
      
      Log.create({
        userId: req.user.id,
        type: 'info',
        message: `Executed command: ${command}`,
        details: { output: output.substring(0, 500) }
      }).catch(console.error);
      
      res.json({
        output,
        error: error?.message || null,
        code: error?.code || 0
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get system metrics
const getSystemMetrics = async () => {
  try {
    const [cpu, memory, disk, network, uptime] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.time()
    ]);
    
    return {
      cpu: {
        usage: cpu.currentLoad,
        cores: cpu.cpus?.length || os.cpus().length,
        speed: cpu.avgSpeed
      },
      memory: {
        total: memory.total,
        used: memory.active,
        free: memory.free,
        usagePercent: (memory.active / memory.total) * 100
      },
      disk: disk.map(d => ({
        mount: d.mount,
        total: d.size,
        used: d.used,
        free: d.available,
        usagePercent: (d.used / d.size) * 100
      })),
      network: network[0] ? {
        rx: network[0].rx_bytes,
        tx: network[0].tx_bytes,
        rxSpeed: network[0].rx_sec,
        txSpeed: network[0].tx_sec
      } : null,
      uptime: {
        system: uptime.uptime,
        process: process.uptime()
      },
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Metrics error:', error);
    return {
      cpu: { usage: 0, cores: os.cpus().length },
      memory: { total: os.totalmem(), used: os.totalmem() - os.freemem(), free: os.freemem() },
      disk: [],
      network: null,
      uptime: { system: os.uptime(), process: process.uptime() }
    };
  }
};

// Get metrics endpoint
const getMetrics = async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get running processes
const getProcesses = async (req, res) => {
  try {
    exec('ps aux --sort=-%cpu | head -20', (error, stdout) => {
      if (error) return res.status(500).json({ error: error.message });
      
      const lines = stdout.split('\n').slice(1);
      const processes = lines.filter(line => line.trim()).map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          user: parts[0],
          pid: parseInt(parts[1]),
          cpu: parseFloat(parts[2]),
          mem: parseFloat(parts[3]),
          command: parts.slice(10).join(' ')
        };
      });
      
      res.json(processes);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kill process
const killProcess = async (req, res) => {
  try {
    const { pid } = req.body;
    exec(`kill -9 ${pid}`, (error) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ message: `Process ${pid} terminated` });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get logs
const getLogs = async (req, res) => {
  try {
    const { type, limit = 100, offset = 0 } = req.query;
    const query = { userId: req.user.id };
    if (type) query.type = type;
    
    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    const total = await Log.countDocuments(query);
    
    res.json({
      logs,
      total,
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Real-time monitoring via Socket.IO
const setupRealtimeMonitoring = (io) => {
  const intervals = new Map();
  
  io.on('connection', (socket) => {
    socket.on('start-monitoring', async (userId) => {
      if (intervals.has(socket.id)) clearInterval(intervals.get(socket.id));
      
      const interval = setInterval(async () => {
        const metrics = await getSystemMetrics();
        socket.emit('metrics', metrics);
      }, 2000);
      
      intervals.set(socket.id, interval);
    });
    
    socket.on('stop-monitoring', () => {
      if (intervals.has(socket.id)) {
        clearInterval(intervals.get(socket.id));
        intervals.delete(socket.id);
      }
    });
    
    socket.on('disconnect', () => {
      if (intervals.has(socket.id)) {
        clearInterval(intervals.get(socket.id));
        intervals.delete(socket.id);
      }
    });
  });
};

module.exports = {
  executeCommand,
  getSystemMetrics,
  getMetrics,
  getProcesses,
  killProcess,
  getLogs,
  setupRealtimeMonitoring
};
