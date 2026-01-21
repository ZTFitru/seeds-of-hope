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
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('If provided, email must be valid'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  body('requestTaxReceipt')
    .optional()
    .isBoolean()
    .withMessage('requestTaxReceipt must be a boolean'),
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
 * GET /api/donations/test
 * Test endpoint to verify routes are working
 */
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Donations route is working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/donations/total
 * Get the total amount of all completed donations
 */
router.get('/total', async (req, res) => {
  try {
    // Sum all completed donations
    const result = await Donation.sum('amount', {
      where: {
        paymentStatus: 'completed'
      }
    });

    const totalAmount = result ? parseFloat(result) : 0;

    res.status(200).json({
      success: true,
      totalAmount: totalAmount
    });
  } catch (error) {
    console.error('Get donation total error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve donation total',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/donations/create
 * Create a PayPal order for a donation
 */
router.post('/create', donationValidation, handleValidationErrors, async (req, res) => {
  let donation = null;
  try {
    const { amount, email, name, isAnonymous, requestTaxReceipt, message, donationType, userId } = req.body;

    console.log('Creating donation order with data:', {
      amount,
      email: email ? 'provided' : 'not provided',
      name: name ? 'provided' : 'not provided',
      isAnonymous,
      requestTaxReceipt,
      donationType
    });

    // Validate that if tax receipt is requested, name and email are provided
    if (requestTaxReceipt) {
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required when requesting a tax receipt'
        });
      }
    }

    // Create donation record with pending status
    try {
      donation = await Donation.create({
        amount: parseFloat(amount),
        email: email || null,
        name: isAnonymous ? null : (name || null),
        userId: userId || null,
        isAnonymous: isAnonymous || false,
        requestTaxReceipt: requestTaxReceipt || false,
        message: message || null,
        donationType: donationType || 'one-time',
        paymentStatus: 'pending',
        paymentProcessor: 'paypal'
      });
      console.log('Donation record created successfully:', donation.id);
    } catch (dbError) {
      console.error('Database error creating donation:', {
        message: dbError.message,
        name: dbError.name,
        stack: dbError.stack,
        errors: dbError.errors
      });
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Create PayPal order
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/donation/success?donationId=${donation.id}`;
    const cancelUrl = `${baseUrl}/donation/cancel?donationId=${donation.id}`;

    console.log('Creating PayPal order with:', {
      amount: parseFloat(amount),
      returnUrl,
      cancelUrl,
      donationId: donation.id
    });

    let orderResult;
    try {
      orderResult = await paypalService.createOrder({
        amount: parseFloat(amount),
        currency: 'USD',
        description: `Donation to Seeds of Hope${donationType && donationType !== 'one-time' ? ` (${donationType})` : ''}`,
        returnUrl,
        cancelUrl,
        customId: `donation-${donation.id}`
      });
      console.log('PayPal order created successfully:', orderResult.orderId);
    } catch (paypalError) {
      console.error('PayPal order creation error:', {
        message: paypalError.message,
        name: paypalError.name,
        stack: paypalError.stack
      });
      // If PayPal fails, try to clean up the donation record
      if (donation) {
        try {
          await donation.destroy();
          console.log('Cleaned up donation record after PayPal error');
        } catch (cleanupError) {
          console.error('Error cleaning up donation record:', cleanupError.message);
        }
      }
      throw new Error(`PayPal error: ${paypalError.message}`);
    }

    // Update donation with PayPal order ID
    try {
      await donation.update({
        paypalOrderId: orderResult.orderId
      });
      console.log('Donation updated with PayPal order ID');
    } catch (updateError) {
      console.error('Error updating donation with PayPal order ID:', {
        message: updateError.message,
        donationId: donation.id,
        orderId: orderResult.orderId
      });
      // Don't fail the request if update fails - order is still created
      // But log it for investigation
    }

    res.status(200).json({
      success: true,
      donationId: donation.id,
      orderId: orderResult.orderId,
      approvalUrl: orderResult.approvalUrl,
      message: 'Donation order created successfully. Redirect user to approvalUrl to complete payment.'
    });
  } catch (error) {
    console.error('Donation creation error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      donationId: donation?.id || null
    });
    
    // Provide more helpful error message
    let errorMessage = 'Failed to create donation order';
    if (error.message.includes('Database error')) {
      errorMessage = 'Database error while creating donation. Please check server logs.';
    } else if (error.message.includes('PayPal error')) {
      errorMessage = 'PayPal service error. Please check PayPal configuration and credentials.';
    } else if (error.message.includes('credentials')) {
      errorMessage = 'PayPal credentials not configured. Please check environment variables.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      // Include error type in production for better debugging
      errorType: error.name || 'UnknownError'
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
