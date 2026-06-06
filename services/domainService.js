const dns = require('dns');
const util = require('util');
const logger = require('../utils/logger');
const Domain = require('../models/Domain');
const Deployment = require('../models/Deployment');

const resolveMX = util.promisify(dns.resolveMx);
const resolveA = util.promisify(dns.resolveA);

class DomainService {
  async addDomain(userId, domainData) {
    try {
      const existingDomain = await Domain.findOne({ domain: domainData.domain });
      if (existingDomain) {
        throw new Error('Domain already exists');
      }
      
      const domain = new Domain({
        userId,
        ...domainData,
        status: 'pending',
        dnsStatus: 'pending',
        createdAt: new Date()
      });
      
      await domain.save();
      logger.info(`Domain added: ${domainData.domain} for user ${userId}`);
      
      // Start DNS verification
      this.verifyDNS(domain._id);
      
      return domain;
    } catch (error) {
      logger.error('Error adding domain:', error);
      throw error;
    }
  }

  async removeDomain(domainId, userId) {
    try {
      const domain = await Domain.findOne({ _id: domainId, userId });
      if (!domain) {
        throw new Error('Domain not found');
      }
      
      await domain.deleteOne();
      logger.info(`Domain removed: ${domain.domain}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error removing domain:', error);
      throw error;
    }
  }

  async createSubdomain(userId, domainId, subdomainData) {
    try {
      const parentDomain = await Domain.findOne({ _id: domainId, userId });
      if (!parentDomain) {
        throw new Error('Parent domain not found');
      }
      
      const fullSubdomain = `${subdomainData.subdomain}.${parentDomain.domain}`;
      
      const subdomain = new Domain({
        userId,
        domain: fullSubdomain,
        deploymentId: subdomainData.deploymentId,
        status: 'active',
        dnsStatus: 'pending',
        isSubdomain: true,
        parentDomain: parentDomain._id,
        createdAt: new Date()
      });
      
      await subdomain.save();
      logger.info(`Subdomain created: ${fullSubdomain}`);
      
      return subdomain;
    } catch (error) {
      logger.error('Error creating subdomain:', error);
      throw error;
    }
  }

  async deleteSubdomain(subdomainId, userId) {
    try {
      const subdomain = await Domain.findOne({ _id: subdomainId, userId });
      if (!subdomain) {
        throw new Error('Subdomain not found');
      }
      
      await subdomain.deleteOne();
      logger.info(`Subdomain deleted: ${subdomain.domain}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting subdomain:', error);
      throw error;
    }
  }

  async enableSSL(domainId, userId) {
    try {
      const domain = await Domain.findOne({ _id: domainId, userId });
      if (!domain) {
        throw new Error('Domain not found');
      }
      
      domain.sslEnabled = true;
      domain.sslExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
      await domain.save();
      
      logger.info(`SSL enabled for domain: ${domain.domain}`);
      
      return { success: true, expiry: domain.sslExpiry };
    } catch (error) {
      logger.error('Error enabling SSL:', error);
      throw error;
    }
  }

  async verifyDNS(domainId) {
    try {
      const domain = await Domain.findById(domainId);
      if (!domain) {
        return;
      }
      
      // Verify A record
      try {
        const addresses = await resolveA(domain.domain);
        if (addresses && addresses.length > 0) {
          domain.dnsStatus = 'verified';
          domain.status = 'active';
          await domain.save();
          logger.info(`DNS verified for domain: ${domain.domain}`);
        }
      } catch (error) {
        domain.dnsStatus = 'failed';
        await domain.save();
        logger.warn(`DNS verification failed for ${domain.domain}:`, error);
      }
    } catch (error) {
      logger.error('Error in DNS verification:', error);
    }
  }

  async checkDNSStatus(domainId, userId) {
    try {
      const domain = await Domain.findOne({ _id: domainId, userId });
      if (!domain) {
        throw new Error('Domain not found');
      }
      
      await this.verifyDNS(domainId);
      
      const updatedDomain = await Domain.findById(domainId);
      
      return {
        status: updatedDomain.dnsStatus,
        verified: updatedDomain.dnsStatus === 'verified',
        lastCheck: new Date()
      };
    } catch (error) {
      logger.error('Error checking DNS status:', error);
      throw error;
    }
  }

  async getAllDomains(userId) {
    try {
      const domains = await Domain.find({ userId, isSubdomain: { $ne: true } })
        .populate('deploymentId');
      return domains;
    } catch (error) {
      logger.error('Error getting domains:', error);
      throw error;
    }
  }

  async getAllSubdomains(userId) {
    try {
      const subdomains = await Domain.find({ userId, isSubdomain: true })
        .populate('deploymentId')
        .populate('parentDomain');
      return subdomains;
    } catch (error) {
      logger.error('Error getting subdomains:', error);
      throw error;
    }
  }

  async getDomainByDeployment(deploymentId) {
    try {
      const domain = await Domain.findOne({ deploymentId });
      return domain;
    } catch (error) {
      logger.error('Error getting domain by deployment:', error);
      throw error;
    }
  }
}

module.exports = new DomainService();
