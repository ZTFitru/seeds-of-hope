# Seeds of Hope Backend API

Backend API for the Seeds of Hope application, built with Node.js and Express.

## Features

- ✅ Contact form email handling with Nodemailer
- ✅ Input validation and error handling
- ✅ CORS configuration for frontend integration
- 🚀 Ready for database integration
- 🚀 Ready for payment processing integration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Email account with SMTP access (Gmail, Outlook, etc.)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your configuration:
   - SMTP settings for email
   - Email addresses
   - Server port (default: 5000)

3. **For Gmail users:**
   - Enable 2-factor authentication
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use the app password in `SMTP_PASS`

4. **Start the server:**
   ```bash
   # Development mode (with nodemon for auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns server status

### Contact Form
- **POST** `/api/contact`
  - **Body:**
    ```json
    {
      "name": "John Smith",
      "email": "john@example.com",
      "message": "Your message here"
    }
    ```
  - **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "Your message has been sent successfully. We will get back to you soon!"
    }
    ```
  - **Error Response (400/500):**
    ```json
    {
      "success": false,
      "message": "Error message",
      "errors": [...]
    }
    ```

## Project Structure

```
backend/
├── config/
│   └── nodemailer.js      # Email configuration
├── middleware/
│   └── validation.js      # Input validation
├── routes/
│   └── contact.js         # Contact form routes
├── server.js              # Main server file
├── package.json
├── .env.example
└── README.md
```

## Future Enhancements

### Database Integration
The project structure is ready for database integration. You can add:
- Database models in a `models/` directory
- Database connection in `config/database.js`
- Additional routes for data persistence

### Payment Processing
Ready for payment integration with:
- Stripe
- PayPal
- Other payment gateways

Add payment routes in `routes/payments.js` when ready.

## Environment Variables

See `.env.example` for all available configuration options.

## Troubleshooting

### Email not sending?
1. Verify SMTP credentials in `.env`
2. Check firewall/network settings
3. For Gmail: Ensure App Password is used (not regular password)
4. Check server logs for detailed error messages

### CORS errors?
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that the frontend is making requests to the correct backend URL

## License

ISC
