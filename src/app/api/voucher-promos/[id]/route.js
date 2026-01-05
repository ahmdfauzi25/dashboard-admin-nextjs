import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// GET single voucher promo
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const vouchers = await query('SELECT * FROM voucher_promos WHERE id = ?', [id])
    
    if (vouchers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Voucher promo not found' },
        { status: 404 }
      )
    }
    
    const voucher = vouchers[0]
    const formattedVoucher = {
      id: voucher.id,
      code: voucher.code,
      name: voucher.name,
      description: voucher.description,
      discountType: voucher.discount_type,
      discountValue: parseFloat(voucher.discount_value) || 0,
      minPurchase: parseFloat(voucher.min_purchase) || 0,
      maxDiscount: voucher.max_discount ? parseFloat(voucher.max_discount) : null,
      usageLimit: voucher.usage_limit,
      usedCount: voucher.used_count || 0,
      startDate: voucher.start_date,
      endDate: voucher.end_date,
      isActive: voucher.is_active,
      createdAt: voucher.created_at,
      updatedAt: voucher.updated_at
    }
    
    const response = NextResponse.json({
      success: true,
      voucher: formattedVoucher
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching voucher promo:', error)
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch voucher promo' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    return errorResponse
  }
}

// PUT - Update voucher promo (admin only)
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const authResult = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { 
      code, 
      name, 
      description, 
      discount_type, 
      discount_value, 
      min_purchase, 
      max_discount, 
      usage_limit, 
      start_date, 
      end_date, 
      is_active 
    } = body
    
    if (!code || !name || !discount_type || !discount_value) {
      return NextResponse.json(
        { success: false, error: 'Code, name, discount_type, and discount_value are required' },
        { status: 400 }
      )
    }
    
    // Check if code already exists (excluding current voucher)
    const existing = await query('SELECT id FROM voucher_promos WHERE code = ? AND id != ?', [code.toUpperCase(), id])
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Voucher code already exists' },
        { status: 400 }
      )
    }
    
    const result = await query(
      `UPDATE voucher_promos 
       SET code = ?, name = ?, description = ?, discount_type = ?, discount_value = ?, 
           min_purchase = ?, max_discount = ?, usage_limit = ?, start_date = ?, end_date = ?, is_active = ?
       WHERE id = ?`,
      [
        code.toUpperCase(),
        name,
        description || null,
        discount_type.toUpperCase(),
        parseFloat(discount_value),
        min_purchase ? parseFloat(min_purchase) : 0,
        max_discount ? parseFloat(max_discount) : null,
        usage_limit ? parseInt(usage_limit) : null,
        start_date || null,
        end_date || null,
        is_active !== false,
        id
      ]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Voucher promo not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Voucher promo updated successfully'
    })
  } catch (error) {
    console.error('Error updating voucher promo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update voucher promo' },
      { status: 500 }
    )
  }
}

// DELETE voucher promo (admin only)
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const authResult = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { id } = params
    
    const result = await query('DELETE FROM voucher_promos WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Voucher promo not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Voucher promo deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting voucher promo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete voucher promo' },
      { status: 500 }
    )
  }
}

