# SeamXY Production Deployment Guide

This guide covers deploying SeamXY to a production environment using PM2 process manager.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Build & Deploy](#build--deploy)
6. [PM2 Management](#pm2-management)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher (recommend Neon or managed PostgreSQL)
- **PM2**: Global installation required
- **Memory**: Minimum 2GB RAM (4GB+ recommended for production)
- **Storage**: Minimum 10GB available

### Install Required Tools

```bash
# Install Node.js (if not already installed)
# Use nvm for version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install PM2 globally
npm install -g pm2

# Install pnpm (recommended) or use npm
npm install -g pnpm
```

---

## Initial Setup

### 1. Clone Repository & Install Dependencies

```bash
# Clone your repository
git clone <your-repo-url>
cd seamxy

# Install dependencies
npm install
# or if using pnpm:
pnpm install
```

### 2. Build the Application

```bash
# Build frontend for production
npm run build

# This creates optimized production build in dist/
```

---

## Environment Configuration

### 1. Generate Required Secrets

```bash
# Generate SESSION_SECRET (128 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate INTEGRATION_TOKEN_KEY (64 characters hex = 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Create .env File

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials. **Minimum required variables:**

```env
# Core
NODE_ENV=production
PORT=5000

# Database (use your PostgreSQL connection details)
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=your-db-host.com
PGPORT=5432
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGDATABASE=seamxy_production

# Security
SESSION_SECRET=<generated-128-char-secret>
INTEGRATION_TOKEN_KEY=<generated-64-char-key>

# AI Services
# For external deployment, use direct OpenAI (get key from platform.openai.com)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Note: Replit AI Integrations only work on Replit platform
# Don't use AI_INTEGRATIONS_* vars for external deployment
```

### 3. Configure PM2 Ecosystem

Edit `ecosystem.config.js` and replace placeholder values with your actual credentials:

- Database connection details
- Generated secrets (SESSION_SECRET, INTEGRATION_TOKEN_KEY)
- AI API credentials
- Optional: Retailer API keys (Amazon, eBay, Rakuten)
- Optional: E-commerce platform credentials (Shopify, WooCommerce, BigCommerce)

**Security Note**: Ensure `ecosystem.config.js` contains sensitive credentials and is **NOT** committed to version control. Add it to `.gitignore`:

```bash
echo "ecosystem.config.js" >> .gitignore
```

---

## Database Setup

### 1. Set Up PostgreSQL Database

**Option A: Managed PostgreSQL (Recommended)**

Use a managed service like:
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com)
- [AWS RDS](https://aws.amazon.com/rds/)
- [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases)

**Option B: Self-Hosted PostgreSQL**

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
postgres=# CREATE DATABASE seamxy_production;
postgres=# CREATE USER seamxy_user WITH PASSWORD 'strong_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE seamxy_production TO seamxy_user;
postgres=# \q
```

### 2. Run Database Migrations

```bash
# Push schema to database
npm run db:push

# Verify schema
npm run db:studio
# Open Drizzle Studio at http://localhost:4983
```

### 3. Seed Initial Data (Optional)

The application automatically seeds required data on startup:
- AI Personality Personas (8 stylists)
- Subscription Plans (Basic, Pro, Enterprise)
- Pricing Configurations
- Sample Products (for demo)
- Sample Makers (for demo)

To disable automatic seeding in production, comment out the seeding code in `server/index.ts`.

---

## Build & Deploy

### 1. Build Application

```bash
# Clean previous builds
rm -rf dist/ server/public/

# Build production bundle
npm run build
```

This creates optimized production builds:
- `dist/index.js` - Backend server bundle (entry point for PM2)
- `server/public/` - Frontend static files

**Important**: The PM2 configuration runs the built JavaScript (`node dist/index.js`), not the TypeScript source files. Always build before deploying!

### 2. Start with PM2

```bash
# Start application using ecosystem config (recommended)
pm2 start ecosystem.config.js --env production

# Or use ecosystem.cjs (CommonJS format)
pm2 start ecosystem.cjs --env production

# Or start directly without ecosystem file
pm2 start dist/index.js --name "seamxy-production" -i max --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown by PM2
```

### 3. Verify Deployment

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs seamxy-production

# Monitor metrics
pm2 monit
```

Test the application:

```bash
# Check health
curl http://localhost:5000/

# Check API
curl http://localhost:5000/api/v1/personas
```

---

## PM2 Management

### Common Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs seamxy-production
pm2 logs seamxy-production --lines 100

# Restart application
pm2 restart seamxy-production

# Reload without downtime (zero-downtime reload)
pm2 reload seamxy-production

# Stop application
pm2 stop seamxy-production

# Delete from PM2
pm2 delete seamxy-production

# Monitor in real-time
pm2 monit
```

### Zero-Downtime Deployments

```bash
# Pull latest code
git pull origin main

# Install dependencies (if changed)
npm install

# Build frontend
npm run build

# Reload with zero downtime
pm2 reload seamxy-production
```

### Environment Updates

If you need to update environment variables:

```bash
# Edit ecosystem.config.js with new values

# Reload configuration
pm2 reload ecosystem.config.js --env production --update-env
```

---

## Monitoring

### PM2 Plus (Optional)

For advanced monitoring, use PM2 Plus:

```bash
# Link to PM2 Plus
pm2 link <secret_key> <public_key>
```

Features:
- Real-time monitoring dashboard
- Error tracking
- Performance metrics
- Custom metrics
- Alerts

### Log Management

```bash
# View logs
pm2 logs

# Flush logs
pm2 flush

# Install log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Health Checks

Create a monitoring script to check application health:

```bash
#!/bin/bash
# health-check.sh

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/)

if [ $RESPONSE -eq 200 ]; then
    echo "Application is healthy"
    exit 0
else
    echo "Application is unhealthy (HTTP $RESPONSE)"
    pm2 restart seamxy-production
    exit 1
fi
```

Add to crontab:

```bash
# Check every 5 minutes
*/5 * * * * /path/to/health-check.sh
```

---

## Troubleshooting

### Application Won't Start

**Check logs:**

```bash
pm2 logs seamxy-production --err
```

**Common issues:**

1. **Missing environment variables**
   ```
   Error: DATABASE_URL is required
   ```
   Solution: Verify all required env vars are set in `ecosystem.config.js`

2. **Database connection failed**
   ```
   Error: connect ECONNREFUSED
   ```
   Solution: Check DATABASE_URL, ensure PostgreSQL is running and accessible

3. **Port already in use**
   ```
   Error: listen EADDRINUSE: address already in use :::5000
   ```
   Solution: Stop other processes using port 5000 or change PORT in config

### Encryption Key Warnings

```
⚠️  WARNING: Using development encryption key
```

**Solution:** Set `INTEGRATION_TOKEN_KEY` environment variable:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and add to ecosystem.config.js
```

### Session Not Configured

```
Session middleware not configured
```

**Solution:** Ensure `SESSION_SECRET` is set in environment variables.

### Memory Issues

If application crashes due to memory:

```bash
# Check memory usage
pm2 monit

# Increase max memory in ecosystem.config.js
max_memory_restart: '2G'  # Increase from 1G to 2G

# Reload
pm2 reload seamxy-production
```

### OpenAI/AI Services Unavailable

Price comparison will automatically fall back to text-based matching if OpenAI is unavailable. Check logs:

```bash
pm2 logs seamxy-production | grep -i "openai"
```

If you see AI initialization errors but want to use AI matching:
1. Verify `OPENAI_API_KEY` or `AI_INTEGRATIONS_OPENAI_API_KEY` is set
2. Check API key validity
3. Restart: `pm2 restart seamxy-production`

### Database Migration Issues

```bash
# Check current schema
npm run db:studio

# Force push schema (⚠️ use carefully)
npm run db:push --force

# If tables exist with wrong structure, you may need to drop and recreate
# CAUTION: This deletes all data
# psql -U user -d database -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# npm run db:push
```

---

## Security Checklist

Before going live:

- [ ] All environment variables set in `ecosystem.config.js`
- [ ] Strong `SESSION_SECRET` generated (128 chars)
- [ ] Strong `INTEGRATION_TOKEN_KEY` generated (64 hex chars)
- [ ] Database credentials are secure
- [ ] `.env` and `ecosystem.config.js` are in `.gitignore`
- [ ] PostgreSQL allows connections only from application server
- [ ] HTTPS/TLS enabled (use nginx/caddy as reverse proxy)
- [ ] Firewall configured (allow only necessary ports)
- [ ] Regular backups configured for database
- [ ] PM2 startup script enabled
- [ ] Log rotation configured

---

## Reverse Proxy Setup (Optional but Recommended)

### Using Nginx

```nginx
# /etc/nginx/sites-available/seamxy

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/seamxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

---

## Support

For issues or questions:

1. Check logs: `pm2 logs seamxy-production`
2. Review this deployment guide
3. Check `replit.md` for architecture details
4. Review environment variable requirements in `.env.example`

---

## Quick Reference

```bash
# Start
pm2 start ecosystem.config.js --env production

# Restart
pm2 restart seamxy-production

# Zero-downtime reload
pm2 reload seamxy-production

# View logs
pm2 logs seamxy-production

# Monitor
pm2 monit

# Stop
pm2 stop seamxy-production

# Check status
pm2 status
```

---

**Production Deployment Complete! 🚀**
