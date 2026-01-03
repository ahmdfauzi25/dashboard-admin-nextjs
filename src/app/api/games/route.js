import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// GET all games
export async function GET() {
  try {
    const games = await query(
      `SELECT g.*, c.name as category_name 
       FROM games g 
       LEFT JOIN categories c ON g.category_id = c.id 
       ORDER BY g.created_at DESC`,
      []
    )
    
    return NextResponse.json({
      success: true,
      games
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}

// POST - Create new game
export async function POST(request) {
  try {
    const { name, developer, region, input_type, category_id, image_url, description, is_active } = await request.json()
    
    if (!name || !developer || !region || !input_type) {
      return NextResponse.json(
        { success: false, error: 'Name, developer, region, and input_type are required' },
        { status: 400 }
      )
    }
    
    // Validate input_type
    if (!['ID', 'ID_SERVER'].includes(input_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid input_type. Must be ID or ID_SERVER' },
        { status: 400 }
      )
    }
    
    const result = await query(
      `INSERT INTO games (name, developer, region, input_type, category_id, image_url, description, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, developer, region, input_type, category_id || null, image_url || null, description || null, is_active !== false]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Game created successfully',
      gameId: result.insertId
    })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 }
    )
  }
}
