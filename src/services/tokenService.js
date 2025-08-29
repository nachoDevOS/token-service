const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const { redisClient } = require('../config/database');

class TokenService {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-secret-key';
  }

  // Generar token semanal
  async generateWeeklyToken(systemId, microservice, payload = {}) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 1 semana

      const tokenPayload = {
        ...payload,
        systemId,
        microservice,
        exp: Math.floor(expiresAt.getTime() / 1000)
      };

      const token = jwt.sign(tokenPayload, this.secretKey);

      // Guardar en base de datos
      const tokenDoc = await Token.create({
        token,
        systemId,
        microservice,
        expiresAt,
        isValid: true
      });

      // Guardar en Redis para acceso rápido
      await redisClient.set(`token:${token}`, JSON.stringify({
        isValid: true,
        systemId,
        microservice,
        expiresAt: expiresAt.toISOString()
      }));

      // Establecer expiración en Redis
      await redisClient.expire(`token:${token}`, 7 * 24 * 60 * 60); // 7 días

      return { token, expiresAt };
    } catch (error) {
      throw new Error(`Error generating token: ${error.message}`);
    }
  }

  // Validar token
  async validateToken(token) {
    try {
      // Primero verificar en Redis (más rápido)
      const cachedToken = await redisClient.get(`token:${token}`);
      
      if (cachedToken) {
        const tokenData = JSON.parse(cachedToken);
        if (!tokenData.isValid || new Date(tokenData.expiresAt) < new Date()) {
          return { isValid: false, reason: 'Token expired or invalid' };
        }
        return { isValid: true, data: tokenData };
      }

      // Si no está en Redis, verificar en base de datos
      const tokenDoc = await Token.findOne({ 
        where: { token, isValid: true } 
      });
      
      if (!tokenDoc) {
        return { isValid: false, reason: 'Token not found' };
      }

      if (tokenDoc.expiresAt < new Date()) {
        // Marcar como inválido si está expirado
        await this.invalidateToken(token);
        return { isValid: false, reason: 'Token expired' };
      }

      // Verificar firma JWT
      try {
        jwt.verify(token, this.secretKey);
      } catch (jwtError) {
        await this.invalidateToken(token);
        return { isValid: false, reason: 'Invalid token signature' };
      }

      // Guardar en Redis para futuras consultas
      await redisClient.set(`token:${token}`, JSON.stringify({
        isValid: true,
        systemId: tokenDoc.systemId,
        microservice: tokenDoc.microservice,
        expiresAt: tokenDoc.expiresAt.toISOString()
      }));

      return { 
        isValid: true, 
        data: {
          systemId: tokenDoc.systemId,
          microservice: tokenDoc.microservice,
          expiresAt: tokenDoc.expiresAt
        }
      };
    } catch (error) {
      throw new Error(`Error validating token: ${error.message}`);
    }
  }

  // Invalidar token
  async invalidateToken(token) {
    try {
      // Marcar como inválido en base de datos
      await Token.update(
        { isValid: false, expiresAt: new Date() },
        { where: { token } }
      );

      // Invalidar en Redis
      await redisClient.set(`token:${token}`, JSON.stringify({
        isValid: false,
        expiresAt: new Date().toISOString()
      }));

      return true;
    } catch (error) {
      throw new Error(`Error invalidating token: ${error.message}`);
    }
  }

  // Obtener tokens válidos por sistema
  async getValidTokens(systemId, microservice = null) {
    const whereClause = { 
      systemId, 
      isValid: true, 
      expiresAt: { [Sequelize.Op.gt]: new Date() } 
    };

    if (microservice) {
      whereClause.microservice = microservice;
    }

    return await Token.findAll({ where: whereClause });
  }

  // Limpiar tokens expirados
  async cleanupExpiredTokens() {
    try {
      const result = await Token.update(
        { isValid: false },
        {
          where: {
            expiresAt: { [Sequelize.Op.lt]: new Date() },
            isValid: true
          }
        }
      );

      console.log(`Cleaned up ${result[0]} expired tokens`);
      return result[0];
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
    }
  }
}

module.exports = new TokenService();