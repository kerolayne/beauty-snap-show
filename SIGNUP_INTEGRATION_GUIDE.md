# User Signup Integration Guide

This guide shows how to use the new secure user signup functionality in your beauty scheduling app.

## Quick Start

1. **Start the database and run migrations:**
   ```bash
   npm run db:up          # Start PostgreSQL
   npm run db:migrate     # Run migrations (includes passwordHash field)
   npm run db:seed        # Seed with sample data
   ```

2. **Start the backend server:**
   ```bash
   npm run dev:server     # Start Fastify server with auth routes
   ```

3. **Test the signup functionality:**
   ```bash
   npm run test:signup    # Test signup logic
   ```

## API Endpoint

### POST /api/auth/signup

Creates a new user account with secure password hashing.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Validation Rules:**
- `name`: 2-80 characters
- `email`: Valid email format
- `password`: 8-128 characters, must include:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Success Response (201):**
```json
{
  "id": "cuid_123...",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

**Validation Error (400):**
```json
{
  "code": "VALIDATION_ERROR",
  "issues": [
    {
      "path": ["password"],
      "message": "Password must include an uppercase letter",
      "code": "custom"
    }
  ]
}
```

**Email Already Taken (409):**
```json
{
  "code": "EMAIL_TAKEN",
  "message": "Email already registered"
}
```

## Frontend Usage

### Using the API Client

```typescript
import { apiClient } from '@/lib/api'

// Sign up a new user
try {
  const user = await apiClient.signup({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePassword123'
  })
  
  console.log('User created:', user)
  // Handle success (redirect to dashboard, show welcome message, etc.)
  
} catch (error) {
  console.error('Signup failed:', error.message)
  // Handle error (show validation errors, email taken, etc.)
}
```

### Using the Signup Page Component

The `Signup.tsx` component provides a complete signup form with:

- Real-time validation
- Error handling
- Success feedback
- Loading states
- Responsive design

```typescript
import Signup from '@/pages/Signup'

// Use in your routing
<Route path="/signup" element={<Signup />} />
```

## Security Features

### Password Hashing
- Uses **Argon2** for secure password hashing
- Passwords are never stored in plaintext
- Hash includes salt and configurable parameters

### Input Validation
- **Server-side**: Zod schemas with comprehensive validation
- **Client-side**: Real-time validation with user feedback
- **Email normalization**: Trims whitespace and converts to lowercase

### Error Handling
- **No information leakage**: Generic error messages for security issues
- **Detailed validation**: Specific feedback for input errors
- **Proper HTTP status codes**: 400, 409, 500 as appropriate

### Rate Limiting (Optional)
Consider adding rate limiting to prevent abuse:

```typescript
import rateLimit from '@fastify/rate-limit'

await app.register(rateLimit, {
  max: 5, // 5 requests
  timeWindow: '15 minutes' // per 15 minutes
})
```

## Database Schema

The User model now includes:

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String   // New field for secure password storage
  phone        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  appointments Appointment[]
}
```

## Testing

### Manual Testing
1. **Valid signup**: Test with valid data
2. **Validation errors**: Test with invalid data (short password, invalid email, etc.)
3. **Duplicate email**: Try to sign up with the same email twice
4. **Edge cases**: Very long names, special characters in email, etc.

### Automated Testing
```bash
npm run test:signup    # Test signup functionality
npm run test:setup     # Test database connectivity
```

## Integration with Existing Features

### Booking System
Once users are created, they can book appointments:

```typescript
// After successful signup
const appointment = await apiClient.createAppointment({
  userId: user.id,
  professionalId: 'professional-id',
  serviceId: 'service-id',
  startsAtISO: '2024-01-15T10:00:00Z'
})
```

### User Management
Extend the system with additional user features:

- Login/logout functionality
- Password reset
- User profile management
- Appointment history

## Production Considerations

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@host:5432/beauty"
NODE_ENV=production
```

### Security Headers
Consider adding security headers:

```typescript
await app.register(require('@fastify/helmet'), {
  contentSecurityPolicy: false
})
```

### Monitoring
- Log authentication attempts
- Monitor failed signup attempts
- Track user registration metrics

## Next Steps

1. **Implement Login**: Add JWT-based authentication
2. **Password Reset**: Add forgot password functionality
3. **Email Verification**: Send verification emails
4. **Social Login**: Add OAuth providers (Google, Facebook)
5. **User Roles**: Implement different user types (admin, professional, customer)

## Troubleshooting

### Common Issues

**Database Connection Error:**
- Ensure PostgreSQL is running: `npm run db:up`
- Check DATABASE_URL in `.env`

**Migration Errors:**
- Reset database: `npm run db:reset`
- Run migrations: `npm run db:migrate`

**CORS Errors:**
- Check server CORS configuration
- Ensure frontend URL is allowed

**Validation Errors:**
- Check password requirements
- Verify email format
- Ensure name length is within limits
