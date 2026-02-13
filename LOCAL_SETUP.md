# SoundCloudBoost - Local Development Setup

## Prerequisites

- Node.js v18+
- npm

## 1. Clone the Repository

```bash
git clone https://github.com/Dimuthu1234/soundcloud-boost.git
cd soundcloud-boost
```

## 2. Backend Setup

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# PayPal Sandbox
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_MODE=sandbox

# Mailtrap SMTP (optional - for email notifications)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password
EMAIL_FROM=noreply@soundcloudboost.com

# Frontend URL (for CORS and PayPal redirects)
FRONTEND_URL=http://localhost:5173
```

### Database setup

```bash
npx prisma migrate dev
node prisma/seed.js
```

This creates a SQLite database with:
- Default admin account
- 11 sample packages (SoundCloud Boost, Graphic Design, Video Editing)

### Start backend server

```bash
npm run dev
```

Backend runs at: **http://localhost:4000**

## 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
```

### Environment variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:4000
VITE_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
```

### Start frontend dev server

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

## 4. Default Credentials

### Admin Panel

- URL: http://localhost:5173/admin/login
- Email: `admin@soundcloudboost.com`
- Password: `admin123`

## 5. PayPal Sandbox Setup

To test payments locally:

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/accounts)
2. Create sandbox accounts with **United States** as the country:
   - **Business account** (seller/merchant - receives payments)
   - **Personal account** (buyer - makes test payments)
3. Go to **Apps & Credentials** > Create/select your sandbox app
4. Copy the **Client ID** and **Secret** into your `.env` files
5. When testing payments, log in with the **sandbox Personal account** credentials

> **Note:** Sandbox accounts created with Sri Lanka (LK) country may get `PAYMENT_DENIED` errors. Always use **US** country for sandbox accounts.

## 6. Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend with nodemon (auto-reload) |
| `npm start` | Start backend (production) |
| `npm run seed` | Seed database with sample data |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Run database migrations |
| `cd client && npm run dev` | Start frontend dev server |
| `cd client && npm run build` | Build frontend for production |

## 7. Project Structure

```
soundcloud-boost/
├── src/
│   ├── config/         # Database, PayPal, Mailtrap config
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth (JWT), validation, file upload
│   ├── routes/         # API route definitions
│   ├── services/       # PayPal & email services
│   └── server.js       # Express app entry point
├── prisma/
│   ├── schema.prisma   # Database models
│   └── seed.js         # Database seeder
├── client/             # React frontend (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components (user & admin)
│   │   └── services/   # API service layer
│   └── .env            # Frontend environment variables
├── .env                # Backend environment variables
└── railway.json        # Railway deployment config
```

## 8. API Endpoints

### Auth
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile (requires auth)

### Packages
- `GET /api/packages` - List all packages
- `GET /api/packages/:id` - Get package by ID
- `POST /api/packages` - Create package (admin)
- `PUT /api/packages/:id` - Update package (admin)
- `DELETE /api/packages/:id` - Delete package (admin)

### Orders
- `POST /api/orders` - Create order + PayPal payment
- `POST /api/orders/capture` - Capture PayPal payment
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/history?email=` - Get orders by email
- `GET /api/orders/admin/all` - List all orders (admin)
- `PUT /api/orders/admin/:id/status` - Update order status (admin)
- `GET /api/orders/admin/stats` - Dashboard stats (admin)

## 9. Deployment

- **Backend:** Deployed on [Railway](https://railway.app)
- **Frontend:** Deployed on [Vercel](https://vercel.com)

Refer to `railway.json` for Railway deployment configuration.
