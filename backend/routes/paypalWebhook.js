const express = require('express');
const router = express.Router();
const { Donation, Ticket } = require('../models');
const paypalService = require('../services/paypalService');

/**
 * POST /api/paypal/webhook
 * Handle PayPal webhook notifications
 * 
 * PayPal sends webhooks for various events like:
 * - PAYMENT.CAPTURE.COMPLETED
 * - PAYMENT.CAPTURE.DENIED
 * - PAYMENT.CAPTURE.REFUNDED
 * - CHECKOUT.ORDER.APPROVED
 * - etc.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature
    const isValid = await paypalService.verifyWebhook(req.headers, req.body);
    
    if (!isValid) {
      console.warn('Invalid PayPal webhook signature');
      return res.status(401).send('Unauthorized');
    }

    const webhookEvent = JSON.parse(req.body.toString());
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    console.log(`Received PayPal webhook: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(resource);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        await handlePaymentDenied(resource);
        break;
      
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(resource);
        break;
      
      case 'CHECKOUT.ORDER.APPROVED':
        // Order approved but not yet captured
        // You might want to automatically capture here
        console.log('Order approved:', resource.id);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    // Still return 200 to prevent PayPal from retrying
    res.status(200).json({ received: true, error: error.message });
  }
});

/**
 * Handle completed payment
 */
async function handlePaymentCompleted(resource) {
  const transactionId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;
  const amount = parseFloat(resource.amount?.value || 0);
  const payerEmail = resource.payer?.email_address;
  const payerId = resource.payer?.payer_id;

  console.log(`Payment completed: ${transactionId} for order ${orderId}`);

  // Update donation if exists
  const donation = await Donation.findOne({
    where: { paypalOrderId: orderId }
  });

  if (donation && donation.paymentStatus !== 'completed') {
    await donation.update({
      paymentStatus: 'completed',
      paymentTransactionId: transactionId,
      paymentDate: new Date(),
      paypalPayerId: payerId,
      paypalEmail: payerEmail
    });
    console.log(`Updated donation ${donation.id} to completed`);
    // TODO: Send receipt email
  }

  // Update ticket if exists (check by PayPal order ID)
  const ticket = await Ticket.findOne({
    where: { paypalOrderId: orderId }
  });

  if (ticket && ticket.paymentStatus !== 'completed') {
    await ticket.update({
      paymentStatus: 'completed',
      paymentTransactionId: transactionId, // Update to actual transaction ID
      paymentDate: new Date()
    });
    console.log(`Updated ticket ${ticket.id} to completed`);
    // TODO: Send confirmation email with ticket details
  }
}

/**
 * Handle denied/declined payment
 */
async function handlePaymentDenied(resource) {
  const transactionId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;

  console.log(`Payment denied: ${transactionId} for order ${orderId}`);

  // Update donation
  const donation = await Donation.findOne({
    where: { paypalOrderId: orderId }
  });

  if (donation) {
    await donation.update({
      paymentStatus: 'failed'
    });
    console.log(`Updated donation ${donation.id} to failed`);
  }

  // Update ticket
  const ticket = await Ticket.findOne({
    where: { paypalOrderId: orderId }
  });

  if (ticket) {
    await ticket.update({
      paymentStatus: 'failed'
    });
    console.log(`Updated ticket ${ticket.id} to failed`);
  }
}

/**
 * Handle refunded payment
 */
async function handlePaymentRefunded(resource) {
  const transactionId = resource.id;
  const refundId = resource.id; // In refund events, this is the refund ID

  console.log(`Payment refunded: ${transactionId}`);

  // Update donation
  const donation = await Donation.findOne({
    where: { paymentTransactionId: transactionId }
  });

  if (donation) {
    await donation.update({
      paymentStatus: 'refunded'
    });
    console.log(`Updated donation ${donation.id} to refunded`);
  }

  // Update ticket
  const ticket = await Ticket.findOne({
    where: { paymentTransactionId: transactionId }
  });

  if (ticket) {
    await ticket.update({
      paymentStatus: 'refunded'
    });
    console.log(`Updated ticket ${ticket.id} to refunded`);
  }
}

module.exports = router;
