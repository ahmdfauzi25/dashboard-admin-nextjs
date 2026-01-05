import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function POST(request) {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (token) {
      // Log logout time in login history
      // Note: We're not tracking which login_id this is, but in production
      // you'd want to update the last login record with logout time
      console.log('User logged out successfully')
    }

    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the auth cookie
    response.cookies.delete('auth_token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}

// GET - Redirect to login
export async function GET(request) {
  const response = NextResponse.redirect(new URL('/auth/login', request.url))
  response.cookies.delete('auth_token')
  return response
}
