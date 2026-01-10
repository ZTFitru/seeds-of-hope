const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EventSpeaker = sequelize.define('EventSpeaker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Name of the guest speaker or performer'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Professional title or role (e.g., CEO, Author, Musician)'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Biography or description of the speaker'
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to speaker image'
  },
  appearanceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'speaker',
    comment: 'Type of appearance (speaker, performer, guest, panelist, etc.)'
  },
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Scheduled time for this speaker/appearance within the event'
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Display order for listing speakers'
  }
}, {
  tableName: 'event_speakers',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['eventId']
    },
    {
      fields: ['eventId', 'order']
    }
  ]
});

module.exports = EventSpeaker;
