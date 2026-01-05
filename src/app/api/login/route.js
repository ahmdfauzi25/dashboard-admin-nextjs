import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { verifyPassword, generateToken } from '@/lib/auth'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password } = body

    const origin = request.headers.get('origin')
    
    // Validate input
    if (!username || !password) {
      const response = NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Trim username
    const trimmedUsername = username.trim()

    // Find user by email or name (username can be either)
    // Try password_hash first (new schema), fallback to password (old schema)
    const users = await query(
      'SELECT id, email, name, password_hash, password, role, is_verified, is_active, createdAt, updatedAt FROM users WHERE email = ? OR name = ?',
      [trimmedUsername.toLowerCase(), trimmedUsername]
    )
    const user = users.length > 0 ? users[0] : null

    if (!user) {
      const response = NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Get password hash (prefer password_hash, fallback to password for backward compatibility)
    const passwordHash = user.password_hash || user.password
    
    if (!passwordHash) {
      const response = NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, passwordHash)

    if (!isPasswordValid) {
      const response = NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Check if user is verified (for customer registration)
    if (user.is_verified === false || user.is_verified === 0) {
      const response = NextResponse.json(
        { error: 'Akun Anda belum diverifikasi. Silakan verifikasi email/WhatsApp terlebih dahulu.' },
        { status: 403 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Check if user is active
    if (user.is_active === false || user.is_active === 0) {
      const response = NextResponse.json(
        { error: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.' },
        { status: 403 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Check if user role is CUSTOMER (only customers can login to top-up website)
    const userRole = (user.role || '').toUpperCase()
    if (userRole !== 'CUSTOMER') {
      const response = NextResponse.json(
        { error: 'Akses ditolak. Hanya customer yang dapat login ke website top-up.' },
        { status: 403 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Return user data (without password fields)
    const { password: _, password_hash: __, ...userWithoutPassword } = user

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

    // Set CORS headers with specific origin (required for credentials)
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

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
    
    const origin = request.headers.get('origin')
    
    // Handle MySQL connection or general database errors
    if (error && (String(error.code || '').startsWith('ER_') || error.message?.includes('connect') || error.message?.includes('Can\'t reach database server'))) {
      const dbErrorMessage = error.message || 'Unknown database error.'
      const response = NextResponse.json(
        { error: `Database error: ${dbErrorMessage}. Please check your .env file and ensure MySQL is running.` },
        { status: 500 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Handle JWT errors
    if (error && (error.message?.includes('JWT') || error.message?.includes('secret'))) {
      const response = NextResponse.json(
        { error: 'JWT configuration error. Please check JWT_SECRET in .env file.' },
        { status: 500 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Generic error handling
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error?.message || 'Internal server error')
      : 'Internal server error. Please check server logs for details.'

    const response = NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          code: error?.code,
          details: error?.stack 
        })
      },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
  }
}

