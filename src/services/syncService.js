const cron = require('node-cron');
const Token = require('../models/Token');
const { redisClient, Sequelize } = require('../config/database');
const tokenService = require('./tokenService');

class SyncService {
  constructor() {
    this.syncInterval = '*/5 * * * *'; // Cada 5 minutos
    this.cleanupInterval = '0 0 * * 0'; // Cada domingo a medianoche
  }

  initialize() {
    // Sincronizar Redis con base de datos periódicamente
    cron.schedule(this.syncInterval, () => {
      this.syncRedisWithDatabase();
    });

    // Limpiar tokens expirados semanalmente
    cron.schedule(this.cleanupInterval, () => {
      tokenService.cleanupExpiredTokens();
    });

    console.log('Sync service initialized');
  }

  async syncRedisWithDatabase() {
    try {
      console.log('Starting Redis-DB synchronization...');
      
      // Obtener todos los tokens válidos de la base de datos
      const validTokens = await Token.findAll({
        where: {
          isValid: true,
          expiresAt: { [Sequelize.Op.gt]: new Date() }
        }
      });

      // Sincronizar Redis
      for (const tokenDoc of validTokens) {
        await redisClient.set(`token:${tokenDoc.token}`, JSON.stringify({
          isValid: true,
          systemId: tokenDoc.systemId,
          microservice: tokenDoc.microservice,
          expiresAt: tokenDoc.expiresAt.toISOString()
        }));

        // Establecer expiración
        const ttl = Math.floor((tokenDoc.expiresAt - new Date()) / 1000);
        if (ttl > 0) {
          await redisClient.expire(`token:${tokenDoc.token}`, ttl);
        }
      }

      console.log(`Synchronized ${validTokens.length} tokens with Redis`);
    } catch (error) {
      console.error('Error during synchronization:', error);
    }
  }
}

// Función para inicializar el servicio
function initializeSyncService() {
  const syncService = new SyncService();
  syncService.initialize();
  return syncService;
}

module.exports = { SyncService, initializeSyncService };