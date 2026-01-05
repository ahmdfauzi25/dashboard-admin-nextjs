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

// GET all voucher promos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const adminView = searchParams.get('admin') === 'true'
    const code = searchParams.get('code') // For validation
    
    let querySql = 'SELECT * FROM voucher_promos'
    const params = []
    
    if (code) {
      // Validate specific voucher code (public)
      querySql += ` WHERE code = ? AND is_active = TRUE 
                    AND (start_date IS NULL OR start_date <= NOW())
                    AND (end_date IS NULL OR end_date >= NOW())
                    AND (usage_limit IS NULL OR used_count < usage_limit)`
      params.push(code)
    } else if (!includeInactive && !adminView) {
      // Public view: only active vouchers within date range
      querySql += ` WHERE is_active = TRUE 
                    AND (start_date IS NULL OR start_date <= NOW())
                    AND (end_date IS NULL OR end_date >= NOW())
                    AND (usage_limit IS NULL OR used_count < usage_limit)`
    } else if (!includeInactive) {
      // Admin view: only active vouchers
      querySql += ' WHERE is_active = TRUE'
    }
    
    querySql += ' ORDER BY created_at DESC'
    
    const vouchers = await query(querySql, params)
    
    // Format vouchers for frontend
    const formattedVouchers = vouchers.map(voucher => ({
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
    }))
    
    const response = NextResponse.json({
      success: true,
      vouchers: formattedVouchers
    })
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error) {
    console.error('Error fetching voucher promos:', error)
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch voucher promos' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    return errorResponse
  }
}

// POST - Create new voucher promo (admin only)
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
    
    // Check if code already exists
    const existing = await query('SELECT id FROM voucher_promos WHERE code = ?', [code])
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Voucher code already exists' },
        { status: 400 }
      )
    }
    
    const result = await query(
      `INSERT INTO voucher_promos 
       (code, name, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, start_date, end_date, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        is_active !== false
      ]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Voucher promo created successfully',
      voucherId: result.insertId
    })
  } catch (error) {
    console.error('Error creating voucher promo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create voucher promo' },
      { status: 500 }
    )
  }
}

