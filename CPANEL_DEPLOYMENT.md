# cPanel Deployment Guide for Seeds of Hope

> **⚠️ This is the legacy deployment guide. For the most up-to-date and comprehensive guide, see [CPANEL_DEPLOYMENT_GUIDE.md](./CPANEL_DEPLOYMENT_GUIDE.md)**
>
> **For a quick start, see [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)**

This guide will help you deploy your Node.js application to cPanel.

## Common Issues and Solutions

### Issue 1: "npm start" Command Not Found
**Solution**: The root `package.json` now includes a `start` script that points to the backend server.

### Issue 2: Port Configuration
cPanel may assign ports automatically or require specific port configurations:
- Set `PORT` or `PORT_NUMBER` in your `.env` file
- Passenger typically handles ports automatically, so you may not need to set this

### Issue 3: Missing Entry Point
We've created multiple entry points to support different cPanel configurations:
- `app.js` - Root level entry point (some cPanel setups prefer this)
- `passenger_wsgi.js` - For Passenger-based Node.js hosting
- `package.json` - Has `start` script pointing to backend

## Step-by-Step Deployment

### 1. Upload Your Files
Upload all files to your cPanel hosting account, typically to the `public_html` directory.

### 2. Install Node.js Version in cPanel
1. Go to **cPanel → Select PHP Version** (or **Setup Node.js App**)
2. Select or install Node.js version (14.x or higher recommended)
3. Note the path where Node.js is installed

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

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

**Important**: In cPanel, you may need to set environment variables through the cPanel interface instead of using a `.env` file. Check your hosting provider's documentation.

### 4. Install Dependencies
SSH into your cPanel account and run:
```bash
cd ~/public_html
npm install
cd backend
npm install
```

Or if you have access to Terminal in cPanel:
```bash
npm run install:all
```

### 5. Configure .htaccess File
Update the `.htaccess` file with your actual paths:
- Replace `your_username` with your cPanel username
- Update the Node.js path if different from the default

### 6. Set Up Node.js App in cPanel
1. Go to **cPanel → Setup Node.js App** (or similar)
2. Create a new application:
   - **Application root**: `/home/your_username/public_html`
   - **Application URL**: `/` (or your subdomain)
   - **Application startup file**: `app.js` or `passenger_wsgi.js` (try both if one doesn't work)
   - **Application mode**: Production
   - **Node.js version**: Latest stable (14.x or higher)

### 7. Start the Application
In cPanel's Node.js App interface:
- Click **Run NPM install**
- Click **Restart App**

Or via SSH:
```bash
npm start
```

## Troubleshooting

### Error: "Cannot find module"
- Make sure all dependencies are installed: `npm install` in both root and backend directories
- Check that `node_modules` folders exist

### Error: "Port already in use"
- Remove the `PORT` from `.env` if using Passenger (it assigns ports automatically)
- Or set a different port number

### Error: "EADDRINUSE" or "Permission denied"
- Passenger handles ports automatically, so don't set `PORT` in `.env` if using Passenger
- If manually managing ports, use a port above 1024

### Application starts but shows errors
1. Check error logs in cPanel:
   - **Error Log** section in cPanel
   - Application logs in Node.js App interface
2. Verify `.env` file exists in `backend` directory
3. Check that all required environment variables are set
4. Ensure SMTP credentials are correct

### Check if the server is running
Visit: `https://yourdomain.com/health`
You should see: `{"status":"ok","message":"Server is running"}`

### View Logs
Check logs in these locations:
1. cPanel → **Error Log**
2. cPanel → **Node.js App** → View logs
3. SSH: Check output of `npm start` command

## Alternative: Using Package Manager Scripts

If Passenger setup doesn't work, try running directly:
```bash
cd ~/public_html
npm start
```

This will run the backend server. You may need to set up a reverse proxy or use cPanel's port forwarding features.

## Need Help?

Common issues to check:
1. ✅ Node.js version is compatible (14.x or higher)
2. ✅ All dependencies installed (`node_modules` exists)
3. ✅ `.env` file exists in `backend` directory with all required variables
4. ✅ Port is not conflicting (or let Passenger handle it)
5. ✅ Application entry point is correctly set in cPanel
6. ✅ File permissions are correct (755 for directories, 644 for files)

If you're still getting errors, check the specific error message in cPanel's error logs and compare it with the solutions above.