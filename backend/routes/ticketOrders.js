const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { TicketOrder, Ticket } = require('../models');

// Validation middleware for ticket order submission
const ticketOrderValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
  body('birthdate')
    .notEmpty()
    .withMessage('Birthdate is required')
    .isISO8601()
    .withMessage('Valid birthdate is required (YYYY-MM-DD format)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 0 || age > 150) {
        throw new Error('Invalid birthdate');
      }
      return true;
    }),
  body('mailingAddress')
    .trim()
    .notEmpty()
    .withMessage('Mailing address is required')
    .isLength({ max: 255 })
    .withMessage('Mailing address must be less than 255 characters'),
  body('mailingCity')
    .trim()
    .notEmpty()
    .withMessage('Mailing city is required')
    .isLength({ max: 100 })
    .withMessage('Mailing city must be less than 100 characters'),
  body('mailingState')
    .trim()
    .notEmpty()
    .withMessage('Mailing state is required')
    .isLength({ max: 50 })
    .withMessage('Mailing state must be less than 50 characters'),
  body('mailingZipCode')
    .trim()
    .notEmpty()
    .withMessage('Mailing ZIP code is required')
    .isLength({ max: 20 })
    .withMessage('Mailing ZIP code must be less than 20 characters'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ max: 20 })
    .withMessage('Phone number must be less than 20 characters'),
  body('textNumber')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Text number must be less than 20 characters'),
  body('preferredCommunication')
    .isIn(['text', 'email'])
    .withMessage('Preferred communication must be either "text" or "email"'),
  body('isGroupOrder')
    .optional()
    .isBoolean()
    .withMessage('isGroupOrder must be a boolean'),
  body('groupMembers')
    .optional()
    .isArray()
    .withMessage('Group members must be an array'),
  body('needsAirportTransportation')
    .optional()
    .isBoolean()
    .withMessage('needsAirportTransportation must be a boolean'),
  body('wantsCateredDinner')
    .optional()
    .isBoolean()
    .withMessage('wantsCateredDinner must be a boolean'),
  body('proteinRequests')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Protein requests must be less than 1000 characters'),
  body('foodAllergies')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Food allergies must be less than 1000 characters'),
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be less than 2000 characters')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * POST /api/ticket-orders
 * Create a new ticket order
 */
router.post('/', ticketOrderValidation, handleValidationErrors, async (req, res) => {
  try {
    const {
      name,
      email,
      birthdate,
      mailingAddress,
      mailingCity,
      mailingState,
      mailingZipCode,
      phoneNumber,
      textNumber,
      preferredCommunication,
      isGroupOrder,
      groupMembers,
      needsAirportTransportation,
      wantsCateredDinner,
      proteinRequests,
      foodAllergies,
      notes
    } = req.body;

    // Validate that if wantsCateredDinner is true, proteinRequests or foodAllergies should be provided
    // (This is a business rule, not a strict requirement, but we can add a warning)
    
    // Validate that if isGroupOrder is true, groupMembers should be provided
    if (isGroupOrder && (!groupMembers || !Array.isArray(groupMembers) || groupMembers.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Group members information is required when ordering for a group'
      });
    }

    // Create ticket order
    const ticketOrder = await TicketOrder.create({
      name,
      email,
      birthdate,
      mailingAddress,
      mailingCity,
      mailingState,
      mailingZipCode,
      phoneNumber,
      textNumber: textNumber || null,
      preferredCommunication: preferredCommunication || 'email',
      isGroupOrder: isGroupOrder || false,
      groupMembers: isGroupOrder && groupMembers ? groupMembers : null,
      needsAirportTransportation: needsAirportTransportation || false,
      wantsCateredDinner: wantsCateredDinner || false,
      proteinRequests: wantsCateredDinner ? (proteinRequests || null) : null,
      foodAllergies: wantsCateredDinner ? (foodAllergies || null) : null,
      notes: notes || null,
      status: 'submitted'
    });

    res.status(201).json({
      success: true,
      message: 'Ticket order submitted successfully',
      ticketOrder: {
        id: ticketOrder.id,
        name: ticketOrder.name,
        email: ticketOrder.email,
        status: ticketOrder.status,
        createdAt: ticketOrder.createdAt
      }
    });
  } catch (error) {
    console.error('Ticket order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ticket-orders/:id
 * Get ticket order details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const ticketOrder = await TicketOrder.findByPk(req.params.id, {
      include: [
        {
          model: Ticket,
          as: 'ticket',
          required: false
        }
      ]
    });

    if (!ticketOrder) {
      return res.status(404).json({
        success: false,
        message: 'Ticket order not found'
      });
    }

    res.status(200).json({
      success: true,
      ticketOrder: {
        id: ticketOrder.id,
        name: ticketOrder.name,
        email: ticketOrder.email,
        birthdate: ticketOrder.birthdate,
        mailingAddress: ticketOrder.mailingAddress,
        mailingCity: ticketOrder.mailingCity,
        mailingState: ticketOrder.mailingState,
        mailingZipCode: ticketOrder.mailingZipCode,
        phoneNumber: ticketOrder.phoneNumber,
        textNumber: ticketOrder.textNumber,
        preferredCommunication: ticketOrder.preferredCommunication,
        isGroupOrder: ticketOrder.isGroupOrder,
        groupMembers: ticketOrder.groupMembers,
        needsAirportTransportation: ticketOrder.needsAirportTransportation,
        wantsCateredDinner: ticketOrder.wantsCateredDinner,
        proteinRequests: ticketOrder.proteinRequests,
        foodAllergies: ticketOrder.foodAllergies,
        notes: ticketOrder.notes,
        status: ticketOrder.status,
        ticketId: ticketOrder.ticketId,
        createdAt: ticketOrder.createdAt,
        updatedAt: ticketOrder.updatedAt
      }
    });
  } catch (error) {
    console.error('Get ticket order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ticket-orders
 * Get all ticket orders (with optional filtering)
 */
router.get('/', async (req, res) => {
  try {
    const { status, email } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (email) {
      where.email = email;
    }

    const ticketOrders = await TicketOrder.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: req.query.limit ? parseInt(req.query.limit) : 100
    });

    res.status(200).json({
      success: true,
      count: ticketOrders.length,
      ticketOrders: ticketOrders.map(order => ({
        id: order.id,
        name: order.name,
        email: order.email,
        status: order.status,
        isGroupOrder: order.isGroupOrder,
        wantsCateredDinner: order.wantsCateredDinner,
        needsAirportTransportation: order.needsAirportTransportation,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    console.error('Get ticket orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
