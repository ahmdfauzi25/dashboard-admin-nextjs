import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'

// GET all customers
export async function GET(request) {
  try {
    const auth = await apiAuthMiddleware(request, ['admin', 'moderator'])
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, active, inactive, verified, unverified
    const offset = (page - 1) * limit

    let sql = `
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        role, 
        is_verified, 
        is_active, 
        last_login, 
        created_at
      FROM users 
      WHERE role = 'customer'
    `
    const params = []

    // Search filter
    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    // Status filter
    if (status === 'active') {
      sql += ` AND is_active = TRUE`
    } else if (status === 'inactive') {
      sql += ` AND is_active = FALSE`
    } else if (status === 'verified') {
      sql += ` AND is_verified = TRUE`
    } else if (status === 'unverified') {
      sql += ` AND is_verified = FALSE`
    }

    // Count total
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM')
    const countResult = await query(countSql, params)
    const total = countResult[0].total

    // Add pagination
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const customers = await query(sql, params)

    return NextResponse.json({
      success: true,
      customers: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Fetch customers error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// UPDATE customer status
export async function PUT(request) {
  try {
    const auth = await apiAuthMiddleware(request, ['admin'])
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode }
      )
    }

    const { id, is_active } = await request.json()

    if (!id || is_active === undefined) {
      return NextResponse.json(
        { success: false, error: 'ID and is_active required' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE users SET is_active = ? WHERE id = ? AND role = 'customer'`,
      [is_active, id]
    )

    return NextResponse.json({
      success: true,
      message: `Customer ${is_active ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}
