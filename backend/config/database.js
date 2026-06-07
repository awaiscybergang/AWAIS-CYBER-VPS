const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/awais-cyber-vps';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB Connected Successfully');
    
    // Create admin user if not exists
    const User = require('../models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminUser = new User({
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@awaicyber.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        fullName: 'System Administrator',
        role: 'admin',
        status: 'active',
        emailVerified: true
      });
      await adminUser.save();
      console.log('👑 Admin user created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
