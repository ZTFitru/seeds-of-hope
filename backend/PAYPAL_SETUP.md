# PayPal Integration Setup Guide

This guide explains how to set up PayPal connectivity for donations and ticket sales in the Seeds of Hope backend.

## Prerequisites

1. A PayPal Business account
2. Access to PayPal Developer Dashboard
3. Node.js backend environment configured

## Step 1: Create PayPal Application

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal Business account
3. Navigate to **Dashboard** > **My Apps & Credentials**
4. Click **Create App**
5. Fill in:
   - **App Name**: Seeds of Hope Payments
   - **Merchant**: Your business account
   - **Features**: Checkout
6. Click **Create App**
7. Copy your **Client ID** and **Secret** (you'll need these for environment variables)

## Step 2: Configure Environment Variables

Add the following variables to your `backend/.env` file:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
PAYPAL_ENVIRONMENT=sandbox  # Use 'sandbox' for testing, 'production' or 'live' for production
PAYPAL_BRAND_NAME=Seeds of Hope  # Optional: Brand name shown in PayPal checkout
PAYPAL_WEBHOOK_ID=your_webhook_id_here  # Optional: For webhook verification

# Base URL (for return/cancel URLs)
BASE_URL=https://seedsofhopesc.org  # Your production domain
# Or for development:
# BASE_URL=http://localhost:3000
```

### Environment Modes

- **Sandbox**: Use for testing with fake payments
  - Test accounts: https://developer.paypal.com/dashboard/accounts
  - Use sandbox buyer/seller accounts for testing

- **Production**: Use for real payments
  - Requires verified PayPal Business account
  - Real money transactions

## Step 3: Install Dependencies

The PayPal SDK is already added to `package.json`. Install it:

```bash
cd backend
npm install
```

## Step 4: Set Up Webhooks (Optional but Recommended)

Webhooks allow PayPal to notify your server about payment status changes automatically.

1. In PayPal Developer Dashboard, go to your app
2. Scroll to **Webhooks** section
3. Click **Add Webhook**
4. Enter webhook URL: `https://yourdomain.com/api/paypal/webhook`
5. Select events to listen for:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `CHECKOUT.ORDER.APPROVED`
6. Copy the **Webhook ID** and add to `PAYPAL_WEBHOOK_ID` in `.env`

## Step 5: Database Migration

The models already include PayPal fields. If you need to add the `paypalOrderId` field to tickets:

```bash
cd backend
npm run db:init
```

Or if you need to force update:

```bash
npm run db:init:force
```

**Note**: `db:init:force` will drop existing tables. Use with caution!

## API Endpoints

### Donations

#### Create Donation Order
```
POST /api/donations/create
```

**Request Body:**
```json
{
  "amount": 50.00,
  "email": "donor@example.com",
  "name": "John Doe",
  "isAnonymous": false,
  "message": "Keep up the great work!",
  "donationType": "one-time",
  "userId": 123  // Optional: if donor is registered user
}
```

**Response:**
```json
{
  "success": true,
  "donationId": 1,
  "orderId": "5O190127TN364715T",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "message": "Donation order created successfully..."
}
```

#### Capture Donation Payment
```
POST /api/donations/capture
```

**Request Body:**
```json
{
  "orderId": "5O190127TN364715T"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation payment captured successfully",
  "donation": {
    "id": 1,
    "amount": "50.00",
    "status": "completed",
    "transactionId": "5O190127TN364715T"
  }
}
```

#### Get Donation Details
```
GET /api/donations/:id
```

### Tickets

#### Create Ticket Purchase Order
```
POST /api/tickets/purchase
```

**Request Body:**
```json
{
  "eventId": 1,
  "quantity": 2,
  "userId": 123,  // Optional: for guest purchases, omit this
  "attendeeNames": ["John Doe", "Jane Doe"],
  "specialRequests": "Wheelchair accessible seating"
}
```

**Response:**
```json
{
  "success": true,
  "ticketId": 1,
  "orderId": "5O190127TN364715T",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "totalAmount": 100.00,
  "message": "Ticket order created successfully..."
}
```

#### Capture Ticket Payment
```
POST /api/tickets/capture
```

**Request Body:**
```json
{
  "orderId": "5O190127TN364715T"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket payment captured successfully",
  "ticket": {
    "id": 1,
    "ticketCode": "TKT-1234567890-ABC123",
    "quantity": 2,
    "totalAmount": "100.00",
    "status": "completed",
    "transactionId": "5O190127TN364715T"
  }
}
```

#### Get Ticket Details
```
GET /api/tickets/:id
```

### Webhooks

#### PayPal Webhook Endpoint
```
POST /api/paypal/webhook
```

This endpoint is automatically called by PayPal when payment events occur. No manual calls needed.

## Payment Flow

### For Donations:

1. **Frontend** calls `POST /api/donations/create` with donation details
2. **Backend** creates donation record with `pending` status
3. **Backend** creates PayPal order and returns `approvalUrl`
4. **Frontend** redirects user to `approvalUrl` (PayPal checkout page)
5. User completes payment on PayPal
6. PayPal redirects to `returnUrl` (your success page)
7. **Frontend** calls `POST /api/donations/capture` with `orderId`
8. **Backend** captures payment and updates donation to `completed`
9. **Webhook** (optional) also updates status automatically

### For Tickets:

Same flow as donations, but using `/api/tickets/purchase` and `/api/tickets/capture`

## Testing

### Sandbox Testing

1. Use sandbox test accounts from PayPal Developer Dashboard
2. Test with small amounts (e.g., $0.01)
3. Test both successful and failed payment scenarios
4. Verify webhook notifications are received

### Test Scenarios

- ✅ Successful payment
- ✅ Payment cancellation
- ✅ Payment failure
- ✅ Refund processing
- ✅ Webhook notifications

## Security Considerations

1. **Never expose** `PAYPAL_CLIENT_SECRET` in frontend code
2. **Always verify** webhook signatures in production
3. **Use HTTPS** for all payment-related endpoints
4. **Validate** all input data before processing
5. **Log** all payment transactions for audit purposes
6. **Implement** rate limiting on payment endpoints

## Troubleshooting

### Common Issues

1. **"PayPal credentials not configured"**
   - Check that `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set in `.env`
   - Restart server after adding environment variables

2. **"Invalid order ID"**
   - Ensure you're using the correct order ID from the create response
   - Check that the order hasn't already been captured

3. **Webhooks not working**
   - Verify webhook URL is publicly accessible
   - Check that webhook ID is set in environment
   - Ensure webhook events are configured in PayPal dashboard

4. **Payment status not updating**
   - Check webhook endpoint is receiving requests
   - Verify database connection
   - Check server logs for errors

## Production Checklist

Before going live:

- [ ] Switch `PAYPAL_ENVIRONMENT` to `production`
- [ ] Use production PayPal credentials
- [ ] Set up webhook with production URL
- [ ] Test with small real payment
- [ ] Configure email notifications for receipts
- [ ] Set up monitoring/alerting for payment failures
- [ ] Review and test refund process
- [ ] Ensure HTTPS is enabled
- [ ] Review security settings

## Support

For PayPal API issues:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Support](https://www.paypal.com/support)

For application issues:
- Check server logs
- Review database records
- Verify environment configuration
