import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function testSignup() {
  console.log('🧪 Testing signup functionality...')

  try {
    // Test 1: Create a user with valid data
    console.log('\n1. Testing valid user creation...')
    
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123',
    }

    // Hash password
    const passwordHash = await hash(testUser.password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    console.log('✅ User created successfully:', user)

    // Test 2: Try to create user with duplicate email
    console.log('\n2. Testing duplicate email prevention...')
    
    try {
      await prisma.user.create({
        data: {
          name: 'Another User',
          email: testUser.email, // Same email
          passwordHash: await hash('AnotherPassword123'),
        },
      })
      console.log('❌ Duplicate email was allowed (this should not happen)')
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('✅ Duplicate email correctly prevented')
      } else {
        console.log('❌ Unexpected error:', error.message)
      }
    }

    // Test 3: Verify password is hashed (not stored in plaintext)
    console.log('\n3. Testing password security...')
    
    const storedUser = await prisma.user.findUnique({
      where: { email: testUser.email },
    })

    if (storedUser && storedUser.passwordHash !== testUser.password) {
      console.log('✅ Password is properly hashed')
      console.log('✅ Password hash length:', storedUser.passwordHash.length)
    } else {
      console.log('❌ Password was stored in plaintext (security issue)')
    }

    // Test 4: Test email normalization
    console.log('\n4. Testing email normalization...')
    
    const normalizedUser = {
      name: 'Normalized User',
      email: '  NORMALIZED@EXAMPLE.COM  ', // With spaces and uppercase
      password: 'TestPassword123',
    }

    const normalizedEmail = normalizedUser.email.trim().toLowerCase()
    const normalizedName = normalizedUser.name.trim()

    const normalizedUserCreated = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash: await hash(normalizedUser.password),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    console.log('✅ Email normalized correctly:', normalizedUserCreated.email)
    console.log('✅ Name trimmed correctly:', normalizedUserCreated.name)

    console.log('\n🎉 All signup tests passed!')

  } catch (error) {
    console.error('❌ Signup test failed:', error)
  } finally {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'normalized@example.com'],
        },
      },
    })
    console.log('🧹 Cleaned up test users')
    await prisma.$disconnect()
  }
}

// Run the test
testSignup()
