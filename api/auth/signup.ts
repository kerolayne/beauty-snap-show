import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { z } from 'zod'
import { hash } from 'argon2'

export const config = { runtime: 'nodejs' as const }

const SignUpSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string()
    .min(8).max(128)
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number'),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS not needed in same-origin; keep minimal preflight just in case
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'content-type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    // Parse request body
    const body = req.body ?? (typeof req.body === 'string' ? JSON.parse(req.body) : {})
    const parsed = SignUpSchema.safeParse(body)
    
    if (!parsed.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues,
      })
    }

    const { name, email, password } = parsed.data
    const normEmail = email.trim().toLowerCase()
    const normName = name.trim()

    // Check if user already exists
    const exists = await prisma.user.findUnique({
      where: { email: normEmail },
    })
    
    if (exists) {
      return res.status(409).json({
        code: 'EMAIL_TAKEN',
        message: 'Email already registered',
      })
    }

    // Hash password and create user
    const passwordHash = await hash(password)
    const user = await prisma.user.create({
      data: {
        name: normName,
        email: normEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return res.status(201).json(user)

  } catch (err: any) {
    console.error('signup_error', err)
    
    // Handle Prisma unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({
        code: 'EMAIL_TAKEN',
        message: 'Email already registered',
      })
    }
    
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}

