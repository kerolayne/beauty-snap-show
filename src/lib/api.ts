import { z } from 'zod'
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import firebaseApp from './firebase'

// Get Firestore and Auth instances
const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)

// Validation schemas
const FirestoreTimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
})

// Helper to convert Firestore Timestamp to ISO string
const firestoreTimestampToISO = (timestamp: { seconds: number; nanoseconds: number }) => {
  return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toISOString()
}

const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  durationMinutes: z.number(),
  priceCents: z.number(),
  active: z.boolean(),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
})

const ProfessionalSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    durationMinutes: z.number(),
    priceCents: z.number(),
  })),
  workingHours: z.array(z.object({
    dayOfWeek: z.number(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
})

const AppointmentStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])

const AppointmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  professionalId: z.string(),
  serviceId: z.string(),
  startsAt: FirestoreTimestampSchema,
  endsAt: FirestoreTimestampSchema,
  status: AppointmentStatusSchema,
  notes: z.string().nullable(),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
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

// Type exports
export type Service = z.infer<typeof ServiceSchema>
export type Professional = z.infer<typeof ProfessionalSchema>
export type Appointment = z.infer<typeof AppointmentSchema>
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>
export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>
export type Availability = z.infer<typeof AvailabilitySchema>
export type LoginCredentials = {
  email: string
  password: string
}

// Convert Firestore document data to our schema types
const convertServiceDoc = (doc: any): Service => {
  const data = doc.data()
  return ServiceSchema.parse({
    id: doc.id,
    ...data,
  })
}

const convertProfessionalDoc = (doc: any): Professional => {
  const data = doc.data()
  return ProfessionalSchema.parse({
    id: doc.id,
    ...data,
  })
}

const convertAppointmentDoc = (doc: any): Appointment => {
  const data = doc.data()
  return AppointmentSchema.parse({
    id: doc.id,
    ...data,
  })
}

// Firestore API Client implementation
class FirestoreApiClient {
  async getServices(): Promise<Service[]> {
    const servicesRef = collection(db, 'services')
    const q = query(servicesRef, where('active', '==', true), orderBy('name'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(convertServiceDoc)
  }

  async getProfessionals(): Promise<Professional[]> {
    const professionalsRef = collection(db, 'professionals')
    const q = query(professionalsRef, orderBy('name'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(convertProfessionalDoc)
  }

  async getProfessional(id: string): Promise<Professional> {
    const docRef = doc(db, 'professionals', id)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) {
      throw new Error('Professional not found')
    }
    return convertProfessionalDoc(snapshot)
  }

  async getAppointments(userId?: string): Promise<Appointment[]> {
    const appointmentsRef = collection(db, 'appointments')
    let q
    
    if (userId) {
      q = query(appointmentsRef, where('userId', '==', userId), orderBy('startsAt', 'desc'))
    } else {
      q = query(appointmentsRef, orderBy('startsAt', 'desc'))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(convertAppointmentDoc)
  }

  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'user'>): Promise<Appointment> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('You must be logged in to create an appointment')
    }

    const appointmentData = {
      ...data,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      user: {
        id: user.uid,
        name: user.displayName || '',
        email: user.email || '',
      },
    }

    const docRef = await addDoc(collection(db, 'appointments'), appointmentData)
    const newDoc = await getDoc(docRef)
    return convertAppointmentDoc(newDoc)
  }

  getCurrentUser() {
    return auth.currentUser
  }

  async getAvailability(professionalId: string, date: string): Promise<Availability> {
    const response = await fetch(`/api/professionals/${professionalId}/availability?date=${date}`)
    if (!response.ok) {
      throw new Error('Failed to get availability')
    }
    const data = await response.json()
    return {
      professional: data.data.professional,
      date: data.data.date,
      slots: data.data.slots,
    }
  }

  async cancelAppointment(id: string): Promise<Appointment> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('You must be logged in to cancel an appointment')
    }

    const appointmentRef = doc(db, 'appointments', id)
    const appointmentSnap = await getDoc(appointmentRef)
    
    if (!appointmentSnap.exists()) {
      throw new Error('Appointment not found')
    }

    const appointment = convertAppointmentDoc(appointmentSnap)
    if (appointment.userId !== user.uid) {
      throw new Error('You can only cancel your own appointments')
    }

    await updateDoc(appointmentRef, {
      status: 'CANCELLED' as AppointmentStatus,
      updatedAt: Timestamp.now(),
    })

    const updatedDoc = await getDoc(appointmentRef)
    return convertAppointmentDoc(updatedDoc)
  }
}

// Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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

// Auth schemas
const SignUpRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['client', 'professional'])
})

const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['client', 'professional']),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema
})

const ValidationErrorSchema = z.object({
  type: z.literal('validation'),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string()
  }))
})

const EmailTakenErrorSchema = z.object({
  type: z.literal('email_taken'),
  message: z.string()
})

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

  async login(credentials: { email: string; password: string }): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // for cookies/sessions
    })

    const responseData = await response.json()

    if (!response.ok) {
      // Handle validation errors
      if (response.status === 400) {
        const validationError = ValidationErrorSchema.parse(responseData)
        throw new Error(validationError.issues.map(issue => issue.message).join(', '))
      }
      
      // Handle authentication errors
      if (response.status === 401) {
        throw new Error(responseData.message || 'Invalid credentials')
      }
      
      // Handle other errors
      throw new Error(responseData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    // Store auth token if provided
    if (responseData.token) {
      localStorage.setItem('authToken', responseData.token)
    }

    return UserResponseSchema.parse(responseData)
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.warn('Logout request failed:', error)
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken')
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken')
    return !!token
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export the class for testing
export { ApiClient }
