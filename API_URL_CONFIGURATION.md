# API URL Configuration Guide

This guide explains how to configure the frontend to access your backend API at `https://seedsofhopesc.org/backend`.

## 🎯 Quick Setup

### For Production Deployment

When building the frontend for production, set the API URL:

**Option 1: Full URL (Recommended)**
```bash
cd frontend
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build
```

**Option 2: Relative Path**
```bash
cd frontend
NEXT_PUBLIC_API_URL=/backend npm run build
```

**Option 3: Using .env.local**
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend
```
Then build:
```bash
cd frontend
npm run build
```

## 📋 How It Works

### Frontend Configuration

The frontend uses `frontend/src/utils/apiConfig.js` to determine the API base URL:

1. **If `NEXT_PUBLIC_API_URL` is set**: Uses that value (full URL or relative path)
2. **If in development**: Defaults to `http://localhost:5000`
3. **If in production without explicit URL**: Defaults to `/backend` (relative path)

### Example API Calls

When the frontend calls:
```javascript
getApiUrl('/api/contact')
```

With `NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend`, it generates:
```
https://seedsofhopesc.org/backend/api/contact
```

With `NEXT_PUBLIC_API_URL=/backend`, it generates:
```
/backend/api/contact
```

### Backend Routing

The backend server (`backend/server.js`) handles requests at:
- `/api/contact` - Direct route
- `/backend/api/contact` - Route with /backend prefix

Both routes work, so your API will respond correctly regardless of how the frontend calls it.

## 🔧 Configuration Methods

### Method 1: Environment Variable at Build Time (Recommended)

**Production Build:**
```bash
cd frontend
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build
```

**Using Deployment Script:**
Update `deploy-to-cpanel.sh` or `deploy-to-cpanel.ps1`:
```bash
# In the script, before npm run build:
export NEXT_PUBLIC_API_URL="https://seedsofhopesc.org/backend"
npm run build
```

### Method 2: .env.local File

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend
```

**Important:** `.env.local` is for local development. For production builds on the server, use environment variables.

### Method 3: Update package.json Script

Edit `frontend/package.json`:
```json
{
  "scripts": {
    "build": "NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend next build --webpack",
    "build:local": "NEXT_PUBLIC_API_URL=/backend next build --webpack"
  }
}
```

## 🌐 Backend CORS Configuration

The backend must allow requests from your frontend domain. In `backend/.env`:

```env
# For production
FRONTEND_URL=https://seedsofhopesc.org,https://www.seedsofhopesc.org

# Or comma-separated for multiple domains
FRONTEND_URL=https://seedsofhopesc.org,https://www.seedsofhopesc.org,https://staging.seedsofhopesc.org
```

The backend CORS configuration in `backend/server.js` will:
- Allow requests from domains listed in `FRONTEND_URL`
- Allow same-origin requests (important for `/backend` path)
- Allow requests with no origin (for server-side rendering)

## ✅ Verification Steps

### 1. Check Frontend Build

After building, check the built JavaScript files:
```bash
# Search for the API URL in built files
grep -r "seedsofhopesc.org/backend" frontend/out/_next/static/
```

Or check in browser DevTools:
- Open your website
- Go to Network tab
- Submit contact form
- Check the request URL (should be `https://seedsofhopesc.org/backend/api/contact`)

### 2. Test Backend Endpoint

```bash
# Test health endpoint
curl https://seedsofhopesc.org/backend/health

# Expected response:
# {"status":"ok","message":"Server is running"}

# Test API endpoint (if you have curl configured)
curl -X POST https://seedsofhopesc.org/backend/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

### 3. Check Browser Console

1. Open your website: `https://seedsofhopesc.org`
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Submit the contact form
5. Check for:
   - ✅ No CORS errors
   - ✅ Successful API calls to `/backend/api/contact`
   - ✅ No 404 errors

## 🐛 Troubleshooting

### Issue: API calls go to wrong URL

**Problem:** Frontend calls `http://localhost:5000/api/contact` in production

**Solution:**
- Rebuild the frontend with `NEXT_PUBLIC_API_URL` set
- Clear browser cache
- Check that environment variable was set before build

### Issue: CORS errors

**Problem:** Browser shows CORS error when submitting form

**Solution:**
1. Update `FRONTEND_URL` in `backend/.env`:
   ```env
   FRONTEND_URL=https://seedsofhopesc.org
   ```
2. Restart the backend server
3. Check that the domain matches exactly (including `https://`)

### Issue: 404 on /backend/api/contact

**Problem:** Backend returns 404 for API calls

**Solution:**
1. Verify backend server is running
2. Check `.htaccess` routing is correct
3. Verify Node.js app is configured in cPanel
4. Check application logs in cPanel

### Issue: API URL not updating after rebuild

**Problem:** Changed `NEXT_PUBLIC_API_URL` but old URL still used

**Solution:**
1. Delete `frontend/.next` and `frontend/out` directories
2. Rebuild: `npm run build`
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## 📝 Best Practices

1. **Use Full URL for Production**: `https://seedsofhopesc.org/backend`
   - More explicit and clear
   - Works across subdomains
   - Easier to debug

2. **Use Relative Path for Same Domain**: `/backend`
   - Simpler configuration
   - Automatically uses correct protocol (HTTP/HTTPS)
   - Works with any domain

3. **Set at Build Time**: Always set `NEXT_PUBLIC_API_URL` before building
   - Environment variables are embedded at build time
   - Changing `.env` after build won't affect the built files

4. **Test Both Endpoints**: Verify both `/api/contact` and `/backend/api/contact` work
   - Backend handles both routes
   - Provides flexibility

## 🔄 Deployment Workflow

1. **Set API URL:**
   ```bash
   export NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend
   ```

2. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Verify Build:**
   ```bash
   # Check one of the built JS files contains your API URL
   grep -r "seedsofhopesc.org" frontend/out/_next/
   ```

4. **Upload to cPanel:**
   - Upload `frontend/out/*` to `public_html/`

5. **Configure Backend:**
   - Set `FRONTEND_URL=https://seedsofhopesc.org` in `backend/.env`
   - Restart Node.js app

6. **Test:**
   - Visit `https://seedsofhopesc.org`
   - Test contact form
   - Check browser console for errors

## 📚 Related Files

- `frontend/src/utils/apiConfig.js` - API URL configuration
- `backend/server.js` - Backend CORS and routing
- `backend/.env` - Backend environment variables
- `.htaccess` - Apache routing configuration

---

**For your specific case with `https://seedsofhopesc.org/backend`:**

```bash
cd frontend
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build
```

Then deploy and verify API calls work correctly!
