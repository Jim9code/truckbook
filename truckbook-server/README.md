# TruckBooks Backend Server

Backend API server for TruckBooks logistics management application.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=truckbooks_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Important:** Update `DB_PASSWORD` with your MySQL password and set a strong `JWT_SECRET`.

### 3. Create MySQL Database

```sql
CREATE DATABASE truckbooks_db;
```

### 4. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in `.env`).

## Project Structure

```
truckbook-server/
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env                      # Environment variables (create this)
├── .env.example              # Environment template
└── src/
    ├── config/
    │   └── database.js       # Sequelize database configuration
    ├── models/               # Sequelize models
    ├── controllers/          # Route controllers
    ├── routes/               # API routes
    ├── services/             # Business logic
    ├── middleware/           # Custom middleware (auth, etc.)
    └── utils/                # Utility functions
```

## API Endpoints

Will be documented as routes are implemented.

## Health Check

Visit `http://localhost:5000/health` to verify the server is running.

