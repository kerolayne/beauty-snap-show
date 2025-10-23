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
    const servicesSnapshot = await db.collection('services')
      .where('active', '==', true)
      .orderBy('name')
      .get()

    const services = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return res.status(200).json({
      success: true,
      data: services,
    })
  } catch (error) {
    console.error('services_error', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
    })
  }
}

