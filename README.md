# 🚚 Delivery Tracking System

A production-ready, full-stack delivery tracking system with real-time tracking, M-Pesa & card payments, Google Maps integration, and Uber-like driver matching algorithm.

## 🌟 Features

### Core Features
- **Real-time Tracking**: Live driver location tracking using Socket.IO
- **Payment Integration**:
  - M-Pesa (Daraja API) - STK Push
  - Card payments (Stripe)
  - Cash on delivery
- **Google Maps Integration**:
  - Route calculation
  - Distance & duration estimation
  - Geocoding & reverse geocoding
- **Uber-like Matching**: Smart driver assignment algorithm
- **Multi-role System**: Customers, Drivers, and Admins
- **Surge Pricing**: Dynamic pricing based on demand

### Security Features
- JWT authentication with refresh tokens
- Rate limiting
- Helmet.js security headers
- CORS protection
- Password hashing with bcrypt
- Input validation with Joi

### Technical Features
- TypeScript for type safety
- PostgreSQL with PostGIS for geospatial data
- Redis for caching and real-time features
- Prisma ORM
- WebSocket (Socket.IO) for real-time updates
- Docker containerization
- Comprehensive error handling
- Structured logging with Winston

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15 with PostGIS
- **Cache**: Redis 7
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Joi
- **Payments**:
  - M-Pesa Daraja API
  - Stripe

### Frontend (Coming Soon)
- **Framework**: Next.js 14
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Google Maps React
- **State**: Zustand
- **API Client**: Axios

### Mobile (Coming Soon)
- **Framework**: React Native
- **Navigation**: React Navigation
- **Maps**: React Native Maps

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions (ready)
- **Logging**: Winston
- **Monitoring**: Ready for integration

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 with PostGIS extension
- Redis 7
- Docker & Docker Compose (optional)
- Google Maps API key
- M-Pesa Daraja API credentials
- Stripe account (for card payments)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd delivery-tracking-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/delivery_system?schema=public"

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# M-Pesa Daraja API
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_PASSKEY=your-mpesa-passkey
MPESA_SHORTCODE=your-business-shortcode
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### 4. Start databases with Docker

```bash
npm run docker:up
```

This will start PostgreSQL and Redis in Docker containers.

### 5. Run database migrations

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 6. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Build and run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL with PostGIS
- Redis
- Application server

### Stop services

