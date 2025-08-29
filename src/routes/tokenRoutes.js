const express = require('express');
const tokenService = require('../services/tokenService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Generar nuevo token semanal
router.post('/generate', async (req, res) => {
  try {
    const { systemId, microservice, payload } = req.body;
    
    if (!systemId || !microservice) {
      return res.status(400).json({ error: 'systemId and microservice are required' });
    }

    const { token, expiresAt } = await tokenService.generateWeeklyToken(systemId, microservice, payload);
    
    res.json({
      success: true,
      token,
      expiresAt,
      message: 'Token generated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validar token
router.get('/validate', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const validation = await tokenService.validateToken(token);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invalidar token
router.post('/invalidate', authMiddleware, async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    await tokenService.invalidateToken(token);
    res.json({ success: true, message: 'Token invalidated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener tokens válidos
router.get('/valid-tokens', authMiddleware, async (req, res) => {
  try {
    const { systemId, microservice } = req.query;
    const tokens = await tokenService.getValidTokens(systemId, microservice);
    res.json({ tokens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;