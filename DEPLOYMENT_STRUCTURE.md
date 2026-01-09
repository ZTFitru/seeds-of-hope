# Deployment Structure for cPanel

This document explains the recommended directory structure for deploying Seeds of Hope to cPanel hosting.

## 📁 Recommended cPanel Structure

```
public_html/                          # cPanel web root
│
├── .htaccess                         # Main routing & Passenger config
├── app.js                            # Alternative Node.js entry point
├── passenger_wsgi.js                 # Passenger entry point (primary)
├── package.json                      # Root package.json
│
├── index.html                        # Frontend homepage
├── *.html                            # Other frontend pages (Next.js export)
├── _next/                            # Next.js static assets
│   └── static/                       # CSS, JS, fonts, etc.
├── images/                           # Frontend images
├── [other static files]              # All frontend static assets
│
└── backend/                          # Backend Node.js API
    ├── .env                          # Environment variables (create this)
    ├── .env.example                  # Example env file
    ├── server.js                     # Express server entry point
    ├── package.json                  # Backend dependencies
    ├── package-lock.json
    ├── node_modules/                 # Installed after deployment
    ├── routes/
    │   └── contact.js                # Contact form route
    ├── config/
    │   └── nodemailer.js             # Email configuration
    └── middleware/
        └── validation.js             # Request validation
```

## 🎯 Key Organizational Principles

### 1. **Separation of Concerns**
- **Frontend**: All static files in `public_html/` root
- **Backend**: Node.js API in `public_html/backend/`
- **Configuration**: Root-level config files (`.htaccess`, entry points)

### 2. **URL Routing**
- Frontend pages: `https://yourdomain.com/` and `https://yourdomain.com/page`
- Backend API: `https://yourdomain.com/backend/api/*`
- Health check: `https://yourdomain.com/backend/health`

### 3. **Entry Points**
- **Primary**: `passenger_wsgi.js` (for Passenger/Node.js apps)
- **Alternative**: `app.js` (if Passenger doesn't work)
- Both point to `backend/server.js`

## 🔄 How It Works

### Request Flow

1. **Frontend Request** (`/` or `/page`):
   ```
   Browser → Apache → .htaccess → Serve static HTML file
   ```

2. **Backend API Request** (`/backend/api/contact`):
   ```
   Browser → Apache → .htaccess → Passenger → Node.js (backend/server.js) → Express routes
   ```

3. **Static Assets** (`/_next/static/...`):
   ```
   Browser → Apache → Direct file serve (no processing)
   ```

### .htaccess Routing Logic

```apache
# Backend API requests
/backend/* → Passenger/Node.js application

# Frontend requests
/* → Static file serve with .html extension handling
```

## 📦 Deployment Package Structure

When you run the deployment script, it creates:

```
cpanel-deploy/
├── .htaccess
├── app.js
├── passenger_wsgi.js
├── package.json
├── index.html
├── [all frontend static files]
└── backend/
    ├── .env.example
    ├── server.js
    ├── package.json
    ├── [all backend source files]
    └── (node_modules installed on server)
```

## ✅ Benefits of This Structure

1. **Clear Separation**: Frontend and backend are clearly separated
2. **Easy Updates**: Update frontend or backend independently
3. **Standard cPanel**: Follows cPanel conventions
4. **Scalable**: Easy to add more backend routes or frontend pages
5. **Maintainable**: Clear file organization makes debugging easier

## 🔧 Customization Options

### Option 1: Subdomain for Backend
If you prefer `api.yourdomain.com` instead of `yourdomain.com/backend`:
- Deploy backend to `api.yourdomain.com` subdomain
- Update frontend `NEXT_PUBLIC_API_URL` to `https://api.yourdomain.com`
- Simpler routing, but requires subdomain setup

### Option 2: Backend in Separate Directory
If you want backend outside `public_html`:
- Deploy backend to `~/backend/` (outside public_html)
- Use reverse proxy in `.htaccess` to route `/backend/*` to Node.js
- More secure (backend not directly accessible), but more complex setup

### Option 3: Root-Level Backend
If you want API at root level:
- Not recommended for this structure
- Would require significant routing changes

## 📝 File Permissions

After deployment, set correct permissions:

```bash
# Directories
find ~/public_html -type d -exec chmod 755 {} \;

# Files
find ~/public_html -type f -exec chmod 644 {} \;

# Executable scripts (if any)
chmod 755 ~/public_html/app.js
chmod 755 ~/public_html/passenger_wsgi.js
```

## 🔒 Security Considerations

1. **.env File**: Never commit `.env` to version control
2. **node_modules**: Install on server, don't upload (except for deployment package)
3. **File Permissions**: Restrict access to sensitive files
4. **.htaccess**: Protects against directory browsing and configures security headers

## 🚀 Migration Path

If you're migrating from a different structure:

1. **Backup current setup**
2. **Run deployment script** to create clean structure
3. **Upload to cPanel** maintaining directory structure
4. **Install dependencies** on server
5. **Configure environment variables**
6. **Test thoroughly** before going live

---

**This structure is optimized for cPanel hosting and follows best practices for Node.js + static frontend deployments.**
