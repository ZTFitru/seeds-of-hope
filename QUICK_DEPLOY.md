# Quick Deployment Reference

**For detailed instructions, see [CPANEL_DEPLOYMENT_GUIDE.md](./CPANEL_DEPLOYMENT_GUIDE.md)**

## 🚀 Quick Start

### 1. Prepare for Deployment

**Windows (PowerShell):**
```powershell
.\deploy-to-cpanel.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy-to-cpanel.sh
./deploy-to-cpanel.sh
```

This creates a `cpanel-deploy/` directory with everything ready.

### 2. Upload to cPanel

Upload all contents of `cpanel-deploy/` to your `public_html` directory via:
- cPanel File Manager
- FTP/SFTP
- Git (if available)

### 3. Install Backend Dependencies

SSH into cPanel or use Terminal:
```bash
cd ~/public_html/backend
npm install
```

### 4. Configure Environment

Create `backend/.env` file:
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TO_EMAIL=admin@seeds-of-hope.org
FROM_EMAIL=your-email@gmail.com
```

### 5. Setup Node.js App in cPanel

1. Go to **cPanel → Setup Node.js App**
2. Create application:
   - **Startup file**: `passenger_wsgi.js`
   - **Application root**: `/home/YOUR_USERNAME/public_html`
3. Click **Run NPM install**
4. Click **Restart App**

### 6. Update .htaccess

Edit `public_html/.htaccess`:
- Replace `YOUR_USERNAME` with your cPanel username
- Update Node.js path (found in Node.js App interface)

### 7. Test

- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/backend/health`
- Contact form: Submit and verify emails

## 📋 Directory Structure

```
public_html/
├── .htaccess
├── passenger_wsgi.js
├── index.html (and other frontend files)
└── backend/
    ├── .env
    ├── server.js
    └── node_modules/
```

## ⚡ Common Commands

```bash
# Build frontend with API URL
cd frontend && NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build

# Or with relative path
cd frontend && NEXT_PUBLIC_API_URL=/backend npm run build

# Install backend deps
cd backend && npm install --production

# Restart Node.js app (in cPanel)
# Use Node.js App interface → Restart App
```

## 🔗 Setting API URL

**Important:** Set the API URL before building the frontend!

```bash
# Full URL (recommended)
NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend npm run build

# Relative path (simpler, works on same domain)
NEXT_PUBLIC_API_URL=/backend npm run build
```

See **[SETUP_API_URL.md](./SETUP_API_URL.md)** for detailed API URL configuration.

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend 404 | Check Node.js app is running, verify `.htaccess` |
| CORS errors | Update `FRONTEND_URL` in `backend/.env` |
| Module not found | Run `npm install` in `backend/` directory |
| Port error | Remove `PORT` from `.env` (Passenger handles it) |

## 📚 Full Documentation

- **[SETUP_API_URL.md](./SETUP_API_URL.md)** - Quick guide for API URL setup ⭐ **Start here for API configuration**
- **[CPANEL_DEPLOYMENT_GUIDE.md](./CPANEL_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[API_URL_CONFIGURATION.md](./API_URL_CONFIGURATION.md)** - Detailed API URL configuration options
- **[DEPLOYMENT_STRUCTURE.md](./DEPLOYMENT_STRUCTURE.md)** - Directory structure details
- **[PRODUCTION_API_SETUP.md](./PRODUCTION_API_SETUP.md)** - Legacy API configuration guide
