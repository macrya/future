import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL!,
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY!,
  },

  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
    passkey: process.env.MPESA_PASSKEY!,
    shortcode: process.env.MPESA_SHORTCODE!,
    environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
    callbackUrl: process.env.MPESA_CALLBACK_URL!,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },

  sms: {
    apiKey: process.env.SMS_API_KEY!,
    username: process.env.SMS_USERNAME!,
  },

  email: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER!,
    password: process.env.SMTP_PASS!,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
  },

  security: {
    encryptionKey: process.env.ENCRYPTION_KEY!,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Delivery pricing configuration
  pricing: {
    baseFare: 50, // Base fare in your currency
    perKmRate: 20, // Rate per kilometer
    perMinuteRate: 2, // Rate per minute
    minimumFare: 100, // Minimum delivery charge
    commissionRate: 0.15, // 15% platform commission
  },

  // Driver matching configuration
  matching: {
    searchRadius: 5000, // Search radius in meters (5km)
    maxSearchTime: 300000, // Max time to search for driver (5 minutes)
    driverTimeout: 30000, // Time for driver to accept (30 seconds)
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_MAPS_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  if (config.env === 'production') {
    process.exit(1);
  }
}
