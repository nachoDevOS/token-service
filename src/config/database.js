const { Sequelize } = require('sequelize');
const redis = require('redis');

// Configuración de MySQL
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Configuración de Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

const connectDatabases = async () => {
  try {
    // Conectar a MySQL
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');

    // Conectar a Redis
    await redisClient.connect();
    console.log('✅ Redis connected successfully.');

    // Sincronizar modelos (sin forzar)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  redisClient,
  connectDatabases,
  Sequelize
};