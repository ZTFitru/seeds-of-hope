# Production API Configuration Guide

This guide explains how to configure your Seeds of Hope application to use a production API URL (e.g., `seedsofhopesc.org/backend`) for all backend API and mailer calls.

## Overview

The application is configured to automatically use the correct API URL based on the environment:
- **Development**: Uses `http://localhost:5000` (or value from `NEXT_PUBLIC_API_URL`)
- **Production**: Uses the value from `NEXT_PUBLIC_API_URL` environment variable, or defaults to `/backend` (relative path)

## Frontend Configuration

### 1. Environment Variables

Create a `.env.local` file in the `frontend` directory (or set environment variables in your hosting platform):

```env
# For production deployment
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend

# Or use relative path (recommended for same-domain deployment)
# NEXT_PUBLIC_API_URL=/backend
```

**Important Notes:**
- For Next.js static export, environment variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser
- These variables are embedded at **build time**, so you must rebuild after changing them
- If `NEXT_PUBLIC_API_URL` is not set in production, it defaults to `/backend` (relative path)

### 2. Building for Production

When building for production, make sure to set the environment variable before building:

```bash
cd frontend

# Set the API URL and build
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build

# Or if using relative path
NEXT_PUBLIC_API_URL=/backend npm run build
```

The built files will be in `frontend/out/` directory.

## Backend Configuration

### 1. Environment Variables

Update your `backend/.env` file (or set in your hosting platform):

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS) - can be comma-separated for multiple origins
FRONTEND_URL=https://seedsofhopesc.org

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Addresses
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Seeds of Hope
TO_EMAIL=admin@seeds-of-hope.org
SEND_USER_CONFIRMATION=true
```

### 2. Web Server Configuration

For the backend to be accessible at `seedsofhopesc.org/backend`, you need to configure your web server (Apache/Nginx) to proxy requests.

#### Apache (.htaccess) Example

If using Apache with mod_rewrite and mod_proxy, add to your `.htaccess`:

```apache
# Proxy requests from /backend to Node.js server
RewriteEngine On
RewriteRule ^backend/(.*)$ http://localhost:3000/$1 [P,L]

# Or if using a different port or socket
# RewriteRule ^backend/(.*)$ http://localhost:5000/$1 [P,L]
```

#### Nginx Configuration Example

```nginx
location /backend {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

#### cPanel/Passenger Configuration

If using cPanel with Passenger:
1. The Node.js app typically runs on a specific port
2. Configure the application URL in cPanel's Node.js App interface
3. Set up URL rewriting in `.htaccess` to route `/backend/*` to your Node.js app

## How It Works

1. **Frontend API Calls**: The frontend uses the `getApiUrl()` function from `frontend/src/utils/apiConfig.js` to construct API URLs
2. **Environment Detection**: The function automatically detects the environment and uses the appropriate base URL
3. **Backend Routing**: The backend server handles requests at `/api/contact`, `/health`, etc.
4. **Web Server Proxy**: The web server proxies `/backend/*` requests to the Node.js server

## Testing

### Development
```bash
# Start both servers
npm run dev

# Frontend will call: http://localhost:5000/api/contact
```

### Production Testing
1. Build the frontend with production API URL:
   ```bash
   cd frontend
   NEXT_PUBLIC_API_URL=/backend npm run build
   ```

2. Test the API endpoint:
   ```bash
   curl https://seedsofhopesc.org/backend/health
   # Should return: {"status":"ok","message":"Server is running"}
   ```

3. Test the contact form from the frontend - it should call `/backend/api/contact`

## Troubleshooting

### API calls fail in production
- Check that `NEXT_PUBLIC_API_URL` is set correctly before building
- Verify the web server is properly proxying `/backend/*` requests
- Check browser console for CORS errors
- Verify backend CORS configuration allows your domain

### CORS errors
- Update `FRONTEND_URL` in backend `.env` to include your production domain
- The backend CORS is configured to allow same-origin requests in production

### 404 errors on API endpoints
- Verify the web server proxy configuration
- Check that the backend server is running
- Test the backend directly: `curl http://localhost:3000/health`

## Example Deployment Workflow

1. **Set environment variables** in your hosting platform or `.env` files
2. **Build frontend** with production API URL:
   ```bash
   cd frontend
   NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build
   ```
3. **Upload built files** from `frontend/out/` to your web server
4. **Configure web server** to proxy `/backend/*` to your Node.js server
5. **Start backend server** (or ensure it's running via Passenger/PM2)
6. **Test** by visiting `https://seedsofhopesc.org/backend/health`
