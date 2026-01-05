import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { getAuthToken } from '@/lib/middleware'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function GET(request) {
  try {
    // Get authenticated user from token
    const decoded = getAuthToken(request)

    const origin = request.headers.get('origin')
    
    if (!decoded) {
      const response = NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Get user from database (include avatar)
    const users = await query(
      'SELECT id, email, name, role, avatar, createdAt, updatedAt FROM users WHERE id = ?',
      [decoded.id]
    )
    const user = users.length > 0 ? users[0] : null

    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // Convert avatar buffer to base64 if it exists
    if (user.avatar && Buffer.isBuffer(user.avatar)) {
      user.avatarBase64 = user.avatar.toString('base64')
      delete user.avatar // Remove the buffer to reduce response size
    } else {
      user.avatarBase64 = null
    }

    const response = NextResponse.json(
      {
        success: true,
        user: user
      },
      { status: 200 }
    )
    
    // Set CORS headers with specific origin (required for credentials)
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error) {
    console.error('Get user error:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    
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

