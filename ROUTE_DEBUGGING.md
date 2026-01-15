# Route Debugging Guide

## Issue: "Route not found" when accessing `/api/donations/create`

### Possible Causes

1. **Using GET instead of POST** - The `/create` endpoint requires POST, but browsers use GET
2. **Wrong URL path** - The route might not match exactly
3. **Server not running** - The backend server might not be running
4. **Route not mounted** - Routes might not be loading correctly

---

## Testing Steps

### Step 1: Test if routes are working at all

Use the test endpoint (GET request - works in browser):

**URLs to try:**
- `http://localhost:5000/api/donations/test`
- `http://localhost:5000/backend/api/donations/test`
- `https://yourdomain.com/api/donations/test`
- `https://yourdomain.com/backend/api/donations/test`

**Expected response:**
```json
{
  "success": true,
  "message": "Donations route is working!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

If this works, routes are mounted correctly. If not, check:
- Is the backend server running?
- Are there any errors in the server logs?

### Step 2: Test the create endpoint (requires POST)

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/donations/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "email": "test@example.com",
    "name": "Test User",
    "isAnonymous": false,
    "requestTaxReceipt": false,
    "donationType": "one-time"
  }'
```

**Using Postman/Insomnia:**
- Method: POST
- URL: `http://localhost:5000/api/donations/create`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "amount": 10.00,
  "email": "test@example.com",
  "name": "Test User",
  "isAnonymous": false,
  "requestTaxReceipt": false,
  "donationType": "one-time"
}
```

**Using PowerShell (Windows):**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/donations/create" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"amount":10.00,"email":"test@example.com","name":"Test User","isAnonymous":false,"requestTaxReceipt":false,"donationType":"one-time"}'
```

**Expected response:**
```json
{
  "success": true,
  "donationId": 1,
  "orderId": "5O190127TN364715T",
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=...",
  "message": "Donation order created successfully..."
}
```

---

## Common Issues

### Issue 1: "Route not found" when accessing in browser

**Problem:** Browsers use GET requests by default, but `/create` requires POST.

**Solution:** Use a tool like Postman, curl, or the test endpoint above.

### Issue 2: Routes work locally but not in production

**Check:**
1. Is the backend server running in production?
2. Is the correct port configured?
3. Are environment variables set correctly?
4. Check server logs for errors

### Issue 3: Wrong path

**Available paths:**
- `/api/donations/create` (development)
- `/backend/api/donations/create` (production with /backend prefix)

**Verify:**
- Check your `NEXT_PUBLIC_API_URL` environment variable
- Check `frontend/src/utils/apiConfig.js` for how URLs are constructed

---

## Route Registration

The routes are registered in `backend/server.js`:
```javascript
app.use('/api/donations', donationRoutes);
app.use('/backend/api/donations', donationRoutes);
```

Routes defined in `backend/routes/donations.js`:
- `GET /test` - Test endpoint (browser-friendly)
- `POST /create` - Create donation order
- `POST /capture` - Capture payment
- `GET /:id` - Get donation details

---

## Server Logs

Check your server logs when starting the backend. You should see:
```
Server is running on port 5000
Environment: development
Process PID: 12345
Donation routes registered at:
  - /api/donations
  - /backend/api/donations
```

If you don't see these logs, there might be an issue with server startup.

---

## Quick Test Script

Create a test file `test-route.js`:
```javascript
const fetch = require('node-fetch');

async function testRoute() {
  try {
    // Test GET endpoint
    const testResponse = await fetch('http://localhost:5000/api/donations/test');
    const testData = await testResponse.json();
    console.log('Test endpoint:', testData);

    // Test POST endpoint
    const createResponse = await fetch('http://localhost:5000/api/donations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 10.00,
        email: 'test@example.com',
        name: 'Test User',
        isAnonymous: false,
        requestTaxReceipt: false,
        donationType: 'one-time'
      })
    });
    const createData = await createResponse.json();
    console.log('Create endpoint:', createData);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRoute();
```

Run with: `node test-route.js`
