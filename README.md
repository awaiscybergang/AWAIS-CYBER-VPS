# 📄 COMPLETE README.md - SINGLE FILE

```markdown
# 🚀 AWAIS CYBER VPS
## Powerful Cloud Hosting For Developers, Businesses & Creators

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D5.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-red)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey)

**[Live Demo](http://localhost:5000)** | **[Documentation](#)** | **[Support](https://t.me/awaiscyber)**

</div>

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [System Requirements](#system-requirements)
5. [Quick Installation](#quick-installation)
6. [Detailed Installation](#detailed-installation)
7. [Configuration](#configuration)
8. [Running The Application](#running-the-application)
9. [API Documentation](#api-documentation)
10. [Project Structure](#project-structure)
11. [Deployment Guide](#deployment-guide)
12. [Security Guide](#security-guide)
13. [Troubleshooting](#troubleshooting)
14. [FAQ](#faq)
15. [Support](#support)

---

## PROJECT OVERVIEW

**Awais Cyber VPS** is a professional, production-ready VPS hosting control panel that allows users to deploy websites, bots, APIs, databases, and applications with ease. Built with modern technologies and featuring a stunning cyberpunk-inspired glassmorphism UI.

### Key Metrics
- ⚡ **99.9% Uptime** guaranteed
- 🚀 **Instant Deployment** in seconds
- 💰 **Cost Effective** scalable pricing
- 🔒 **Enterprise Grade** security
- 🌍 **Global CDN** ready

### Use Cases
- 🏢 **Business Websites** - Host your company website
- 🤖 **Bot Hosting** - Deploy Discord/Telegram bots
- 📱 **API Hosting** - REST API deployment
- 🗄️ **Database Hosting** - MongoDB, MySQL, PostgreSQL
- 🎨 **Static Sites** - HTML/CSS/JS websites
- 🐍 **Python Apps** - Django, Flask applications
- 📦 **Node.js Apps** - Express, Nest.js applications

---

## FEATURES

### 👤 User Features
| Feature | Description |
|---------|-------------|
| **Authentication** | JWT-based auth with email verification & password reset |
| **Dashboard** | Real-time resource monitoring with live charts |
| **Deployment Manager** | Deploy Node.js, Python, PHP, Static sites, REST APIs |
| **File Manager** | Upload, edit, delete, rename, zip/unzip files |
| **Database Manager** | Create/manage MongoDB, MySQL, PostgreSQL databases |
| **Domain Manager** | Custom domains, subdomains, SSL certificates |
| **Browser Terminal** | Execute commands directly from web browser |
| **Real-time Monitoring** | Live CPU, RAM, Storage, Network metrics |
| **Logs System** | View, search, download deployment and system logs |
| **Analytics** | Usage graphs, statistics, and performance metrics |
| **Resource Limits** | CPU, RAM, Storage, Bandwidth allocation per plan |

### 👑 Admin Features
| Feature | Description |
|---------|-------------|
| **User Management** | Create, suspend, activate, delete users |
| **Server Management** | Restart services, view system health |
| **Global Monitoring** | Monitor all deployments and databases |
| **System Logs** | View all user activities and errors |
| **Resource Allocation** | Manage user resource limits per plan |
| **Plan Management** | Create and manage pricing plans |

### 🔒 Security Features
- ✅ JWT Authentication with refresh tokens
- ✅ bcrypt password hashing (12 rounds)
- ✅ Helmet.js for security headers
- ✅ Rate limiting protection (100 requests/15min)
- ✅ CSRF protection tokens
- ✅ XSS prevention
- ✅ Secure cookie handling
- ✅ Input validation & sanitization
- ✅ SQL injection protection
- ✅ Session management

---

## TECH STACK

### Frontend
```json
{
  "html": "HTML5",
  "css": "CSS3 + Glassmorphism + Cyberpunk Theme + Neon Effects",
  "javascript": "Vanilla JS (No Framework)",
  "charts": "Chart.js for analytics",
  "realtime": "Socket.IO client",
  "icons": "Font Awesome 6",
  "fonts": "Google Fonts (Inter)",
  "responsive": "Mobile-first responsive design"
}
```

### Backend
```json
{
  "runtime": "Node.js 16+",
  "framework": "Express.js 4.18.2",
  "database": "MongoDB 5+ with Mongoose 8+",
  "realtime": "Socket.IO 4.5.4",
  "authentication": "JWT + bcryptjs",
  "file_upload": "Multer",
  "zip": "Adm-Zip",
  "system_info": "Systeminformation",
  "process": "Child Process, PIDUsage"
}
```

### DevOps & Tools
```json
{
  "process_manager": "PM2",
  "web_server": "Nginx (Reverse Proxy)",
  "ssl": "Let's Encrypt",
  "version_control": "Git",
  "container": "Docker Ready",
  "monitoring": "PM2 Monit"
}
```

---

## SYSTEM REQUIREMENTS

### Minimum Requirements
```yaml
CPU: 2 cores @ 2.0 GHz
RAM: 2 GB
Storage: 20 GB SSD
OS: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
Network: 100 Mbps
Node.js: 16.0 or higher
MongoDB: 5.0 or higher
```

### Recommended Requirements
```yaml
CPU: 4 cores @ 2.5 GHz
RAM: 4 GB
Storage: 50 GB SSD
OS: Ubuntu 22.04 LTS
Network: 1 Gbps
Node.js: 18.0 or higher
MongoDB: 6.0 or higher
```

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 75+

---

## QUICK INSTALLATION

### One-Line Installation (Ubuntu/Debian)
```bash
# Clone and install in one command
git clone https://github.com/awais-cyber/awais-cyber-vps.git && cd awais-cyber-vps && npm install && mkdir -p uploads deployments backups logs && npm start
```

### 5-Minute Quick Start
```bash
# Step 1: Clone repository
git clone https://github.com/awais-cyber/awais-cyber-vps.git
cd awais-cyber-vps

