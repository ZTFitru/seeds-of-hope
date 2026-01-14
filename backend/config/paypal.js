const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

/**
 * Returns PayPal HTTP client instance with environment that has access
 * credentials context. Use this instance to invoke PayPal APIs, provided the
 * credentials have access.
 */
function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

/**
 * Set up and return PayPal JavaScript SDK environment with PayPal access credentials.
 * For demo purposes, we're using SandboxEnvironment. In production, use LiveEnvironment.
 */
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file.');
  }

  if (environment === 'production' || environment === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

/**
 * Get the base URL for PayPal API based on environment
 */
function getBaseUrl() {
  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';
  if (environment === 'production' || environment === 'live') {
    return 'https://api.paypal.com';
  } else {
    return 'https://api.sandbox.paypal.com';
  }
}

/**
 * Get the webhook URL for PayPal webhooks
 */
function getWebhookUrl() {
  const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5000';
  return `${baseUrl}/api/paypal/webhook`;
}

module.exports = {
  client,
  environment,
  getBaseUrl,
  getWebhookUrl
};
