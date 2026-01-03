import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// GET single product
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const products = await query(
      `SELECT p.*, g.name as game_name 
       FROM products p 
       JOIN games g ON p.game_id = g.id 
       WHERE p.id = ?`,
      [id]
    )
    
    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      product: products[0]
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const { game_id, name, price, description, is_active } = await request.json()
    
    if (!game_id || !name || !price) {
      return NextResponse.json(
        { success: false, error: 'Game ID, name, and price are required' },
        { status: 400 }
      )
    }
    
    // Validate price is a positive number
    if (isNaN(price) || parseFloat(price) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a positive number' },
        { status: 400 }
      )
    }
    
    const result = await query(
      `UPDATE products 
       SET game_id = ?, name = ?, price = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [game_id, name, parseFloat(price), description || null, is_active !== false, id]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    const result = await query(
      'DELETE FROM products WHERE id = ?',
      [id]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
