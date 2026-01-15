const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Donor information (allow anonymous)
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Donor name (null for anonymous donations)'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Donor email address for receipt and communication (optional, PayPal email used if not provided)'
  },
  // Optional user connection (if donor is registered user)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Link to user account if donor is registered (optional)'
  },
  // Donation amount
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    },
    comment: 'Donation amount in dollars'
  },
  // Anonymous flag
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether this donation should be displayed anonymously'
  },
  // Payment processor integration
  paymentProcessor: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'paypal',
    comment: 'Payment processor used (paypal, stripe, etc.)'
  },
  paymentTransactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    comment: 'Transaction ID from payment processor'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date and time payment was completed'
  },
  // PayPal-specific fields
  paypalOrderId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'PayPal order ID'
  },
  paypalPayerId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'PayPal payer ID'
  },
  paypalEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'PayPal account email used for payment'
  },
  // Additional information
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional message from donor'
  },
  donationType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Type of donation (one-time, monthly, annual, etc.)'
  },
  recurringDonation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether this is a recurring donation'
  },
  recurringDonationId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID for recurring donation subscription if applicable'
  },
  // Receipt information
  receiptSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether receipt email has been sent'
  },
  receiptSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  taxReceiptNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Tax receipt number for tax-deductible donations'
  },
  requestTaxReceipt: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether the donor requested a tax receipt email'
  }
}, {
  tableName: 'donations',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['email']
    },
    {
      fields: ['paymentStatus']
    },
    {
      fields: ['paymentTransactionId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['isAnonymous']
    }
  ],
  hooks: {
    beforeCreate: (donation) => {
      // If anonymous, clear the name
      if (donation.isAnonymous) {
        donation.name = null;
      }
    },
    beforeUpdate: (donation) => {
      // If setting to anonymous, clear the name
      if (donation.changed('isAnonymous') && donation.isAnonymous) {
        donation.name = null;
      }
    }
  }
});

module.exports = Donation;
