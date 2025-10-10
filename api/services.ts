import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma'

export const config = { runtime: 'nodejs' as const }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    })

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

