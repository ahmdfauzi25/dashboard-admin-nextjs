import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { addCorsHeaders, createOptionsResponse } from '@/lib/cors'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return createOptionsResponse(request)
}

// POST - Check and auto-fail expired orders
export async function POST(request) {
  try {
    // Find all pending orders that have expired
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    
    const expiredOrders = await query(
      `SELECT id, order_id, payment_expires_at 
       FROM topup_orders 
       WHERE status = 'pending' 
       AND payment_expires_at IS NOT NULL 
       AND payment_expires_at < ?`,
      [now]
    )

    if (expiredOrders.length === 0) {
      const response = NextResponse.json({
        success: true,
        message: 'No expired orders found',
        updated: 0
      })
      addCorsHeaders(response, request)
      return response
    }

    // Update expired orders to failed status
    const orderIds = expiredOrders.map(o => o.id)
    const placeholders = orderIds.map(() => '?').join(',')
    
    const result = await query(
      `UPDATE topup_orders 
       SET status = 'failed', 
           updated_at = NOW() 
       WHERE id IN (${placeholders}) 
       AND status = 'pending'`,
      orderIds
    )

    const response = NextResponse.json({
      success: true,
      message: `Updated ${result.affectedRows} expired orders`,
      updated: result.affectedRows,
      orderIds: expiredOrders.map(o => o.order_id)
    })
    addCorsHeaders(response, request)
    return response

  } catch (error) {
    console.error('Check expired orders error:', error)
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

