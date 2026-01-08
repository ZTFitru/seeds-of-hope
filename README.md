# Seeds of Hope

Full-stack application for Seeds of Hope charity organization.

## Project Structure

```
seeds-of-hope/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express backend API
└── package.json       # Root package.json for running both
```

## Quick Start

### Install Dependencies

Install all dependencies (root, frontend, and backend):
```bash
npm run install:all
```

Or install individually:
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install

# Backend dependencies
cd backend && npm install
```

### Run Development Servers

Run both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### Run Individual Servers

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## Backend Setup

Before running the backend, make sure to:

1. Copy the environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Configure your email settings in `backend/.env`:
   - SMTP credentials
   - Email addresses
   - See `backend/README.md` for detailed instructions

## Frontend Setup

The frontend is a Next.js application. No additional setup required beyond installing dependencies.

## Technologies

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express, Nodemailer
- **Email**: SMTP via Nodemailer

## License

ISC
