const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true
  },
  systemId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'system_id'
  },
  microservice: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_valid'
  }
}, {
  tableName: 'tokens',
  timestamps: true,
  indexes: [
    {
      fields: ['token']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['system_id', 'microservice']
    }
  ]
});

module.exports = Token;