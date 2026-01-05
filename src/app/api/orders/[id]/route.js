import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'
import { addCorsHeaders, createOptionsResponse } from '@/lib/cors'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return createOptionsResponse(request)
}

// GET single order by ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    // Check authentication
    const authResult = await apiAuthMiddleware(request, ['CUSTOMER', 'customer', 'ADMIN', 'admin', 'RESELLER', 'reseller', 'MODERATOR', 'moderator'])
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const user = authResult.user
    
    // Get order with details
    const orders = await query(
      `SELECT 
        o.*,
        g.name as game_name,
        g.image_url as game_image,
        u.name as user_name,
        u.email as user_email,
        p.name as product_name,
        pm.name as payment_method_name,
        pm.logo_url as payment_method_logo,
        pm.account_number as payment_method_account_number,
        pm.account_name as payment_method_account_name,
        pm.qr_code_url as payment_method_qr_code_url,
        pm.instructions as payment_method_instructions
      FROM topup_orders o
      LEFT JOIN games g ON o.game_id = g.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
      WHERE o.id = ? OR o.order_id = ?`,
      [id, id]
    )

    if (orders.length === 0) {
      const response = NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const order = orders[0]
    
    // Check if user has permission (admin can see all, customer only their own)
    const isAdmin = user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'RESELLER' || user.role?.toUpperCase() === 'MODERATOR'
    if (!isAdmin && order.user_id !== user.id) {
      const response = NextResponse.json(
        { success: false, error: 'Unauthorized. You can only view your own orders.' },
        { status: 403 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const formattedOrder = {
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
      paymentMethodAccountNumber: order.payment_method_account_number,
      paymentMethodAccountName: order.payment_method_account_name,
      paymentMethodQrCodeUrl: order.payment_method_qr_code_url,
      paymentMethodInstructions: order.payment_method_instructions,
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
    }

    const response = NextResponse.json({
      success: true,
      order: formattedOrder
    })
    addCorsHeaders(response, request)
    return response

  } catch (error) {
    console.error('Get order error:', error)
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

// PUT - Update order (upload payment proof or admin update status)
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Check authentication
    const authResult = await apiAuthMiddleware(request, ['CUSTOMER', 'customer', 'ADMIN', 'admin', 'RESELLER', 'reseller', 'MODERATOR', 'moderator'])
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const user = authResult.user
    const isAdmin = user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'RESELLER' || user.role?.toUpperCase() === 'MODERATOR'
    
    // Get order first
    const orders = await query(
      'SELECT * FROM topup_orders WHERE id = ? OR order_id = ?',
      [id, id]
    )

    if (orders.length === 0) {
      const response = NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
      addCorsHeaders(response, request)
      return response
    }

    const order = orders[0]
    
    // Check permissions
    if (!isAdmin && order.user_id !== user.id) {
      const response = NextResponse.json(
        { success: false, error: 'Unauthorized. You can only update your own orders.' },
        { status: 403 }
      )
      addCorsHeaders(response, request)
      return response
    }

    // Customer can only upload payment proof
    if (!isAdmin) {
      const paymentProof = body.payment_proof || body.paymentProof
      if (paymentProof) {
        // Only allow upload if order is still pending
        if (order.status !== 'pending') {
          const response = NextResponse.json(
            { success: false, error: 'Payment proof can only be uploaded for pending orders' },
            { status: 400 }
          )
          addCorsHeaders(response, request)
          return response
        }
        
        // Validate base64 length (should be at least 100 chars for a valid image)
        if (paymentProof.startsWith('data:image/') && paymentProof.length < 100) {
          const response = NextResponse.json(
            { success: false, error: 'Invalid image data. Please try uploading again.' },
            { status: 400 }
          )
          addCorsHeaders(response, request)
          return response
        }
        
        console.log('Updating payment proof, length:', paymentProof.length)
        
        await query(
          'UPDATE topup_orders SET payment_proof = ?, status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
          [paymentProof, 'processing', order.id, user.id]
        )
        
        // Verify the update
        const verifyResult = await query(
          'SELECT payment_proof, LENGTH(payment_proof) as proof_length FROM topup_orders WHERE id = ?',
          [order.id]
        )
        console.log('Payment proof saved, length in DB:', verifyResult[0]?.proof_length)
        
        const response = NextResponse.json({
          success: true,
          message: 'Payment proof uploaded successfully. Waiting for admin verification.'
        })
        addCorsHeaders(response, request)
        return response
      } else {
        const response = NextResponse.json(
          { success: false, error: 'Payment proof is required' },
          { status: 400 }
        )
        addCorsHeaders(response, request)
        return response
      }
    }

    // Admin can update status and notes
    const updates = []
    const values = []
    
    if (body.status) {
      updates.push('status = ?')
      values.push(body.status)
      
      // Set completed_at if status is completed
      if (body.status === 'completed') {
        updates.push('completed_at = NOW()')
        updates.push('verified_by = ?')
        updates.push('verified_at = NOW()')
        values.push(user.id)
      }
    }
    
    if (body.notes !== undefined) {
      updates.push('notes = ?')
      values.push(body.notes)
    }
    
    if (updates.length === 0) {
      const response = NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
      addCorsHeaders(response, request)
      return response
    }
    
    updates.push('updated_at = NOW()')
    values.push(order.id)
    
    await query(
      `UPDATE topup_orders SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    const response = NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    })
    addCorsHeaders(response, request)
    return response

  } catch (error) {
    console.error('Update order error:', error)
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

