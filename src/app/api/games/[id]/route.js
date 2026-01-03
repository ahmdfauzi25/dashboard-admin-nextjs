import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// GET single game
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const games = await query(
      `SELECT g.*, c.name as category_name 
       FROM games g 
       LEFT JOIN categories c ON g.category_id = c.id 
       WHERE g.id = ?`,
      [id]
    )
    
    if (games.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      game: games[0]
    })
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}

// PUT - Update game
export async function PUT(request, { params }) {
  try {
    const { id } = params
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
      `UPDATE games 
       SET name = ?, developer = ?, region = ?, input_type = ?, category_id = ?, image_url = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [name, developer, region, input_type, category_id || null, image_url || null, description || null, is_active !== false, id]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Game updated successfully'
    })
  } catch (error) {
    console.error('Error updating game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update game' },
      { status: 500 }
    )
  }
}

// DELETE game
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    const result = await query(
      'DELETE FROM games WHERE id = ?',
      [id]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete game' },
      { status: 500 }
    )
  }
}
