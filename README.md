# DeliveryPro - Full-Stack Delivery Management System

A production-ready, full-featured delivery management system with real-time tracking, M-Pesa payment integration, and comprehensive dashboards for customers, couriers, and administrators.

## 🚀 Features

### Core Features
- **Real-time Delivery Tracking** - Live GPS tracking using Google Maps API
- **Multi-role Authentication** - Customer, Courier, and Admin roles with JWT-based auth
- **Payment Integration** - M-Pesa (Daraja API) and Card payments (Flutterwave)
- **WebSocket Integration** - Real-time updates for delivery status and courier location
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Type-Safe** - Built with TypeScript for maximum reliability

### Customer Features
- Create and manage deliveries
- Real-time package tracking with live map
- Multiple payment methods (M-Pesa, Card, Cash on Delivery)
- Delivery history and status updates
- Address management

### Courier Features
- Accept/reject delivery requests
- Real-time earnings tracking
- Performance metrics and ratings
- Online/offline status management
- Route optimization with Google Maps

### Admin Features
- Complete delivery oversight
- Courier management and monitoring
- Revenue analytics and reporting
- Platform-wide statistics
- User management

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios with React Query
- **Maps**: Google Maps API (@react-google-maps/api)
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.io-client
- **UI Components**: Custom component library

### Key Libraries
- `next` - 14.2.0
- `react` - 18.3.0
- `typescript` - 5.4.3
- `tailwindcss` - 3.4.1
- `zustand` - 4.5.2
- `@tanstack/react-query` - 5.28.0
- `socket.io-client` - 4.7.0
- `react-hook-form` - 7.51.0
- `zod` - 3.22.4

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── customer/          # Customer dashboard pages
│   ├── courier/           # Courier dashboard pages
│   ├── admin/             # Admin dashboard pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── providers.tsx      # App providers
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Auth components
│   ├── customer/         # Customer-specific components
│   ├── courier/          # Courier-specific components
│   ├── admin/            # Admin-specific components
│   ├── maps/             # Map components
│   ├── payment/          # Payment components
│   └── layout/           # Layout components
├── lib/                  # Core libraries
│   ├── axios.ts          # Axios instance with interceptors
│   └── websocket.ts      # WebSocket service
├── services/             # API service layer
│   ├── auth.service.ts
│   ├── delivery.service.ts
│   ├── payment.service.ts
│   └── courier.service.ts
├── store/                # Zustand stores
│   ├── auth.store.ts
│   └── delivery.store.ts
├── hooks/                # Custom React hooks
│   ├── useGeolocation.ts
│   └── useWebSocket.ts
├── utils/                # Utility functions
│   ├── cn.ts             # Class name merger
│   ├── format.ts         # Formatting utilities
│   └── validators.ts     # Zod schemas
├── types/                # TypeScript types
│   └── index.ts
└── constants/            # App constants
    └── index.ts
```

## 🚦 Getting Started

### Prerequisites
- Node.js >= 18.17.0
- npm >= 9.0.0
- Google Maps API Key
- M-Pesa Daraja API credentials (for payment)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd delivery-system-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy the example environment file:
```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# M-Pesa Daraja API
NEXT_PUBLIC_MPESA_CONSUMER_KEY=your_mpesa_consumer_key
NEXT_PUBLIC_MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
NEXT_PUBLIC_MPESA_PASSKEY=your_mpesa_passkey
NEXT_PUBLIC_MPESA_SHORTCODE=your_business_shortcode
NEXT_PUBLIC_MPESA_ENVIRONMENT=sandbox

# Card Payment (Flutterwave)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key

# App Configuration
NEXT_PUBLIC_APP_NAME=DeliveryPro
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Type check
npm run type-check

# Build
npm run build

# Start production server
npm start
```

## 🔑 API Integration

This frontend is designed to work with a backend API. Ensure your backend implements the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Deliveries
- `POST /api/deliveries` - Create delivery
- `GET /api/deliveries/:id` - Get delivery details
- `GET /api/deliveries` - List deliveries
- `GET /api/deliveries/my` - Get user's deliveries
- `PUT /api/deliveries/:id/status` - Update delivery status
- `POST /api/deliveries/:id/accept` - Accept delivery (courier)
- `POST /api/deliveries/estimate` - Estimate delivery price

### Payments
- `POST /api/payments/mpesa/stk-push` - Initiate M-Pesa payment
- `GET /api/payments/mpesa/status/:id` - Check payment status
- `POST /api/payments/card/initiate` - Initiate card payment
- `GET /api/payments/card/verify/:id` - Verify card payment

### Couriers
- `GET /api/couriers/:id` - Get courier details
- `PUT /api/couriers/status` - Update courier status
- `PUT /api/couriers/location` - Update courier location
- `GET /api/couriers/stats` - Get courier statistics

### WebSocket Events
- `subscribe_delivery` - Subscribe to delivery updates
- `location_update` - Courier location update
- `status_update` - Delivery status update
- `courier_assigned` - Courier assignment notification

## 🔐 Security Features

- JWT-based authentication
- HTTP-only cookies support
- CSRF protection
- Security headers (HSTS, X-Frame-Options, etc.)
- Input validation with Zod
- XSS protection
- SQL injection prevention (backend)

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize the color scheme:
```typescript
colors: {
  primary: { ... },
  success: { ... },
  warning: { ... },
  danger: { ... },
}
```

### Components
All UI components are in `src/components/ui/` and can be customized.

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices (iOS & Android)

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker
```bash
# Build
docker build -t delivery-pro .

# Run
docker run -p 3000:3000 delivery-pro
```

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 Performance Optimizations

- Code splitting with Next.js
- Image optimization
- Server-side rendering (SSR)
- Static generation where applicable
- Lazy loading of components
- Optimized bundle size
- Caching strategies with React Query

## 🔧 Configuration

### Google Maps Setup
1. Get API key from [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API and Places API
3. Add to `.env.local`

### M-Pesa Setup
1. Register at [Safaricom Daraja](https://developer.safaricom.co.ke)
2. Create an app
3. Get Consumer Key, Consumer Secret, and Passkey
4. Add to `.env.local`

### Flutterwave Setup
1. Register at [Flutterwave](https://flutterwave.com)
2. Get your public key
3. Add to `.env.local`

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@deliverypro.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- Google Maps for mapping services
- Safaricom for M-Pesa API

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
