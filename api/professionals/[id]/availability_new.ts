import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeFirebaseAdmin } from '../../_lib/firebase-admin'
import { z } from 'zod'

export const config = { runtime: 'nodejs' as const }

// Initialize Firebase Admin SDK
initializeFirebaseAdmin()
const db = getFirestore()

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// Helper function to calculate availability
async function calculateAvailability(professionalId: string, date: string) {
  const startDate = new Date(date + 'T00:00:00Z')
  const endDate = new Date(date + 'T23:59:59Z')

  // Get professional's working hours for the day
  const dayOfWeek = startDate.getUTCDay()
  const professionalDoc = await db.collection('professionals').doc(professionalId).get()
  if (!professionalDoc.exists) {
    return []
  }
  
  const professionalData = professionalDoc.data()!
  const workingHours = professionalData.workingHours || []
  const workingHour = workingHours.find((wh: any) => wh.weekday === dayOfWeek)

  if (!workingHour) {
    return [] // No working hours for this day
  }

  // Get existing appointments for the day
  const appointmentsQuery = await db.collection('appointments')
    .where('professionalId', '==', professionalId)
    .where('startsAt', '>=', startDate)
    .where('startsAt', '<=', endDate)
    .where('status', 'in', ['PENDING', 'CONFIRMED'])
    .orderBy('startsAt', 'asc')
    .get()

  const appointments = appointmentsQuery.docs.map(doc => {
    const data = doc.data()
    return {
      startsAt: data.startsAt.toDate(),
      endsAt: data.endsAt.toDate(),
    }
  })

  // Get breaks for the day
  const breaksQuery = await db.collection('breaks')
    .where('professionalId', '==', professionalId)
    .where('startsAt', '>=', startDate)
    .where('startsAt', '<=', endDate)
    .orderBy('startsAt', 'asc')
    .get()

  const breaks = breaksQuery.docs.map(doc => {
    const data = doc.data()
    return {
      startsAt: data.startsAt.toDate(),
      endsAt: data.endsAt.toDate(),
    }
  })

  // Get professional's services
  const services = professionalData.services || []
  if (services.length === 0) {
    return []
  }

  const minDuration = Math.min(...services.map((s: any) => s.durationMinutes))
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
    const professionalDoc = await db.collection('professionals').doc(id).get()
    if (!professionalDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Professional not found',
      })
    }
    const professionalData = professionalDoc.data()!

    const availability = await calculateAvailability(id, validDate)

    return res.status(200).json({
      success: true,
      data: {
        professional: {
          id: professionalData.id,
          name: professionalData.name,
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