import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../_lib/prisma.js'

export const config = { runtime: 'nodejs' as const }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'content-type')
    return res.status(204).end()
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        professional: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, durationMinutes: true } },
      },
    })

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      })
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Appointment is already cancelled',
      })
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

    return res.status(200).json({
      success: true,
      data: updatedAppointment,
    })
  } catch (error) {
    console.error('cancel_appointment_error', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment',
    })
  }
}

