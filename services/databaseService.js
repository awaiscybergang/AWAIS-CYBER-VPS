const { exec } = require('child_process');
const util = require('util');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
const Database = require('../models/Database');

const execPromise = util.promisify(exec);

class DatabaseService {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.backupDir);
  }

  async createDatabase(userId, dbData) {
    try {
      const database = new Database({
        userId,
        ...dbData,
        status: 'active',
        createdAt: new Date()
      });
      
      await database.save();
      logger.info(`Database created: ${dbData.name} for user ${userId}`);
      
      return database;
    } catch (error) {
      logger.error('Error creating database:', error);
      throw error;
    }
  }

  async deleteDatabase(databaseId, userId) {
    try {
      const database = await Database.findOne({ _id: databaseId, userId });
      if (!database) {
        throw new Error('Database not found');
      }
      
      await database.deleteOne();
      logger.info(`Database deleted: ${database.name}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting database:', error);
      throw error;
    }
  }

  async backupDatabase(databaseId, userId) {
    try {
      const database = await Database.findOne({ _id: databaseId, userId });
      if (!database) {
        throw new Error('Database not found');
      }
      
      const timestamp = Date.now();
      const backupFileName = `${database.name}_backup_${timestamp}.gz`;
      const backupPath = path.join(this.backupDir, backupFileName);
      
      database.status = 'backing_up';
      await database.save();
      
      // Simulate backup - in production, use mongodump
      await fs.writeFile(backupPath, `Backup of ${database.name} at ${new Date()}`);
      
      database.status = 'active';
      if (!database.backupSchedule) {
        database.backupSchedule = {};
      }
      database.backupSchedule.lastBackup = new Date();
      await database.save();
      
      logger.info(`Database backup created: ${backupFileName}`);
      
      return {
        success: true,
        backupFile: backupFileName,
        path: backupPath
      };
    } catch (error) {
      logger.error('Error backing up database:', error);
      if (databaseId) {
        const database = await Database.findById(databaseId);
        if (database) {
          database.status = 'active';
          await database.save();
        }
      }
      throw error;
    }
  }

  async restoreDatabase(databaseId, userId, backupFile) {
    try {
      const database = await Database.findOne({ _id: databaseId, userId });
      if (!database) {
        throw new Error('Database not found');
      }
      
      database.status = 'restoring';
      await database.save();
      
      // Simulate restore - in production, use mongorestore
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      database.status = 'active';
      await database.save();
      
      logger.info(`Database restored: ${database.name}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error restoring database:', error);
      if (databaseId) {
        const database = await Database.findById(databaseId);
        if (database) {
          database.status = 'active';
          await database.save();
        }
      }
      throw error;
    }
  }

  async exportDatabase(databaseId, userId, format = 'json') {
    try {
      const database = await Database.findOne({ _id: databaseId, userId });
      if (!database) {
        throw new Error('Database not found');
      }
      
      const exportFile = path.join(this.backupDir, `${database.name}_export.${format}`);
      
      // Simulate export
      const exportData = {
        database: database.name,
        type: database.type,
        exportDate: new Date(),
        data: `Sample data for ${database.name}`
      };
      
      await fs.writeFile(exportFile, JSON.stringify(exportData, null, 2));
      
      logger.info(`Database exported: ${exportFile}`);
      
      return {
        success: true,
        exportFile,
        downloadUrl: `/backups/${path.basename(exportFile)}`
      };
    } catch (error) {
      logger.error('Error exporting database:', error);
      throw error;
    }
  }

  async importDatabase(databaseId, userId, importFile) {
    try {
      const database = await Database.findOne({ _id: databaseId, userId });
      if (!database) {
        throw new Error('Database not found');
      }
      
      // Simulate import
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logger.info(`Database imported: ${database.name}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error importing database:', error);
      throw error;
    }
  }

  async getDatabaseStats(databaseId, userId) {
    try {
      const database = await Database.findOne({ _id: databaseId, userId });
      if (!database) {
        throw new Error('Database not found');
      }
      
      // Get actual stats from database system
      const stats = {
        size: database.size || 0,
        collections: 0,
        documents: 0,
        indexes: 0
      };
      
      return stats;
    } catch (error) {
      logger.error('Error getting database stats:', error);
      throw error;
    }
  }

  async getAllDatabases(userId) {
    try {
      const databases = await Database.find({ userId });
      return databases;
    } catch (error) {
      logger.error('Error getting databases:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();