# Step 2: Install dependencies
npm install

# Step 3: Start MongoDB
sudo systemctl start mongod  # Linux
# OR
brew services start mongodb-community  # macOS

# Step 4: Create directories
mkdir -p uploads deployments backups logs public

# Step 5: Start server
npm start

# Step 6: Access application
# Open browser: http://localhost:5000
# Login: admin@awaicyber.com / Admin@123456
```

---

## DETAILED INSTALLATION

### Prerequisites Check
```bash
# Check Node.js version
node --version
# Output should be: v16.0.0 or higher

# Check npm version
npm --version
# Output should be: 8.0.0 or higher

# Check MongoDB
mongod --version
# Output should be: v5.0.0 or higher
```

### Step 1: Install Node.js

**Ubuntu/Debian:**
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

**CentOS/RHEL:**
```bash
# Add NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
sudo yum install -y nodejs

# Verify
node --version
```

**macOS:**
```bash
# Using Homebrew
brew install node@18

# Add to PATH
echo 'export PATH="/usr/local/opt/node@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
node --version
```

**Windows:**
```bash
# Download installer from:
https://nodejs.org/

# Run installer and follow wizard
# Verify in Command Prompt:
node --version
```

### Step 2: Install MongoDB

**Ubuntu/Debian:**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

**macOS:**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB
brew services start mongodb-community

# Verify
brew services list
```

**Windows:**
```bash
# Download installer from:
https://www.mongodb.com/try/download/community

# Run installer (select Complete setup)
# MongoDB will run as a Windows service
```

### Step 3: Download Project

**Using Git:**
```bash
git clone https://github.com/awais-cyber/awais-cyber-vps.git
cd awais-cyber-vps
```

**Manual Download:**
```bash
# Download ZIP from GitHub
# Extract to your desired directory
cd awais-cyber-vps
```

