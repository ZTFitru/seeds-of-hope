# Donation Creation Error Troubleshooting Guide

## Issue: "Failed to create donation order" (500 Error)

This guide helps troubleshoot the 500 error that occurs when creating a donation order.

## What Was Changed

I've improved error handling in the donation creation flow to provide better diagnostics:

1. **Enhanced error logging** in `backend/routes/donations.js`:
   - Separate error handling for database operations
   - Separate error handling for PayPal operations
   - Detailed console logging at each step
   - More specific error messages

2. **Improved PayPal service** in `backend/services/paypalService.js`:
   - Validation of amount, URLs, and PayPal client initialization
   - Better error messages for different failure scenarios
   - Validation of PayPal API response structure

## Common Causes and Solutions

### 1. PayPal Credentials Not Configured

**Symptoms:**
- Error message mentions "PayPal credentials" or "authentication"
- Error type: `Error` or `PayPalAuthenticationError`

**Solution:**
Check your `backend/.env` file has:
```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
PAYPAL_ENVIRONMENT=production  # or 'sandbox' for testing
```

**How to verify:**
- Check server logs for "PayPal client initialization error"
- Ensure credentials are set in your production environment

### 2. Database Connection Issues

**Symptoms:**
- Error message mentions "Database error"
- Error occurs before PayPal order creation

**Solution:**
- Check database connection settings in `backend/.env`
- Verify database server is running and accessible
- Check database schema is up to date (run `npm run db:init` if needed)
- Review server logs for database connection errors

### 3. PayPal API Errors

**Symptoms:**
- Error message mentions "PayPal error" or "PayPal service error"
- Error occurs during PayPal order creation

**Common causes:**
- Invalid PayPal credentials
- PayPal account not verified/activated
- Network connectivity issues to PayPal API
- PayPal API rate limiting

**Solution:**
- Verify PayPal credentials are correct for your environment (sandbox vs production)
- Check PayPal Developer Dashboard for account status
- Test PayPal API connectivity
- Review PayPal API response in server logs

### 4. Missing Environment Variables

**Symptoms:**
- Error about missing BASE_URL or FRONTEND_URL
- PayPal return/cancel URLs are invalid

**Solution:**
Set in `backend/.env`:
```env
BASE_URL=https://yourdomain.com
# OR
FRONTEND_URL=https://yourdomain.com
```

### 5. Invalid Request Data

**Symptoms:**
- Validation errors (400 status, not 500)
- Error about amount, email, or other fields

**Solution:**
- Check frontend is sending valid data
- Verify amount is a positive number
- Ensure email format is valid if provided

## How to Debug

### Step 1: Check Server Logs

The improved error handling now logs detailed information. Look for:

```
Creating donation order with data: { ... }
Donation record created successfully: <id>
Creating PayPal order with: { ... }
PayPal order created successfully: <orderId>
```

Or error messages like:
```
Database error creating donation: { ... }
PayPal order creation error: { ... }
PayPal client initialization error: { ... }
```

### Step 2: Test PayPal Configuration

Create a test script or use curl to verify PayPal credentials:

```bash
# Test PayPal client initialization
cd backend
node -e "require('dotenv').config(); const { client } = require('./config/paypal'); try { const c = client(); console.log('PayPal client initialized successfully'); } catch(e) { console.error('Error:', e.message); }"
```

### Step 3: Test Database Connection

Verify database is accessible:

```bash
cd backend
node -e "require('dotenv').config(); const { testConnection } = require('./config/database'); testConnection().then(connected => console.log('DB connected:', connected));"
```

### Step 4: Check Environment Variables

Verify all required variables are set:

```bash
cd backend
node -e "require('dotenv').config(); console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? 'SET' : 'MISSING'); console.log('PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? 'SET' : 'MISSING'); console.log('BASE_URL:', process.env.BASE_URL || process.env.FRONTEND_URL || 'MISSING');"
```

## Next Steps After Fixing

1. **Restart your backend server** to load new error handling
2. **Test donation creation** on the live site
3. **Monitor server logs** for the detailed error messages
4. **Check error response** - it now includes `errorType` field for better debugging

## Error Response Format

The API now returns more detailed error information:

```json
{
  "success": false,
  "message": "Specific error message",
  "error": "Detailed error (development only)",
  "errorType": "ErrorTypeName"
}
```

Common error types:
- `DatabaseError` - Database operation failed
- `PayPalError` - PayPal API call failed
- `ValidationError` - Request validation failed
- `UnknownError` - Unexpected error

## Production Considerations

- Error details are hidden in production (only shown in development)
- Check server logs for full error details
- `errorType` field is always included for debugging
- Console logs include full stack traces for investigation

## Still Having Issues?

If the error persists after checking the above:

1. Check server logs for the full error stack trace
2. Verify the error occurs at which step:
   - Database creation
   - PayPal client initialization
   - PayPal order creation
   - Database update
3. Test with a minimal request to isolate the issue
4. Verify PayPal account status in PayPal Developer Dashboard
