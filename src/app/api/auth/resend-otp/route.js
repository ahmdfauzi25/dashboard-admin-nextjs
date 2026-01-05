import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import nodemailer from 'nodemailer'

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

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP via Email
 */
async function sendOTPEmail(email, otp) {
  try {
    // Configure email service
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    })

    // Get custom template if exists
    const templates = await query(
      `SELECT template_text FROM otp_templates WHERE channel = 'email'`
    )
    const template = templates[0]?.template_text || 
      `Your OTP code is: {{OTP_CODE}}\n\nValid for 10 minutes.`

    const emailBody = template.replace('{{OTP_CODE}}', otp)

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Your Game Top Up OTP Code',
      text: emailBody,
      html: `<pre>${emailBody}</pre>`
    })

    console.log(`OTP sent to email: ${email}`)
    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

/**
 * Send OTP via WhatsApp
 */
async function sendOTPWhatsApp(phone, otp) {
  try {
    // Get custom template if exists
    const templates = await query(
      `SELECT template_text FROM otp_templates WHERE channel = 'whatsapp'`
    )
    const template = templates[0]?.template_text || 
      `Kode OTP Anda: {{OTP_CODE}}\n\nBerlaku selama 10 menit.`

    const message = template.replace('{{OTP_CODE}}', otp)

    // Integrate with Twilio or WhatsApp Business API
    // Example: Twilio client
    // const twilio = require('twilio')
    // const client = twilio(ACCOUNT_SID, AUTH_TOKEN)
    // await client.messages.create({ body: message, from: TWILIO_NUMBER, to: phone })

    // For now, just log
    console.log(`OTP sent to WhatsApp: ${phone}`)
    console.log(`Message: ${message}`)
    return true
  } catch (error) {
    console.error('WhatsApp sending error:', error)
    return false
  }
}

export async function POST(request) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      const response = NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }

    // 1. FIND USER
    const users = await query(
      `SELECT id, email, phone FROM users WHERE id = ?`,
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

    // 2. DELETE OLD OTPs (cleanup)
    await query(
      `DELETE FROM otps WHERE user_id = ? AND created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)`,
      [user_id]
    )

    // 3. GENERATE NEW OTP
    const otpCode = generateOTP()

    // 4. CREATE OTP RECORDS FOR EMAIL AND WHATSAPP
    await query(
      `INSERT INTO otps (user_id, otp_code, channel, max_attempts) 
       VALUES (?, ?, 'email', 3)`,
      [user_id, otpCode]
    )

    await query(
      `INSERT INTO otps (user_id, otp_code, channel, max_attempts) 
       VALUES (?, ?, 'whatsapp', 3)`,
      [user_id, otpCode]
    )

    // 5. SEND OTP VIA EMAIL AND WHATSAPP
    const emailSent = await sendOTPEmail(user.email, otpCode)
    const whatsappSent = await sendOTPWhatsApp(user.phone, otpCode)

    // 6. LOG ATTEMPTS
    await query(
      `INSERT INTO otp_logs (user_id, otp_code, channel, status) 
       VALUES (?, ?, 'email', ?)`,
      [user_id, otpCode, emailSent ? 'sent' : 'failed']
    )

    await query(
      `INSERT INTO otp_logs (user_id, otp_code, channel, status) 
       VALUES (?, ?, 'whatsapp', ?)`,
      [user_id, otpCode, whatsappSent ? 'sent' : 'failed']
    )

    const response = NextResponse.json({
      success: true,
      message: 'OTP resent successfully',
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
    console.error('Resend OTP error:', error)
    const origin = request.headers.get('origin')
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to resend OTP' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', origin || '*')
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    return errorResponse
  }
}