### Step 4: Install Dependencies
```bash
# Install all npm packages
npm install

# Packages installed:
# - express@4.18.2
# - mongoose@8.0.0
# - jsonwebtoken@9.0.2
# - bcryptjs@2.4.3
# - socket.io@4.5.4
# - multer@1.4.5
# - adm-zip@0.5.10
# - helmet@7.1.0
# - cors@2.8.5
# - express-rate-limit@7.1.5
# - dotenv@16.3.1
# - nodemailer@6.9.7
# - systeminformation@5.21.22
# - fs-extra@11.1.1
# - compression@1.7.4
# - cookie-parser@1.4.6
# - express-session@1.17.3
```

### Step 5: Create Directories
```bash
# Create required directories
mkdir -p uploads deployments backups logs public

# Set permissions
chmod 755 uploads deployments backups logs public

# Create .env file
touch .env
```

### Step 6: Configure Environment
```bash
# Edit .env file with your settings
nano .env
# OR
vi .env
```

---

## CONFIGURATION

### Complete .env Configuration File

Create `.env` in root directory:

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=production

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Local MongoDB (no auth)
MONGODB_URI=mongodb://localhost:27017/awais-cyber-vps

# Remote MongoDB with auth
# MONGODB_URI=mongodb://username:password@remote-host:27017/awais-cyber-vps?authSource=admin

# MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/awais-cyber-vps

# ============================================
# JWT SECURITY (CHANGE THESE!)
# ============================================
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING_64_CHARS_LONG_123456789
JWT_REFRESH_SECRET=CHANGE_THIS_TO_ANOTHER_RANDOM_STRING_64_CHARS

# ============================================
# SESSION CONFIGURATION
# ============================================
SESSION_SECRET=CHANGE_THIS_SESSION_SECRET_KEY_32_CHARS

# ============================================
# EMAIL CONFIGURATION (For Password Reset)
# ============================================
# Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# SendGrid SMTP
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASS=your-sendgrid-api-key

# ============================================
# SECURITY SETTINGS
# ============================================
CSRF_SECRET=CHANGE_THIS_CSRF_SECRET_KEY
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100  # 100 requests per window

# ============================================
# FRONTEND URL
# ============================================
FRONTEND_URL=http://localhost:5000
# For production: https://your-domain.com

# ============================================
# ADMIN DEFAULTS (First Run Only)
# ============================================
ADMIN_EMAIL=admin@awaicyber.com
ADMIN_PASSWORD=Admin@123456

# ============================================
# UPLOAD LIMITS
# ============================================
MAX_FILE_SIZE=104857600  # 100MB
MAX_ZIP_SIZE=104857600   # 100MB
```

### Generate Secure Secrets
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate CSRF secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Email Setup (Gmail)
```bash
# 1. Enable 2-Factor Authentication on your Gmail
# 2. Go to: https://myaccount.google.com/apppasswords
# 3. Select "Mail" and "Other"
# 4. Name: "Awais Cyber VPS"
# 5. Copy generated 16-character password
# 6. Use that password in EMAIL_PASS
```

---

## RUNNING THE APPLICATION

### Development Mode
```bash
# Run with nodemon (auto-restart on changes)
npm run dev

# Output:
# MongoDB connected
# Server running on http://localhost:5000
```

### Production Mode
```bash
# Standard production start
npm start

# Output:
# MongoDB connected
# Server running on http://localhost:5000
```

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start backend/server.js --name awais-cyber-vps

# Check status
pm2 status

# Monitor in real-time
pm2 monit

# View logs
pm2 logs awais-cyber-vps

# Save PM2 configuration
pm2 save

# Enable startup on boot
pm2 startup

# Stop application
pm2 stop awais-cyber-vps

# Restart application
pm2 restart awais-cyber-vps

# Delete application
pm2 delete awais-cyber-vps
```

### Using Docker
```bash
# Build Docker image
docker build -t awais-cyber-vps .

# Run container
docker run -d -p 5000:5000 --name awais-vps awais-cyber-vps

# View logs
docker logs awais-vps

# Stop container
docker stop awais-vps

# Start container
docker start awais-vps

# Remove container
docker rm awais-vps
```

### Verify Installation
```bash
# Check if server is running
curl http://localhost:5000

# Check API health
curl http://localhost:5000/api/health

# Check MongoDB connection
curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@awaicyber.com","password":"Admin@123456"}'
```

