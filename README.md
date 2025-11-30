# Grapes - Baby Feeding Tracker

A secure, production-ready baby feeding tracker built with Nuxt 3, Cloudflare Pages, and D1 database.

## Features

- 🔐 Secure authentication with HMAC-signed cookies
- 📊 Feeding entry tracking with statistics
- 📈 Data visualization with charts
- 📥 CSV import functionality
- 🛡️ Rate limiting and security headers
- 🚀 Deployed on Cloudflare Pages with D1 database

## Prerequisites

- Node.js 18+ 
- npm or pnpm
- Cloudflare account (for production deployment)
- Wrangler CLI (`npm install -g wrangler`)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

Generate a secure secret:
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
$in="secret"; [Convert]::ToBase64String([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($in)))
```

### 3. Initialize Local D1 Database

```bash
# Create local D1 database
npx wrangler d1 execute grapes_db --local --file=./server/db/schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

**Default Login Credentials:**
- Username: `admin`
- Password: `password`

## Production Deployment

### 1. Create Cloudflare D1 Database

```bash
# Create production database
wrangler d1 create grapes_db

# Note the database_id from the output
# Update wrangler.toml with the production database_id
```

### 2. Initialize Production Database

```bash
# Run schema on production database
wrangler d1 execute grapes_db --file=./server/db/schema.sql
```

### 3. Configure Environment Variables

In your Cloudflare Pages dashboard, set the following environment variables:

- `AUTH_SECRET`: Your secure random string (use `openssl rand -base64 32`)
- `NODE_ENV`: `production`

### 4. Deploy to Cloudflare Pages

```bash
# Build for production
npm run build

# Deploy using Wrangler
wrangler pages deploy .output/public
```

Or connect your GitHub repository to Cloudflare Pages for automatic deployments.

## Security Features

### Authentication
- HMAC-SHA256 signed cookies with expiration
- HttpOnly, Secure, SameSite cookies
- Session expiration after 7 days

### Rate Limiting
- Login endpoint limited to 5 attempts per 15 minutes per IP
- Automatic cleanup of old rate limit entries

### Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` for camera, microphone, geolocation

### Input Validation
- All endpoints validate required fields
- Pagination limits enforced (1-1000 entries)
- SQL injection protection via parameterized queries

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/user` - Get current user

### Entries (All require authentication)
- `GET /api/entries` - Get entries (supports pagination: `?limit=100&offset=0`)
- `POST /api/entries` - Create new entry
- `PUT /api/entries` - Update entry
- `DELETE /api/entries?id=123` - Delete entry
- `POST /api/entries/bulk` - Bulk import entries

## Database Schema

```sql
CREATE TABLE Entries (
    id INTEGER PRIMARY KEY,
    time TEXT NOT NULL,
    feedingAmount INTEGER,
    sensor INTEGER,
    glucometerReading INTEGER,
    drip INTEGER,
    nutritionType TEXT,
    extra TEXT
);

CREATE TABLE Users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);
```

## Troubleshooting

### "AUTH_SECRET environment variable is required" Error

Make sure you've set the `AUTH_SECRET` environment variable in your Cloudflare Pages dashboard or `.env` file for local development.

### Database Connection Issues

For local development, ensure you've initialized the local D1 database:
```bash
npx wrangler d1 execute grapes_db --local --file=./server/db/schema.sql
```

For production, verify your `database_id` in `wrangler.toml` matches your Cloudflare D1 database.

### Rate Limiting Issues

If you're locked out due to too many login attempts, wait 15 minutes or restart the development server to clear the in-memory rate limit cache.

## License

Private - All Rights Reserved
