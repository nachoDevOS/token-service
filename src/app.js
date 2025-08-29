const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDatabases } = require('./config/database');
const { initializeSyncService } = require('./services/syncService');

// Importar rutas
const tokenRoutes = require('./routes/tokenRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/tokens', tokenRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Token Service is running' });
});

// Ruta de prueba básica
app.get('/', (req, res) => {
  res.json({ 
    message: 'Token Service API', 
    endpoints: {
      generate: 'POST /api/tokens/generate',
      validate: 'GET /api/tokens/validate',
      invalidate: 'POST /api/tokens/invalidate',
      validTokens: 'GET /api/tokens/valid-tokens'
    }
  });
});

// Inicializar bases de datos y servicios
async function startServer() {
  try {
    console.log('Connecting to databases...');
    await connectDatabases();
    
    console.log('Initializing sync service...');
    initializeSyncService();

    app.listen(PORT, () => {
      console.log(`✅ Token Service running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

startServer();