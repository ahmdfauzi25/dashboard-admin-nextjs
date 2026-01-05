import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'
import { addCorsHeaders, createOptionsResponse } from '@/lib/cors'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return createOptionsResponse(request)
}

export async function POST(request) {
  try {
    // Check authentication
    const authResult = await apiAuthMiddleware(request, ['CUSTOMER', 'customer'])
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const user = authResult.user
    const body = await request.json()
    const { gameId, playerId, serverId, amount, paymentMethod, paymentMethodId, productId, voucherCode } = body

    // Validate input
    if (!gameId || !playerId || !amount) {
      const response = NextResponse.json(
        { success: false, error: 'Game ID, Player ID, and amount are required' },
        { status: 400 }
      )
      addCorsHeaders(response, request)
      return response
    }

    if (isNaN(amount) || amount <= 0) {
      const response = NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
      addCorsHeaders(response, request)
      return response
    }

    // Check if game exists and is active
    const games = await query('SELECT id, name, is_active FROM games WHERE id = ?', [gameId])
    if (games.length === 0) {
      const response = NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const game = games[0]
    if (!game.is_active) {
      const response = NextResponse.json(
        { success: false, error: 'Game is not active' },
        { status: 400 }
      )
      addCorsHeaders(response, request)
      return response
    }

    // Create top up order
    const orderId = `TOPUP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const status = 'pending' // pending, processing, completed, failed
    
    // Set payment expiration to 10 minutes from now
    const paymentExpiresAt = new Date()
    paymentExpiresAt.setMinutes(paymentExpiresAt.getMinutes() + 10)

    // Insert into orders table with all details
    const result = await query(
      `INSERT INTO topup_orders (order_id, user_id, game_id, player_id, server_id, product_id, amount, payment_method, payment_method_id, voucher_code, status, payment_expires_at, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [orderId, user.id, gameId, playerId.trim(), serverId || null, productId || null, amount, paymentMethod || 'transfer', paymentMethodId || null, voucherCode || null, status, paymentExpiresAt]
    )

    if (result.affectedRows === 0) {
      const response = NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const response = NextResponse.json({
      success: true,
      message: 'Top up order created successfully',
      data: {
        orderId: orderId,
        orderIdForUrl: orderId, // For redirect URL
        amount: amount,
        status: status,
        game: game.name,
        playerId: playerId.trim(),
        paymentExpiresAt: paymentExpiresAt.toISOString()
      }
    }, { status: 201 })
    addCorsHeaders(response, request)
    return response

  } catch (error) {
    console.error('Top up error:', error)
    
    // Handle MySQL errors
    if (error.code === 'ER_NO_SUCH_TABLE') {
      // Table doesn't exist, return a helpful error
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'Top up service is not fully configured. Please contact administrator.',
          details: 'Database table missing'
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
        ...(process.env.NODE_ENV === 'development' && { details: error.stack })
      },
      { status: 500 }
    )
    addCorsHeaders(response, request)
    return response
  }
}

// Get user's top up history
export async function GET(request) {
  try {
    // Check authentication
    const authResult = await apiAuthMiddleware(request, ['CUSTOMER', 'customer'])
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const user = authResult.user
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    try {
      const orders = await query(
        `SELECT o.*, g.name as game_name 
         FROM topup_orders o 
         LEFT JOIN games g ON o.game_id = g.id 
         WHERE o.user_id = ? 
         ORDER BY o.created_at DESC 
         LIMIT ? OFFSET ?`,
        [user.id, limit, offset]
      )

      const countResult = await query(
        'SELECT COUNT(*) as total FROM topup_orders WHERE user_id = ?',
        [user.id]
      )
      const total = countResult[0]?.total || 0

      const response = NextResponse.json({
        success: true,
        orders: orders,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: Math.ceil(total / limit)
        }
      })
      addCorsHeaders(response, request)
      return response
    } catch (dbError) {
      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        const response = NextResponse.json({
          success: true,
          orders: [],
          pagination: {
            page: 1,
            limit: limit,
            total: 0,
            totalPages: 0
          }
        })
        addCorsHeaders(response, request)
        return response
      }
      throw dbError
    }

  } catch (error) {
    console.error('Get top up history error:', error)
    const response = NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    )
    addCorsHeaders(response, request)
    return response
  }
}

