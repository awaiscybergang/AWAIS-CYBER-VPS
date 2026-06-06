const fs = require('fs-extra');
const path = require('path');
const { User, Deployment, Database, Domain, Log, Analytics } = require('./2-models');

// User Controllers
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, username } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, username, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getResources = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.usage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deployment Controllers
const getDeployments = async (req, res) => {
  try {
    const deployments = await Deployment.find({ userId: req.user.id });
    res.json(deployments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDeployment = async (req, res) => {
  try {
    const { name, type, port, domain } = req.body;
    const deploymentPath = path.join(__dirname, '../deployments', req.user.id, name);
    
    await fs.ensureDir(deploymentPath);
    
    const deployment = new Deployment({
      userId: req.user.id,
      name,
      type,
      port: port || Math.floor(3000 + Math.random() * 2000),
      domain,
      path: deploymentPath,
      status: 'deploying'
    });
    
    await deployment.save();
    
    await Log.create({
      userId: req.user.id,
      type: 'deployment',
      message: `Created deployment: ${name}`,
      details: { deploymentId: deployment._id }
    });
    
    res.status(201).json(deployment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDeployment = async (req, res) => {
  try {
    const deployment = await Deployment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDeploymentLogs = async (req, res) => {
  try {
    const deployment = await Deployment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    res.json(deployment.logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Database Controllers
const getDatabases = async (req, res) => {
  try {
    const databases = await Database.find({ userId: req.user.id });
    res.json(databases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDatabase = async (req, res) => {
  try {
    const { name, type } = req.body;
    const db = new Database({
      userId: req.user.id,
      name,
      type,
      username: `user_${Date.now()}`,
      password: Math.random().toString(36).slice(-8),
      host: 'localhost',
      port: type === 'mongodb' ? 27017 : type === 'mysql' ? 3306 : 5432
    });
    
    await db.save();
    res.status(201).json(db);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDatabase = async (req, res) => {
  try {
    await Database.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Database deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const backupDatabase = async (req, res) => {
  try {
    const db = await Database.findOne({ _id: req.params.id, userId: req.user.id });
    if (!db) return res.status(404).json({ error: 'Database not found' });
    
    const backupPath = path.join(__dirname, '../backups', req.user.id, `${db.name}_${Date.now()}`);
    await fs.ensureDir(backupPath);
    
    db.status = 'backing_up';
    await db.save();
    
    // Simulate backup process
    setTimeout(async () => {
      db.status = 'active';
      if (db.backupSchedule) db.backupSchedule.lastBackup = new Date();
      await db.save();
    }, 3000);
    
    res.json({ message: 'Backup started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const restoreDatabase = async (req, res) => {
  try {
    const db = await Database.findOne({ _id: req.params.id, userId: req.user.id });
    if (!db) return res.status(404).json({ error: 'Database not found' });
    
    db.status = 'restoring';
    await db.save();
    
    setTimeout(async () => {
      db.status = 'active';
      await db.save();
    }, 5000);
    
    res.json({ message: 'Restore started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportDatabase = async (req, res) => {
  try {
    const db = await Database.findOne({ _id: req.params.id, userId: req.user.id });
    if (!db) return res.status(404).json({ error: 'Database not found' });
    
    res.json({ message: `Export of ${db.name} started`, downloadUrl: `/exports/${db.name}.sql` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Domain Controllers
const getDomains = async (req, res) => {
  try {
    const domains = await Domain.find({ userId: req.user.id }).populate('deploymentId');
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addDomain = async (req, res) => {
  try {
    const { domain, deploymentId } = req.body;
    const existingDomain = await Domain.findOne({ domain });
    if (existingDomain) return res.status(400).json({ error: 'Domain already exists' });
    
    const newDomain = new Domain({
      userId: req.user.id,
      domain,
      deploymentId,
      status: 'pending'
    });
    
    await newDomain.save();
    res.status(201).json(newDomain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeDomain = async (req, res) => {
  try {
    await Domain.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Domain removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const enableSSL = async (req, res) => {
  try {
    const domain = await Domain.findOne({ _id: req.params.id, userId: req.user.id });
    if (!domain) return res.status(404).json({ error: 'Domain not found' });
    
    domain.sslEnabled = true;
    domain.sslExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    await domain.save();
    
    res.json({ message: 'SSL enabled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkDNSStatus = async (req, res) => {
  try {
    const domain = await Domain.findOne({ _id: req.params.id, userId: req.user.id });
    if (!domain) return res.status(404).json({ error: 'Domain not found' });
    
    domain.dnsStatus = 'verified';
    await domain.save();
    
    res.json({ status: domain.dnsStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Controllers
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, password, fullName, role, plan } = req.body;
    const user = new User({ username, email, password, fullName, role, plan });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );
    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    res.json({ message: 'User activated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDeployments = await Deployment.countDocuments();
    const activeDeployments = await Deployment.countDocuments({ status: 'running' });
    const totalDatabases = await Database.countDocuments();
    
    res.json({
      totalUsers,
      totalDeployments,
      activeDeployments,
      totalDatabases,
      serverUptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const restartServer = async (req, res) => {
  try {
    res.json({ message: 'Server restart initiated' });
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getResources,
  getUsage,
  getDeployments,
  createDeployment,
  getDeployment,
  getDeploymentLogs,
  getDatabases,
  createDatabase,
  deleteDatabase,
  backupDatabase,
  restoreDatabase,
  exportDatabase,
  getDomains,
  addDomain,
  removeDomain,
  enableSSL,
  checkDNSStatus,
  getAllUsers,
  createUser,
  suspendUser,
  activateUser,
  deleteUser,
  getSystemStats,
  restartServer,
  getSystemLogs
};
