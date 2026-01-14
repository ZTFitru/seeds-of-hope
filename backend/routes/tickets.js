const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Ticket, Event, User } = require('../models');
const paypalService = require('../services/paypalService');

// Validation middleware for ticket purchase
const ticketPurchaseValidation = [
  body('eventId')
    .isInt({ min: 1 })
    .withMessage('Valid event ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required if provided'),
  body('attendeeNames')
    .optional()
    .isArray()
    .withMessage('Attendee names must be an array'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests must be less than 500 characters')
];

// Validation middleware for payment capture
const captureValidation = [
  body('orderId')
    .notEmpty()
    .trim()
    .withMessage('PayPal order ID is required')
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
 * POST /api/tickets/purchase
 * Create a PayPal order for ticket purchase
 */
router.post('/purchase', ticketPurchaseValidation, handleValidationErrors, async (req, res) => {
  try {
    const { eventId, quantity, userId, attendeeNames, specialRequests } = req.body;

    // Verify event exists and get ticket price
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event has tickets available (if there's a capacity limit)
    // TODO: Add capacity checking logic if events have ticket limits

    // Calculate total amount
    const unitPrice = parseFloat(event.ticketPrice || 0);
    if (unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Event does not have a valid ticket price'
      });
    }

    const totalAmount = parseFloat((quantity * unitPrice).toFixed(2));

    // If userId is provided, verify user exists
    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } else {
      // For guest purchases, you might want to require email or other info
      // For now, we'll allow it but note that userId will be null
    }

    // Create ticket record with pending status
    const ticket = await Ticket.create({
      userId: userId || null,
      eventId,
      quantity: parseInt(quantity),
      unitPrice,
      totalAmount,
      paymentStatus: 'pending',
      paymentMethod: 'paypal',
      attendeeNames: attendeeNames || null,
      specialRequests: specialRequests || null
    });

    // Create PayPal order
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/tickets/success?ticketId=${ticket.id}`;
    const cancelUrl = `${baseUrl}/tickets/cancel?ticketId=${ticket.id}`;

    const orderResult = await paypalService.createOrder({
      amount: totalAmount,
      currency: 'USD',
      description: `${quantity} ticket(s) for ${event.title || 'Event'}`,
      returnUrl,
      cancelUrl,
      customId: `ticket-${ticket.id}`
    });

    // Update ticket with PayPal order ID
    await ticket.update({
      paypalOrderId: orderResult.orderId
    });

    res.status(200).json({
      success: true,
      ticketId: ticket.id,
      orderId: orderResult.orderId,
      approvalUrl: orderResult.approvalUrl,
      totalAmount,
      message: 'Ticket order created successfully. Redirect user to approvalUrl to complete payment.'
    });
  } catch (error) {
    console.error('Ticket purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/tickets/capture
 * Capture a PayPal payment for ticket purchase
 */
router.post('/capture', captureValidation, handleValidationErrors, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find ticket by PayPal order ID
    const ticket = await Ticket.findOne({
      where: { paypalOrderId: orderId },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found for this order'
      });
    }

    if (ticket.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This ticket purchase has already been processed'
      });
    }

    // Capture PayPal order
    const captureResult = await paypalService.captureOrder(orderId);

    if (captureResult.transactionStatus === 'COMPLETED') {
      // Update ticket with payment details
      await ticket.update({
        paymentStatus: 'completed',
        paymentTransactionId: captureResult.transactionId, // Now store actual transaction ID
        paymentDate: new Date()
      });

      // TODO: Send confirmation email with ticket details
      // TODO: Send notification email to admin
      // TODO: Generate QR codes or ticket codes if needed

      res.status(200).json({
        success: true,
        message: 'Ticket payment captured successfully',
        ticket: {
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          quantity: ticket.quantity,
          totalAmount: ticket.totalAmount,
          status: ticket.paymentStatus,
          transactionId: ticket.paymentTransactionId,
          event: ticket.event ? {
            id: ticket.event.id,
            title: ticket.event.title
          } : null
        }
      });
    } else {
      // Payment not completed
      await ticket.update({
        paymentStatus: 'failed'
      });

      res.status(400).json({
        success: false,
        message: 'Payment capture was not completed',
        status: captureResult.transactionStatus
      });
    }
  } catch (error) {
    console.error('Ticket capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture ticket payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/tickets/:id
 * Get ticket details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        quantity: ticket.quantity,
        unitPrice: ticket.unitPrice,
        totalAmount: ticket.totalAmount,
        paymentStatus: ticket.paymentStatus,
        attendeeNames: ticket.attendeeNames,
        specialRequests: ticket.specialRequests,
        createdAt: ticket.createdAt,
        event: ticket.event ? {
          id: ticket.event.id,
          title: ticket.event.title,
          date: ticket.event.date
        } : null,
        user: ticket.user ? {
          id: ticket.user.id,
          email: ticket.user.email,
          name: `${ticket.user.firstName} ${ticket.user.lastName}`
        } : null
      }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
