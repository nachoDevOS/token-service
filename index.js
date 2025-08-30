const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDatabases } = require('./src/config/database');
const { initializeSyncService } = require('./src/services/syncService');

// Importar rutas
const tokenRoutes = require('./src/routes/tokenRoutes');

dotenv.config();


const app = express();
const PORT = process.env.APP_PORT;
const ENV = process.env.NODE_ENV;
const DOMAIN = process.env.APP_DOMAIN;
const NAME = process.env.APP_NAME;

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

// Inicializar el servidor según el entorno
const server = ENV === 'production'
  ? https.createServer({
      key: fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`),
      cert: fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/fullchain.pem`)
    }, app)
  : http.createServer(app);

// Inicializar bases de datos y servicios
async function startServer() {
  try {
    console.log('Connecting to databases...');
    await connectDatabases();

    console.log('Initializing sync service...');
    initializeSyncService();

    server.listen(PORT, () => {
      const protocol = ENV === 'production' ? 'HTTPS' : 'HTTP';
      console.log(`✅ ${NAME} (${protocol}) running on port ${PORT}`);
      if (ENV !== 'production') {
        console.log(`📍 Health check: http://localhost:${PORT}/health`);
      }
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