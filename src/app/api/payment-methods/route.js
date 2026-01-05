import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// GET all payment methods (public - no auth required)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const adminView = searchParams.get('admin') === 'true'
    const type = searchParams.get('type') // Filter by type
    
    let querySql = 'SELECT * FROM payment_methods'
    const params = []
    
    if (!includeInactive && !adminView) {
      // Public view: only active payment methods
      querySql += ' WHERE is_active = TRUE'
    } else if (!includeInactive) {
      // Admin view: only active
      querySql += ' WHERE is_active = TRUE'
    }
    
    if (type) {
      querySql += querySql.includes('WHERE') ? ' AND type = ?' : ' WHERE type = ?'
      params.push(type)
    }
    
    querySql += ' ORDER BY position ASC, name ASC'
    
    const methods = await query(querySql, params)
    
    // Format payment methods for frontend
    const formattedMethods = methods.map(method => ({
      id: method.id,
      name: method.name,
      code: method.code,
      type: method.type,
      logoUrl: method.logo_url,
      description: method.description,
      feePercentage: parseFloat(method.fee_percentage) || 0,
      feeFixed: parseFloat(method.fee_fixed) || 0,
      isActive: method.is_active,
      position: method.position,
      minAmount: parseFloat(method.min_amount) || 0,
      maxAmount: parseFloat(method.max_amount) || 99999999999.99,
      accountNumber: method.account_number || null,
      accountName: method.account_name || null,
      qrCodeUrl: method.qr_code_url || null,
      instructions: method.instructions || null,
      createdAt: method.created_at,
      updatedAt: method.updated_at
    }))
    
    const response = NextResponse.json({
      success: true,
      paymentMethods: formattedMethods
    })
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    return errorResponse
  }
}

// POST - Create new payment method (admin only)
export async function POST(request) {
  try {
    // Check authentication
    const authResult = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      code, 
      type, 
      logo_url, 
      description, 
      fee_percentage, 
      fee_fixed, 
      is_active, 
      position,
      min_amount,
      max_amount
    } = body
    
    if (!name || !code || !type) {
      return NextResponse.json(
        { success: false, error: 'Name, code, and type are required' },
        { status: 400 }
      )
    }
    
    // Validate type
    const validTypes = ['EWALLET', 'BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'QRIS', 'CREDIT_CARD', 'OTHER']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method type' },
        { status: 400 }
      )
    }
    
    const result = await query(
      `INSERT INTO payment_methods 
       (name, code, type, logo_url, description, fee_percentage, fee_fixed, is_active, position, min_amount, max_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        code.toUpperCase(),
        type,
        logo_url || null,
        description || null,
        fee_percentage || 0,
        fee_fixed || 0,
        is_active !== false,
        position || 0,
        min_amount || 0,
        max_amount || 99999999999.99
      ]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Payment method created successfully',
      paymentMethodId: result.insertId
    })
  } catch (error) {
    console.error('Error creating payment method:', error)
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'Payment method code already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create payment method' },
      { status: 500 }
    )
  }
}

