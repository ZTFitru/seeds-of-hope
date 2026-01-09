#!/bin/bash
# ============================================
# Seeds of Hope - cPanel Deployment Script
# ============================================
# This script prepares your application for cPanel deployment
# Run this script before uploading to cPanel

set -e  # Exit on error

echo "============================================"
echo "Seeds of Hope - cPanel Deployment Preparation"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Building frontend for production...${NC}"
cd frontend

# Check if NEXT_PUBLIC_API_URL is set
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo -e "${YELLOW}Warning: NEXT_PUBLIC_API_URL not set.${NC}"
    echo -e "${YELLOW}Using default: /backend (relative path)${NC}"
    echo -e "${YELLOW}To use full URL, set: NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend${NC}"
    echo -e "${YELLOW}Or export it before running this script: export NEXT_PUBLIC_API_URL=https://seedsofhopesc.org/backend${NC}"
    export NEXT_PUBLIC_API_URL="/backend"
fi

echo -e "${GREEN}Using API URL: ${NEXT_PUBLIC_API_URL}${NC}"

npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"

cd ..

echo ""
echo -e "${YELLOW}Step 2: Installing backend dependencies...${NC}"
cd backend
npm install --production
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

echo ""
echo -e "${YELLOW}Step 3: Creating deployment package structure...${NC}"

# Create deployment directory
DEPLOY_DIR="cpanel-deploy"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy frontend build output
echo "  - Copying frontend build files..."
cp -r frontend/out/* "$DEPLOY_DIR/"

# Copy backend
echo "  - Copying backend files..."
mkdir -p "$DEPLOY_DIR/backend"
cp -r backend/* "$DEPLOY_DIR/backend/"
# Remove node_modules from backend (will be installed on server)
rm -rf "$DEPLOY_DIR/backend/node_modules"

# Copy root files
echo "  - Copying configuration files..."
cp .htaccess "$DEPLOY_DIR/"
cp app.js "$DEPLOY_DIR/"
cp passenger_wsgi.js "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"

# Create .env.example if it doesn't exist
if [ ! -f "$DEPLOY_DIR/backend/.env.example" ]; then
    echo "  - Creating .env.example..."
    cat > "$DEPLOY_DIR/backend/.env.example" << 'EOF'
# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS) - can be comma-separated
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
EOF
fi

echo -e "${GREEN}✓ Deployment package created in: $DEPLOY_DIR${NC}"

echo ""
echo -e "${GREEN}============================================"
echo "Deployment package ready!"
echo "============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Upload the contents of '$DEPLOY_DIR' to your cPanel public_html directory"
echo "2. SSH into your cPanel account and run:"
echo "   cd ~/public_html/backend"
echo "   npm install"
echo "3. Create .env file in backend directory with your configuration"
echo "4. Configure Node.js app in cPanel -> Setup Node.js App"
echo "5. Update .htaccess with your cPanel username and Node.js path"
echo ""
echo "See CPANEL_DEPLOYMENT_GUIDE.md for detailed instructions"
