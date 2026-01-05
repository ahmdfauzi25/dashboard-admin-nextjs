import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'
import { addCorsHeaders, createOptionsResponse } from '@/lib/cors'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return createOptionsResponse(request)
}

// GET all orders (admin only) or user's own orders
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'
    
    // Check authentication
    const authResult = await apiAuthMiddleware(request, isAdmin ? ['ADMIN', 'admin', 'RESELLER', 'reseller', 'MODERATOR', 'moderator'] : ['CUSTOMER', 'customer', 'USER', 'user'])
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const user = authResult.user
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // Filter by status
    const offset = (page - 1) * limit

    let querySql = `
      SELECT 
        o.*,
        g.name as game_name,
        g.image_url as game_image,
        u.name as user_name,
        u.email as user_email,
        p.name as product_name,
        pm.name as payment_method_name,
        pm.logo_url as payment_method_logo,
        pm.code as payment_method_code
      FROM topup_orders o
      LEFT JOIN games g ON o.game_id = g.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
    `
    
    const params = []
    
    // Admin can see all orders, customer only sees their own
    const userRole = user.role?.toUpperCase()
    const isAdminRole = userRole === 'ADMIN' || userRole === 'RESELLER' || userRole === 'MODERATOR'
    
    if (!isAdmin || !isAdminRole) {
      querySql += ' WHERE o.user_id = ?'
      params.push(user.id)
    } else {
      querySql += ' WHERE 1=1'
    }
    
    // Filter by status if provided
    if (status) {
      querySql += ' AND o.status = ?'
      params.push(status)
    }
    
    querySql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    console.log('Executing orders query:', querySql)
    console.log('Query params:', params)
    
    const orders = await query(querySql, params)
    console.log('Orders found:', orders.length)

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM topup_orders o'
    const countParams = []
    if (!isAdmin || !isAdminRole) {
      countSql += ' WHERE o.user_id = ?'
      countParams.push(user.id)
      if (status) {
        countSql += ' AND o.status = ?'
        countParams.push(status)
      }
    } else {
      if (status) {
        countSql += ' WHERE o.status = ?'
        countParams.push(status)
      }
    }
    
    const countResult = await query(countSql, countParams)
    const total = countResult[0]?.total || 0

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderId: order.order_id,
      userId: order.user_id,
      userName: order.user_name,
      userEmail: order.user_email,
      gameId: order.game_id,
      gameName: order.game_name,
      gameImage: order.game_image,
      playerId: order.player_id,
      serverId: order.server_id,
      productId: order.product_id,
      productName: order.product_name,
      amount: parseFloat(order.amount),
      paymentMethod: order.payment_method,
      paymentMethodId: order.payment_method_id,
      paymentMethodName: order.payment_method_name,
      paymentMethodLogo: order.payment_method_logo,
      paymentMethodCode: order.payment_method_code || null,
      voucherCode: order.voucher_code,
      paymentProof: order.payment_proof,
      paymentExpiresAt: order.payment_expires_at,
      status: order.status,
      notes: order.notes,
      verifiedBy: order.verified_by,
      verifiedAt: order.verified_at,
      completedAt: order.completed_at,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }))

    const response = NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    })
    addCorsHeaders(response, request)
    return response

  } catch (error) {
    console.error('Get orders error:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // Handle table not found error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'Orders table not found. Please run the database migration: update_topup_orders_table.sql',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 503 }
      )
      addCorsHeaders(response, request)
      return response
    }
    
    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect')) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed. Please check your database configuration.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 503 }
      )
      addCorsHeaders(response, request)
      return response
    }
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          message: error.message,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    )
    addCorsHeaders(response, request)
    return response
  }
}

