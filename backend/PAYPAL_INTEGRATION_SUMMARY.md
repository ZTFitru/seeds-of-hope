# PayPal Integration - Implementation Summary

## What Has Been Created

### 1. PayPal SDK Configuration
- **File**: `backend/config/paypal.js`
- Configures PayPal client for sandbox/production environments
- Handles authentication and environment setup

### 2. PayPal Service Layer
- **File**: `backend/services/paypalService.js`
- Core PayPal operations:
  - `createOrder()` - Create PayPal payment orders
  - `captureOrder()` - Capture approved payments
  - `getOrder()` - Retrieve order details
  - `refundPayment()` - Process refunds
  - `verifyWebhook()` - Verify webhook signatures

### 3. Donation Routes
- **File**: `backend/routes/donations.js`
- Endpoints:
  - `POST /api/donations/create` - Create donation order
  - `POST /api/donations/capture` - Capture donation payment
  - `GET /api/donations/:id` - Get donation details

### 4. Ticket Routes
- **File**: `backend/routes/tickets.js`
- Endpoints:
  - `POST /api/tickets/purchase` - Create ticket purchase order
  - `POST /api/tickets/capture` - Capture ticket payment
  - `GET /api/tickets/:id` - Get ticket details

### 5. PayPal Webhook Handler
- **File**: `backend/routes/paypalWebhook.js`
- Endpoint: `POST /api/paypal/webhook`
- Automatically handles payment status updates from PayPal
- Processes events: completed, denied, refunded payments

### 6. Database Updates
- **File**: `backend/models/Ticket.js`
- Added `paypalOrderId` field to store PayPal order IDs

### 7. Server Integration
- **File**: `backend/server.js`
- All new routes are registered and accessible

### 8. Documentation
- **File**: `backend/PAYPAL_SETUP.md`
- Complete setup guide with step-by-step instructions

## Next Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install `@paypal/checkout-server-sdk` package.

### 2. Set Up PayPal Developer Account
1. Go to https://developer.paypal.com/
2. Create a PayPal Business account (if you don't have one)
3. Create a new app in the Developer Dashboard
4. Get your Client ID and Secret

### 3. Configure Environment Variables
Add to `backend/.env`:
```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
PAYPAL_ENVIRONMENT=sandbox  # or 'production' for live
PAYPAL_BRAND_NAME=Seeds of Hope
BASE_URL=https://seedsofhopesc.org  # Your domain
```

### 4. Update Database Schema
If you haven't already, run:
```bash
npm run db:init
```

This will add the `paypalOrderId` field to the tickets table.

### 5. Set Up Webhooks (Recommended)
1. In PayPal Developer Dashboard, add webhook URL
2. URL: `https://yourdomain.com/api/paypal/webhook`
3. Select events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`
4. Add `PAYPAL_WEBHOOK_ID` to `.env`

### 6. Test the Integration
1. Start your backend server
2. Test donation flow with sandbox account
3. Test ticket purchase flow
4. Verify webhook notifications

## API Usage Examples

### Create a Donation
```javascript
// Frontend call
const response = await fetch('/api/donations/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50.00,
    email: 'donor@example.com',
    name: 'John Doe',
    isAnonymous: false
  })
});

const { approvalUrl } = await response.json();
// Redirect user to approvalUrl
window.location.href = approvalUrl;
```

### Capture Payment (after user approves)
```javascript
// After PayPal redirects back
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('token'); // Get from PayPal redirect

const response = await fetch('/api/donations/capture', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId })
});
```

## Features Included

✅ PayPal order creation for donations and tickets  
✅ Payment capture after user approval  
✅ Webhook handling for automatic status updates  
✅ Refund capability (via service layer)  
✅ Support for both sandbox and production  
✅ Error handling and validation  
✅ Database integration with existing models  
✅ Support for anonymous donations  
✅ Guest ticket purchases  

## Important Notes

1. **Security**: Never expose `PAYPAL_CLIENT_SECRET` in frontend code
2. **Testing**: Always test in sandbox mode first
3. **Webhooks**: Highly recommended for production to handle edge cases
4. **HTTPS**: Required for production webhooks
5. **Email Notifications**: TODO items in code - implement receipt emails

## Support

- See `backend/PAYPAL_SETUP.md` for detailed setup instructions
- PayPal Developer Docs: https://developer.paypal.com/docs/
- Check server logs for debugging
