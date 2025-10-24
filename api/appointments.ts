import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { initializeFirebaseAdmin } from './_lib/firebase-admin'
import { z } from 'zod'

export const config = { runtime: 'nodejs' as const }

// Initialize Firebase Admin SDK
initializeFirebaseAdmin()
const db = getFirestore()

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
    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }
    const userData = userDoc.data()!

    // Verify professional exists and check if they offer the service
    const professionalDoc = await db.collection('professionals').doc(professionalId).get()
    if (!professionalDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Professional not found',
      })
    }
    const professionalData = professionalDoc.data()!

    // Get service details
    const serviceDoc = await db.collection('services').doc(serviceId).get()
    if (!serviceDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      })
    }
    const serviceData = serviceDoc.data()!

    // Verify professional offers this service
    const professionalServices = professionalData.services || []
    if (!professionalServices.some((s: any) => s.id === serviceId)) {
      return res.status(400).json({
        success: false,
        error: 'Professional does not offer this service',
      })
    }

    // Calculate appointment end time
    const startsAt = new Date(startsAtISO)
    const endsAt = new Date(startsAt.getTime() + serviceData.durationMinutes * 60 * 1000)

    // Create appointment with transaction to handle race conditions
    try {
      const result = await db.runTransaction(async (transaction) => {
        // Check for conflicts within the transaction
        const conflictsQuery = await transaction.get(
          db.collection('appointments')
            .where('professionalId', '==', professionalId)
            .where('status', 'in', ['PENDING', 'CONFIRMED'])
        )

        const hasConflicts = conflictsQuery.docs.some(doc => {
          const appointment = doc.data()
          const appointmentStart = appointment.startsAt.toDate()
          const appointmentEnd = appointment.endsAt.toDate()
          return (startsAt < appointmentEnd && endsAt > appointmentStart)
        })

        if (conflicts.length > 0) {
          throw new Error('APPOINTMENT_CONFLICT')
        }

        // Create new appointment
        const appointmentRef = db.collection('appointments').doc()
        const appointmentData = {
          userId,
          professionalId,
          serviceId,
          startsAt: Timestamp.fromDate(startsAt),
          endsAt: Timestamp.fromDate(endsAt),
          status: 'PENDING',
          notes: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          user: {
            id: userId,
            name: userData.name,
            email: userData.email,
          },
          professional: {
            id: professionalId,
            name: professionalData.name,
          },
          service: {
            id: serviceId,
            name: serviceData.name,
            durationMinutes: serviceData.durationMinutes,
          }
        }

        await transaction.create(appointmentRef, appointmentData)
        return { id: appointmentRef.id, ...appointmentData }
      })

      return res.status(201).json({
        success: true,
        data: result
      })
    } catch (error: any) {
      if (error.message === 'APPOINTMENT_CONFLICT') {
        return res.status(409).json({
          success: false,
          error: 'This time slot is already booked'
        })
      }
      throw error
    }
        })

        if (conflicts.length > 0) {
          throw new Error('APPOINTMENT_CONFLICT')
        }

        // Create new appointment
        const appointmentRef = db.collection('appointments').doc()
        const appointmentData = {
          userId,
          professionalId,
          serviceId,
          startsAt: Timestamp.fromDate(startsAt),
          endsAt: Timestamp.fromDate(endsAt),
          status: 'PENDING',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          user: {
            id: userId,
            name: userData.name,
            email: userData.email,
          },
          professional: {
            id: professionalId,
            name: professionalData.name,
          },
          service: {
            id: serviceId,
            name: serviceData.name,
            durationMinutes: serviceData.durationMinutes,
            name: serviceData.name
          }
        }

        transaction.create(appointmentRef, appointmentData)
        return { id: appointmentRef.id, ...appointmentData }
      })

      return res.status(201).json({
        success: true,
        data: result,
      })
    } catch (error: any) {
      if (error.message === 'APPOINTMENT_CONFLICT') {
        return res.status(409).json({
          success: false,
          error: 'This time slot is already booked',
        })
      }
      throw error
    }
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}
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