---

## API DOCUMENTATION

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Register new user | `{username, email, password, fullName}` | User object + tokens |
| POST | `/api/auth/login` | Login user | `{email, password}` | User object + tokens |
| POST | `/api/auth/logout` | Logout user | - | Success message |
| POST | `/api/auth/refresh-token` | Refresh JWT | `{refreshToken}` | New tokens |
| POST | `/api/auth/forgot-password` | Request reset | `{email}` | Success message |
| POST | `/api/auth/reset-password` | Reset password | `{token, newPassword}` | Success message |
| GET | `/api/auth/verify-email` | Verify email | `?token=xxx` | Success message |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| PUT | `/api/users/change-password` | Change password | Yes |
| GET | `/api/users/resources` | Get resource limits | Yes |
| GET | `/api/users/usage` | Get current usage | Yes |

### Deployment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/deployments` | List all deployments | Yes |
| POST | `/api/deployments` | Create deployment | Yes |
| GET | `/api/deployments/:id` | Get deployment details | Yes |
| PUT | `/api/deployments/:id/start` | Start deployment | Yes |
| PUT | `/api/deployments/:id/stop` | Stop deployment | Yes |
| PUT | `/api/deployments/:id/restart` | Restart deployment | Yes |
| DELETE | `/api/deployments/:id` | Delete deployment | Yes |
| GET | `/api/deployments/:id/logs` | Get deployment logs | Yes |

### File Manager Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/files/list` | List files in directory | Yes |
| POST | `/api/files/upload` | Upload file | Yes |
| POST | `/api/files/folder` | Create folder | Yes |
| DELETE | `/api/files` | Delete file/folder | Yes |
| PUT | `/api/files/rename` | Rename file/folder | Yes |
| POST | `/api/files/move` | Move file/folder | Yes |
| POST | `/api/files/copy` | Copy file/folder | Yes |
| GET | `/api/files/download` | Download file | Yes |
| PUT | `/api/files/edit` | Edit file content | Yes |
| POST | `/api/files/extract` | Extract ZIP archive | Yes |

### Database Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/databases` | List databases | Yes |
| POST | `/api/databases` | Create database | Yes |
| DELETE | `/api/databases/:id` | Delete database | Yes |
| POST | `/api/databases/:id/backup` | Backup database | Yes |
| POST | `/api/databases/:id/restore` | Restore database | Yes |
| POST | `/api/databases/:id/export` | Export database | Yes |

### Domain Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/domains` | List domains | Yes |
| POST | `/api/domains` | Add domain | Yes |
| DELETE | `/api/domains/:id` | Remove domain | Yes |
| POST | `/api/domains/:id/ssl` | Enable SSL | Yes |
| GET | `/api/domains/:id/dns-status` | Check DNS status | Yes |

### Terminal Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/terminal/command` | Execute command | Yes |
| GET | `/api/terminal/metrics` | Get system metrics | Yes |
| GET | `/api/terminal/processes` | List processes | Yes |
| POST | `/api/terminal/kill-process` | Kill process | Yes |
| GET | `/api/terminal/logs` | Get system logs | Yes |

### Admin Endpoints (Admin Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users | Admin |
| POST | `/api/admin/users` | Create user | Admin |
| PUT | `/api/admin/users/:id/suspend` | Suspend user | Admin |
| PUT | `/api/admin/users/:id/activate` | Activate user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| GET | `/api/admin/statistics` | Get system stats | Admin |
| POST | `/api/admin/server/restart` | Restart server | Admin |
| GET | `/api/admin/logs` | Get system logs | Admin |

### API Response Examples

