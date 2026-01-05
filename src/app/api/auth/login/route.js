import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query } from '@/lib/mysql'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // 1. VALIDATION
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      )
    }

    // 2. FIND USER
    const users = await query(
      `SELECT id, name, email, role, password_hash, is_verified, is_active FROM users WHERE email = ?`,
      [email]
    )

    if (users.length === 0) {
      // Log failed login attempt
      await query(
        `INSERT INTO login_history (ip_address, user_agent, login_status) 
         VALUES (?, ?, 'failed')`,
        [request.headers.get('x-forwarded-for') || 'unknown', request.headers.get('user-agent') || 'unknown']
      )

      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // 3. CHECK IF USER IS VERIFIED
    if (!user.is_verified) {
      await query(
        `INSERT INTO login_history (user_id, ip_address, login_status) 
         VALUES (?, ?, ?)`,
        [user.id, request.headers.get('x-forwarded-for') || 'unknown', 'blocked']
      )

      return NextResponse.json(
        { success: false, error: 'Please verify your email first' },
        { status: 403 }
      )
    }

    // 4. CHECK IF ACCOUNT IS ACTIVE
    if (!user.is_active) {
      await query(
        `INSERT INTO login_history (user_id, ip_address, login_status) 
         VALUES (?, ?, ?)`,
        [user.id, request.headers.get('x-forwarded-for') || 'unknown', 'blocked']
      )

      return NextResponse.json(
        { success: false, error: 'Account is inactive' },
        { status: 403 }
      )
    }

    // 5. =====================================================
    // CRITICAL: CUSTOMER CANNOT ACCESS ADMIN PANEL
    // =====================================================
    // Note: Login itself is allowed, but dashboard access will be blocked by middleware
    // This is the first check. Additional check happens in middleware.

    // 6. VERIFY PASSWORD
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      await query(
        `INSERT INTO login_history (user_id, ip_address, login_status) 
         VALUES (?, ?, ?)`,
        [user.id, request.headers.get('x-forwarded-for') || 'unknown', 'failed']
      )

      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 7. GENERATE JWT TOKEN
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role // CRITICAL: Include role in token for middleware validation
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // 8. UPDATE LAST LOGIN
    await query(
      `UPDATE users SET last_login = NOW() WHERE id = ?`,
      [user.id]
    )

    // 9. LOG SUCCESSFUL LOGIN
    await query(
      `INSERT INTO login_history (user_id, ip_address, login_status, login_time) 
       VALUES (?, ?, 'success', NOW())`,
      [user.id, request.headers.get('x-forwarded-for') || 'unknown']
    )

    // 10. CREATE RESPONSE WITH HTTP-ONLY COOKIE
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}

// GET - Check current user from token
export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET)

    // Verify user still exists and is active
    const users = await query(
      `SELECT id, name, email, role, is_active FROM users WHERE id = ? AND is_active = TRUE`,
      [decoded.userId]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: users[0]
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    )
  }
}
