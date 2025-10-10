import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'

// Validation schema for signup
const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[0-9]/, 'Password must include a number'),
})

// Response schemas
const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string().datetime(),
})

type UserResponse = z.infer<typeof UserResponseSchema>

export async function authRoutes(app: FastifyInstance) {
  const prisma = new PrismaClient()

  // POST /api/auth/signup
  app.post('/api/auth/signup', {
    schema: {
      body: SignUpSchema,
      response: {
        201: UserResponseSchema,
        400: z.object({
          code: z.literal('VALIDATION_ERROR'),
          issues: z.array(z.object({
            path: z.array(z.union([z.string(), z.number()])),
            message: z.string(),
            code: z.string(),
          })),
        }),
        409: z.object({
          code: z.literal('EMAIL_TAKEN'),
          message: z.string(),
        }),
        500: z.object({
          code: z.literal('INTERNAL_ERROR'),
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      // Validate request body
      const validationResult = SignUpSchema.safeParse(request.body)
      if (!validationResult.success) {
        app.log.warn({ validationErrors: validationResult.error.issues }, 'Signup validation failed')
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          issues: validationResult.error.issues,
        })
      }

      const { name, email, password } = validationResult.data

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase()
      const normalizedName = name.trim()

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })

      if (existingUser) {
        app.log.warn({ email: normalizedEmail }, 'Signup attempt with existing email')
        return reply.code(409).send({
          code: 'EMAIL_TAKEN',
          message: 'Email already registered',
        })
      }

      // Hash password
      const passwordHash = await hash(password)

      // Create user
      const user = await prisma.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })

      app.log.info({ userId: user.id, email: user.email }, 'User created successfully')

      return reply.code(201).send(user)

    } catch (error) {
      app.log.error(error, 'Unexpected error during signup')
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      })
    }
  })

  // Health check for auth routes
  app.get('/api/auth/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Graceful cleanup
  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
}
