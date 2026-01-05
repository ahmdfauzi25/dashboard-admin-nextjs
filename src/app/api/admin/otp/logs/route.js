import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'

// GET OTP logs
export async function GET(request) {
  try {
    const auth = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const channel = searchParams.get('channel')

    let sql = `SELECT id, user_id, otp_code, channel, status, created_at FROM otp_logs WHERE 1=1`
    const params = []

    if (status) {
      sql += ` AND status = ?`
      params.push(status)
    }

    if (channel) {
      sql += ` AND channel = ?`
      params.push(channel)
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`
    params.push(limit)

    const logs = await query(sql, params)

    return NextResponse.json({
      success: true,
      logs: logs,
      total: logs.length
    })
  } catch (error) {
    console.error('Fetch logs error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
