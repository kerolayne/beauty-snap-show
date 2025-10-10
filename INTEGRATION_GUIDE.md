# API Integration Guide

This guide shows how to integrate the new PostgreSQL backend with your existing React components.

## Quick Start

1. **Start the backend services:**
   ```bash
   npm run db:up          # Start PostgreSQL
   npm run db:migrate     # Run migrations
   npm run db:seed        # Seed sample data
   npm run dev:server     # Start API server
   ```

2. **Use the API client in your components:**
   ```typescript
   import { apiClient } from '@/lib/api'
   
   // Get services
   const services = await apiClient.getServices()
   
   // Get professionals
   const professionals = await apiClient.getProfessionals()
   
   // Get availability
   const availability = await apiClient.getAvailability(professionalId, '2024-01-15')
   
   // Book appointment
   const appointment = await apiClient.createAppointment({
     userId: 'user-id',
     professionalId: 'professional-id',
     serviceId: 'service-id',
     startsAtISO: '2024-01-15T10:00:00Z'
   })
   ```

## Example: Updated AgendamentoForm

Here's how to update your existing `AgendamentoForm` component to use the new API:

```typescript
import { useState, useEffect } from 'react'
import { apiClient, Professional, Service } from '@/lib/api'
import { formatDateTime } from '@/lib/api'

export const AgendamentoForm = ({ onSubmit, loading }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availability, setAvailability] = useState(null)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const [professionalsData, servicesData] = await Promise.all([
        apiClient.getProfessionals(),
        apiClient.getServices(),
      ])
      setProfessionals(professionalsData)
      setServices(servicesData)
    }
    loadData()
  }, [])

  // Load availability when professional and date change
  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      const loadAvailability = async () => {
        const availabilityData = await apiClient.getAvailability(
          selectedProfessional,
          selectedDate
        )
        setAvailability(availabilityData)
      }
      loadAvailability()
    }
  }, [selectedProfessional, selectedDate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Create user if needed (in real app, this would come from auth)
      const user = await createOrGetUser({
        name: nomeCliente,
        phone: telefone,
      })

      // Book appointment
      const appointment = await apiClient.createAppointment({
        userId: user.id,
        professionalId: selectedProfessional,
        serviceId: selectedService,
        startsAtISO: `${selectedDate}T${selectedTime}:00Z`,
      })

      onSubmit({
        appointment,
        message: `Agendamento confirmado para ${formatDateTime(new Date(appointment.startsAt))}`
      })
    } catch (error) {
      toast({
        title: "Erro no agendamento",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your existing form fields */}
      {/* Add professional, service, date, and time selectors */}
    </form>
  )
}
```

## Data Migration

If you have existing data in your frontend, you can migrate it to the new database:

### 1. Services Migration
```typescript
// Your existing services data
const existingServices = [
  { name: 'Corte de Cabelo', duration: 45, price: 35 },
  { name: 'Manicure', duration: 60, price: 25 },
  // ...
]

// Migrate to database
for (const service of existingServices) {
  await apiClient.createService({
    name: service.name,
    durationMinutes: service.duration,
    priceCents: service.price * 100,
    active: true,
  })
}
```

### 2. Professionals Migration
```typescript
// Your existing professionals data
const existingProfessionals = [
  { name: 'Maria Silva', services: ['Corte de Cabelo', 'Manicure'] },
  // ...
]

// Migrate to database
for (const professional of existingProfessionals) {
  await apiClient.createProfessional({
    name: professional.name,
    email: `${professional.name.toLowerCase().replace(' ', '.')}@beauty.com`,
    // Link to services...
  })
}
```

## Testing the Integration

1. **Test the API endpoints:**
   ```bash
   # Test services
   curl http://localhost:3001/api/services
   
   # Test professionals
   curl http://localhost:3001/api/professionals
   
   # Test availability
   curl "http://localhost:3001/api/professionals/PROFESSIONAL_ID/availability?date=2024-01-15"
   ```

2. **Test concurrent booking:**
   ```bash
   npm run test:concurrent
   ```

3. **View database:**
   ```bash
   npm run db:studio
   ```

## Common Issues

### 1. CORS Errors
If you get CORS errors, make sure the backend is running and the frontend URL is allowed in the CORS configuration.

### 2. Database Connection
If you get database connection errors:
- Make sure Docker is running: `docker ps`
- Check if PostgreSQL is up: `npm run db:up`
- Verify the connection string in `.env`

### 3. Type Errors
If you get TypeScript errors:
- Run `npm run db:generate` to update Prisma client types
- Restart your TypeScript server in your IDE

## Production Deployment

For production deployment:

1. **Environment Variables:**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/beauty"
   NODE_ENV=production
   PORT=3001
   ```

2. **Database Setup:**
   ```bash
   npm run db:migrate
   npm run db:seed  # Only for initial setup
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Start:**
   ```bash
   npm run dev:server
   ```
