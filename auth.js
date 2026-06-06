const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User, Log } = require('./2-models');

const JWT_SECRET = process.env.JWT_SECRET || 'awais-cyber-super-secret-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-2026';

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'test@gmail.com',
    pass: process.env.EMAIL_PASS || 'test'
  }
});

// Generate JWT tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'Verify your email - Awais Cyber VPS',
    html: `<h1>Welcome to Awais Cyber VPS!</h1>
           <p>Please verify your email by clicking <a href="${verificationUrl}">here</a></p>
           <p>Or copy this link: ${verificationUrl}</p>`
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'Password Reset - Awais Cyber VPS',
    html: `<h1>Reset Your Password</h1>
           <p>Click <a href="${resetUrl}">here</a> to reset your password</p>
           <p>This link expires in 1 hour.</p>`
  });
};

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    const user = new User({
      username,
      email,
      password,
      fullName,
      emailVerificationToken
    });
    
    await user.save();
    await sendVerificationEmail(email, emailVerificationToken);
    
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    await Log.create({
      userId: user._id,
      type: 'auth',
      message: 'User registered',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      accessToken,
      refreshToken,
      user: { id: user._id, username, email, fullName, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    await Log.create({
      userId: user._id,
      type: 'auth',
      message: 'User logged in',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, email, fullName: user.fullName, role: user.role, plan: user.plan }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ emailVerificationToken: token });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    await sendPasswordResetEmail(email, resetToken);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    await Log.create({
      userId: req.user?.id,
      type: 'auth',
      message: 'User logged out',
      ip: req.ip
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  verifyToken
};
