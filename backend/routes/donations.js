const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Donation } = require('../models');
const paypalService = require('../services/paypalService');

// Validation middleware for donation creation
const donationValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be at least $0.01'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters'),
  body('donationType')
    .optional()
    .isIn(['one-time', 'monthly', 'annual'])
    .withMessage('Donation type must be one-time, monthly, or annual')
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
 * POST /api/donations/create
 * Create a PayPal order for a donation
 */
router.post('/create', donationValidation, handleValidationErrors, async (req, res) => {
  try {
    const { amount, email, name, isAnonymous, message, donationType, userId } = req.body;

    // Create donation record with pending status
    const donation = await Donation.create({
      amount: parseFloat(amount),
      email,
      name: isAnonymous ? null : name,
      userId: userId || null,
      isAnonymous: isAnonymous || false,
      message: message || null,
      donationType: donationType || 'one-time',
      paymentStatus: 'pending',
      paymentProcessor: 'paypal'
    });

    // Create PayPal order
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/donation/success?donationId=${donation.id}`;
    const cancelUrl = `${baseUrl}/donation/cancel?donationId=${donation.id}`;

    const orderResult = await paypalService.createOrder({
      amount: parseFloat(amount),
      currency: 'USD',
      description: `Donation to Seeds of Hope${donationType && donationType !== 'one-time' ? ` (${donationType})` : ''}`,
      returnUrl,
      cancelUrl,
      customId: `donation-${donation.id}`
    });

    // Update donation with PayPal order ID
    await donation.update({
      paypalOrderId: orderResult.orderId
    });

    res.status(200).json({
      success: true,
      donationId: donation.id,
      orderId: orderResult.orderId,
      approvalUrl: orderResult.approvalUrl,
      message: 'Donation order created successfully. Redirect user to approvalUrl to complete payment.'
    });
  } catch (error) {
    console.error('Donation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/donations/capture
 * Capture a PayPal payment for a donation
 */
router.post('/capture', captureValidation, handleValidationErrors, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find donation by PayPal order ID
    const donation = await Donation.findOne({
      where: { paypalOrderId: orderId }
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found for this order'
      });
    }

    if (donation.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This donation has already been processed'
      });
    }

    // Capture PayPal order
    const captureResult = await paypalService.captureOrder(orderId);

    if (captureResult.transactionStatus === 'COMPLETED') {
      // Update donation with payment details
      await donation.update({
        paymentStatus: 'completed',
        paymentTransactionId: captureResult.transactionId,
        paymentDate: new Date(),
        paypalPayerId: captureResult.payerId,
        paypalEmail: captureResult.payerEmail
      });

      // TODO: Send receipt email to donor
      // TODO: Send notification email to admin

      res.status(200).json({
        success: true,
        message: 'Donation payment captured successfully',
        donation: {
          id: donation.id,
          amount: donation.amount,
          status: donation.paymentStatus,
          transactionId: donation.paymentTransactionId
        }
      });
    } else {
      // Payment not completed
      await donation.update({
        paymentStatus: 'failed'
      });

      res.status(400).json({
        success: false,
        message: 'Payment capture was not completed',
        status: captureResult.transactionStatus
      });
    }
  } catch (error) {
    console.error('Donation capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture donation payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/donations/:id
 * Get donation details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Return donation details (sanitize for public)
    res.status(200).json({
      success: true,
      donation: {
        id: donation.id,
        amount: donation.amount,
        paymentStatus: donation.paymentStatus,
        createdAt: donation.createdAt,
        // Only include name if not anonymous
        name: donation.isAnonymous ? null : donation.name
      }
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve donation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
