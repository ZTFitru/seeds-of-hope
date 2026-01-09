// Passenger WSGI file for cPanel Node.js applications
// This file tells Passenger where your application entry point is
const path = require('path');

// Set the working directory to backend
process.chdir(path.join(__dirname, 'backend'));

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Load the application
require('./server.js');