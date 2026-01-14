const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'User who purchased the tickets (one-to-many relationship)'
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Event for which tickets were purchased (one-to-many relationship)'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    },
    comment: 'Number of tickets purchased in this transaction'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Price per ticket at time of purchase'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total amount paid (quantity * unitPrice)'
  },
  // Payment information
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Payment method used (paypal, credit_card, etc.)'
  },
  paymentTransactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Transaction ID from payment processor (e.g., PayPal)'
  },
  paypalOrderId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'PayPal order ID (before capture)'
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date and time payment was completed'
  },
  // Ticket codes/QR codes
  ticketCode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: 'Unique ticket code/identifier for verification'
  },
  // Additional information
  attendeeNames: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of attendee names if different from user'
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Special requests or accommodations'
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['eventId']
    },
    {
      fields: ['ticketCode']
    },
    {
      fields: ['paymentStatus']
    },
    {
      fields: ['userId', 'eventId']
    }
  ],
  hooks: {
    beforeCreate: (ticket) => {
      // Calculate total amount if not provided
      if (!ticket.totalAmount && ticket.quantity && ticket.unitPrice) {
        ticket.totalAmount = parseFloat((ticket.quantity * ticket.unitPrice).toFixed(2));
      }
      // Generate unique ticket code if not provided
      if (!ticket.ticketCode) {
        ticket.ticketCode = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      }
    },
    beforeUpdate: (ticket) => {
      // Recalculate total amount if quantity or unit price changed
      if (ticket.changed('quantity') || ticket.changed('unitPrice')) {
        ticket.totalAmount = parseFloat((ticket.quantity * ticket.unitPrice).toFixed(2));
      }
    }
  }
});

module.exports = Ticket;
