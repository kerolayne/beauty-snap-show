# Vercel Deployment Guide

This guide covers deploying your beauty scheduling app to Vercel with serverless functions.

## 🚀 Quick Deployment Steps

### 1. Database Setup

**Option A: Neon (Recommended)**
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/database`)
4. Use the pooled connection string for better performance

**Option B: Supabase**
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

### 2. Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables for **Production** and **Preview**:

```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
```

### 3. Deploy to Vercel

**Via Vercel CLI:**
```bash
npm install -g vercel
vercel --prod
```

**Via GitHub Integration:**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push

### 4. Database Migration

After deployment, run the database migration:

```bash
# Set your DATABASE_URL environment variable locally
export DATABASE_URL="your-database-url"

# Run migrations
npx prisma migrate deploy

# Optionally seed the database
npx prisma db seed
```

## 📁 Project Structure

```
├── api/                          # Vercel Serverless Functions
│   ├── _lib/
│   │   └── prisma.ts            # Prisma client for serverless
│   ├── auth/
│   │   └── signup.ts            # POST /api/auth/signup
│   ├── professionals/
│   │   └── [id]/
│   │       └── availability.ts  # GET /api/professionals/:id/availability
│   ├── appointments/
│   │   └── [id]/
│   │       └── cancel.ts        # PATCH /api/appointments/:id/cancel
│   ├── services.ts              # GET /api/services
│   ├── professionals.ts         # GET /api/professionals
│   ├── appointments.ts          # POST /api/appointments
│   └── health.ts                # GET /api/health
├── src/                         # Frontend React app
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Database seeding
├── vercel.json                 # Vercel configuration
└── package.json                # Dependencies and scripts
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create user account
- `GET /api/health` - Health check

### Services & Professionals
- `GET /api/services` - List all services
- `GET /api/professionals` - List all professionals with services

### Availability
- `GET /api/professionals/:id/availability?date=YYYY-MM-DD` - Get availability

### Appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id/cancel` - Cancel appointment

## 🛠️ Configuration Files

### vercel.json
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

### package.json Scripts
```json
{
  "scripts": {
    "vercel-build": "prisma generate && vite build",
    "postinstall": "prisma generate"
  }
}
```

## 🔍 Testing Your Deployment

### 1. Health Check
Visit: `https://your-app.vercel.app/api/health`

Expected response:
```json
{
  "ok": true,
  "db": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

### 2. Test Signup
```bash
curl -X POST https://your-app.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Expected response (201):
```json
{
  "id": "cuid_...",
  "name": "Test User",
  "email": "test@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 3. Frontend Integration
The frontend automatically uses relative paths:
- Development: `http://localhost:8080/api/auth/signup`
- Production: `https://your-app.vercel.app/api/auth/signup`

## 🚨 Troubleshooting

### Common Issues

**1. "Failed to fetch" Error**
- ✅ Check that `DATABASE_URL` is set in Vercel environment variables
- ✅ Verify database connection (test with `/api/health`)
- ✅ Ensure database migrations are applied

**2. Prisma Client Not Generated**
- ✅ Run `npm run vercel-build` locally to test
- ✅ Check Vercel build logs for Prisma generation errors
- ✅ Ensure `postinstall` script runs: `"postinstall": "prisma generate"`

**3. Database Connection Issues**
- ✅ Use pooled connection strings for Neon
- ✅ Check database IP allowlist (if applicable)
- ✅ Verify connection string format

**4. CORS Errors**
- ✅ Not applicable - using same-origin requests
- ✅ Functions include OPTIONS preflight handling

**5. Function Timeout**
- ✅ Vercel functions have 10s timeout (Hobby) / 60s (Pro)
- ✅ Optimize database queries
- ✅ Use connection pooling

### Debugging

**Check Vercel Function Logs:**
1. Go to Vercel Dashboard → Functions
2. Click on your function
3. View logs for errors

**Test Locally:**
```bash
# Install Vercel CLI
npm install -g vercel

# Run locally
vercel dev
```

## 🔒 Security Considerations

### Environment Variables
- ✅ Never commit `DATABASE_URL` to version control
- ✅ Use different databases for development/production
- ✅ Rotate database credentials regularly

### API Security
- ✅ Input validation with Zod schemas
- ✅ Password hashing with Argon2
- ✅ SQL injection prevention with Prisma
- ✅ Rate limiting (consider adding `@fastify/rate-limit`)

### Database Security
- ✅ Use connection pooling
- ✅ Enable SSL/TLS connections
- ✅ Regular backups
- ✅ Monitor access logs

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Monitor function execution times
- Track error rates

### Database Monitoring
- Monitor connection pool usage
- Track query performance
- Set up alerts for errors

## 🚀 Performance Optimization

### Database
- ✅ Use connection pooling (Neon/Supabase)
- ✅ Optimize Prisma queries
- ✅ Add database indexes

### Functions
- ✅ Keep functions lightweight
- ✅ Use edge caching where possible
- ✅ Optimize bundle size

### Frontend
- ✅ Use Vite's code splitting
- ✅ Optimize images and assets
- ✅ Enable compression

## 📝 Next Steps

1. **Add Authentication**: Implement JWT-based login
2. **Add Rate Limiting**: Prevent API abuse
3. **Add Monitoring**: Set up error tracking
4. **Add Testing**: Implement automated tests
5. **Add CI/CD**: Automated deployments

## 🆘 Support

If you encounter issues:

1. Check Vercel Function logs
2. Test database connection with `/api/health`
3. Verify environment variables
4. Check Prisma schema and migrations
5. Review this guide for common solutions

For additional help:
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)

