# Database Setup Guide

This guide explains the database structure and how to set up the database for the Seeds of Hope application.

## Overview

The application uses **MySQL** with **Sequelize ORM** for database management. The database is hosted remotely and contains four main tables plus one relational table for guest speakers.

## Database Structure

### 1. Users Table (`users`)

Stores user account information for authentication, account management, and payment processor connectivity.

**Fields:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `email` (STRING, UNIQUE, REQUIRED) - User email address
- `password` (STRING, REQUIRED) - Hashed password (bcrypt)
- `firstName` (STRING, REQUIRED) - User's first name
- `lastName` (STRING, REQUIRED) - User's last name
- `phone` (STRING, OPTIONAL) - Phone number
- `emailNotifications` (BOOLEAN, DEFAULT: true) - Email notification preferences
- `eventUpdates` (BOOLEAN, DEFAULT: true) - Event update email preferences
- `paypalEmail` (STRING, OPTIONAL) - PayPal account email
- `paypalAccountId` (STRING, OPTIONAL) - PayPal account identifier
- `isActive` (BOOLEAN, DEFAULT: true) - Account active status
- `isVerified` (BOOLEAN, DEFAULT: false) - Email verification status
- `verificationToken` (STRING, OPTIONAL) - Email verification token
- `resetPasswordToken` (STRING, OPTIONAL) - Password reset token
- `resetPasswordExpires` (DATE, OPTIONAL) - Password reset expiration
- `createdAt` (DATE) - Record creation timestamp
- `updatedAt` (DATE) - Record update timestamp

**Relationships:**
- One-to-Many with `tickets` (User can have many tickets)
- One-to-Many with `donations` (User can make many donations)

### 2. Events Table (`events`)

Stores event information including date, time, location, and capacity details.

**Fields:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `title` (STRING, REQUIRED) - Event title
- `description` (TEXT, OPTIONAL) - Event description
- `eventDate` (DATE, REQUIRED) - Event date and time
- `endDate` (DATE, OPTIONAL) - End date/time for multi-day events
- `location` (STRING, REQUIRED) - Event location name
- `address` (TEXT, OPTIONAL) - Full address
- `city` (STRING, OPTIONAL) - City
- `state` (STRING, OPTIONAL) - State
- `zipCode` (STRING, OPTIONAL) - ZIP code
- `venue` (STRING, OPTIONAL) - Venue name
- `maxCapacity` (INTEGER, OPTIONAL) - Maximum attendees
- `ticketPrice` (DECIMAL, DEFAULT: 0.00) - Price per ticket
- `isActive` (BOOLEAN, DEFAULT: true) - Event active status
- `isPublished` (BOOLEAN, DEFAULT: false) - Public visibility
- `registrationOpen` (BOOLEAN, DEFAULT: true) - Registration status
- `imageUrl` (STRING, OPTIONAL) - Event image/banner URL
- `category` (STRING, OPTIONAL) - Event category
- `createdAt` (DATE) - Record creation timestamp
- `updatedAt` (DATE) - Record update timestamp

**Relationships:**
- One-to-Many with `event_speakers` (Event can have many speakers)
- One-to-Many with `tickets` (Event can have many tickets purchased)

### 3. Event Speakers Table (`event_speakers`)

Relational table listing guest speakers and appearances for events.

**Fields:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `eventId` (INTEGER, REQUIRED, FOREIGN KEY) - Reference to events table
- `name` (STRING, REQUIRED) - Speaker/performer name
- `title` (STRING, OPTIONAL) - Professional title or role
- `bio` (TEXT, OPTIONAL) - Biography or description
- `imageUrl` (STRING, OPTIONAL) - Speaker image URL
- `appearanceType` (STRING, DEFAULT: 'speaker') - Type of appearance
- `scheduledTime` (DATE, OPTIONAL) - Scheduled time for this appearance
- `order` (INTEGER, DEFAULT: 0) - Display order
- `createdAt` (DATE) - Record creation timestamp
- `updatedAt` (DATE) - Record update timestamp

**Relationships:**
- Many-to-One with `events` (Each speaker belongs to one event)

### 4. Tickets Table (`tickets`)

Relational table connecting users and events with ticket purchase information. Implements one-to-many relationships with both Users and Events.

**Fields:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `userId` (INTEGER, REQUIRED, FOREIGN KEY) - Reference to users table
- `eventId` (INTEGER, REQUIRED, FOREIGN KEY) - Reference to events table
- `quantity` (INTEGER, REQUIRED, DEFAULT: 1) - Number of tickets purchased
- `unitPrice` (DECIMAL, REQUIRED, DEFAULT: 0.00) - Price per ticket
- `totalAmount` (DECIMAL, REQUIRED) - Total amount (auto-calculated)
- `paymentStatus` (ENUM: 'pending', 'completed', 'failed', 'refunded') - Payment status
- `paymentMethod` (STRING, OPTIONAL) - Payment method used
- `paymentTransactionId` (STRING, OPTIONAL) - Transaction ID from payment processor
- `paymentDate` (DATE, OPTIONAL) - Payment completion date
- `ticketCode` (STRING, UNIQUE) - Unique ticket code/identifier (auto-generated)
- `attendeeNames` (JSON, OPTIONAL) - Array of attendee names
- `specialRequests` (TEXT, OPTIONAL) - Special requests
- `createdAt` (DATE) - Record creation timestamp
- `updatedAt` (DATE) - Record update timestamp

