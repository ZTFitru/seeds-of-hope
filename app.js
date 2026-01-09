// Alternative entry point for cPanel
// Some cPanel setups prefer app.js at root level
// This file redirects to the backend server

const path = require('path');

// Change to backend directory
process.chdir(path.join(__dirname, 'backend'));

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Start the server (server.js is now in current directory after chdir)
require('./server.js');