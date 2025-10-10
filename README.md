# Beauty Snap Show

A modern beauty salon booking and showcase application built with React, TypeScript, Tailwind CSS, and a production-ready PostgreSQL backend with Prisma ORM.

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

## Technologies Used

### Frontend
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn/ui** - Beautiful and accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **Zod** - Runtime type validation

### Backend
- **Fastify** - Fast and low overhead web framework
- **Prisma** - Next-generation ORM for TypeScript
- **PostgreSQL** - Robust relational database
- **Docker** - Containerized database setup
- **TypeScript** - Type-safe backend development

## Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js 20+** - You can install using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **Docker** - For running PostgreSQL database locally
- **npm** - Package manager (comes with Node.js)

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

3. Set up environment variables:
```sh
cp env.example .env
```
Edit `.env` if needed (default values should work for local development).

4. Start the PostgreSQL database:
```sh
npm run db:up
```

5. Run database migrations:
```sh
npm run db:migrate
```

6. Seed the database with sample data:
```sh
npm run db:seed
```

7. Generate Prisma client:
```sh
npm run db:generate
```

8. Start the backend server:
```sh
npm run dev:server
```

9. In a new terminal, start the frontend development server:
```sh
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:8080` (Vite)
- **Backend API**: `http://localhost:3001`
- **Database**: `localhost:5432`

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

## API Endpoints

### Services
- `GET /api/services` - List all active services

### Professionals
- `GET /api/professionals` - List all professionals with their services
- `GET /api/professionals/:id/availability?date=YYYY-MM-DD` - Get availability for a specific professional and date

### Appointments
- `POST /api/appointments` - Create a new appointment
- `PATCH /api/appointments/:id/cancel` - Cancel an appointment

### Health
- `GET /health` - Health check endpoint

## Database Schema

The application uses PostgreSQL with the following main entities:

- **User** - Clients who book appointments
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
