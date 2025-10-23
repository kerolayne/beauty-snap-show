import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeFirebaseAdmin } from './_lib/firebase-admin'

export const config = { runtime: 'nodejs' as const }

// Initialize Firebase Admin SDK
initializeFirebaseAdmin()
const db = getFirestore()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    // Get all professionals ordered by name
    const professionalsSnapshot = await db.collection('professionals')
      .orderBy('name')
      .get()

    // Get all active services
    const servicesSnapshot = await db.collection('services')
      .where('active', '==', true)
      .get()

    // Create a map of services by professional
    const servicesByProfessional = new Map()
    servicesSnapshot.docs.forEach(serviceDoc => {
      const service = { id: serviceDoc.id, ...serviceDoc.data() }
      if (service.professionalIds) {
        service.professionalIds.forEach((profId: string) => {
          if (!servicesByProfessional.has(profId)) {
            servicesByProfessional.set(profId, [])
          }
          servicesByProfessional.get(profId).push({
            id: service.id,
            name: service.name,
            durationMinutes: service.durationMinutes,
            priceCents: service.priceCents,
          })
        })
      }
    })

    // Map professionals with their services
    const professionals = professionalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      services: servicesByProfessional.get(doc.id) || []
    }))

    return res.status(200).json({
      success: true,
      data: professionals,
    })
  } catch (error) {
    console.error('professionals_error', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch professionals',
    })
  }
}

