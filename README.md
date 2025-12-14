# 🍵 Digital Cafe Order Queue System

A modern, full-stack order management system for cafes with real-time order tracking, admin dashboard, and beautiful UI. Built with JavaScript, Express, React, PostgreSQL, and Material-UI.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Quick Start](#quick-start)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [User Guide](#user-guide)
- [Development & Customization](#development--customization)
- [Troubleshooting](#troubleshooting)
- [Common Issues & Solutions](#common-issues--solutions)
- [Project Highlights](#project-highlights)

## ✨ Features

### Customer Features
- 📱 Browse menu items with beautiful cards and images
- 🛒 Add items to cart with quantity management (+/- buttons)
- 📝 Place orders (with optional customer name)
- 📊 Real-time order status tracking
- 🔄 Auto-refreshing order status page (5 seconds)
- 📈 Visual order progress with stepper component
- 🎉 Success notifications and feedback

### Admin Features
- 🔐 Secure JWT-based authentication
- 📈 Comprehensive order queue dashboard
- ✅ Update order status (NEW → PREPARING → READY → COMPLETED)
- 🔍 Filter orders by status
- 📋 View detailed order information
- 🗑️ Delete orders
- 🔄 Auto-refresh dashboard (every 10 seconds)
- 👤 User identification in header
- 📱 Responsive Material-UI design

### Technical Features
- 🔒 JWT authentication with 24-hour expiration
- 🗄️ PostgreSQL database with Prisma ORM
- 🎨 Material-UI components for professional UI
- ⚡ Real-time updates and auto-refresh
- 🚀 RESTful API architecture
- 📦 Clean, modular JavaScript code
- ✨ Simple, easy-to-understand codebase
- 🔌 Express.js middleware for auth and error handling

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js 4.18.2
- **Language:** JavaScript (ES6+)
- **Database:** PostgreSQL 14+
- **ORM:** Prisma 5.22.0
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **Development:** Nodemon 3.0.2

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.4.21
- **Language:** JavaScript (JSX)
- **UI Library:** Material-UI (MUI) 5.15.3
- **Routing:** React Router v6.21.1
- **HTTP Client:** Axios 1.6.5
- **State Management:** React Context API
- **Styling:** Material-UI + Emotion

## 📁 Project Structure

```
OrderManagement/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema definition
│   │   └── migrations/                # Database migration files
│   ├── src/
│   │   ├── index.js                   # Express server setup & routing
│   │   ├── seed.js                    # Database seeding script
│   │   ├── routes/
│   │   │   ├── auth.routes.js         # Login/register endpoints
│   │   │   ├── menu.routes.js         # Menu CRUD endpoints
│   │   │   └── order.routes.js        # Order management endpoints
│   │   └── middleware/
│   │       └── auth.middleware.js     # JWT authentication middleware
│   ├── package.json                   # Backend dependencies
│   ├── .env                           # Environment variables
│   └── node_modules/                  # Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                   # React entry point
│   │   ├── App.jsx                    # Main app component with routing
│   │   ├── index.css                  # Global styles
│   │   ├── pages/
│   │   │   ├── CustomerView.jsx       # Customer menu & shopping cart (400+ lines)
│   │   │   ├── AdminLogin.jsx         # Secure admin login page
│   │   │   ├── AdminDashboard.jsx     # Order queue management (350+ lines)
│   │   │   └── OrderTracking.jsx      # Real-time order tracking page
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx        # Global authentication state management
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx     # Route protection wrapper
│   │   └── services/
│   │       ├── api.js                 # Axios instance with interceptors
│   │       └── apiService.js          # API service functions
│   ├── index.html                     # HTML template
│   ├── vite.config.js                 # Vite build configuration
│   ├── package.json                   # Frontend dependencies
│   └── node_modules/                  # Dependencies
│
├── README.md                          # This file
└── .env (example)                     # Environment variables template
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher - [Download](https://nodejs.org/)
- **PostgreSQL** v14 or higher - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

## 🚀 Installation & Setup

### Step 1: Navigate to Project Directory

```bash
cd OrderManagement
```

### Step 2: Set Up PostgreSQL Database

1. **Start PostgreSQL** (if not running):
   ```bash
   # macOS (with Homebrew)
   brew services start postgresql@14
   
   # Or start manually
   pg_ctl -D /opt/homebrew/var/postgresql@14 start
   ```

2. **Verify PostgreSQL is running:**
   ```bash
   psql --version
   ```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npm run seed

# Sample data created:
# - Admin user: username=admin, password=admin123
# - 12 menu items: Coffees, Pastries, Food, Tea
# - 1 sample order for testing
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install
```

### Step 5: Configure Environment Variables

**Backend `.env`** (create if doesn't exist):
```env
DATABASE_URL="postgresql://postgres@localhost:5432/cafe_orders?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

## ⚡ Quick Start

**One-command setup for any platform:**

### macOS/Linux:
```bash
./setup.sh
```
This will automatically:
- Install Homebrew (if needed)
- Install PostgreSQL
- Install Node.js
- Set up the database
- Install dependencies
- Seed with sample data
- **Start both servers automatically**

### Windows:
```cmd
setup.bat
```
This will automatically:
- Install Chocolatey (if needed)
- Install PostgreSQL
- Install Node.js
- Set up the database
- Install dependencies
- Seed with sample data
- **Start both servers automatically**

**That's it!** The application will be running at:
- Customer View: http://localhost:3000
- Admin Login: http://localhost:3000/admin/login

**Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## 🏃 Running the Application

### Using npm scripts

**Backend:**
```bash
cd backend
npm run dev              # Development with nodemon
npm run start            # Production mode
npm run seed             # Seed database
npx prisma studio       # Open database GUI
```

**Frontend:**
```bash
cd frontend
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview build
```

### Access Points

| Purpose | URL | Credentials |
|---------|-----|-------------|
| Customer Menu | http://localhost:3000 | None required |
| Admin Login | http://localhost:3000/admin/login | admin / admin123 |
| Order Tracking | http://localhost:3000/track/{orderId} | Auto-generated link |
| API Health | http://localhost:5000/api/health | None required |
| Prisma Studio | http://localhost:5555 | Run `npx prisma studio` |

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Public Endpoints (No Authentication Required)

#### GET `/health`
Health check for the API.

**Response:**
```json
{
  "status": "OK",
  "message": "Cafe Order API is running"
}
```

#### GET `/menu`
Get all available menu items.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Cappuccino",
    "price": 4.50,
    "description": "Espresso with steamed milk and foam",
    "category": "Coffee",
    "imageUrl": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
    "available": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET `/menu/:id`
Get single menu item by ID.

#### POST `/orders`
Create a new order (Public - no authentication needed).

**Request:**
```json
{
  "customerName": "John Doe",
  "items": [
    {
      "menuItemId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 2
    },
    {
      "menuItemId": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "orderNumber": 1,
  "customerName": "John Doe",
  "status": "NEW",
  "totalPrice": 12.50,
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "menuItem": { "name": "Cappuccino", ... },
      "quantity": 2,
      "price": 4.50
    }
  ],
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### GET `/orders/:id`
Get order by ID (with all details and items).

#### GET `/orders/number/:orderNumber`
Get order by order number (public lookup).

### Protected Endpoints (Admin Only - Requires JWT Token)

Include JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### POST `/auth/login`
Login as admin and get JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "role": "admin"
  }
}
```

#### GET `/orders`
Get all orders (with optional status filter).

**Query Parameters:**
- `status` (optional): Filter by status
  - `NEW` - Orders just placed
  - `PREPARING` - Being prepared
  - `READY` - Ready for pickup
  - `COMPLETED` - Completed orders

**Example:** `GET /orders?status=NEW`

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "orderNumber": 1,
    "customerName": "John Doe",
    "status": "NEW",
    "totalPrice": 12.50,
    "items": [...],
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

#### PUT `/orders/:id/status`
Update order status (for admin workflow).

**Request:**
```json
{
  "status": "PREPARING"
}
```

**Valid Status Values:**
- `NEW` - Initial status
- `PREPARING` - Staff is preparing
- `READY` - Ready for pickup
- `COMPLETED` - Order completed

**Status Workflow:**
```
NEW → PREPARING → READY → COMPLETED
```

#### POST `/menu` (Admin)
Create new menu item.

**Request:**
```json
{
  "name": "Espresso",
  "price": 3.50,
  "description": "Strong Italian coffee",
  "category": "Coffee",
  "imageUrl": "https://..."
}
```

#### PUT `/menu/:id` (Admin)
Update menu item.

#### DELETE `/menu/:id` (Admin)
Delete menu item.

#### DELETE `/orders/:id` (Admin)
Delete an order.

## 📊 Database Schema

### Users Table
```
Column      | Type         | Constraints
------------|--------------|------------------
id          | UUID         | Primary Key
username    | String       | Unique, Not Null
password    | String       | Not Null (hashed)
role        | String       | Default: "admin"
createdAt   | DateTime     | Auto-set
updatedAt   | DateTime     | Auto-update
```

### MenuItems Table
```
Column      | Type         | Constraints
------------|--------------|------------------
id          | UUID         | Primary Key
name        | String       | Not Null
price       | Float        | Not Null
description | String       | Optional
category    | String       | Optional
imageUrl    | String       | Optional
available   | Boolean      | Default: true
createdAt   | DateTime     | Auto-set
updatedAt   | DateTime     | Auto-update
```

### Orders Table
```
Column      | Type         | Constraints
------------|--------------|------------------
id          | UUID         | Primary Key
orderNumber | Int          | Auto-increment
customerName| String       | Optional
status      | Enum         | NEW, PREPARING, READY, COMPLETED
totalPrice  | Float        | Not Null
items       | OrderItem[]  | Relation
createdAt   | DateTime     | Auto-set
updatedAt   | DateTime     | Auto-update
```

### OrderItems Table (Junction Table)
```
Column      | Type         | Constraints
------------|--------------|------------------
id          | UUID         | Primary Key
orderId     | UUID         | Foreign Key → Orders
menuItemId  | UUID         | Foreign Key → MenuItems
quantity    | Int          | Not Null
price       | Float        | Not Null
createdAt   | DateTime     | Auto-set
updatedAt   | DateTime     | Auto-update
```

## 📖 User Guide

### For Customers

#### 1. Browse Menu
- Open http://localhost:3000
- See menu organized by categories: Coffee, Pastries, Food, Tea
- View item images, descriptions, and prices
- All items are clickable cards with hover effects

#### 2. Add to Cart
- Click "Add to Cart" button on any menu item
- Item is added to shopping cart (see badge count on cart icon)
- Multiple clicks increase quantity
- Cart preview shows in drawer on right side

#### 3. View Cart
- Click shopping cart icon (top right with badge)
- Drawer opens showing:
  - All items in cart with quantities
  - Individual item prices
  - Total price calculation
  - +/- buttons to adjust quantities
  - Delete button for each item

#### 4. Place Order
- In cart drawer, optionally enter your name
- Click "Place Order" button
- You'll see success notification
- Automatically redirected to order tracking page
- Your order number is generated

#### 5. Track Order
- See order number prominently displayed
- Watch progress through stepper: "Order Placed" → "Preparing" → "Ready for Pickup" → "Completed"
- Status updates in real-time (refreshes every 5 seconds)
- See all order items with prices
- Page shows creation time and total

### For Administrators

#### 1. Login to Admin Dashboard
- Click "Admin Login" in top right
- Enter credentials:
  - Username: `admin`
  - Password: `admin123`
- You're logged in for 24 hours (JWT token)

#### 2. View Order Queue
- See all orders in cards on dashboard
- Cards color-coded by status:
  - Red border = NEW orders (urgent)
  - Orange border = PREPARING orders
  - Green border = READY orders
  - Gray = COMPLETED orders

#### 3. Filter Orders
- Use toggle buttons at top: Active Orders, NEW, PREPARING, READY, COMPLETED, All Orders
- Default shows "Active Orders" (NEW and PREPARING)
- Helps focus on what needs attention

#### 4. Update Order Status
- Click order card to expand
- See action buttons:
  - "Start Preparing" for NEW orders
  - "Mark Ready" for PREPARING orders
  - "Complete" for READY orders
- Click to advance status
- Changes reflected immediately
- Dashboard auto-refreshes every 10 seconds

#### 5. View Order Details
- Click any order card
- See full details in modal:
  - Order number
  - Customer name
  - Order time
  - Total price
  - All items with quantities and prices
  - Current status

#### 6. Delete Orders
- In order details modal
- Click "Delete Order" button (red)
- Confirm deletion
- Order removed immediately

#### 7. Logout
- Click "Logout" button (top right)
- Returns to login page
- Token cleared from local storage

## 🎨 Development & Customization

### Adding New Menu Items

**Option 1: Using Prisma Studio (Visual)**
```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
# Click on MenuItems table, add new record
```

**Option 2: Update Seed Script**
```bash
# Edit backend/src/seed.js
# Add item to menuItems array
# Run: npm run seed
```

**Option 3: Using Admin Dashboard API**
(Requires implementing POST /menu endpoint in frontend)

### Changing Theme Colors

Edit `frontend/src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#6B4423', // Coffee brown
    },
    secondary: {
      main: '#D4AF37', // Gold accent
    },
    background: {
      default: '#F5F5DC', // Beige
    },
  },
});
```

### Modifying Order Status Labels

Edit `frontend/src/pages/AdminDashboard.jsx`:

```javascript
const getNextStatusLabel = (status) => {
  // Customize labels here
};
```

### Adding New Routes

**Backend (Express):**
1. Create new file in `backend/src/routes/`
2. Add route functions
3. Import and use in `backend/src/index.js`

**Frontend (React):**
1. Create new component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Link in navigation

### Database Backup & Reset

```bash
# Reset entire database (warning: deletes all data)
cd backend
npx prisma migrate reset --force

# Creates fresh schema and runs seeding

# Backup before reset:
# pg_dump cafe_orders > backup.sql

# Restore from backup:
# psql cafe_orders < backup.sql
```

## 🐛 Troubleshooting

### Backend Issues

**Problem: "Can't reach database server at localhost:5432"**
- Solution: Start PostgreSQL with `brew services start postgresql@14`
- Or check PostgreSQL is running: `psql --version`

**Problem: "EADDRINUSE: address already in use :::5000"**
- Solution: Kill process on port 5000
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

**Problem: Database migration errors**
- Solution: Reset database
  ```bash
  npx prisma migrate reset --force
  npm run seed
  ```

**Problem: Module not found errors**
- Solution: Reinstall dependencies
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npx prisma generate
  ```

### Frontend Issues

**Problem: "Failed to load resource: the server responded with a status of 500"**
- Ensure backend is running
- Check backend logs for errors
- Verify DATABASE_URL is correct

**Problem: CORS errors**
- Backend Express has CORS enabled
- Verify proxy in `vite.config.js` is correct
- Restart Vite dev server

**Problem: Port 3000 already in use**
- Solution: Kill process on port 3000
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

**Problem: Login not working**
- Verify credentials: admin / admin123
- Check JWT_SECRET in `.env`
- Clear browser localStorage and try again

### Database Issues

**Problem: "Table doesn't exist"**
- Solution: Run migrations
  ```bash
  npx prisma migrate dev --name init
  ```

**Problem: Can't connect to PostgreSQL**
- Ensure PostgreSQL is running
- Check DATABASE_URL format in `.env`
- Verify password and permissions
- Test connection: `psql -U postgres`

## 📋 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 500 errors on API calls | Database not running | `brew services start postgresql@14` |
| Can't add items to cart | Frontend/Backend mismatch | Restart both servers |
| Login fails | Wrong credentials | Use admin/admin123 |
| Orders don't update | JWT expired | Logout and login again |
| Port conflicts | Process already running | Kill process: `lsof -ti:PORT \| xargs kill -9` |
| Dependencies not found | node_modules missing | Run `npm install` |
| Database empty | Not seeded | Run `npm run seed` |
| Hot reload not working | Vite not watching | Restart: `npm run dev` |

## 🎯 Project Highlights

### Full-Stack Integration
- ✅ Seamless React → Express → PostgreSQL communication
- ✅ Consistent error handling across all layers
- ✅ Type-safe API calls (JavaScript with JSDoc)
- ✅ Real-time state synchronization

### Security
- ✅ JWT authentication with 24-hour expiration
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ Protected routes and endpoints
- ✅ CORS properly configured
- ✅ Environment variables for secrets
- ✅ SQL injection protection with Prisma ORM

### User Experience
- ✅ Responsive Material-UI design
- ✅ Mobile, tablet, and desktop optimized
- ✅ Real-time order updates
- ✅ Visual feedback (loading, errors, success)
- ✅ Smooth navigation with React Router
- ✅ Auto-refresh for fresh data
- ✅ Intuitive admin workflow

### Code Quality
- ✅ Clean, simple JavaScript (no complex types)
- ✅ Modular component architecture
- ✅ Separation of concerns (services, contexts, pages)
- ✅ RESTful API design
- ✅ Environment-based configuration
- ✅ Comprehensive error handling
- ✅ Professional code organization

### Performance
- ✅ Fast Vite build tool
- ✅ Hot Module Replacement (HMR)
- ✅ Lazy component loading
- ✅ Optimized database queries
- ✅ Image CDN for menu items
- ✅ Efficient state management

### Development Experience
- ✅ Nodemon auto-restart for backend
- ✅ Vite HMR for frontend
- ✅ Prisma Studio for database GUI
- ✅ Clear project structure
- ✅ Easy to extend and customize
- ✅ Good for learning full-stack development

## 📱 Responsive Design

The application works perfectly on:
- **Mobile:** 320px and up
- **Tablet:** 600px and up
- **Desktop:** 960px and up

Material-UI Grid system ensures proper layout at all sizes.

## 🔐 Default Credentials

| User | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

**⚠️ Important:** Change these credentials in production!

## 📝 Sample Data

The database is seeded with:
- **1 Admin User** for testing login
- **12 Menu Items:**
  - 5 Coffees ($3.50-$5.00)
  - 3 Pastries ($2.75-$3.50)
  - 2 Food items ($7.50-$8.50)
  - 2 Teas ($3.00-$4.25)
- **1 Sample Order** for testing tracking

All images are from Unsplash and load from CDN.

## 🚀 Deployment (Optional)

This project can be deployed to:

**Backend:**
- Heroku
- Railway
- Render
- AWS EC2

**Frontend:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Database:**
- AWS RDS
- Railway
- Render
- Supabase
- DigitalOcean

Requires environment variable configuration for each platform.

## 📞 Support & Learning

This project is perfect for:
- Learning full-stack development
- Portfolio projects
- Job interviews
- Understanding REST APIs
- Learning React patterns
- Database design with Prisma

## 🎓 Key Learning Points

1. **Backend:** Express routing, middleware, JWT auth, Prisma ORM
2. **Frontend:** React components, hooks, Context API, React Router
3. **Database:** Schema design, relationships, migrations
4. **Architecture:** Full-stack integration, separation of concerns
5. **Security:** Authentication, authorization, password hashing
6. **UI/UX:** Material-UI, responsive design, user workflows

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 👨‍💻 Project Info

- **Type:** Full-Stack Web Application
- **Language:** JavaScript (Backend & Frontend)
- **Status:** Complete and Production-Ready
- **Last Updated:** December 2025

---

**Built with ❤️ for Full-Stack Learning**

**Enjoy your Digital Cafe Order Queue System! ☕**
