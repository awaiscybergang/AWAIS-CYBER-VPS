const express = require('express');
const os = require('os');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get system metrics
router.get('/metrics', authenticate, async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const cpus = os.cpus();
    const cpuUsage = cpus.map(cpu => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return ((total - idle) / total) * 100;
    }).reduce((a, b) => a + b, 0) / cpus.length;
    
    const metrics = {
      cpu: { usage: cpuUsage, cores: cpus.length },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usagePercent: (usedMem / totalMem) * 100
      },
      uptime: os.uptime(),
      timestamp: Date.now()
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system info
router.get('/info', authenticate, (req, res) => {
  res.json({
    platform: os.platform(),
    release: os.release(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    uptime: os.uptime()
  });
});

module.exports = router;
