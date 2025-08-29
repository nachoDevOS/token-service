const tokenService = require('../services/tokenService');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const validation = await tokenService.validateToken(token);
    
    if (!validation.isValid) {
      return res.status(401).json({ error: 'Invalid token', reason: validation.reason });
    }

    req.tokenData = validation.data;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = authMiddleware;