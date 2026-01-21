const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TicketOrder = sequelize.define('TicketOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Contact information
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Full name of the ticket purchaser'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    },
    comment: 'Email address for communication'
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date of birth (required for age verification)'
  },
  // Mailing address
  mailingAddress: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Street address'
  },
  mailingCity: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'City'
  },
  mailingState: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'State or province'
  },
  mailingZipCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'ZIP or postal code'
  },
  // Phone information
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Primary phone number'
  },
  textNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Text number if different from phone number (optional)'
  },
  preferredCommunication: {
    type: DataTypes.ENUM('text', 'email'),
    allowNull: false,
    defaultValue: 'email',
    comment: 'Preferred method of communication'
  },
  // Group ordering
  isGroupOrder: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether this is an order for multiple people'
  },
  groupMembers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of group member information if isGroupOrder is true'
  },
  // Additional services
  needsAirportTransportation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether the visitor needs airport transportation arrangements'
  },
  wantsCateredDinner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether the visitor wants a catered dinner'
  },
  // Catered dinner details (only if wantsCateredDinner is true)
  proteinRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Protein requests for catered dinner'
  },
  foodAllergies: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Food allergies or dietary restrictions'
  },
  // Order status
  status: {
    type: DataTypes.ENUM('pending', 'submitted', 'processing', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'Status of the ticket order'
  },
  // Optional link to Ticket record after payment
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tickets',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Link to ticket record after payment is completed'
  },
  // Additional notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes or special requests'
  }
}, {
  tableName: 'ticket_orders',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['ticketId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = TicketOrder;
