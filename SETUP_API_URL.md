# Quick Setup: Configure API URL for seedsofhopesc.org

This guide shows you exactly how to ensure your frontend accesses the backend API at `https://seedsofhopesc.org/backend`.

## ✅ Quick Steps

### 1. Build Frontend with API URL

**Before building, set the environment variable:**

```bash
cd frontend
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build
```

That's it! The built frontend will now call `https://seedsofhopesc.org/backend/api/contact` for all API requests.

### 2. Configure Backend CORS

In `backend/.env`, set:

```env
FRONTEND_URL=https://seedsofhopesc.org,https://www.seedsofhopesc.org
NODE_ENV=production
```

### 3. Deploy and Test

1. Upload built files from `frontend/out/` to your `public_html` directory
2. Restart your Node.js app in cPanel
3. Test: Visit `https://seedsofhopesc.org` and submit the contact form
4. Check browser DevTools → Network tab to verify API calls go to `https://seedsofhopesc.org/backend/api/contact`

## 🔍 How to Verify It's Working

### Check in Browser DevTools

1. Open `https://seedsofhopesc.org`
2. Press F12 to open DevTools
3. Go to **Network** tab
4. Submit the contact form
5. Look for a request to `/backend/api/contact` or `https://seedsofhopesc.org/backend/api/contact`
6. Check that it returns status `200` (success)

### Test Backend Directly

```bash
# Test health endpoint
curl https://seedsofhopesc.org/backend/health

# Should return:
# {"status":"ok","message":"Server is running","timestamp":"..."}
```

## 📝 Alternative: Using Relative Path

If you prefer to use a relative path (simpler, but less explicit):

```bash
cd frontend
NEXT_PUBLIC_API_URL=/backend npm run build
```

This will use `/backend/api/contact` which automatically resolves to `https://seedsofhopesc.org/backend/api/contact` when running on your domain.

## 🛠️ Using Deployment Scripts

If using the deployment scripts:

**Windows PowerShell:**
```powershell
$env:NEXT_PUBLIC_API_URL="https://seedsofhopesc.org/backend"
.\deploy-to-cpanel.ps1
```

**Linux/Mac:**
```bash
export NEXT_PUBLIC_API_URL="https://seedsofhopesc.org/backend"
./deploy-to-cpanel.sh
```

## ⚠️ Important Notes

1. **Set Before Building**: `NEXT_PUBLIC_API_URL` must be set **before** running `npm run build`. Environment variables are embedded at build time.

2. **Rebuild if Changed**: If you change the API URL, you must rebuild the frontend:
   ```bash
   rm -rf frontend/out frontend/.next  # Clean previous build
   cd frontend
   NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build
   ```

3. **Backend Routes**: The backend is configured to handle both:
   - `/api/contact` (direct route)
   - `/backend/api/contact` (with prefix)
   
   So it will work regardless of how Apache/Passenger routes the requests.

4. **CORS**: Make sure `FRONTEND_URL` in `backend/.env` includes your domain (with `https://`).

## 🐛 Troubleshooting

### API calls still go to localhost

**Solution:** Rebuild the frontend with the correct URL:
```bash
cd frontend
rm -rf out .next
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build
```

### CORS errors in browser

**Solution:** Update `backend/.env`:
```env
FRONTEND_URL=https://seedsofhopesc.org
```
Then restart the Node.js app in cPanel.

### 404 on /backend/api/contact

**Solution:** 
1. Check that the backend server is running (test `/backend/health`)
2. Verify Node.js app is configured in cPanel
3. Check `.htaccess` is routing `/backend/*` to your Node.js app

## 📚 More Information

For detailed configuration options, see [API_URL_CONFIGURATION.md](./API_URL_CONFIGURATION.md)

---

**Quick Command Reference:**
```bash
# Build with full URL
cd frontend && NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build

# Build with relative path
cd frontend && NEXT_PUBLIC_API_URL=/backend npm run build

# Test backend
curl https://seedsofhopesc.org/backend/health
```
