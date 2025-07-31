# BoxCric Backend

A consolidated Node.js/Express backend for the BoxCric cricket ground booking application. All routes, models, middleware, and business logic are contained in a single `server.js` file for easy deployment and maintenance.

## 🚀 Features

- **Single File Architecture**: All backend logic consolidated in `server.js`
- **Authentication**: JWT-based authentication with OTP verification
- **Real-time Updates**: Socket.IO integration for live booking updates
- **Payment Integration**: Cashfree payment gateway integration
- **Booking Management**: Complete CRUD operations for ground bookings
- **Admin Panel**: Administrative functions for ground and user management
- **Email Notifications**: Automated OTP and booking confirmation emails

## 📁 Project Structure

```
server/
├── server.js              # Main consolidated backend file
├── package.json           # Dependencies and scripts
├── README.md             # This file
├── .env                  # Environment variables (create this)
└── package-lock.json     # Locked dependencies
```

## 🛠️ Quick Start

### Prerequisites

- Node.js >= 16.0.0
- MongoDB database
- Email service (Gmail recommended for development)

### Installation

1. **Clone and navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/boxcric
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/boxcric

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Cashfree Payment Gateway
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENVIRONMENT=TEST  # or PRODUCTION

# Optional: Admin Configuration
ADMIN_EMAIL=admin@boxcric.com
ADMIN_PASSWORD=admin123
```

## 🚀 Deployment on Render

This consolidated backend is optimized for deployment on Render:

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. **Add environment variables** in Render dashboard
5. **Deploy!**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-registration` - OTP verification
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Grounds
- `GET /api/grounds` - Get all grounds
- `GET /api/grounds/:id` - Get specific ground
- `POST /api/grounds` - Create new ground (Admin)
- `PUT /api/grounds/:id` - Update ground (Admin)
- `DELETE /api/grounds/:id` - Delete ground (Admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get specific booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/ground/:groundId` - Get bookings for specific ground

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify-payment` - Verify payment
- `GET /api/payments/orders` - Get payment orders

### Locations
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Create location (Admin)
- `PUT /api/locations/:id` - Update location (Admin)
- `DELETE /api/locations/:id` - Delete location (Admin)

### Admin Routes
- `GET /api/admin/bookings` - Get all bookings (Admin)
- `GET /api/admin/users` - Get all users (Admin)
- `PUT /api/admin/bookings/:id/status` - Update booking status (Admin)

### Health Check
- `GET /api/health` - Server health status

## 🗄️ Database Models

### User
- Basic info (name, email, phone)
- Authentication (password, JWT tokens)
- Role-based access (user/admin)

### Ground
- Ground details (name, location, price)
- Availability and amenities
- Owner information

### Booking
- Booking details (ground, date, time slots)
- Payment status and amount
- User information

### Location
- City and area information
- Geographic coordinates

### OTP
- Temporary OTP storage for verification

## 🔧 Middleware

- **Authentication**: JWT token verification
- **Optional Auth**: Non-blocking authentication
- **Admin Check**: Role-based access control
- **Error Handling**: Centralized error management
- **CORS**: Cross-origin resource sharing

## 🔌 Socket.IO Events

- `booking_created` - New booking notification
- `booking_updated` - Booking status changes
- `booking_cancelled` - Booking cancellation

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Rate limiting (can be added)
- Environment variable protection

## 📝 Development

### Adding New Features

Since all code is in `server.js`, you can:

1. Add new models in the **Database Models** section
2. Add new middleware in the **Middleware** section
3. Add new routes in the **API Routes** section
4. Add new Socket.IO events in the **Socket.IO** section

### Code Organization

The `server.js` file is organized into clear sections:
- Imports and dependencies
- Database models
- Middleware functions
- Utility functions
- Socket.IO setup
- API routes (grouped by feature)
- Server startup

## 🚀 Benefits of Single File Architecture

1. **Easy Deployment**: No complex file structure to manage
2. **Simple Maintenance**: All code in one place
3. **Quick Setup**: Minimal configuration required
4. **Render Ready**: Optimized for cloud deployment
5. **Version Control**: Single file to track changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in `server.js`
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**Note**: This consolidated backend is designed for simplicity and easy deployment. For larger applications, consider splitting into multiple files for better maintainability. 