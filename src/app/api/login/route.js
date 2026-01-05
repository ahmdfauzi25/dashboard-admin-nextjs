import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Trim username
    const trimmedUsername = username.trim()

    // Find user by email or name (username can be either)
    const users = await query(
      'SELECT id, email, name, password, role, createdAt, updatedAt FROM users WHERE email = ? OR name = ?',
      [trimmedUsername.toLowerCase(), trimmedUsername]
    )
    const user = users.length > 0 ? users[0] : null

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })

    // Create response with token
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: userWithoutPassword,
        token: token
      },
      { status: 200 }
    )

    // Set HTTP-only cookie for token (more secure than localStorage)
    // Set both cookie names for compatibility
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    
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