**Successful Login Response:**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user",
    "plan": "professional",
    "status": "active"
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid email or password"
}
```

**Deployment List Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "my-node-app",
    "type": "nodejs",
    "status": "running",
    "port": 3000,
    "domain": "app.example.com",
    "path": "/deployments/user123/my-node-app",
    "metrics": {
      "cpu": 2.5,
      "memory": 128000000,
      "requests": 1250
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## PROJECT STRUCTURE

```
awais-cyber-vps/
│
├── backend/                          # Backend source code
│   ├── controllers/                  # Business logic controllers
│   │   ├── authController.js        # Authentication logic
│   │   ├── userController.js        # User management
│   │   ├── deploymentController.js  # Deployment operations
│   │   ├── databaseController.js    # Database management
│   │   ├── domainController.js      # Domain management
│   │   ├── fileController.js        # File operations
│   │   ├── terminalController.js    # Terminal commands
│   │   ├── monitoringController.js  # System monitoring
│   │   ├── analyticsController.js   # Analytics & stats
│   │   └── adminController.js       # Admin functions
│   │
│   ├── models/                       # MongoDB models
│   │   ├── User.js                  # User schema
│   │   ├── Deployment.js            # Deployment schema
│   │   ├── Database.js              # Database schema
│   │   ├── Domain.js                # Domain schema
│   │   ├── Subdomain.js             # Subdomain schema
│   │   ├── Server.js                # Server schema
│   │   ├── Log.js                   # Logs schema
│   │   └── Analytics.js             # Analytics schema
│   │
│   ├── routes/                       # API routes
│   │   ├── auth.js                  # Authentication routes
│   │   ├── users.js                 # User routes
│   │   ├── deployments.js           # Deployment routes
│   │   ├── databases.js             # Database routes
│   │   ├── domains.js               # Domain routes
│   │   ├── subdomains.js            # Subdomain routes
│   │   ├── files.js                 # File manager routes
│   │   ├── terminal.js              # Terminal routes
│   │   ├── monitoring.js            # Monitoring routes
│   │   ├── analytics.js             # Analytics routes
│   │   └── admin.js                 # Admin routes
│   │
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.js                  # JWT authentication
│   │   ├── rateLimit.js             # Rate limiting
│   │   ├── validation.js            # Input validation
│   │   ├── security.js              # Security headers
│   │   ├── csrf.js                  # CSRF protection
│   │   ├── errorHandler.js          # Error handling
│   │   └── upload.js                # File upload handling
│   │
│   ├── services/                     # Business services
│   │   ├── emailService.js          # Email sending
│   │   ├── backupService.js         # Backup operations
│   │   ├── monitoringService.js     # System monitoring
│   │   └── deploymentService.js     # Deployment logic
│   │
│   ├── utils/                        # Utility functions
│   │   ├── helpers.js               # Helper functions
│   │   ├── constants.js             # Constants
│   │   └── validators.js            # Validation rules
│   │
│   └── server.js                     # Express server entry point
│
├── frontend/                         # Frontend source code
│   ├── css/
│   │   ├── style.css                # Main stylesheet
│   │   ├── dashboard.css            # Dashboard styles
│   │   ├── terminal.css             # Terminal styles
│   │   └── responsive.css           # Responsive design
│   │
│   ├── js/
│   │   ├── app.js                   # Main application
│   │   ├── auth.js                  # Authentication
│   │   ├── dashboard.js             # Dashboard logic
│   │   ├── deployments.js           # Deployment logic
│   │   ├── fileManager.js           # File manager logic
│   │   ├── database.js              # Database logic
│   │   ├── domain.js                # Domain logic
│   │   ├── terminal.js              # Terminal logic
│   │   ├── monitoring.js            # Monitoring logic
│   │   ├── analytics.js             # Analytics logic
│   │   └── admin.js                 # Admin panel logic
│   │
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── deployments.html
│   │   ├── file-manager.html
│   │   ├── databases.html
│   │   ├── domains.html
│   │   ├── terminal.html
│   │   ├── logs.html
│   │   ├── analytics.html
│   │   ├── settings.html
│   │   └── admin.html
│   │
│   └── index.html                    # Main HTML file
│
├── uploads/                          # User uploaded files
│   └── {userId}/
│       └── {filename}
│
├── deployments/                      # Deployed applications
│   └── {userId}/
│       └── {deploymentName}/
│           ├── app files...
│           └── logs/
│
├── backups/                          # Database backups
│   └── {database}/
│       └── backup-{date}.gz
│
├── logs/                             # System logs
│   ├── app.log                      # Application logs
│   ├── error.log                    # Error logs
│   └── access.log                   # Access logs
│
├── public/                           # Static assets
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
├── config/                           # Configuration files
│   ├── database.js                  # Database config
│   ├── passport.js                  # Passport config
│   └── socket.js                    # Socket.IO config
│
├── .env                              # Environment variables
├── .gitignore                        # Git ignore file
├── package.json                      # NPM dependencies
├── package-lock.json                 # Lock file
├── Dockerfile                        # Docker configuration
├── nginx.conf                        # Nginx configuration
├── pm2.config.js                     # PM2 configuration
└── README.md                         # Documentation
```

---

## DEPLOYMENT GUIDE

### Deploy on Linux VPS (Ubuntu 20.04/22.04)

#### Step 1: Connect to VPS
```bash
ssh root@your-server-ip
```

#### Step 2: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Step 3: Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 4: Install MongoDB
```bash
# Import MongoDB key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Step 5: Install Nginx
```bash
sudo apt install -y nginx
```

