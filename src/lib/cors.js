import { NextResponse } from 'next/server'

/**
 * Helper function to add CORS headers to response
 * @param {NextResponse} response - The NextResponse object
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - Response with CORS headers
 */
export function addCorsHeaders(response, request) {
  const origin = request?.headers?.get('origin')
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

/**
 * Helper function to create OPTIONS response for CORS preflight
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - OPTIONS response with CORS headers
 */
export function createOptionsResponse(request) {
  const origin = request?.headers?.get('origin')
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

