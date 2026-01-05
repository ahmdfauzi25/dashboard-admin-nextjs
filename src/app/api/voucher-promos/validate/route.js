import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// POST - Validate voucher code and calculate discount
export async function POST(request) {
  try {
    const body = await request.json()
    const { code, amount } = body
    
    if (!code || !amount) {
      return NextResponse.json(
        { success: false, error: 'Code and amount are required' },
        { status: 400 }
      )
    }
    
    const purchaseAmount = parseFloat(amount)
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }
    
    // Find voucher
    const vouchers = await query(
      `SELECT * FROM voucher_promos 
       WHERE code = ? AND is_active = TRUE 
       AND (start_date IS NULL OR start_date <= NOW())
       AND (end_date IS NULL OR end_date >= NOW())
       AND (usage_limit IS NULL OR used_count < usage_limit)`,
      [code.toUpperCase()]
    )
    
    if (vouchers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Voucher code tidak valid atau sudah tidak berlaku' },
        { status: 404 }
      )
    }
    
    const voucher = vouchers[0]
    
    // Check minimum purchase
    const minPurchase = parseFloat(voucher.min_purchase) || 0
    if (purchaseAmount < minPurchase) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Minimum pembelian Rp ${minPurchase.toLocaleString('id-ID')} untuk menggunakan voucher ini` 
        },
        { status: 400 }
      )
    }
    
    // Calculate discount
    let discount = 0
    if (voucher.discount_type === 'PERCENTAGE') {
      discount = (purchaseAmount * parseFloat(voucher.discount_value)) / 100
      // Apply max discount if set
      if (voucher.max_discount) {
        const maxDiscount = parseFloat(voucher.max_discount)
        if (discount > maxDiscount) {
          discount = maxDiscount
        }
      }
    } else if (voucher.discount_type === 'FIXED') {
      discount = parseFloat(voucher.discount_value)
      // Don't exceed purchase amount
      if (discount > purchaseAmount) {
        discount = purchaseAmount
      }
    }
    
    const finalAmount = purchaseAmount - discount
    
    const response = NextResponse.json({
      success: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        discountType: voucher.discount_type,
        discountValue: parseFloat(voucher.discount_value),
        discount: discount,
        finalAmount: finalAmount,
        minPurchase: minPurchase
      }
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error validating voucher:', error)
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to validate voucher' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    return errorResponse
  }
}

