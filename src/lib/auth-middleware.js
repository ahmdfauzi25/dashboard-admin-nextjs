import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * Middleware to protect dashboard routes
 * CRITICAL: Customer DILARANG KERAS akses dashboard (403 Forbidden)
 */
export async function dashboardAuthMiddleware(request) {
  try {
    // Try both cookie names for compatibility
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value

    // No token = not authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // CRITICAL: Customer/USER cannot access dashboard
    const role = decoded.role?.toUpperCase()
    if (role === 'CUSTOMER' || role === 'USER') {
      return NextResponse.json(
        {
          success: false,
          error: 'Customers are not allowed to access the admin dashboard'
        },
        { status: 403 }
      )
    }

    // Allow admin/reseller (case-insensitive)
    if (role !== 'ADMIN' && role !== 'RESELLER' && role !== 'MODERATOR') {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 403 }
      )
    }

    // Attach user to request (for later use in page/API)
    request.user = decoded

    return null // Continue to next middleware/route
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

/**
 * Middleware untuk API routes yang perlu autentikasi
 */
export async function apiAuthMiddleware(request, requiredRoles = null) {
  try {
    // Try both cookie names for compatibility
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value

    if (!token) {
      return {
        authenticated: false,
        error: 'No token provided',
        statusCode: 401
      }
    }

    const decoded = jwt.verify(token, JWT_SECRET)

    // Check role if required (case-insensitive)
    if (requiredRoles) {
      const userRole = decoded.role?.toUpperCase()
      const allowedRoles = requiredRoles.map(r => r.toUpperCase())
      if (!allowedRoles.includes(userRole)) {
        return {
          authenticated: false,
          error: 'Insufficient permissions',
          statusCode: 403,
          user: decoded
        }
      }
    }

    return {
      authenticated: true,
      user: decoded,
      statusCode: 200
    }
  } catch (error) {
    console.error('API Auth error:', error)
    return {
      authenticated: false,
      error: 'Invalid token',
      statusCode: 401
    }
  }
}

/**
 * Logout middleware - clear auth cookie
 */
export function logoutMiddleware(response) {
  response.cookies.delete('auth_token')
  return response
}
