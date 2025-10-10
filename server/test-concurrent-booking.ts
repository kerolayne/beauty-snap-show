import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConcurrentBooking() {
  console.log('🧪 Testing concurrent booking scenario...')

  // Get a professional and service for testing
  const professional = await prisma.professional.findFirst({
    include: { services: { take: 1 } }
  })

  if (!professional || professional.services.length === 0) {
    console.log('❌ No professional or service found. Please run seed first.')
    return
  }

  const service = professional.services[0]
  
  // Create a test user if it doesn't exist
  let user = await prisma.user.findFirst({ where: { email: 'test@example.com' } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+351 912 345 999',
      },
    })
  }

  // Set up appointment time (tomorrow at 10:00 UTC)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const endsAt = new Date(tomorrow.getTime() + service.durationMinutes * 60 * 1000)

  console.log(`📅 Testing appointment: ${tomorrow.toISOString()} - ${endsAt.toISOString()}`)

  // Simulate concurrent booking attempts
  const promises = [
    createAppointment('Attempt 1', user.id, professional.id, service.id, tomorrow),
    createAppointment('Attempt 2', user.id, professional.id, service.id, tomorrow),
    createAppointment('Attempt 3', user.id, professional.id, service.id, tomorrow),
  ]

  try {
    const results = await Promise.allSettled(promises)
    
    let successCount = 0
    let conflictCount = 0

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ ${result.value.attempt}: Success - Appointment ID: ${result.value.appointment.id}`)
        successCount++
      } else {
        console.log(`❌ Attempt ${index + 1}: Failed - ${result.reason}`)
        if (result.reason.includes('conflict') || result.reason.includes('exclusion')) {
          conflictCount++
        }
      }
    })

    console.log(`\n📊 Results:`)
    console.log(`- Successful bookings: ${successCount}`)
    console.log(`- Conflicts prevented: ${conflictCount}`)
    console.log(`- Expected: 1 success, 2 conflicts`)

    if (successCount === 1 && conflictCount === 2) {
      console.log('🎉 Test passed! Double-booking prevention is working correctly.')
    } else {
      console.log('⚠️  Test results unexpected. Check the exclusion constraint.')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    // Clean up test appointments
    await prisma.appointment.deleteMany({
      where: {
        userId: user.id,
        professionalId: professional.id,
        startsAt: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })
    console.log('🧹 Cleaned up test appointments')
  }
}

async function createAppointment(
  attempt: string,
  userId: string,
  professionalId: string,
  serviceId: string,
  startsAt: Date
) {
  try {
    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) throw new Error('Service not found')

    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000)

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        professionalId,
        serviceId,
        startsAt,
        endsAt,
        status: 'PENDING',
      },
    })

    return { attempt, appointment }
  } catch (error: any) {
    if (error.code === 'P0001' || error.message?.includes('exclusion constraint')) {
      throw new Error(`Time slot conflict detected`)
    }
    throw new Error(`Failed to create appointment: ${error.message}`)
  }
}

// Run the test
testConcurrentBooking()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
