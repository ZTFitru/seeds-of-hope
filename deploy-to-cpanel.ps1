# ============================================
# Seeds of Hope - cPanel Deployment Script (Windows PowerShell)
# ============================================
# This script prepares your application for cPanel deployment
# Run this script before uploading to cPanel

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Seeds of Hope - cPanel Deployment Preparation" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the project root
if (-not (Test-Path "package.json") -or -not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Building frontend for production..." -ForegroundColor Yellow
Set-Location frontend

# Check if NEXT_PUBLIC_API_URL is set
if (-not $env:NEXT_PUBLIC_API_URL) {
    Write-Host "Warning: NEXT_PUBLIC_API_URL not set." -ForegroundColor Yellow
    Write-Host "Using default: /backend (relative path)" -ForegroundColor Yellow
    Write-Host "To use full URL, set: `$env:NEXT_PUBLIC_API_URL='https://seedsofhopesc.org/backend'" -ForegroundColor Yellow
    Write-Host "Or set it before running this script: `$env:NEXT_PUBLIC_API_URL='https://seedsofhopesc.org/backend'; .\deploy-to-cpanel.ps1" -ForegroundColor Yellow
    $env:NEXT_PUBLIC_API_URL = "/backend"
}

Write-Host "Using API URL: $env:NEXT_PUBLIC_API_URL" -ForegroundColor Green

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "Step 2: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install --production
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Backend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "Step 3: Creating deployment package structure..." -ForegroundColor Yellow

# Create deployment directory
$DeployDir = "cpanel-deploy"
if (Test-Path $DeployDir) {
    Remove-Item -Recurse -Force $DeployDir
}
New-Item -ItemType Directory -Path $DeployDir | Out-Null

# Copy frontend build output
Write-Host "  - Copying frontend build files..."
Copy-Item -Recurse -Path "frontend\out\*" -Destination $DeployDir -Force

# Copy backend
Write-Host "  - Copying backend files..."
New-Item -ItemType Directory -Path "$DeployDir\backend" | Out-Null
Get-ChildItem -Path "backend" -Exclude "node_modules" | Copy-Item -Recurse -Destination "$DeployDir\backend" -Force

# Copy root files
Write-Host "  - Copying configuration files..."
Copy-Item ".htaccess" -Destination $DeployDir -Force
Copy-Item "app.js" -Destination $DeployDir -Force
Copy-Item "passenger_wsgi.js" -Destination $DeployDir -Force
Copy-Item "package.json" -Destination $DeployDir -Force

# Create .env.example if it doesn't exist
if (-not (Test-Path "$DeployDir\backend\.env.example")) {
    Write-Host "  - Creating .env.example..."
    $envExample = @"
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
"@
    $envExample | Out-File -FilePath "$DeployDir\backend\.env.example" -Encoding UTF8
}

Write-Host "✓ Deployment package created in: $DeployDir" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Deployment package ready!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Upload the contents of '$DeployDir' to your cPanel public_html directory"
Write-Host "2. SSH into your cPanel account and run:"
Write-Host "   cd ~/public_html/backend"
Write-Host "   npm install"
Write-Host "3. Create .env file in backend directory with your configuration"
Write-Host "4. Configure Node.js app in cPanel -> Setup Node.js App"
Write-Host "5. Update .htaccess with your cPanel username and Node.js path"
Write-Host ""
Write-Host "See CPANEL_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
