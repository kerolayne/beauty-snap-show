# Beauty Snap Show

A modern beauty salon booking and showcase application built with React, TypeScript, Tailwind CSS, and Firebase backend.

**Live Demo**: https://beauty-snap-show-git-main-kerolaynes-projects.vercel.app/

## Features

- **Booking System**: Schedule appointments with beauty professionals
- **Portfolio Showcase**: Browse and view beauty work portfolios
- **Reviews & Ratings**: Read customer reviews and ratings
- **Availability Calendar**: Real-time availability checking with conflict prevention
- **Professional Management**: Manage beauty professionals and their services
- **Time Zone Support**: Proper handling of Europe/Lisbon timezone
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Real-time Updates**: Using Firebase Realtime Database features

## Technologies Used

### Frontend
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn/ui** - Beautiful and accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase SDK** - Firebase client library
- **Zod** - Runtime type validation

### Backend
- **Firebase** - Backend as a Service (BaaS)
  - Firestore - NoSQL database
  - Authentication - User management
  - Cloud Functions - Serverless backend logic
  - Hosting - Web hosting
- **TypeScript** - Type-safe backend development

## Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js 20+** - You can install using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** - Package manager (comes with Node.js)
- **Firebase CLI** - For deploying to Firebase (`npm install -g firebase-tools`)

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd beauty-snap-show
```

2. Install dependencies:
```sh
npm install
```

3. Firebase Setup:
   - Create a new project in [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Hosting
   - Download your Firebase Admin SDK service account key:
     - Go to Project Settings > Service Accounts
     - Click "Generate New Private Key"
     - Save as `firebase-service-account.json` in the project root

4. Set up environment variables:
```sh
cp env.example .env.local
```

Edit `.env.local` with your Firebase configuration:

```env
# Firebase Config
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email

# Frontend Firebase Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Timezone
TZ=Europe/Lisbon
```

5. Initialize Firebase:
```sh
firebase login
firebase init
```

Choose the following features:
- Firestore
- Hosting
- Functions (optional)
```sh
npm run db:seed
```

7. Generate Prisma client:
```sh
npm run db:generate
```

8. Start both backend and frontend servers:
```sh
npm run dev
```

This will start:
- **API Server** on `http://localhost:3001` (Express with auto-registered routes)
- **Frontend** on `http://localhost:5173` (Vite dev server with proxy)

Alternatively, run them separately:
```sh
# Terminal 1: Start API server
npm run dev:server

# Terminal 2: Start frontend
npm run dev:client
```

The application will be available at:
- **Frontend**: `http://localhost:5173` (Vite)
- **Backend API**: `http://localhost:3001` (Express)
- **Database**: `localhost:5432` (PostgreSQL)

### API Configuration

The application uses a centralized API client that automatically handles:
- **Development**: Proxy configuration routes `/api/*` requests to `http://localhost:3001`
- **Production**: Direct API calls to the configured `VITE_API_URL`
- **Environment Detection**: Automatic fallback to relative paths when no environment variable is set

**No hardcoded localhost URLs** - All API calls use environment variables with proper fallbacks.

### Database Management

- **View database**: `npm run db:studio` (opens Prisma Studio)
- **Reset database**: `npm run db:reset` (drops all data and re-runs migrations)
- **Stop database**: `npm run db:down`

## Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and API client
│   ├── types/             # TypeScript type definitions
│   └── assets/            # Static assets
├── server/                # Backend source code
│   └── index.ts           # Fastify server entry point
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Prisma schema definition
│   ├── migrations/        # Database migration files
│   └── seed.ts            # Database seeding script
├── docker-compose.yml     # PostgreSQL container setup
└── env.example            # Environment variables template
```

## Available Scripts

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev:server` - Start Fastify development server

### Database
- `npm run db:up` - Start PostgreSQL container
- `npm run db:down` - Stop PostgreSQL container
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database (drops all data)
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run db:generate` - Generate Prisma client

### Testing
- `npm run test:setup` - Test database setup and connectivity
- `npm run test:concurrent` - Test concurrent booking prevention
- `npm run test:signup` - Test user signup functionality

## API Endpoints

### Services
- `GET /api/services` - List all active services

### Professionals
- `GET /api/professionals` - List all professionals with their services
- `GET /api/professionals/:id/availability` - Get availability for a specific professional

### Appointments
- `POST /api/appointments` - Create a new appointment
- `PATCH /api/appointments/:id/cancel` - Cancel an appointment

### Authentication
- Firebase Authentication handles all auth-related operations

### Health
- `GET /health` - Health check endpoint

## Firestore Data Structure

The application uses the following collections:

### professionals
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  services: {
    id: string;
    name: string;
    durationMinutes: number;
    priceCents: number;
  }[];
  workingHours: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### appointments
```typescript
{
  id: string;
  userId: string;
  professionalId: string;
  serviceId: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### services
```typescript
{
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

## Database Schema

The application uses PostgreSQL with the following main entities:

- **User** - Clients who book appointments (with secure password authentication)
- **Professional** - Beauty service providers
- **Service** - Available beauty services (haircut, manicure, etc.)
- **WorkingHour** - Professional availability schedule
- **Break** - Professional breaks and time off
- **Appointment** - Booked appointments with conflict prevention
- **Payment** - Payment tracking (optional)
- **RecurrenceRule** - Recurring appointment templates (optional)

## Key Features

### Double-Booking Prevention
The system uses PostgreSQL exclusion constraints to prevent overlapping appointments:

```sql
ALTER TABLE "Appointment"
  ADD CONSTRAINT appointment_no_overlap
  EXCLUDE USING gist (
    "professionalId" WITH =,
    tstzrange("startsAt","endsAt") WITH &&
  )
  WHERE (status IN ('PENDING','CONFIRMED'));
```

### Time Zone Handling
- All timestamps are stored in UTC
- Client-side conversion to Europe/Lisbon timezone
- Proper date/time formatting utilities provided

### Type Safety
- Full TypeScript support with Zod validation
- Prisma generates type-safe database queries
- API responses are validated at runtime

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit and push to your branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
