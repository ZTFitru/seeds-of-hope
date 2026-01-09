# cPanel Deployment Guide - Seeds of Hope

This comprehensive guide will help you deploy your Seeds of Hope application to cPanel hosting with optimal organization and configuration.

## 📋 Table of Contents

1. [Directory Structure](#directory-structure)
2. [Pre-Deployment Preparation](#pre-deployment-preparation)
3. [Uploading Files](#uploading-files)
4. [Backend Configuration](#backend-configuration)
5. [Frontend Configuration](#frontend-configuration)
6. [cPanel Node.js Setup](#cpanel-nodejs-setup)
7. [Apache/.htaccess Configuration](#apachehtaccess-configuration)
8. [Environment Variables](#environment-variables)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 📁 Directory Structure

For optimal cPanel deployment, your `public_html` directory should be organized as follows:

```
public_html/
├── .htaccess                 # Main routing configuration
├── app.js                    # Alternative entry point
├── passenger_wsgi.js         # Passenger entry point
├── package.json              # Root package.json
│
├── index.html                # Frontend entry point
├── *.html                    # Other frontend pages
├── _next/                    # Next.js static assets
├── images/                   # Frontend images
├── [other frontend files]    # All frontend static files
│
└── backend/                  # Backend Node.js application
    ├── .env                  # Environment variables (create this)
    ├── server.js             # Backend server entry point
    ├── package.json
    ├── routes/
    ├── config/
    ├── middleware/
    └── node_modules/         # Installed after deployment
```

**Key Points:**
- Frontend static files are in the root of `public_html`
- Backend is in `public_html/backend/`
- `.htaccess` routes `/backend/*` to Node.js and handles frontend routing

---

## 🚀 Pre-Deployment Preparation

### Option 1: Use Deployment Script (Recommended)

```bash
# From project root
chmod +x deploy-to-cpanel.sh
./deploy-to-cpanel.sh
```

This script will:
- Build the frontend for production
- Install backend production dependencies
- Create a `cpanel-deploy/` directory with everything ready to upload

### Option 2: Manual Preparation

```bash
# 1. Build frontend
cd frontend
NEXT_PUBLIC_API_URL=/backend npm run build
cd ..

# 2. Install backend dependencies
cd backend
npm install --production
cd ..
```

---

## 📤 Uploading Files

### Method 1: cPanel File Manager

1. Log into cPanel
2. Navigate to **File Manager**
3. Go to `public_html` directory
4. Upload all files from `cpanel-deploy/` (or manually upload)
5. **Important:** Upload files maintaining the directory structure

### Method 2: FTP/SFTP

```bash
# Using SFTP
sftp your_username@yourdomain.com
cd public_html
put -r cpanel-deploy/* .
```

### Method 3: Git (if available)

```bash
# If you have Git access in cPanel
cd ~/public_html
git clone your-repo-url .
```

---

## ⚙️ Backend Configuration

### 1. Install Backend Dependencies

SSH into your cPanel account:

```bash
cd ~/public_html/backend
npm install
```

Or use cPanel Terminal if SSH is not available.

### 2. Create Environment File

Create `.env` file in `backend/` directory:

```bash
cd ~/public_html/backend
nano .env
```

Or use cPanel File Manager to create `backend/.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS) - can be comma-separated for multiple origins
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com

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

**Security Note:** In some cPanel setups, you may need to set environment variables through the cPanel interface instead of `.env` file. Check your hosting provider's documentation.

---

## 🎨 Frontend Configuration

The frontend is already built as static files. The API URL is configured at build time.

### Setting API URL

Before building (or rebuild if needed):

```bash
cd frontend
NEXT_PUBLIC_API_URL=/backend npm run build
```

This ensures all API calls go to `/backend/api/*`.

---

## 🔧 cPanel Node.js Setup

### Step 1: Access Node.js App Manager

1. Log into cPanel
2. Find **Setup Node.js App** (or **Node.js Selector**)
3. Click to open

### Step 2: Create New Application

Click **Create Application** and configure:

- **Node.js version:** Latest stable (18.x or 20.x recommended)
- **Application mode:** Production
- **Application root:** `/home/YOUR_USERNAME/public_html`
- **Application URL:** `/` (or leave empty for root)
- **Application startup file:** `passenger_wsgi.js` (or `app.js` if that doesn't work)
- **Application log file:** Leave default or set custom path

### Step 3: Install Dependencies

In the Node.js App interface:
1. Click **Run NPM install** button
2. Or manually run: `cd ~/public_html/backend && npm install`

### Step 4: Restart Application

Click **Restart App** button in the Node.js App interface.

### Step 5: Note Node.js Path

After creating the app, note the Node.js binary path. You'll need this for `.htaccess` configuration.

Common path format:
```
/home/YOUR_USERNAME/nodevenv/public_html/18/bin/node
```

---

## 🌐 Apache/.htaccess Configuration

### Update .htaccess File

Edit `public_html/.htaccess` and update these values:

1. **Replace `YOUR_USERNAME`** with your actual cPanel username
2. **Update Node.js path** with the path from Step 5 above

```apache
<IfModule mod_passenger.c>
  PassengerEnabled On
  PassengerAppRoot /home/YOUR_USERNAME/public_html
  PassengerAppType node
  PassengerStartupFile passenger_wsgi.js
  PassengerNodejs /home/YOUR_USERNAME/nodevenv/public_html/18/bin/node
</IfModule>
```

### How It Works

The `.htaccess` file:
- Routes `/backend/*` requests to your Node.js application
- Handles frontend static file routing (Next.js export)
- Adds `.html` extensions for clean URLs
- Configures caching and compression

---

## 🔐 Environment Variables

### Setting in cPanel

Some cPanel hosts require environment variables to be set through the interface:

1. Go to **Setup Node.js App**
2. Click on your application
3. Find **Environment Variables** section
4. Add each variable:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `FRONTEND_URL=https://yourdomain.com`
   - `SMTP_HOST=smtp.gmail.com`
   - (etc.)

### Using .env File

If your host supports `.env` files:
- Create `backend/.env` with all variables
- Ensure file permissions are correct (644)

---

## ✅ Testing

### 1. Test Backend Health Endpoint

```bash
curl https://yourdomain.com/backend/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

### 2. Test Frontend

Visit: `https://yourdomain.com`

The frontend should load correctly.

### 3. Test Contact Form

1. Fill out the contact form on your website
2. Submit it
3. Check that:
   - Form submission succeeds
   - Admin receives email
   - User receives confirmation (if enabled)

### 4. Check Browser Console

Open browser DevTools → Console and verify:
- No CORS errors
- API calls are going to `/backend/api/contact`
- No 404 errors

---

## 🐛 Troubleshooting

### Backend Not Responding

**Problem:** `/backend/health` returns 404 or error

**Solutions:**
1. Verify Node.js app is running in cPanel
2. Check application logs in cPanel → Node.js App → View logs
3. Verify `.htaccess` Passenger configuration
4. Check that `passenger_wsgi.js` or `app.js` exists
5. Ensure backend dependencies are installed: `cd ~/public_html/backend && npm install`

### CORS Errors

**Problem:** Browser console shows CORS errors

**Solutions:**
1. Update `FRONTEND_URL` in `backend/.env` to include your domain
2. Ensure domain matches exactly (including `https://` and `www` if applicable)
3. Check backend `server.js` CORS configuration

### 404 Errors on Frontend Pages

**Problem:** Frontend pages return 404

**Solutions:**
1. Verify `.htaccess` rewrite rules are working
2. Check that `mod_rewrite` is enabled in Apache
3. Ensure frontend files are in `public_html` root
4. Check file permissions (644 for files, 755 for directories)

### Port Already in Use

**Problem:** Error: `EADDRINUSE` or port conflict

**Solutions:**
1. Remove `PORT` from `.env` if using Passenger (it handles ports automatically)
2. Or set a different port number (above 1024)
3. Check if another Node.js app is using the port

### Module Not Found Errors

**Problem:** `Cannot find module` errors

**Solutions:**
1. Run `npm install` in `backend/` directory
2. Verify `node_modules` exists in `backend/`
3. Check `package.json` has all dependencies
4. Try deleting `node_modules` and `package-lock.json`, then reinstall

### Email Not Sending

**Problem:** Contact form submits but no emails sent

**Solutions:**
1. Verify SMTP credentials in `backend/.env`
2. For Gmail, use App Password (not regular password)
3. Check SMTP host and port are correct
4. Verify `TO_EMAIL` and `FROM_EMAIL` are set
5. Check application logs for email errors

### Application Logs

View logs in these locations:
1. **cPanel → Error Log** - Apache/PHP errors
2. **cPanel → Node.js App → View logs** - Application logs
3. **SSH:** `tail -f ~/public_html/backend/logs/*.log` (if logging configured)

---

## 📝 Deployment Checklist

Before going live, verify:

- [ ] Frontend built with correct `NEXT_PUBLIC_API_URL`
- [ ] All files uploaded to `public_html`
- [ ] Backend dependencies installed (`npm install` in `backend/`)
- [ ] `.env` file created in `backend/` with all variables
- [ ] Node.js app created in cPanel
- [ ] `.htaccess` updated with correct username and Node.js path
- [ ] Application restarted in cPanel
- [ ] Backend health endpoint works: `/backend/health`
- [ ] Frontend loads correctly
- [ ] Contact form submits successfully
- [ ] Emails are being sent
- [ ] No errors in browser console
- [ ] No errors in application logs

---

## 🔄 Updating the Application

When you need to update:

1. **Update Frontend:**
   ```bash
   cd frontend
   NEXT_PUBLIC_API_URL=/backend npm run build
   ```
   Upload new files from `frontend/out/` to `public_html/`

2. **Update Backend:**
   ```bash
   cd backend
   git pull  # or upload new files
   npm install  # if package.json changed
   ```
   Restart app in cPanel

3. **Restart Application:**
   - Go to cPanel → Node.js App
   - Click **Restart App**

---

## 📞 Need Help?

Common issues are covered in the Troubleshooting section above. If you encounter other issues:

1. Check application logs
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure file permissions are correct
5. Contact your hosting provider for cPanel-specific issues

---

## 🎯 Best Practices

1. **Always test in staging first** if possible
2. **Keep backups** before major updates
3. **Use environment variables** for sensitive data (never commit `.env`)
4. **Monitor logs** regularly for errors
5. **Keep dependencies updated** for security
6. **Use HTTPS** for production (most cPanel hosts provide SSL)

---

**Last Updated:** 2024
**Version:** 1.0
