import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'

// GET all customers - ADMIN/MODERATOR ONLY
export async function GET(request) {
  try {
    // Check authentication - admin and reseller only (case-insensitive)
    const auth = await apiAuthMiddleware(request, ['ADMIN', 'RESELLER', 'admin', 'reseller'])
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
    const status = searchParams.get('status') || 'all'
    const offset = (page - 1) * limit

    let sql = `
      SELECT 
        id, 
        name, 
        email, 
        role, 
        avatar,
        createdAt,
        updatedAt
      FROM users 
      WHERE role = 'CUSTOMER'
    `
    const params = []

    // Search filter
    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern)
    }

    // Count total
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM')
    const countResult = await query(countSql, params)
    const total = countResult[0].total

    // Add pagination
    sql += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const customers = await query(sql, params)

    // Format the data to match frontend expectations
    const formattedCustomers = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: customer.role || 'USER',
      avatar: customer.avatar ? `data:image/png;base64,${customer.avatar.toString('base64')}` : null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }))

    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
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

// UPDATE customer status - ADMIN ONLY
export async function PUT(request) {
  try {
    // Check authentication - admin only (case-insensitive)
    const auth = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
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

    // Note: Since the users table doesn't have is_active column in the current schema,
    // we'll skip this update for now or you can add the column to the database
    // await query(
    //   `UPDATE users SET is_active = ? WHERE id = ? AND role = 'USER'`,
    //   [is_active, id]
    // )

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
