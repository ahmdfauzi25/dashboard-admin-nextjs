import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

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

// Utility: Generate OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString()
}

// Utility: Send OTP via Email
async function sendOTPEmail(email, name, otpCode) {
  try {
    // Integration dengan Email Service (Nodemailer, SendGrid, AWS SES, dll)
    console.log(`[EMAIL] Sending OTP to ${email}: ${otpCode}`)
    
    // Placeholder - implementasi real sesuai email provider
    // const response = await emailService.send({
    //   to: email,
    //   subject: 'Kode Verifikasi Game Top Up',
    //   body: `Kode verifikasi Anda: ${otpCode}\n\nBerlaku 10 menit.`
    // })
    
    return true // Assume success
  } catch (error) {
    console.error('Email send failed:', error)
    return false
  }
}

// Utility: Send OTP via WhatsApp
async function sendOTPWhatsApp(phone, name, otpCode) {
  try {
    // Integration dengan WhatsApp Service (Twilio, WhatsApp Business API, dll)
    console.log(`[WHATSAPP] Sending OTP to ${phone}: ${otpCode}`)
    
    // Placeholder - implementasi real sesuai WhatsApp provider
    // const response = await whatsappService.send({
    //   phone: phone,
    //   message: `Kode verifikasi Game Top Up Anda: ${otpCode}\n\nBerlaku 10 menit.`
    // })
    
    return true // Assume success
  } catch (error) {
    console.error('WhatsApp send failed:', error)
    return false
  }
}

// Utility: Check if IP/Email/Phone is blacklisted
async function isBlacklisted(type, value) {
  try {
    const blacklisted = await query(
      `SELECT id FROM blacklist 
       WHERE type = ? AND value = ? AND (expires_at IS NULL OR expires_at > NOW())`,
      [type, value]
    )
    return blacklisted.length > 0
  } catch (error) {
    console.error('Blacklist check failed:', error)
    return false
  }
}

// ============================================
// REGISTER ENDPOINT
// ============================================
export async function POST(request) {
  try {
    const origin = request.headers.get('origin')
    const { name, email, phone, password } = await request.json()

    // 1. VALIDATION
    if (!name || !email || !phone || !password) {
      const response = NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    if (password.length < 8) {
      const response = NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // 2. CHECK BLACKLIST
    if (await isBlacklisted('email', email)) {
      const response = NextResponse.json(
        { success: false, error: 'Email is blacklisted' },
        { status: 403 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    if (await isBlacklisted('phone', phone)) {
      const response = NextResponse.json(
        { success: false, error: 'Phone is blacklisted' },
        { status: 403 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // 3. CHECK EXISTING USER
    const existingUser = await query(
      `SELECT id FROM users WHERE email = ? OR phone = ?`,
      [email, phone]
    )

    if (existingUser.length > 0) {
      const response = NextResponse.json(
        { success: false, error: 'Email or phone already registered' },
        { status: 409 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // 4. HASH PASSWORD
    const passwordHash = await bcrypt.hash(password, 10)

    // 5. CREATE USER with role 'customer'
    const result = await query(
      `INSERT INTO users (name, email, phone, password_hash, role, is_verified) 
       VALUES (?, ?, ?, ?, 'customer', FALSE)`,
      [name, email, phone, passwordHash]
    )

    const userId = result.insertId

    // 6. GENERATE OTP
    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await query(
      `INSERT INTO otps (user_id, otp_code, channel, is_used, expires_at) 
       VALUES (?, ?, 'email', FALSE, ?)`,
      [userId, otpCode, expiresAt]
    )

    await query(
      `INSERT INTO otps (user_id, otp_code, channel, is_used, expires_at) 
       VALUES (?, ?, 'whatsapp', FALSE, ?)`,
      [userId, otpCode, expiresAt]
    )

    // 7. SEND OTP via Email & WhatsApp
    const emailSent = await sendOTPEmail(email, name, otpCode)
    const whatsappSent = await sendOTPWhatsApp(phone, name, otpCode)

    // 8. LOG OTP SENDING
    if (emailSent) {
      await query(
        `INSERT INTO otp_logs (user_id, email, otp_code, channel, status) 
         VALUES (?, ?, ?, 'email', 'sent')`,
        [userId, email, otpCode]
      )
    }

    if (whatsappSent) {
      await query(
        `INSERT INTO otp_logs (user_id, phone, otp_code, channel, status) 
         VALUES (?, ?, ?, 'whatsapp', 'sent')`,
        [userId, phone, otpCode]
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful. OTP sent to email and WhatsApp.',
      user_id: userId,
      email_sent: emailSent,
      whatsapp_sent: whatsappSent
    })
    
    // Add CORS headers with specific origin (required for credentials)
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    const origin = request.headers.get('origin')
    const errorResponse = NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', origin || '*')
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    return errorResponse
  }
}
