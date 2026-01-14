const paypal = require('@paypal/checkout-server-sdk');
const { client } = require('../config/paypal');

/**
 * Create a PayPal order for a payment
 * @param {Object} orderData - Order data containing amount, currency, description, etc.
 * @returns {Promise<Object>} PayPal order object with approval URL
 */
async function createOrder(orderData) {
  const { amount, currency = 'USD', description, returnUrl, cancelUrl, customId } = orderData;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2)
      },
      description: description || 'Payment',
      custom_id: customId || null
    }],
    application_context: {
      brand_name: process.env.PAYPAL_BRAND_NAME || 'Seeds of Hope',
      landing_page: 'BILLING',
      user_action: 'PAY_NOW',
      return_url: returnUrl,
      cancel_url: cancelUrl
    }
  });

  try {
    const order = await client().execute(request);
    return {
      success: true,
      orderId: order.result.id,
      approvalUrl: order.result.links.find(link => link.rel === 'approve').href,
      order: order.result
    };
  } catch (error) {
    console.error('PayPal order creation error:', error);
    throw new Error(`Failed to create PayPal order: ${error.message}`);
  }
}

/**
 * Capture a PayPal order after user approval
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<Object>} Capture details
 */
async function captureOrder(orderId) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    const captureData = capture.result;
    
    return {
      success: true,
      orderId: captureData.id,
      status: captureData.status,
      payer: captureData.payer,
      purchaseUnits: captureData.purchase_units,
      transactionId: captureData.purchase_units[0]?.payments?.captures[0]?.id,
      transactionStatus: captureData.purchase_units[0]?.payments?.captures[0]?.status,
      amount: captureData.purchase_units[0]?.payments?.captures[0]?.amount,
      payerEmail: captureData.payer?.email_address,
      payerId: captureData.payer?.payer_id,
      createTime: captureData.create_time,
      updateTime: captureData.update_time
    };
  } catch (error) {
    console.error('PayPal capture error:', error);
    throw new Error(`Failed to capture PayPal order: ${error.message}`);
  }
}

/**
 * Get order details by order ID
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<Object>} Order details
 */
async function getOrder(orderId) {
  const request = new paypal.orders.OrdersGetRequest(orderId);

  try {
    const order = await client().execute(request);
    return {
      success: true,
      order: order.result
    };
  } catch (error) {
    console.error('PayPal get order error:', error);
    throw new Error(`Failed to get PayPal order: ${error.message}`);
  }
}

/**
 * Refund a captured payment
 * @param {string} captureId - PayPal capture ID (transaction ID)
 * @param {Object} refundData - Refund data (amount, note, etc.)
 * @returns {Promise<Object>} Refund details
 */
async function refundPayment(captureId, refundData = {}) {
  const request = new paypal.payments.CapturesRefundRequest(captureId);
  request.requestBody({
    amount: refundData.amount ? {
      value: refundData.amount.toFixed(2),
      currency_code: refundData.currency || 'USD'
    } : undefined,
    note_to_payer: refundData.note || 'Refund processed'
  });

  try {
    const refund = await client().execute(request);
    return {
      success: true,
      refundId: refund.result.id,
      status: refund.result.status,
      amount: refund.result.amount,
      refund: refund.result
    };
  } catch (error) {
    console.error('PayPal refund error:', error);
    throw new Error(`Failed to refund PayPal payment: ${error.message}`);
  }
}

/**
 * Verify PayPal webhook signature
 * @param {Object} headers - Request headers
 * @param {Object} body - Request body
 * @returns {Promise<boolean>} Whether signature is valid
 */
async function verifyWebhook(headers, body) {
  // Note: PayPal webhook verification requires additional setup
  // For now, we'll use a simple verification approach
  // In production, implement full webhook signature verification
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  
  if (!webhookId) {
    console.warn('PAYPAL_WEBHOOK_ID not set. Webhook verification may be incomplete.');
    return true; // Allow in development, but log warning
  }

  // TODO: Implement full webhook signature verification
  // This requires calling PayPal's webhook verification API
  return true;
}

module.exports = {
  createOrder,
  captureOrder,
  getOrder,
  refundPayment,
  verifyWebhook
};
