import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../../_lib/prisma'
import { z } from 'zod'

export const config = { runtime: 'nodejs' as const }

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    const { id } = req.query
    const { date } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Professional ID is required',
      })
    }

    // Validate date query parameter
    const dateValidation = availabilityQuerySchema.safeParse({ date })
    if (!dateValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Valid date parameter is required (YYYY-MM-DD format)',
      })
    }

    const validDate = dateValidation.data.date

    // Verify professional exists
    const professional = await prisma.professional.findUnique({
      where: { id },
    })

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: 'Professional not found',
      })
    }

    const availability = await calculateAvailability(id, validDate)

    return res.status(200).json({
      success: true,
      data: {
        professional: {
          id: professional.id,
          name: professional.name,
        },
        date: validDate,
        slots: availability,
      },
    })
  } catch (error) {
    console.error('availability_error', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate availability',
    })
  }
}

