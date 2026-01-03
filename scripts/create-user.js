/**
 * Script to create a test user in the database
 * Usage: node scripts/create-user.js
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUser() {
  try {
    const email = process.argv[2] || 'admin@example.com'
    const name = process.argv[3] || 'Admin User'
    const password = process.argv[4] || 'admin123'
    const role = process.argv[5] || 'ADMIN'

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role.toUpperCase()
      }
    })

    console.log('✅ User created successfully!')
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Role:', user.role)
    console.log('ID:', user.id)
    console.log('\nYou can now login with:')
    console.log('Username/Email:', email)
    console.log('Password:', password)
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Error: User with this email already exists')
    } else {
      console.error('❌ Error creating user:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createUser()

