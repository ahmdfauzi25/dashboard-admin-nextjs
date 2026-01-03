import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    // Log request for debugging
    console.log('Register API called')
    
    const body = await request.json()
    const { email, name, password, role: rawRole } = body
    const role = (rawRole || 'USER').toUpperCase()
    
    console.log('Register data received:', { email, name, role })

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    // Trim whitespace
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate name length
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [trimmedEmail])
    const existingUser = existingUsers.length > 0 ? existingUsers[0] : null

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await hashPassword(password)

    // Create user
    console.log('Creating user in database...')
    const result = await query(
      'INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)',
      [trimmedEmail, trimmedName, hashedPassword, role]
    )
    const userId = result.insertId
    
    // Fetch the created user to match the previous Prisma behavior
    const users = await query('SELECT id, email, name, role, createdAt, updatedAt FROM users WHERE id = ?', [userId])
    const user = users.length > 0 ? users[0] : null

    if (!user) {
      console.error('Failed to retrieve created user.')
      return NextResponse.json(
        { error: 'Registration successful, but failed to retrieve user data.' },
        { status: 500 }
      )
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    // Generate JWT token
    console.log('Generating JWT token...')
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
    
    console.log('User created successfully:', { id: user.id, email: user.email })

    // Create response with token
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: userWithoutPassword,
        token: token
      },
      { status: 201 }
    )

    // Set HTTP-only cookie for token (more secure than localStorage)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // Handle MySQL duplicate entry error (ER_DUP_ENTRY)
    if (error && error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Handle MySQL connection or general database errors
    if (error && (String(error.code || '').startsWith('ER_') || error.message?.includes('connect') || error.message?.includes('Can\'t reach database server'))) {
      const dbErrorMessage = error.message || 'Unknown database error.'
      return NextResponse.json(
        { error: `Database error: ${dbErrorMessage}. Please check your .env file and ensure MySQL is running.` },
        { status: 500 }
      )
    }

    // Handle JWT errors
    if (error && (error.message?.includes('JWT') || error.message?.includes('secret'))) {
      return NextResponse.json(
        { error: 'JWT configuration error. Please check JWT_SECRET in .env file.' },
        { status: 500 }
      )
    }

    // Generic error handling
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error?.message || 'Internal server error')
      : 'Internal server error. Please check server logs for details.'

    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          code: error?.code,
          details: error?.stack 
        })
      },
      { status: 500 }
    )
  }
}

