import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// GET all products or products for a specific game
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('game_id')
    
    let products
    if (gameId) {
      products = await query(
        `SELECT p.*, g.name as game_name 
         FROM products p 
         JOIN games g ON p.game_id = g.id 
         WHERE p.game_id = ? 
         ORDER BY p.price ASC`,
        [gameId]
      )
    } else {
      products = await query(
        `SELECT p.*, g.name as game_name 
         FROM products p 
         JOIN games g ON p.game_id = g.id 
         ORDER BY g.name, p.price ASC`,
        []
      )
    }
    
    return NextResponse.json({
      success: true,
      products
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request) {
  try {
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
      `INSERT INTO products (game_id, name, price, description, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [game_id, name, parseFloat(price), description || null, is_active !== false]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertId
    })
  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
