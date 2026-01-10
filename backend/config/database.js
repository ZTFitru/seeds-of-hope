const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance with connection pooling
const sequelize = new Sequelize(
  process.env.DB_NAME || 'seedsofhope_main',
  process.env.DB_USER || 'seedsofhope_gd',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'amelia.ducimus.digital',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    },
    timezone: '+00:00' // UTC timezone
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// Sync database (create tables if they don't exist)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: false });
    console.log('Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('Error synchronizing database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  syncDatabase
};
