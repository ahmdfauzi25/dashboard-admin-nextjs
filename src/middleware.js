import { NextResponse } from 'next/server'

export function middleware(request) {
  // Don't add CORS headers here - let individual route handlers manage CORS
  // This prevents duplicate CORS headers which cause errors
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}

