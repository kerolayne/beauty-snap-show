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
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    return res.status(200).json({
      ok: true,
      db: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error('health_check_error', error)
    
    return res.status(503).json({
      ok: false,
      db: false,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: 'Database connection failed',
    })
  }
}

