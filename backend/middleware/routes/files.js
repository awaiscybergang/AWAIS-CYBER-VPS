const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs-extra');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const getUserDir = (userId, dir = '') => {
  return path.join(__dirname, '../../deployments', userId.toString(), dir);
};

// List files
router.get('/list', authenticate, async (req, res) => {
  try {
    const { dir = '' } = req.query;
    const userDir = getUserDir(req.user._id, dir);
    
    await fs.ensureDir(userDir);
    const items = await fs.readdir(userDir);
    
    const files = [];
    for (const item of items) {
      const itemPath = path.join(userDir, item);
      const stat = await fs.stat(itemPath);
      files.push({
        name: item,
        path: path.join(dir, item),
        type: stat.isDirectory() ? 'directory' : 'file',
        size: stat.size,
        modified: stat.mtime
      });
    }
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload file
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { dir = '' } = req.body;
    const userDir = getUserDir(req.user._id, dir);
    
    await fs.ensureDir(userDir);
    
    if (req.file) {
      const targetPath = path.join(userDir, req.file.originalname);
      await fs.move(req.file.path, targetPath, { overwrite: true });
      res.json({ message: 'File uploaded', file: req.file.originalname });
    } else {
      res.status(400).json({ error: 'No file uploaded' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create folder
router.post('/folder', authenticate, async (req, res) => {
  try {
    const { dir = '', folderName } = req.body;
    const folderPath = getUserDir(req.user._id, path.join(dir, folderName));
    
    await fs.ensureDir(folderPath);
    res.json({ message: 'Folder created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete file/folder
router.delete('/', authenticate, async (req, res) => {
  try {
    const { path: filePath } = req.body;
    const fullPath = getUserDir(req.user._id, filePath);
    
    await fs.remove(fullPath);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rename file/folder
router.put('/rename', authenticate, async (req, res) => {
  try {
    const { oldPath, newName } = req.body;
    const fullOldPath = getUserDir(req.user._id, oldPath);
    const fullNewPath = path.join(path.dirname(fullOldPath), newName);
    
    await fs.move(fullOldPath, fullNewPath);
    res.json({ message: 'Renamed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move file/folder
router.post('/move', authenticate, async (req, res) => {
  try {
    const { source, destination } = req.body;
    const fullSource = getUserDir(req.user._id, source);
    const fullDest = getUserDir(req.user._id, destination);
    
    await fs.move(fullSource, fullDest);
    res.json({ message: 'Moved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download file
router.get('/download', authenticate, async (req, res) => {
  try {
    const { path: filePath } = req.query;
    const fullPath = getUserDir(req.user._id, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(fullPath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit file
router.put('/edit', authenticate, async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    const fullPath = getUserDir(req.user._id, filePath);
    
    await fs.writeFile(fullPath, content, 'utf8');
    res.json({ message: 'File saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract ZIP
router.post('/extract', authenticate, async (req, res) => {
  try {
    const { zipPath, extractTo = '' } = req.body;
    const fullZipPath = getUserDir(req.user._id, zipPath);
    const extractPath = getUserDir(req.user._id, extractTo);
    
    const zip = new AdmZip(fullZipPath);
    zip.extractAllTo(extractPath, true);
    
    res.json({ message: 'Extracted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
