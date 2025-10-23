import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { initializeFirebaseAdmin } from '../../_lib/firebase-admin'

export const config = { runtime: 'nodejs' as const }

// Initialize Firebase Admin SDK
initializeFirebaseAdmin()
const db = getFirestore()

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

    // Get appointment from Firestore
    const appointmentRef = db.collection('appointments').doc(id)
    const appointmentDoc = await appointmentRef.get()

    if (!appointmentDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      })
    }

    const appointmentData = appointmentDoc.data()!

    if (appointmentData.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Appointment is already cancelled',
      })
    }

    // Update appointment status
    const updatedAppointment = {
      ...appointmentData,
      status: 'CANCELLED',
      updatedAt: Timestamp.now(),
    }

    await appointmentRef.update(updatedAppointment)

    return res.status(200).json({
      success: true,
      data: {
        id: appointmentDoc.id,
        ...updatedAppointment,
      },
    })
  } catch (error) {
    console.error('cancel_appointment_error', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment',
    })
  }
}