import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma.js'
import { z } from 'zod'

export const config = { runtime: 'nodejs' as const }

const createAppointmentSchema = z.object({
  userId: z.string(),
  professionalId: z.string(),
  serviceId: z.string(),
  startsAtISO: z.string().datetime(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'content-type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    const body = req.body ?? (typeof req.body === 'string' ? JSON.parse(req.body) : {})
    const parsed = createAppointmentSchema.safeParse(body)
    
    if (!parsed.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues,
      })
    }

    const { userId, professionalId, serviceId, startsAtISO } = parsed.data

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Verify professional exists
    const professional = await prisma.professional.findUnique({ 
      where: { id: professionalId },
      include: { services: { where: { id: serviceId } } }
    })
    if (!professional || professional.services.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Professional or service not found',
      })
    }

    // Get service details
    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      })
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

      return res.status(201).json({
        success: true,
        data: appointment,
      })
    } catch (error: any) {
      if (error.message === 'APPOINTMENT_CONFLICT') {
        return res.status(409).json({
          success: false,
          error: 'Time slot is no longer available',
        })
      }
      throw error
    }
  } catch (error: any) {
    console.error('appointments_error', error)
    
    // Handle PostgreSQL exclusion constraint violation
    if (error.code === 'P0001' || error.message?.includes('exclusion constraint')) {
      return res.status(409).json({
        success: false,
        error: 'Time slot is no longer available',
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create appointment',
    })
  }
}

