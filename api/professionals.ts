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

