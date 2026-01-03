import { NextResponse } from 'next/server'
import { verifyToken } from './auth'

/**
 * Middleware to verify JWT token from cookie or Authorization header
 * @param {Request} request - Next.js request object
 * @returns {object|null} Decoded token or null if invalid
 */
export function getAuthToken(request) {
  // Try to get token from cookie first
  const tokenFromCookie = request.cookies.get('token')?.value

  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null

  const token = tokenFromCookie || tokenFromHeader

  if (!token) {
    return null
  }

  return verifyToken(token)
}

/**
 * Middleware to protect API routes
 * @param {Request} request - Next.js request object
 * @returns {NextResponse|null} Error response if unauthorized, null if authorized
 */
export function requireAuth(request) {
  const decoded = getAuthToken(request)

  if (!decoded) {
    return NextResponse.json(
      { error: 'Unauthorized - Please login first' },
      { status: 401 }
    )
  }

  return null
}

/**
 * Middleware to check if user has required role
 * @param {Request} request - Next.js request object
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {NextResponse|null} Error response if unauthorized, null if authorized
 */
export function requireRole(request, requiredRoles) {
  const decoded = getAuthToken(request)

  if (!decoded) {
    return NextResponse.json(
      { error: 'Unauthorized - Please login first' },
      { status: 401 }
    )
  }

  const userRole = decoded.role
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  if (!roles.includes(userRole)) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    )
  }

  return null
}

