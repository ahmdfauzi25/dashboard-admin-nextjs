import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// ============================================
// VERIFY OTP ENDPOINT
// ============================================
export async function POST(request) {
  try {
    const { user_id, otp_code } = await request.json()

    if (!user_id || !otp_code) {
      return NextResponse.json(
        { success: false, error: 'User ID and OTP code required' },
        { status: 400 }
      )
    }

    // 1. CHECK IF USER EXISTS
    const users = await query(
      `SELECT id, email, phone, is_verified FROM users WHERE id = ?`,
      [user_id]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0]

    // 2. CHECK ALREADY VERIFIED
    if (user.is_verified) {
      return NextResponse.json(
        { success: false, error: 'User already verified' },
        { status: 400 }
      )
    }

    // 3. FIND VALID OTP
    const otps = await query(
      `SELECT id, is_used, is_expired, attempts, max_attempts, expires_at 
       FROM otps 
       WHERE user_id = ? AND otp_code = ? AND is_used = FALSE AND is_expired = FALSE`,
      [user_id, otp_code]
    )

    if (otps.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }

    const otp = otps[0]

    // 4. CHECK EXPIRATION TIME
    if (new Date(otp.expires_at) < new Date()) {
      await query(
        `UPDATE otps SET is_expired = TRUE WHERE id = ?`,
        [otp.id]
      )
      return NextResponse.json(
        { success: false, error: 'OTP has expired' },
        { status: 401 }
      )
    }

    // 5. CHECK MAX ATTEMPTS
    if (otp.attempts >= otp.max_attempts) {
      await query(
        `UPDATE otps SET is_expired = TRUE WHERE id = ?`,
        [otp.id]
      )
      return NextResponse.json(
        { success: false, error: 'Maximum verification attempts exceeded' },
        { status: 429 }
      )
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

    return NextResponse.json({
      success: true,
      message: 'Email verification successful',
      user_id: user_id
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}

// Increment OTP attempt
export async function PUT(request) {
  try {
    const { user_id, otp_code } = await request.json()

    if (!user_id || !otp_code) {
      return NextResponse.json(
        { success: false, error: 'User ID and OTP code required' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE otps SET attempts = attempts + 1 
       WHERE user_id = ? AND otp_code = ? AND is_used = FALSE`,
      [user_id, otp_code]
    )

    return NextResponse.json({
      success: true,
      message: 'Attempt recorded'
    })
  } catch (error) {
    console.error('Attempt recording error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record attempt' },
      { status: 500 }
    )
  }
}
