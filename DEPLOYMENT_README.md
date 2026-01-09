# Deployment Organization for cPanel

This document explains how the Seeds of Hope application is organized for optimal cPanel hosting deployment.

## 🎯 Overview

The application has been reorganized to follow cPanel best practices with clear separation between frontend (static Next.js export) and backend (Node.js API), ensuring efficient deployment and maintenance.

## 📁 Project Structure

```
seeds-of-hope/
├── frontend/              # Next.js application (static export)
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── out/              # Built static files (deployed to public_html)
│
├── backend/              # Node.js Express API
│   ├── server.js        # Main server file
│   ├── routes/          # API routes
│   ├── config/          # Configuration (nodemailer, etc.)
│   └── middleware/      # Request validation, etc.
│
├── .htaccess            # Apache routing configuration
├── app.js               # Alternative Node.js entry point
├── passenger_wsgi.js   # Passenger entry point (primary)
│
└── [deployment files]   # Scripts and guides
```

## 🚀 Deployment Files

### Scripts
- **`deploy-to-cpanel.sh`** - Linux/Mac deployment preparation script
- **`deploy-to-cpanel.ps1`** - Windows PowerShell deployment script

### Documentation
- **`CPANEL_DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide
- **`QUICK_DEPLOY.md`** - Quick reference for deployment
- **`DEPLOYMENT_STRUCTURE.md`** - Detailed structure explanation
- **`CPANEL_DEPLOYMENT.md`** - Legacy guide (updated with references)

## 🔧 Key Features

### 1. Optimized Backend Routing
- Backend handles both `/api/*` and `/backend/api/*` paths
- Health check available at `/health` and `/backend/health`
- Flexible routing for different cPanel configurations

### 2. Comprehensive .htaccess
- Routes `/backend/*` to Node.js application
- Handles frontend static file routing
- Configures caching, compression, and security headers
- Supports Passenger configuration

### 3. Deployment Scripts
- Automatically builds frontend with correct API URL
- Installs backend production dependencies
- Creates ready-to-upload deployment package
- Includes environment variable examples

### 4. Clear Documentation
- Step-by-step deployment instructions
- Troubleshooting guides
- Structure explanations
- Best practices

## 📦 Deployment Process

1. **Prepare**: Run deployment script (`deploy-to-cpanel.sh` or `.ps1`)
2. **Upload**: Upload `cpanel-deploy/` contents to `public_html`
3. **Install**: Run `npm install` in `backend/` directory
4. **Configure**: Create `backend/.env` with your settings
5. **Setup**: Configure Node.js app in cPanel
6. **Test**: Verify frontend and backend are working

## 🎨 Benefits of This Organization

### For Development
- Clear separation of frontend and backend
- Easy to work on either independently
- Standard project structure

### For Deployment
- Optimized for cPanel hosting
- Follows cPanel conventions
- Easy to update and maintain
- Clear file organization

### For Maintenance
- Easy to locate files
- Clear routing logic
- Comprehensive documentation
- Troubleshooting guides

## 🔄 Update Workflow

### Frontend Updates
```bash
cd frontend
NEXT_PUBLIC_API_URL=/backend npm run build
# Upload frontend/out/* to public_html/
```

### Backend Updates
```bash
cd backend
# Make changes
npm install  # if dependencies changed
# Restart app in cPanel
```

## 📝 Environment Variables

### Frontend (Build Time)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `/backend`)

### Backend (Runtime)
- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (optional, Passenger handles it)
- `FRONTEND_URL` - Frontend domain for CORS
- `SMTP_*` - Email configuration
- `TO_EMAIL`, `FROM_EMAIL` - Email addresses

## 🛠️ Build Scripts

Added to root `package.json`:
- `npm run build` - Build both frontend and backend
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Install backend production deps
- `npm run build:production` - Full production build
- `npm run prepare:deploy` - Alias for production build

## 📚 Documentation Hierarchy

1. **QUICK_DEPLOY.md** - Start here for quick deployment
2. **CPANEL_DEPLOYMENT_GUIDE.md** - Complete step-by-step guide
3. **DEPLOYMENT_STRUCTURE.md** - Understand the structure
4. **CPANEL_DEPLOYMENT.md** - Legacy guide (still useful)

## ✅ Best Practices Implemented

1. ✅ Clear separation of concerns
2. ✅ Environment-based configuration
3. ✅ Production-ready build process
4. ✅ Comprehensive error handling
5. ✅ Security headers and configurations
6. ✅ Caching and compression
7. ✅ Documentation and guides
8. ✅ Deployment automation

## 🎯 Next Steps

1. Review the deployment guides
2. Test the deployment script locally
3. Prepare your cPanel environment
4. Follow the deployment guide step-by-step
5. Test thoroughly before going live

---

**This organization ensures your application is production-ready and easy to maintain on cPanel hosting.**
