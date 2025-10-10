import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = Fastify({
  logger: {
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
})

// Register CORS
await app.register(cors, {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:8080', 'http://localhost:3000']
    : true,
  credentials: true,
})

// Initialize Prisma
const prisma = new PrismaClient()

// Validation schemas
const createAppointmentSchema = z.object({
  userId: z.string(),
  professionalId: z.string(),
  serviceId: z.string(),
  startsAtISO: z.string().datetime(),
})

const cancelAppointmentSchema = z.object({
  id: z.string(),
})

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// Helper function to calculate availability
async function calculateAvailability(professionalId: string, date: string) {
  const startDate = new Date(date + 'T00:00:00Z')
  const endDate = new Date(date + 'T23:59:59Z')

  // Get professional's working hours for the day
  const dayOfWeek = startDate.getUTCDay()
  const workingHour = await prisma.workingHour.findUnique({
    where: {
      professionalId_weekday: {
        professionalId,
        weekday: dayOfWeek,
      },
    },
  })

  if (!workingHour) {
    return [] // No working hours for this day
  }

  // Get existing appointments for the day
  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId,
      startsAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    orderBy: { startsAt: 'asc' },
  })

  // Get breaks for the day
  const breaks = await prisma.break.findMany({
    where: {
      professionalId,
      startsAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { startsAt: 'asc' },
  })

  // Get professional's services to determine slot duration
  const services = await prisma.service.findMany({
    where: {
      professionals: {
        some: { id: professionalId },
      },
      active: true,
    },
  })

  if (services.length === 0) {
    return []
  }

  const minDuration = Math.min(...services.map(s => s.durationMinutes))
  const slots: Array<{ startsAt: Date; endsAt: Date; available: boolean }> = []

  // Generate slots in 15-minute intervals
  const startMinutes = workingHour.startMinutes
  const endMinutes = workingHour.endMinutes
  const slotInterval = 15 // 15 minutes

  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotInterval) {
    const slotStart = new Date(startDate)
    slotStart.setUTCHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
    
    const slotEnd = new Date(slotStart)
    slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + minDuration)

    // Check if slot conflicts with existing appointments
    const conflictsWithAppointment = appointments.some(apt => {
      return (slotStart < apt.endsAt && slotEnd > apt.startsAt)
    })

    // Check if slot conflicts with breaks
    const conflictsWithBreak = breaks.some(brk => {
      return (slotStart < brk.endsAt && slotEnd > brk.startsAt)
    })

    // Check if slot extends beyond working hours
    const slotEndMinutes = slotEnd.getUTCHours() * 60 + slotEnd.getUTCMinutes()
    const extendsBeyondHours = slotEndMinutes > endMinutes

    slots.push({
      startsAt: slotStart,
      endsAt: slotEnd,
      available: !conflictsWithAppointment && !conflictsWithBreak && !extendsBeyondHours,
    })
  }

  return slots.filter(slot => slot.available)
}

// Routes

// GET /api/services
app.get('/api/services', async (request, reply) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    })

    return {
      success: true,
      data: services,
    }
  } catch (error) {
    app.log.error(error)
    reply.code(500)
    return {
      success: false,
      error: 'Failed to fetch services',
    }
  }
})

