# Deployment Guide

## Production Checklist

Before deploying to production, ensure:

- [ ] All environment variables are set correctly
- [ ] API endpoints point to production backend
- [ ] Google Maps API key is production-ready with proper restrictions
- [ ] M-Pesa credentials are production (not sandbox)
- [ ] Security headers are enabled
- [ ] Error tracking is set up (e.g., Sentry)
- [ ] Analytics are configured
- [ ] SSL/TLS certificates are in place

## Environment Variables for Production

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourapp.com/api
NEXT_PUBLIC_WS_URL=wss://api.yourapp.com

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_google_maps_key

# M-Pesa Daraja API (Production)
NEXT_PUBLIC_MPESA_CONSUMER_KEY=production_consumer_key
NEXT_PUBLIC_MPESA_CONSUMER_SECRET=production_consumer_secret
NEXT_PUBLIC_MPESA_PASSKEY=production_passkey
NEXT_PUBLIC_MPESA_SHORTCODE=production_shortcode
NEXT_PUBLIC_MPESA_ENVIRONMENT=production

# Card Payment
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=production_flutterwave_key

# App Configuration
NEXT_PUBLIC_APP_NAME=DeliveryPro
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

## Deployment Options

### 1. Vercel (Recommended for Next.js)

**Advantages:**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Serverless functions
- Preview deployments

**Steps:**
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Or connect via Vercel Dashboard:
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Configure environment variables
   - Deploy

### 2. Netlify

**Steps:**
1. Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

### 3. AWS (EC2 + ALB)

**Steps:**
1. Build the application:
   ```bash
   npm run build
   ```

2. Create a production start script in `package.json`:
   ```json
   {
     "scripts": {
       "start:prod": "NODE_ENV=production npm start"
     }
   }
   ```

3. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "delivery-pro" -- start
   pm2 save
   pm2 startup
   ```

4. Configure nginx as reverse proxy:
   ```nginx
   server {
     listen 80;
     server_name yourapp.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

### 4. Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

### 5. DigitalOcean App Platform

1. Connect your repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Set environment variables
4. Deploy

## Performance Optimization

### 1. Enable Caching
Add cache headers in `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/:all*(svg|jpg|png)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
}
```

### 2. Enable Compression
```bash
npm install compression
```

### 3. Use CDN
Configure CDN for static assets in `next.config.mjs`:
```javascript
images: {
  domains: ['your-cdn.com'],
}
```

## Monitoring & Analytics

### 1. Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### 2. Analytics (Google Analytics)
Add to `_app.tsx`:
```typescript
import Script from 'next/script'

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
  strategy="afterInteractive"
/>
```

### 3. Uptime Monitoring
- UptimeRobot
- Pingdom
- New Relic

## Security Best Practices

1. **Use HTTPS only**
2. **Set security headers** (already configured in next.config.mjs)
3. **Implement rate limiting** on API routes
4. **Use environment variables** for secrets
5. **Regular security audits**:
   ```bash
   npm audit
   npm audit fix
   ```

## Scaling

### Horizontal Scaling
- Deploy multiple instances behind a load balancer
- Use Redis for session management
- Implement caching with Redis/Memcached

### Database Optimization
- Use connection pooling
- Implement read replicas
- Add database indexes
- Use caching for frequent queries

## Backup Strategy

1. **Database backups** - Daily automated backups
2. **File storage backups** - Replicate to multiple regions
3. **Code backups** - Git repository with tags for releases

## Rollback Plan

1. Keep previous versions:
   ```bash
   vercel rollback
   ```

2. Use Git tags:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. Docker versioning:
   ```bash
   docker tag delivery-pro:latest delivery-pro:v1.0.0
   ```

## Post-Deployment

1. **Test all features**
2. **Monitor error rates**
3. **Check performance metrics**
4. **Verify payment integrations**
5. **Test WebSocket connections**
6. **Verify maps functionality**

## Troubleshooting

### Build Fails
- Check Node.js version
- Clear `.next` cache: `rm -rf .next`
- Delete `node_modules` and reinstall

### API Connection Issues
- Verify CORS settings on backend
- Check API URL in environment variables
- Verify SSL certificates

### Maps Not Loading
- Check Google Maps API key
- Verify billing is enabled
- Check API restrictions

### WebSocket Issues
- Verify WebSocket URL protocol (wss:// for production)
- Check firewall rules
- Verify backend WebSocket server

## Support

For deployment issues:
- Check [Next.js deployment docs](https://nextjs.org/docs/deployment)
- Review platform-specific documentation
- Contact support team
