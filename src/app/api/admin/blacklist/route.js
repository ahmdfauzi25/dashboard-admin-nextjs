import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'

// GET blacklist items
export async function GET(request) {
  try {
    const auth = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode }
      )
    }

    const items = await query(
      `SELECT id, type, value, reason, expires_at FROM blacklist 
       WHERE expires_at IS NULL OR expires_at > NOW() 
       ORDER BY created_at DESC`
    )

    return NextResponse.json({
      success: true,
      items: items
    })
  } catch (error) {
    console.error('Fetch blacklist error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blacklist' },
      { status: 500 }
    )
  }
}

// ADD to blacklist
export async function POST(request) {
  try {
    const auth = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode }
      )
    }

    const { type, value, reason, expires_at } = await request.json()

    if (!type || !value) {
      return NextResponse.json(
        { success: false, error: 'Type and value required' },
        { status: 400 }
      )
    }

    await query(
      `INSERT INTO blacklist (type, value, reason, expires_at) VALUES (?, ?, ?, ?)`,
      [type, value, reason || null, expires_at || null]
    )

    return NextResponse.json({
      success: true,
      message: 'Added to blacklist'
    })
  } catch (error) {
    console.error('Add blacklist error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add to blacklist' },
      { status: 500 }
    )
  }
}
