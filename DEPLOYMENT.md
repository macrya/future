# 🚀 Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Production PostgreSQL database (with PostGIS extension)
- Production Redis instance
- Domain name with SSL certificate
- Google Maps API key
- M-Pesa Daraja API production credentials
- Stripe production account

## Environment Setup

### 1. Production Environment Variables

Create `.env.production`:

```env
NODE_ENV=production
PORT=3000
API_URL=https://api.yourdomain.com

# Database (Production)
DATABASE_URL="postgresql://user:password@host:5432/delivery_system?schema=public&sslmode=require"

# Redis (Production)
REDIS_URL=redis://user:password@redis-host:6379

# JWT (Strong secrets for production)
JWT_SECRET=<generate-strong-64-char-secret>
JWT_REFRESH_SECRET=<generate-strong-64-char-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=<production-key>

# M-Pesa Production
MPESA_CONSUMER_KEY=<production-consumer-key>
MPESA_CONSUMER_SECRET=<production-consumer-secret>
MPESA_PASSKEY=<production-passkey>
MPESA_SHORTCODE=<production-shortcode>
MPESA_ENVIRONMENT=production
MPESA_CALLBACK_URL=https://api.yourdomain.com/api/payments/mpesa/callback

# Stripe Production
STRIPE_SECRET_KEY=sk_live_<your-live-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>

# Security
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
ENCRYPTION_KEY=<generate-32-char-key>

# Monitoring
LOG_LEVEL=info
```

### 2. Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment Options

### Option 1: Docker (Recommended)

#### 1. Build Docker Image

```bash
docker build -t delivery-system:latest .
```

#### 2. Push to Registry

```bash
# Docker Hub
docker tag delivery-system:latest yourusername/delivery-system:latest
docker push yourusername/delivery-system:latest

# AWS ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account-id.dkr.ecr.region.amazonaws.com
docker tag delivery-system:latest account-id.dkr.ecr.region.amazonaws.com/delivery-system:latest
docker push account-id.dkr.ecr.region.amazonaws.com/delivery-system:latest
```

#### 3. Deploy with Docker Compose

```yaml
version: '3.8'

services:
  app:
    image: yourusername/delivery-system:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      # Add all other env vars
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: always

  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: delivery_system
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: always

volumes:
  postgres_data:
  redis_data:
```

### Option 2: AWS Deployment

#### Using AWS ECS

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name delivery-system
```

2. **Push Docker Image**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin account-id.dkr.ecr.us-east-1.amazonaws.com
docker tag delivery-system:latest account-id.dkr.ecr.us-east-1.amazonaws.com/delivery-system:latest
docker push account-id.dkr.ecr.us-east-1.amazonaws.com/delivery-system:latest
```

3. **Create ECS Task Definition**
```json
{
  "family": "delivery-system",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "delivery-system",
      "image": "account-id.dkr.ecr.us-east-1.amazonaws.com/delivery-system:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        }
      ]
    }
  ]
}
```

4. **Create ECS Service**
```bash
aws ecs create-service \
  --cluster delivery-cluster \
  --service-name delivery-service \
  --task-definition delivery-system \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

#### Using AWS Elastic Beanstalk

```bash
eb init delivery-system --platform node.js --region us-east-1
eb create production-env --database --database.engine postgres
eb deploy
```

### Option 3: DigitalOcean App Platform

1. **Create `app.yaml`**
```yaml
name: delivery-system
services:
  - name: api
    github:
      repo: your-username/delivery-system
      branch: main
      deploy_on_push: true
    dockerfile_path: Dockerfile
    http_port: 3000
    instance_count: 2
    instance_size_slug: professional-xs
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
    health_check:
      http_path: /health

databases:
  - name: db
    engine: PG
    version: "15"

  - name: redis
    engine: REDIS
    version: "7"
```

2. **Deploy**
```bash
doctl apps create --spec app.yaml
```

### Option 4: Heroku

```bash
# Login
heroku login

# Create app
heroku create delivery-system

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# ... set all other env vars

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:deploy

# Scale
heroku ps:scale web=2
```

## Database Migration

### Run migrations in production

```bash
# Using npm
npm run prisma:deploy

# Using Docker
docker exec -it container-name npm run prisma:deploy

# Using Heroku
heroku run npm run prisma:deploy
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

1. **Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain Certificate**
```bash
sudo certbot --nginx -d api.yourdomain.com
```

3. **Auto-renewal**
```bash
sudo certbot renew --dry-run
```

### Nginx Configuration

```nginx
upstream delivery_api {
    server app:3000;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://delivery_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://delivery_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Monitoring Setup

### PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start dist/server.js --name delivery-system

# Start on boot
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs delivery-system
```

### Health Checks

```bash
# Add health check endpoint to monitoring
curl https://api.yourdomain.com/health
```

### Log Aggregation

Configure log shipping to:
- CloudWatch (AWS)
- Papertrail
- Loggly
- ELK Stack

## Backup Strategy

### Database Backups

```bash
# Automated daily backups
0 2 * * * pg_dump -U user delivery_system | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

### Redis Backups

Configure RDB persistence in `redis.conf`:
```
save 900 1
save 300 10
save 60 10000
```

## Performance Optimization

### 1. Enable Redis Caching

Already implemented in the codebase for:
- Driver locations
- Active deliveries
- Session data

### 2. Database Indexing

Indexes are already defined in Prisma schema for:
- User lookups (email, phone)
- Delivery queries (status, customer, driver)
- Location-based queries

### 3. Connection Pooling

Configure in DATABASE_URL:
```
postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
```

### 4. Enable Compression

Already enabled in Express middleware

## Security Checklist

- [x] Use HTTPS everywhere
- [x] Set strong JWT secrets
- [x] Enable rate limiting
- [x] Configure CORS properly
- [x] Use Helmet.js for security headers
- [x] Hash passwords with bcrypt
- [x] Validate all inputs
- [x] Use environment variables for secrets
- [x] Enable database SSL connections
- [ ] Set up firewall rules
- [ ] Enable DDoS protection
- [ ] Set up intrusion detection
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Rollback Strategy

### Docker

```bash
# Tag releases
docker tag delivery-system:latest delivery-system:v1.0.0

# Rollback
docker-compose down
docker-compose up -d delivery-system:v0.9.0
```

### Database

```bash
# Create migration snapshot before deployment
npm run prisma:migrate resolve --rolled-back "migration-name"
```

## Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review error logs
   - Check disk space
   - Monitor response times

2. **Monthly**
   - Update dependencies
   - Review security alerts
   - Database optimization
   - Backup verification

3. **Quarterly**
   - Security audit
   - Performance optimization
   - Capacity planning

---

**Deployment complete! 🚀**