**Relationships:**
- Many-to-One with `users` (Each ticket belongs to one user)
- Many-to-One with `events` (Each ticket belongs to one event)

### 5. Donations Table (`donations`)

Stores donation information with support for anonymous donations and payment processor connectivity.

**Fields:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `name` (STRING, OPTIONAL) - Donor name (null for anonymous)
- `email` (STRING, REQUIRED) - Donor email address
- `userId` (INTEGER, OPTIONAL, FOREIGN KEY) - Reference to users table (if registered)
- `amount` (DECIMAL, REQUIRED) - Donation amount
- `isAnonymous` (BOOLEAN, DEFAULT: false) - Anonymous donation flag
- `paymentProcessor` (STRING, DEFAULT: 'paypal') - Payment processor used
- `paymentTransactionId` (STRING, UNIQUE, OPTIONAL) - Transaction ID
- `paymentStatus` (ENUM: 'pending', 'completed', 'failed', 'refunded') - Payment status
- `paymentDate` (DATE, OPTIONAL) - Payment completion date
- `paypalOrderId` (STRING, OPTIONAL) - PayPal order ID
- `paypalPayerId` (STRING, OPTIONAL) - PayPal payer ID
- `paypalEmail` (STRING, OPTIONAL) - PayPal account email
- `message` (TEXT, OPTIONAL) - Donor message
- `donationType` (STRING, OPTIONAL) - Type of donation
- `recurringDonation` (BOOLEAN, DEFAULT: false) - Recurring donation flag
- `recurringDonationId` (STRING, OPTIONAL) - Recurring donation subscription ID
- `receiptSent` (BOOLEAN, DEFAULT: false) - Receipt email status
- `receiptSentAt` (DATE, OPTIONAL) - Receipt sent timestamp
- `taxReceiptNumber` (STRING, OPTIONAL) - Tax receipt number
- `createdAt` (DATE) - Record creation timestamp
- `updatedAt` (DATE) - Record update timestamp

**Relationships:**
- Many-to-One with `users` (Optional - donation can be linked to user account)

## Environment Variables

Make sure your `.env` file in the `backend` directory contains:

```env
# Database Configuration
DB_HOST=amelia.ducimus.digital
DB_NAME=seedsofhope_main
DB_USER=seedsofhope_gd
DB_PASSWORD=your_password_here
DB_PORT=3306  # Optional, defaults to 3306

# Optional: Auto-sync database on server start (default: false)
# DB_AUTO_SYNC=false  # Set to 'true' to auto-create tables on startup
```

## Initializing the Database

### Method 1: Using npm script (Recommended)

```bash
cd backend

# Initialize database (creates tables if they don't exist)
npm run db:init

# Force reinitialize (WARNING: Drops all existing tables and recreates them)
npm run db:init:force
```

### Method 2: Direct script execution

```bash
cd backend

# Normal initialization
node scripts/initDatabase.js

# Force reinitialize
node scripts/initDatabase.js --force
```

### Method 3: Auto-sync on server start

If you want tables to be automatically created when the server starts (not recommended for production):

1. Add to your `.env` file:
   ```env
   DB_AUTO_SYNC=true
   ```

2. Start the server normally:
   ```bash
   npm start
   ```

**⚠️ Warning:** Auto-sync will only create tables if they don't exist. It will NOT drop existing tables. Use the initialization script with `--force` flag for that.

## Verifying Database Connection

The server will automatically test the database connection on startup. Check the console output for:

```
Initializing database connection...
Database connection has been established successfully.
Database ready.
```

If you see connection errors, verify:
1. Database credentials in `.env` file are correct
2. Database server is accessible from your network
3. Firewall allows connections on the database port (default: 3306)
4. User has proper permissions to create tables and access the database

## Usage in Code

### Importing Models

```javascript
const { User, Event, EventSpeaker, Ticket, Donation } = require('./models');

// Or import individually
const User = require('./models/User');
```

### Basic CRUD Operations

```javascript
// Create a user
const user = await User.create({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Find with relationships
const event = await Event.findOne({
  where: { id: 1 },
  include: [{ model: EventSpeaker, as: 'speakers' }]
});

// Create ticket with relationships
const ticket = await Ticket.create({
  userId: 1,
  eventId: 1,
  quantity: 2,
  unitPrice: 25.00
});
```

## Database Relationships Summary

```
Users (1) ──< (Many) Tickets (Many) >── (1) Events
  │                                        │
  │                                        │
  │                                        │
 (1) ──< (Many) Donations                  │
                                          │
                                          │
                                          │
                                      (1) ──< (Many) EventSpeakers
```

## Notes

- All tables use UTC timezone for consistency
- Timestamps are automatically managed by Sequelize
- Foreign key constraints use CASCADE deletion where appropriate
- Password hashing is handled automatically via bcrypt hooks
- Ticket codes are auto-generated on creation
- Anonymous donations will have `name` set to null

## Troubleshooting

### Connection Errors

If you get connection errors:
- Verify database credentials
- Check if database server is running
- Verify network connectivity
- Check firewall settings

### Table Creation Errors

If tables aren't created:
- Verify user has CREATE TABLE permissions
- Check database name is correct
- Review error logs for specific issues
- Try running initialization script with detailed logging

### Relationship Issues

If relationships aren't working:
- Ensure all models are imported via `models/index.js`
- Check foreign key constraints in database
- Verify table names match model definitions
