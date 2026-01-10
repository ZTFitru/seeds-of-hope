const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Date and time of the event'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'End date and time of the event (for multi-day events)'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Full address of the event location'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  zipCode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  venue: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Name of the venue'
  },
  // Ticket information
  maxCapacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maximum number of attendees'
  },
  ticketPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Price per ticket (0.00 for free events)'
  },
  // Event status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether the event is visible to public'
  },
  registrationOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  // Additional metadata
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to event image/banner'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Event category (e.g., Fundraiser, Workshop, Conference)'
  }
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['eventDate']
    },
    {
      fields: ['isPublished', 'isActive']
    }
  ]
});

module.exports = Event;
