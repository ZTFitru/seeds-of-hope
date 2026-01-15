# Donation Flow Evaluation Report

## Executive Summary
This document provides a thorough evaluation of the charitable donation flow, including frontend and backend analysis, identified issues, and recommended fixes.

---

## Backend Route Location

### ✅ **Route Exists and is Correctly Mounted**

**Location:** `backend/routes/donations.js`
- Route file: `backend/routes/donations.js`
- Endpoint path: `POST /create` (within the donations router)
- Mounted at: `/api/donations` and `/backend/api/donations` in `server.js` (lines 87-88)

**Full endpoint paths:**
- `/api/donations/create`
- `/backend/api/donations/create`

**Important Note:** Express routes don't require a matching filesystem directory structure. The route exists in `backend/routes/donations.js` and is mounted via `app.use()` in `server.js`, not as a file at `backend/api/donations/create.js`.

---

## Frontend API Configuration

### ✅ **Frontend is Correctly Configured**

**File:** `frontend/src/app/charities/page.js`
- Line 111: `const response = await fetch(getApiUrl('/api/donations/create'), {...})`

**API Configuration:** `frontend/src/utils/apiConfig.js`
- `getApiUrl('/api/donations/create')` constructs the full URL
- In development: `http://localhost:5000/api/donations/create`
- In production (without NEXT_PUBLIC_API_URL): `/backend/api/donations/create`
- In production (with NEXT_PUBLIC_API_URL): `{NEXT_PUBLIC_API_URL}/api/donations/create`

---

## Donation Flow Architecture

### 1. **Donation Creation Flow**
```
Frontend (charities/page.js)
  ↓ POST /api/donations/create
Backend (routes/donations.js)
  ↓ Validates request
  ↓ Creates Donation record (status: pending)
  ↓ Creates PayPal order
  ↓ Returns approvalUrl
Frontend redirects to PayPal
```

### 2. **Payment Capture Flow**
```
User completes payment on PayPal
  ↓ PayPal redirects to /donation/success?donationId={id}&token={token}
Frontend (donation/success/page.js)
  ↓ POST /api/donations/capture
Backend (routes/donations.js)
  ↓ Captures PayPal payment
  ↓ Updates donation (status: completed)
  ↓ Returns success
```

### 3. **Webhook Flow (Alternative)**
```
PayPal sends webhook
  ↓ POST /api/paypal/webhook
Backend (routes/paypalWebhook.js)
  ↓ Verifies webhook signature
  ↓ Updates donation (status: completed)
```

---

## Issues Identified

### 🔴 **Critical Issues - FIXED**

#### 1. **Missing `requestTaxReceipt` Field in Database** ✅ FIXED
- **Location:** `backend/routes/donations.js` (line 68-91)
- **Issue:** The backend accepts `requestTaxReceipt` in the request body and validates it, but did NOT save it to the database
- **Impact:** Tax receipt preference was lost after donation creation
- **Fix Applied:** 
  - Added `requestTaxReceipt` field to Donation model (`backend/models/Donation.js`)
  - Updated donation creation to save this field (`backend/routes/donations.js`)

### ⚠️ **Remaining Issues**

#### 2. **Tax Receipt Emails Not Implemented**
- **Location:** Multiple locations with TODO comments
- **Issue:** Tax receipt emails are not sent when `requestTaxReceipt` is true
- **Impact:** Donors requesting tax receipts won't receive them
- **Fix Required:** Implement email sending logic in capture handler and webhook handler

### ✅ **Working Correctly**

1. Route mounting in `server.js` (lines 87-88)
2. Frontend API URL construction
3. PayPal order creation
4. Payment capture endpoint
5. Webhook handling
6. Error handling and validation
7. Return URL configuration (`/donation/success`)

---

## Files Involved

### Backend
- `backend/routes/donations.js` - Main donation routes
- `backend/models/Donation.js` - Donation database model
- `backend/server.js` - Route mounting
- `backend/services/paypalService.js` - PayPal integration
- `backend/routes/paypalWebhook.js` - Webhook handling

### Frontend
- `frontend/src/app/charities/page.js` - Donation form page
- `frontend/src/app/donation/success/page.js` - Success page
- `frontend/src/utils/apiConfig.js` - API URL configuration

---

## API Endpoint Summary

### POST `/api/donations/create`
**Purpose:** Create a PayPal order for a donation

**Request Body:**
```json
{
  "amount": 50.00,
  "email": "donor@example.com",
  "name": "John Doe",
  "isAnonymous": false,
  "requestTaxReceipt": true,
  "message": "Optional message",
  "donationType": "one-time"
}
```

**Response:**
```json
{
  "success": true,
  "donationId": 1,
  "orderId": "5O190127TN364715T",
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=...",
  "message": "Donation order created successfully..."
}
```

### POST `/api/donations/capture`
**Purpose:** Capture a PayPal payment for a donation

**Request Body:**
```json
{
  "orderId": "5O190127TN364715T"
}
```

### GET `/api/donations/:id`
**Purpose:** Get donation details by ID

---

## Next Steps

### Immediate Actions Required

1. **Database Migration:** Run database migration to add `requestTaxReceipt` field
   ```bash
   cd backend
   npm run db:init
   ```

2. **Implement Tax Receipt Email Sending:**
   - Create email template
   - Send email in capture handler (`backend/routes/donations.js`)
   - Send email in webhook handler (`backend/routes/paypalWebhook.js`)

3. **Testing:**
   - Test donation flow end-to-end
   - Verify `requestTaxReceipt` is saved to database
   - Test tax receipt email delivery

---

## Conclusion

The donation flow is **functional** with routes correctly configured. The main issues have been identified and the `requestTaxReceipt` field persistence has been fixed. The remaining work is implementing the tax receipt email functionality.

**The API endpoint `/api/donations/create` exists and is correctly mounted at:**
- `backend/routes/donations.js` (route definition)
- Mounted in `backend/server.js` at both `/api/donations` and `/backend/api/donations`

**The frontend is correctly calling the endpoint via:**
- `getApiUrl('/api/donations/create')` which resolves to the correct URL based on environment
