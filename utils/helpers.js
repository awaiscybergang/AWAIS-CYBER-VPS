const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

class Helpers {
  generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  generateAPIKey() {
    return `ak_${this.generateRandomString(32)}`;
  }

  generateSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  calculatePercentage(part, total) {
    if (total === 0) return 0;
    return (part / total) * 100;
  }

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  isValidDomain(domain) {
    const re = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return re.test(domain);
  }

  async ensureDirectory(dirPath) {
    await fs.ensureDir(dirPath);
  }

  async removeDirectory(dirPath) {
    if (await fs.pathExists(dirPath)) {
      await fs.remove(dirPath);
    }
  }

  async copyDirectory(source, destination) {
    await fs.copy(source, destination);
  }

  async moveDirectory(source, destination) {
    await fs.move(source, destination);
  }

  async readJSONFile(filePath) {
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    }
    return null;
  }

  async writeJSONFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  retry(fn, retries = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
      const attempt = (n) => {
        fn().then(resolve).catch((err) => {
          if (n > 0) {
            setTimeout(() => attempt(n - 1), delay);
          } else {
            reject(err);
          }
        });
      };
      attempt(retries);
    });
  }

  maskEmail(email) {
    const [local, domain] = email.split('@');
    const maskedLocal = local.slice(0, 2) + '***' + local.slice(-2);
    return `${maskedLocal}@${domain}`;
  }

  maskIP(ip) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.***.***.${parts[3]}`;
    }
    return ip;
  }

  generateDeploymentName(baseName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${baseName}-${timestamp}-${random}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  isZipFile(filename) {
    const ext = this.getFileExtension(filename);
    return ext.toLowerCase() === 'zip';
  }

  async streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}

module.exports = new Helpers();