#### Step 6: Install PM2
```bash
sudo npm install -g pm2
```

#### Step 7: Clone and Setup Application
```bash
# Create directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
git clone https://github.com/awais-cyber/awais-cyber-vps.git
cd awais-cyber-vps

# Install dependencies
npm install

# Create directories
mkdir -p uploads deployments backups logs

# Set permissions
sudo chown -R $USER:$USER .

# Create .env file
nano .env
# Add your configuration
```

#### Step 8: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/awais-cyber-vps
```

Add this configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/awais-cyber-vps /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 9: Install SSL Certificate
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### Step 10: Start Application with PM2
```bash
# Start application
pm2 start backend/server.js --name awais-cyber-vps

# Save PM2 configuration
pm2 save

# Enable startup on boot
pm2 startup
```

#### Step 11: Configure Firewall
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

#### Step 12: Set Up Monitoring
```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs awais-cyber-vps

# System monitoring
htop
```

### Deploy with Docker

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads deployments backups logs

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: securepassword

  app:
    build: .
    restart: always
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://admin:securepassword@mongodb:27017/awais-cyber-vps?authSource=admin
      NODE_ENV: production
    volumes:
      - ./uploads:/app/uploads
      - ./deployments:/app/deployments
      - ./backups:/app/backups
      - ./logs:/app/logs

volumes:
  mongodb_data:
```

Run with Docker Compose:
```bash
docker-compose up -d
```

---

## SECURITY GUIDE

### Production Security Checklist

```bash
# 1. Change all default secrets
# Edit .env file with strong passwords

# 2. Enable HTTPS with valid SSL
sudo certbot --nginx -d your-domain.com

# 3. Set NODE_ENV=production
export NODE_ENV=production

# 4. Enable MongoDB authentication
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["root"]
})

# Update .env:
MONGODB_URI=mongodb://admin:strong-password@localhost:27017/awais-cyber-vps?authSource=admin

# 5. Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# 6. Regular security updates
sudo apt update && sudo apt upgrade -y
sudo unattended-upgrades

# 7. Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 8. Set proper file permissions
chmod 600 .env
chmod 755 uploads deployments backups logs

# 9. Enable PM2 logs rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# 10. Setup daily backups
crontab -e
# Add: 0 2 * * * mongodump --out /backup/$(date +\%Y\%m\%d)
```

### Security Headers (Automatically Applied)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### Rate Limiting
```javascript
// Default: 100 requests per 15 minutes per IP
// Login endpoint: 5 requests per minute
// API endpoints: 100 requests per 15 minutes
```

### Password Policy
- Minimum 6 characters
- Hashed with bcrypt (12 rounds)
- Never stored in plain text
- Password reset tokens expire in 1 hour

---

## TROUBLESHOOTING

### Common Issues and Solutions

