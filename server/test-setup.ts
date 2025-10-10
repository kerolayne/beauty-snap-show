import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function testSetup() {
  console.log('🧪 Testing database setup...')

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')

    // Test if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `
    console.log('✅ Tables found:', (tables as any[]).map(t => t.table_name))

    // Test if data exists
    const serviceCount = await prisma.service.count()
    const professionalCount = await prisma.professional.count()
    const userCount = await prisma.user.count()

    console.log('📊 Data counts:')
    console.log(`- Services: ${serviceCount}`)
    console.log(`- Professionals: ${professionalCount}`)
    console.log(`- Users: ${userCount}`)

    if (serviceCount === 0 || professionalCount === 0) {
      console.log('⚠️  No sample data found. Run: npm run db:seed')
    } else {
      console.log('✅ Sample data found')
    }

    // Test exclusion constraint
    const constraintExists = await prisma.$queryRaw`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE constraint_name = 'appointment_no_overlap'
    `

    if ((constraintExists as any[]).length > 0) {
      console.log('✅ Exclusion constraint found')
    } else {
      console.log('⚠️  Exclusion constraint not found. Run the migration manually.')
    }

    console.log('🎉 Database setup test completed!')

  } catch (error) {
    console.error('❌ Database setup test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testSetup()
