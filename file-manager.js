const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const userPath = path.join(__dirname, '../uploads', req.user.id);
      await fs.ensureDir(userPath);
      cb(null, userPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// List files in directory
const listFiles = async (req, res) => {
  try {
    const { dir = '/' } = req.query;
    const userDir = path.join(__dirname, '../deployments', req.user.id, dir);
    
    if (!fs.existsSync(userDir)) {
      await fs.ensureDir(userDir);
    }
    
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
        modified: stat.mtime,
        permissions: stat.mode
      });
    }
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload file
const uploadFile = async (req, res) => {
  try {
    const { dir = '/' } = req.body;
    const uploadDir = path.join(__dirname, '../deployments', req.user.id, dir);
    await fs.ensureDir(uploadDir);
    
    upload.single('file')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      
      const targetPath = path.join(uploadDir, req.file.originalname);
      await fs.move(req.file.path, targetPath, { overwrite: true });
      
      res.json({ message: 'File uploaded successfully', file: req.file.originalname });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create folder
const createFolder = async (req, res) => {
  try {
    const { dir = '/', folderName } = req.body;
    const folderPath = path.join(__dirname, '../deployments', req.user.id, dir, folderName);
    
    await fs.ensureDir(folderPath);
    res.json({ message: 'Folder created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete file or folder
const deleteFile = async (req, res) => {
  try;
  const { path: filePath } = req.body;
  const fullPath = path.join(__dirname, '../deployments', req.user.id, filePath);
  
  if (!fullPath.startsWith(path.join(__dirname, '../deployments', req.user.id))) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  await fs.remove(fullPath);
  res.json({ message: 'Deleted successfully' });
} catch (error) {
  res.status(500).json({ error: error.message });
}

// Rename file or folder
const renameFile = async (req, res) => {
  try {
    const { oldPath, newName } = req.body;
    const fullOldPath = path.join(__dirname, '../deployments', req.user.id, oldPath);
    const fullNewPath = path.join(path.dirname(fullOldPath), newName);
    
    await fs.move(fullOldPath, fullNewPath);
    res.json({ message: 'Renamed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Move file or folder
const moveFile = async (req, res) => {
  try {
    const { source, destination } = req.body;
    const fullSource = path.join(__dirname, '../deployments', req.user.id, source);
    const fullDest = path.join(__dirname, '../deployments', req.user.id, destination);
    
    await fs.move(fullSource, fullDest);
    res.json({ message: 'Moved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Copy file or folder
const copyFile = async (req, res) => {
  try {
    const { source, destination } = req.body;
    const fullSource = path.join(__dirname, '../deployments', req.user.id, source);
    const fullDest = path.join(__dirname, '../deployments', req.user.id, destination);
    
    await fs.copy(fullSource, fullDest);
    res.json({ message: 'Copied successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const { path: filePath } = req.query;
    const fullPath = path.join(__dirname, '../deployments', req.user.id, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(fullPath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit file content
const editFile = async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    const fullPath = path.join(__dirname, '../deployments', req.user.id, filePath);
    
    await fs.writeFile(fullPath, content, 'utf8');
    res.json({ message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Extract ZIP file
const extractZip = async (req, res) => {
  try {
    const { zipPath, extractTo = '/' } = req.body;
    const fullZipPath = path.join(__dirname, '../deployments', req.user.id, zipPath);
    const extractPath = path.join(__dirname, '../deployments', req.user.id, extractTo);
    
    const zip = new AdmZip(fullZipPath);
    zip.extractAllTo(extractPath, true);
    
    res.json({ message: 'Extracted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get file content
const getFileContent = async (req, res) => {
  try {
    const { path: filePath } = req.query;
    const fullPath = path.join(__dirname, '../deployments', req.user.id, filePath);
    
    const content = await fs.readFile(fullPath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listFiles,
  uploadFile,
  createFolder,
  deleteFile,
  renameFile,
  moveFile,
  copyFile,
  downloadFile,
  editFile,
  extractZip,
  getFileContent
};