```bash
docker-compose down
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+254712345678",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

### Deliveries

#### Create Delivery
```http
POST /api/deliveries
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "pickupAddress": "Nairobi CBD, Kenya",
  "pickupLatitude": -1.286389,
  "pickupLongitude": 36.817223,
  "pickupContactName": "John Doe",
  "pickupContactPhone": "+254712345678",
  "deliveryAddress": "Westlands, Nairobi",
  "deliveryLatitude": -1.268436,
  "deliveryLongitude": 36.808678,
  "deliveryContactName": "Jane Smith",
  "deliveryContactPhone": "+254787654321",
  "packageDescription": "Electronics",
  "packageWeight": 2.5,
  "packageValue": 5000
}
```

#### Get My Deliveries
```http
GET /api/deliveries
Authorization: Bearer <access_token>
```

#### Get Delivery by ID
```http
GET /api/deliveries/:id
Authorization: Bearer <access_token>
```

#### Update Delivery Status (Driver/Admin)
```http
PATCH /api/deliveries/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "PICKED_UP",
  "notes": "Package collected"
}
```

#### Cancel Delivery
```http
POST /api/deliveries/:id/cancel
Authorization: Bearer <access_token>
```

#### Estimate Price
```http
GET /api/deliveries/estimate?pickupLat=-1.286389&pickupLng=36.817223&deliveryLat=-1.268436&deliveryLng=36.808678
Authorization: Bearer <access_token>
```

### Drivers

#### Register as Driver
```http
POST /api/drivers/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicleType": "MOTORCYCLE",
  "vehicleModel": "Honda CB 150",
  "vehiclePlate": "KAA 123B",
  "licenseNumber": "DL12345678",
  "bankAccount": "1234567890"
}
```

#### Update Driver Status
```http
PATCH /api/drivers/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "ONLINE"
}
```

#### Update Location
```http
PATCH /api/drivers/:id/location
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "latitude": -1.286389,
  "longitude": 36.817223
}
```

#### Get Nearby Drivers
```http
GET /api/drivers/nearby?latitude=-1.286389&longitude=36.817223&radius=5000
Authorization: Bearer <access_token>
```

#### Get Driver Stats
```http
GET /api/drivers/:id/stats
Authorization: Bearer <access_token>
```

### Payments

#### Initiate Payment
```http
POST /api/payments/initiate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deliveryId": "uuid",
  "method": "MPESA",
  "phoneNumber": "+254712345678"
}
```

For card payment:
```json
{
  "deliveryId": "uuid",
  "method": "CARD"
}
```

#### Confirm Card Payment
```http
POST /api/payments/card/confirm
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "paymentIntentId": "pi_..."
}
```

#### Get Payment by Delivery
```http
GET /api/payments/delivery/:deliveryId
Authorization: Bearer <access_token>
```

## 🔌 WebSocket Events

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Driver Events

#### Register Driver
```javascript
socket.emit('driver:register', {
  driverId: 'uuid'
});
```

#### Update Location
```javascript
socket.emit('driver:location', {
  driverId: 'uuid',
  latitude: -1.286389,
  longitude: 36.817223
});
```

#### Listen for Location Updates
```javascript
socket.on('driver:location:update', (data) => {
  console.log('Driver location:', data);
});
```

#### Update Status
```javascript
socket.emit('driver:status', {
  driverId: 'uuid',
  status: 'ONLINE'
});
```

### Customer Events

#### Track Delivery
```javascript
socket.emit('delivery:track', {
  deliveryId: 'uuid'
});
```

#### Listen for Delivery Updates
```javascript
socket.on('delivery:update', (data) => {
  console.log('Delivery update:', data);
});
```

## 🗄️ Database Schema

The system uses PostgreSQL with PostGIS extension for geospatial queries. Key tables:

- **User**: User accounts (customers, drivers, admins)
- **Customer**: Customer profiles
- **Driver**: Driver profiles with vehicle information
- **Delivery**: Delivery orders
- **DeliveryTracking**: Real-time tracking history
- **Payment**: Payment records
- **Review**: Customer reviews for drivers
- **Earning**: Driver earnings
- **Notification**: User notifications
- **SystemConfig**: System configuration

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **JWT Secrets**: Use strong, random secrets in production
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Configured for API protection
5. **Input Validation**: All inputs are validated with Joi
6. **SQL Injection**: Protected by Prisma ORM
7. **XSS**: Protected by Helmet.js
8. **CORS**: Configured for specific origins

## 📊 Monitoring & Logging

Logs are stored in the `logs/` directory:
- `error.log`: Error logs
- `all.log`: All logs

Integration ready for:
- Sentry (error tracking)
- DataDog (monitoring)
- ELK Stack (log aggregation)

## 🧪 Testing

```bash
npm test
```

## 🛠️ Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run prisma:studio # Open Prisma Studio
npm run prisma:migrate # Run migrations
npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services
```

## 🌐 Deployment

### Production Checklist

1. ✅ Set strong JWT secrets
2. ✅ Configure production database
3. ✅ Set up Redis instance
4. ✅ Configure CORS for your domain
5. ✅ Set up SSL/TLS certificates
6. ✅ Configure environment variables
7. ✅ Run database migrations
8. ✅ Set up monitoring
9. ✅ Configure backups
10. ✅ Test payment integrations

### Deploy to Cloud

The application is ready to deploy to:
- AWS (EC2, ECS, Lambda)
- Google Cloud Platform
- Azure
- DigitalOcean
- Heroku
- Railway

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

## 🙏 Acknowledgments

- Google Maps API
- Safaricom Daraja API
- Stripe
- The open-source community

---

**Built with ❤️ using TypeScript, Node.js, Express, PostgreSQL, Redis, and Socket.IO**