#### Issue 1: MongoDB Connection Error
```bash
Error: MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Fix permission issues
sudo chown -R mongodb:mongodb /var/lib/mongodb
```

#### Issue 2: Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>

# Change port in .env
PORT=5001
```

#### Issue 3: Module Not Found
```bash
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Issue 4: Permission Denied
```bash
Error: EACCES: permission denied, mkdir './uploads'
```

**Solution:**
```bash
# Fix directory permissions
sudo chown -R $USER:$USER uploads deployments backups logs
chmod 755 uploads deployments backups logs
```

#### Issue 5: Memory Issues
```bash
Error: FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm start

# Or in PM2
pm2 start backend/server.js --node-args="--max-old-space-size=4096"
```

#### Issue 6: WebSocket Connection Failed
```bash
Error: WebSocket connection to 'ws://localhost:5000/socket.io/' failed
```

**Solution:**
Update Nginx configuration:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

#### Issue 7: 401 Unauthorized Error
```bash
Error: Unauthorized
```

**Solution:**
```javascript
// Check token in localStorage
console.log(localStorage.getItem('token'));

// Clear and relogin
localStorage.clear();
// Login again
```

#### Issue 8: Upload Failed - File Too Large
```bash
Error: File too large
```

**Solution:**
```bash
# Update .env
MAX_FILE_SIZE=209715200  # 200MB

# Update Nginx
client_max_body_size 200M;

# Restart Nginx
sudo systemctl restart nginx
```

---

## FAQ

### General Questions

**Q1: What are the minimum system requirements?**
A: 2GB RAM, 2 CPU cores, 20GB storage, Node.js 16+, MongoDB 5+.

**Q2: Can I deploy multiple applications?**
A: Yes! Each user can deploy unlimited applications based on their plan.

**Q3: How do I add a custom domain?**
A: Go to Domains → Add Domain → Enter domain → Point DNS to server IP → Enable SSL.

**Q4: How to backup my data?**
A: Automatic backups run daily at 2 AM. Manual backups via Database Manager.

**Q5: Can I migrate from other hosting?**
A: Yes, use File Manager to upload existing files and Database Manager for databases.

**Q6: How to monitor server health?**
A: Dashboard shows real-time CPU, RAM, Storage, and Network usage with charts.

**Q7: What happens if I exceed my plan limits?**
A: You'll receive notifications and can upgrade your plan anytime from Settings.

**Q8: Is SSH access available?**
A: Yes, Browser Terminal provides full command-line access.

**Q9: How to reset admin password?**
A: Use forgot password feature or directly in MongoDB.

**Q10: Can I use this for production?**
A: Absolutely! It's production-ready with security features and monitoring.

### Technical Questions

**Q11: What Node.js versions are supported?**
A: Node.js 16.x, 18.x, and 20.x are fully supported.

**Q12: Can I use PostgreSQL instead of MongoDB?**
A: No, MongoDB is required for the application data.

**Q13: How to scale the application?**
A: Use PM2 cluster mode or Docker with load balancer.

**Q14: What deployment types are supported?**
A: Node.js, Python, PHP, Static Websites, REST APIs.

**Q15: How to enable HTTPS?**
A: Use Let's Encrypt with Certbot: `sudo certbot --nginx`

**Q16: Can I use a CDN?**
A: Yes, you can configure Cloudflare or any CDN.

**Q17: How to update the application?**
A: `git pull` then `npm install` then `pm2 restart awais-cyber-vps`

**Q18: What databases can I create?**
A: MongoDB, MySQL, PostgreSQL, Redis.

**Q19: How to monitor logs?**
A: Use Logs page in dashboard or `pm2 logs` command.

**Q20: Is there an API rate limit?**
A: Yes, 100 requests per 15 minutes per IP.

---

## SUPPORT

### Get Help

| Channel | Link/Contact |
|---------|--------------|
| 📧 Email Support | support@awaicyber.com |
| 💬 Telegram Group | https://t.me/awaiscyber |
| 🐛 GitHub Issues | https://github.com/awais-cyber/awais-cyber-vps/issues |
| 📚 Documentation | https://docs.awaicyber.com |
| 🎥 Video Tutorials | https://youtube.com/@awaiscyber |
| 🌐 Website | https://awaicyber.com |

