import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// ============================================
// VERIFY OTP ENDPOINT
// ============================================
export async function POST(request) {
  try {
    const origin = request.headers.get('origin')
    const { user_id, otp_code } = await request.json()

    if (!user_id || !otp_code) {
      const response = NextResponse.json(
        { success: false, error: 'User ID and OTP code required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // 1. CHECK IF USER EXISTS
    const users = await query(
      `SELECT id, email, phone, is_verified FROM users WHERE id = ?`,
      [user_id]
    )

    if (users.length === 0) {
      const response = NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    const user = users[0]

    // 2. CHECK ALREADY VERIFIED
    if (user.is_verified) {
      const response = NextResponse.json(
        { success: false, error: 'User already verified' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // 3. FIND VALID OTP
    const otps = await query(
      `SELECT id, is_used, is_expired, attempts, max_attempts, expires_at 
       FROM otps 
       WHERE user_id = ? AND otp_code = ? AND is_used = FALSE AND is_expired = FALSE`,
      [user_id, otp_code]
    )

    if (otps.length === 0) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 401 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    const otp = otps[0]

    // 4. CHECK EXPIRATION TIME
    if (new Date(otp.expires_at) < new Date()) {
      await query(
        `UPDATE otps SET is_expired = TRUE WHERE id = ?`,
        [otp.id]
      )
      const response = NextResponse.json(
        { success: false, error: 'OTP has expired' },
        { status: 401 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // 5. CHECK MAX ATTEMPTS
    if (otp.attempts >= otp.max_attempts) {
      await query(
        `UPDATE otps SET is_expired = TRUE WHERE id = ?`,
        [otp.id]
      )
      const response = NextResponse.json(
        { success: false, error: 'Maximum verification attempts exceeded' },
        { status: 429 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // 6. MARK OTP AS USED
    await query(
      `UPDATE otps SET is_used = TRUE, verified_at = NOW() WHERE id = ?`,
      [otp.id]
    )

    // 7. MARK USER AS VERIFIED
    await query(
      `UPDATE users SET is_verified = TRUE WHERE id = ?`,
      [user_id]
    )

    // 8. LOG SUCCESSFUL VERIFICATION
    await query(
      `INSERT INTO otp_logs (user_id, otp_code, channel, status) 
       VALUES (?, ?, 'system', 'verified')`,
      [user_id, otp_code]
    )
    
    const response = NextResponse.json({
      success: true,
      message: 'Email verification successful',
      user_id: user_id
    })
    
    // Add CORS headers with specific origin (required for credentials)
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error) {
    console.error('OTP verification error:', error)
    const origin = request.headers.get('origin')
    const errorResponse = NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', origin || '*')
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    return errorResponse
  }
}

// Increment OTP attempt
export async function PUT(request) {
  try {
    const origin = request.headers.get('origin')
    const { user_id, otp_code } = await request.json()

    if (!user_id || !otp_code) {
      const response = NextResponse.json(
        { success: false, error: 'User ID and OTP code required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    await query(
      `UPDATE otps SET attempts = attempts + 1 
       WHERE user_id = ? AND otp_code = ? AND is_used = FALSE`,
      [user_id, otp_code]
    )

    const response = NextResponse.json({
      success: true,
      message: 'Attempt recorded'
    })
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
  } catch (error) {
    console.error('Attempt recording error:', error)
    const origin = request.headers.get('origin')
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to record attempt' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', origin || '*')
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    return errorResponse
  }
}
