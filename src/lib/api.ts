import { z } from 'zod'

// API Configuration - use relative paths for Vercel serverless functions
const API_BASE_URL = ''

// Validation schemas
const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  durationMinutes: z.number(),
  priceCents: z.number(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const ProfessionalSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    durationMinutes: z.number(),
    priceCents: z.number(),
  })),
})

const AppointmentStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])

// Auth schemas
const SignUpRequestSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string().datetime(),
})

const ValidationErrorSchema = z.object({
  code: z.literal('VALIDATION_ERROR'),
  issues: z.array(z.object({
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
    code: z.string(),
  })),
})

const EmailTakenErrorSchema = z.object({
  code: z.literal('EMAIL_TAKEN'),
  message: z.string(),
})

const AppointmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  professionalId: z.string(),
  serviceId: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: AppointmentStatusSchema,
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  professional: z.object({
    id: z.string(),
    name: z.string(),
  }),
  service: z.object({
    id: z.string(),
    name: z.string(),
    durationMinutes: z.number(),
  }),
})

const AvailabilitySlotSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  available: z.boolean(),
})

const AvailabilitySchema = z.object({
  professional: z.object({
    id: z.string(),
    name: z.string(),
  }),
  date: z.string(),
  slots: z.array(AvailabilitySlotSchema),
})

// API Response schemas
const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
})

// Types
export type Service = z.infer<typeof ServiceSchema>
export type Professional = z.infer<typeof ProfessionalSchema>
export type Appointment = z.infer<typeof AppointmentSchema>
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>
export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>
export type Availability = z.infer<typeof AvailabilitySchema>

// Auth types
export type SignUpRequest = z.infer<typeof SignUpRequestSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type ValidationError = z.infer<typeof ValidationErrorSchema>
export type EmailTakenError = z.infer<typeof EmailTakenErrorSchema>

// Utility functions for date handling
export function toUTCString(date: Date): string {
  return date.toISOString()
}

export function fromUTCString(dateString: string): Date {
  return new Date(dateString)
}

export function toLisbonTime(date: Date): Date {
  // Convert UTC to Europe/Lisbon timezone
  return new Date(date.toLocaleString("en-US", {timeZone: "Europe/Lisbon"}))
}

export function formatTime(date: Date, locale = 'pt-PT'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Lisbon',
  })
}

export function formatDate(date: Date, locale = 'pt-PT'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Lisbon',
  })
}

export function formatDateTime(date: Date, locale = 'pt-PT'): string {
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Lisbon',
  })
}

// API Client class
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const validatedData = ApiResponseSchema.parse(data)
    
    if (!validatedData.success) {
      throw new Error(validatedData.error || 'API request failed')
    }

    return validatedData.data
  }

  // Services API
  async getServices(): Promise<Service[]> {
    const data = await this.request('/api/services')
    return z.array(ServiceSchema).parse(data)
  }

  // Professionals API
  async getProfessionals(): Promise<Professional[]> {
    const data = await this.request('/api/professionals')
    return z.array(ProfessionalSchema).parse(data)
  }

  // Availability API
  async getAvailability(
    professionalId: string,
    date: string
  ): Promise<Availability> {
    const data = await this.request(
      `/api/professionals/${professionalId}/availability?date=${date}`
    )
    return AvailabilitySchema.parse(data)
  }

  // Appointments API
  async createAppointment(params: {
    userId: string
    professionalId: string
    serviceId: string
    startsAtISO: string
  }): Promise<Appointment> {
    const data = await this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    return AppointmentSchema.parse(data)
  }

  async cancelAppointment(appointmentId: string): Promise<Appointment> {
    const data = await this.request(`/api/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
    })
    return AppointmentSchema.parse(data)
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health')
  }

  // Auth API
  async signup(data: SignUpRequest): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const responseData = await response.json()

    if (!response.ok) {
      // Handle validation errors
      if (response.status === 400) {
        const validationError = ValidationErrorSchema.parse(responseData)
        throw new Error(validationError.issues.map(issue => issue.message).join(', '))
      }
      
      // Handle email taken error
      if (response.status === 409) {
        const emailError = EmailTakenErrorSchema.parse(responseData)
        throw new Error(emailError.message)
      }
      
      // Handle other errors
      throw new Error(responseData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return UserResponseSchema.parse(responseData)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export the class for testing
export { ApiClient }
