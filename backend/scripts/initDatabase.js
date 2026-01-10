/**
 * Database Initialization Script
 * 
 * This script initializes the database by:
 * 1. Testing the connection
 * 2. Creating all tables based on models
 * 3. Setting up relationships
 * 
 * Usage: node scripts/initDatabase.js [--force]
 * 
 * --force: Drops all existing tables and recreates them (USE WITH CAUTION)
 */

require('dotenv').config();
const { sequelize, testConnection, syncDatabase } = require('../config/database');
const models = require('../models');

const force = process.argv.includes('--force');

async function initializeDatabase() {
  console.log('Starting database initialization...');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_NAME || 'seedsofhope_main'}`);
  console.log(`Host: ${process.env.DB_HOST || 'amelia.ducimus.digital'}`);
  
  if (force) {
    console.warn('⚠️  WARNING: --force flag is set. This will DROP ALL EXISTING TABLES!');
    console.warn('Press Ctrl+C within 5 seconds to cancel...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  try {
    // Test connection
    console.log('\n1. Testing database connection...');
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to database. Please check your credentials.');
      process.exit(1);
    }

    // Sync database (create tables)
    console.log('\n2. Synchronizing database schema...');
    if (force) {
      console.log('   (Force mode: Dropping existing tables)');
    }
    
    const synced = await syncDatabase(force);
    if (!synced) {
      console.error('Failed to synchronize database.');
      process.exit(1);
    }

    // Verify tables were created
    console.log('\n3. Verifying tables...');
    const [results] = await sequelize.query("SHOW TABLES");
    const tableNames = results.map(row => Object.values(row)[0]);
    console.log(`   Found ${tableNames.length} tables:`);
    tableNames.forEach(table => {
      console.log(`   - ${table}`);
    });

    // Expected tables
    const expectedTables = ['users', 'events', 'event_speakers', 'tickets', 'donations'];
    const missingTables = expectedTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.warn(`\n⚠️  Warning: Some expected tables are missing: ${missingTables.join(', ')}`);
    } else {
      console.log('\n✅ All expected tables are present!');
    }

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nYou can now start the server and use the API endpoints.');
    
  } catch (error) {
    console.error('\n❌ Error during database initialization:');
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run initialization
initializeDatabase();