// GET /api/professionals
app.get('/api/professionals', async (request, reply) => {
  try {
    const professionals = await prisma.professional.findMany({
      include: {
        services: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            priceCents: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return {
      success: true,
      data: professionals,
    }
  } catch (error) {
    app.log.error(error)
    reply.code(500)
    return {
      success: false,
      error: 'Failed to fetch professionals',
    }
  }
})

// GET /api/professionals/:id/availability
app.get<{ Params: { id: string }; Querystring: { date: string } }>(
  '/api/professionals/:id/availability',
  {
    schema: {
      params: z.object({
        id: z.string(),
      }),
      querystring: availabilityQuerySchema,
    },
  },
  async (request, reply) => {
    try {
      const { id } = request.params
      const { date } = request.query

      // Verify professional exists
      const professional = await prisma.professional.findUnique({
        where: { id },
      })

      if (!professional) {
        reply.code(404)
        return {
          success: false,
          error: 'Professional not found',
        }
      }

      const availability = await calculateAvailability(id, date)

      return {
        success: true,
        data: {
          professional: {
            id: professional.id,
            name: professional.name,
          },
          date,
          slots: availability,
        },
      }
    } catch (error) {
      app.log.error(error)
      reply.code(500)
      return {
        success: false,
        error: 'Failed to calculate availability',
      }
    }
  }
)

// POST /api/appointments
app.post('/api/appointments', {
  schema: {
    body: createAppointmentSchema,
  },
}, async (request, reply) => {
  try {
    const { userId, professionalId, serviceId, startsAtISO } = request.body

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      reply.code(404)
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Verify professional exists
    const professional = await prisma.professional.findUnique({ 
      where: { id: professionalId },
      include: { services: { where: { id: serviceId } } }
    })
    if (!professional || professional.services.length === 0) {
      reply.code(404)
      return {
        success: false,
        error: 'Professional or service not found',
      }
    }

    // Get service details
    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      reply.code(404)
      return {
        success: false,
        error: 'Service not found',
      }
    }

    // Calculate appointment end time
    const startsAt = new Date(startsAtISO)
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000)

    // Create appointment in transaction to handle race conditions
    try {
      const appointment = await prisma.$transaction(async (tx) => {
        // Check for conflicts within the transaction
        const conflicts = await tx.appointment.findMany({
          where: {
            professionalId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            OR: [
              {
                startsAt: { lt: endsAt },
                endsAt: { gt: startsAt },
              },
            ],
          },
        })

        if (conflicts.length > 0) {
          throw new Error('APPOINTMENT_CONFLICT')
        }

        return await tx.appointment.create({
          data: {
            userId,
            professionalId,
            serviceId,
            startsAt,
            endsAt,
            status: 'PENDING',
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            professional: { select: { id: true, name: true } },
            service: { select: { id: true, name: true, durationMinutes: true } },
          },
        })
      })

      return {
        success: true,
        data: appointment,
      }
    } catch (error: any) {
      if (error.message === 'APPOINTMENT_CONFLICT') {
        reply.code(409)
        return {
          success: false,
          error: 'Time slot is no longer available',
        }
      }
      throw error
    }
  } catch (error: any) {
    app.log.error(error)
    
    // Handle PostgreSQL exclusion constraint violation
    if (error.code === 'P0001' || error.message?.includes('exclusion constraint')) {
      reply.code(409)
      return {
        success: false,
        error: 'Time slot is no longer available',
      }
    }

    reply.code(500)
    return {
      success: false,
      error: 'Failed to create appointment',
    }
  }
})

// PATCH /api/appointments/:id/cancel
app.patch<{ Params: { id: string } }>(
  '/api/appointments/:id/cancel',
  {
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
  },
  async (request, reply) => {
    try {
      const { id } = request.params

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          professional: { select: { id: true, name: true } },
          service: { select: { id: true, name: true, durationMinutes: true } },
        },
      })

      if (!appointment) {
        reply.code(404)
        return {
          success: false,
          error: 'Appointment not found',
        }
      }

      if (appointment.status === 'CANCELLED') {
        reply.code(400)
        return {
          success: false,
          error: 'Appointment is already cancelled',
        }
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          professional: { select: { id: true, name: true } },
          service: { select: { id: true, name: true, durationMinutes: true } },
        },
      })

      return {
        success: true,
        data: updatedAppointment,
      }
    } catch (error) {
      app.log.error(error)
      reply.code(500)
      return {
        success: false,
        error: 'Failed to cancel appointment',
      }
    }
  }
)

// Health check
app.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'ok', timestamp: new Date().toISOString() }
  } catch (error) {
    reply.code(503)
    return { status: 'error', timestamp: new Date().toISOString() }
  }
})

// Graceful shutdown
const gracefulShutdown = async () => {
  app.log.info('Shutting down gracefully...')
  await prisma.$disconnect()
  await app.close()
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001')
    const host = '0.0.0.0'
    
    await app.listen({ port, host })
    app.log.info(`🚀 Server running on http://${host}:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
