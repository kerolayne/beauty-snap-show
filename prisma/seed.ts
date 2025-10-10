import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Haircut & Styling',
        description: 'Professional haircut with styling',
        durationMinutes: 45,
        priceCents: 3500, // €35.00
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Manicure',
        description: 'Complete nail care and polish',
        durationMinutes: 60,
        priceCents: 2500, // €25.00
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Facial Treatment',
        description: 'Deep cleansing and moisturizing facial',
        durationMinutes: 90,
        priceCents: 6500, // €65.00
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Eyebrow Shaping',
        description: 'Professional eyebrow shaping and tinting',
        durationMinutes: 30,
        priceCents: 1800, // €18.00
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Massage Therapy',
        description: 'Relaxing full body massage',
        durationMinutes: 75,
        priceCents: 5500, // €55.00
        active: true,
      },
    }),
  ])

  console.log('✅ Created services:', services.length)

  // Create professionals
  const professionals = await Promise.all([
    prisma.professional.create({
      data: {
        name: 'Maria Silva',
        email: 'maria@beauty.com',
        phone: '+351 912 345 678',
        bio: 'Experienced hairstylist with 10+ years in the industry',
        avatarUrl: '/avatars/maria.jpg',
      },
    }),
    prisma.professional.create({
      data: {
        name: 'Ana Costa',
        email: 'ana@beauty.com',
        phone: '+351 912 345 679',
        bio: 'Specialized in nail art and beauty treatments',
        avatarUrl: '/avatars/ana.jpg',
      },
    }),
    prisma.professional.create({
      data: {
        name: 'João Santos',
        email: 'joao@beauty.com',
        phone: '+351 912 345 680',
        bio: 'Certified massage therapist and wellness expert',
        avatarUrl: '/avatars/joao.jpg',
      },
    }),
  ])

  console.log('✅ Created professionals:', professionals.length)

  // Link services to professionals
  const serviceConnections = [
    // Maria offers haircut, manicure, facial, and eyebrow services
    { professionalId: professionals[0].id, serviceId: services[0].id },
    { professionalId: professionals[0].id, serviceId: services[1].id },
    { professionalId: professionals[0].id, serviceId: services[2].id },
    { professionalId: professionals[0].id, serviceId: services[3].id },
    
    // Ana offers manicure, facial, and eyebrow services
    { professionalId: professionals[1].id, serviceId: services[1].id },
    { professionalId: professionals[1].id, serviceId: services[2].id },
    { professionalId: professionals[1].id, serviceId: services[3].id },
    
    // João offers massage therapy
    { professionalId: professionals[2].id, serviceId: services[4].id },
  ]

  await Promise.all(
    serviceConnections.map(conn =>
      prisma.professional.update({
        where: { id: conn.professionalId },
        data: {
          services: {
            connect: { id: conn.serviceId }
          }
        }
      })
    )
  )

  console.log('✅ Linked services to professionals')

  // Create working hours (Monday to Saturday, 9:00-18:00 UTC)
  // Note: Portugal is UTC+0 in winter, UTC+1 in summer
  const workingHours = []
  for (const professional of professionals) {
    for (let weekday = 1; weekday <= 6; weekday++) { // Monday to Saturday
      workingHours.push({
        professionalId: professional.id,
        weekday,
        startMinutes: 9 * 60, // 09:00
        endMinutes: 18 * 60,  // 18:00
      })
    }
  }

  await prisma.workingHour.createMany({
    data: workingHours,
  })

  console.log('✅ Created working hours')

  // Create some sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Sofia Oliveira',
        email: 'sofia@example.com',
        phone: '+351 912 345 681',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carlos Ferreira',
        email: 'carlos@example.com',
        phone: '+351 912 345 682',
      },
    }),
  ])

  console.log('✅ Created sample users')

  // Create some sample breaks
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(12, 0, 0, 0) // 12:00 UTC

  const breakEnd = new Date(tomorrow)
  breakEnd.setHours(13, 0, 0, 0) // 13:00 UTC

  await prisma.break.create({
    data: {
      professionalId: professionals[0].id,
      startsAt: tomorrow,
      endsAt: breakEnd,
      reason: 'Lunch break',
    },
  })

  console.log('✅ Created sample breaks')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