### Professional Support

For businesses requiring dedicated support:

**Standard Support ($99/month)**
- Response time: 24 hours
- Email support only
- Security updates
- Bug fixes

**Premium Support ($299/month)**
- Response time: 4 hours
- Email + Phone support
- Priority bug fixes
- Monthly security audit
- 99.9% uptime guarantee

**Enterprise Support (Custom Pricing)**
- Response time: 1 hour
- 24/7 dedicated support
- Custom features development
- On-premise deployment
- SLA agreement

**Contact for Professional Support:**
- Email: ceo@awaicyber.com
- Phone: +92-XXX-XXXXXXX

### Report Issues

When reporting issues, please include:
1. Error message (full log)
2. Steps to reproduce
3. Environment details:
   - OS version
   - Node.js version
   - MongoDB version
   - Browser version
4. Screenshots if applicable

---

## CONTRIBUTING

We welcome contributions!

### How to Contribute

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

### Development Setup
```bash
# Clone your fork
git clone https://github.com/your-username/awais-cyber-vps.git
cd awais-cyber-vps

# Install dependencies
npm install

# Start development server
npm run dev

# Make your changes
# Test thoroughly
# Commit and push
```

### Coding Standards
- Use ES6+ syntax
- Add comments for complex logic
- Follow existing code structure
- Write meaningful commit messages

---

## LICENSE

MIT License

```
MIT License

Copyright (c) 2026 Awais Cyber Gang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## ACKNOWLEDGMENTS

Special thanks to:

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.IO** - Realtime features
- **Chart.js** - Analytics charts
- **Font Awesome** - Icons
- **Google Fonts** - Inter font
- **All Contributors** - For their support

---

## CONTACT

**Developer:** Awais Cyber Gang
- **Email:** ceo@awaicyber.com
- **GitHub:** @awais-cyber
- **Twitter:** @awaiscyber
- **LinkedIn:** /in/awais-cyber

---

## QUICK COMMANDS REFERENCE

```bash
# Installation
git clone https://github.com/awais-cyber/awais-cyber-vps.git
cd awais-cyber-vps
npm install
mkdir -p uploads deployments backups logs

# Start
npm start                    # Production
npm run dev                  # Development

# PM2
pm2 start backend/server.js --name awais-vps
pm2 stop awais-vps
pm2 restart awais-vps
pm2 logs awais-vps
pm2 monit

# Database
mongodump --db awais-cyber-vps --out ./backup
mongorestore --db awais-cyber-vps ./backup/awais-cyber-vps

# Nginx
sudo nginx -t
sudo systemctl restart nginx

# MongoDB
sudo systemctl start mongod
sudo systemctl status mongod

# Firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Logs
tail -f logs/app.log
pm2 logs awais-vps
journalctl -u nginx -f
```

---

## FINAL NOTES

### Default Login Credentials
```
Email: admin@awaicyber.com
Password: Admin@123456
```

### Important URLs
- **Application:** http://localhost:5000
- **API Base:** http://localhost:5000/api
- **WebSocket:** ws://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### ⚠️ IMPORTANT WARNINGS
1. **Change default passwords immediately!**
2. **Enable HTTPS in production!**
3. **Regular backups are essential!**
4. **Keep system updated!**
5. **Monitor resource usage!**

---

<div align="center">

### ⭐ If you like this project, please give it a star! ⭐

**Built with ❤️ by Awais Cyber Gang**

**© 2026 Powerful VPS Hosting Platform**

[Report Bug](https://github.com/awais-cyber/awais-cyber-vps/issues) · [Request Feature](https://github.com/awais-cyber/awais-cyber-vps/issues) · [Support](https://t.me/awaiscyber)

</div>

---

**END OF README**
```

This is a **COMPLETE SINGLE README FILE** with everything you need! Just save it as `README.md` in your project root. No separate files needed! 🎉
