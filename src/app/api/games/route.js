import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { addCorsHeaders, createOptionsResponse } from '@/lib/cors'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return createOptionsResponse(request)
}

// GET all games (only active games for public API)
export async function GET(request) {
  try {
    console.log('Games API called')
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    let querySql = `SELECT g.*, c.name as category_name 
       FROM games g 
       LEFT JOIN categories c ON g.category_id = c.id`
    
    if (!includeInactive) {
      querySql += ' WHERE g.is_active = TRUE'
    }
    
    querySql += ' ORDER BY g.created_at DESC'
    
    console.log('Executing query:', querySql)
    const games = await query(querySql, [])
    console.log('Games found:', games.length)
    
    // Format games for frontend
    const formattedGames = games.map(game => {
      // Handle image URL - support multiple formats
      let imageUrl = game.image_url
      
      if (imageUrl) {
        // If it's a base64 data URL, use it directly
        if (imageUrl.startsWith('data:image/')) {
          // Already a base64 data URL, use as is
        }
        // If it's a full HTTP/HTTPS URL, use it directly
        else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          // Already a full URL, use as is
        }
        // If it starts with /, it's a relative path from backend
        else if (imageUrl.startsWith('/')) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
          imageUrl = `${baseUrl}${imageUrl}`
        }
        // If it's a relative path without leading slash
        else {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
          imageUrl = `${baseUrl}/${imageUrl}`
        }
      }
      
      return {
        id: game.id,
        name: game.name,
        description: game.description,
        imageUrl: imageUrl || null, // Return null if no image
        category: game.category_name,
        categoryId: game.category_id,
        developer: game.developer,
        region: game.region,
        inputType: game.input_type,
        isActive: game.is_active,
        createdAt: game.created_at,
        updatedAt: game.updated_at
      }
    })
    
    console.log('Formatted games:', formattedGames.map(g => ({ 
      id: g.id, 
      name: g.name, 
      imageUrl: g.imageUrl ? (g.imageUrl.length > 50 ? g.imageUrl.substring(0, 50) + '...' : g.imageUrl) : 'null' 
    })))
    
    // Add CORS headers for frontend access
    const response = NextResponse.json({
      success: true,
      games: formattedGames
    })
    
    // Add CORS headers
    addCorsHeaders(response, request)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error) {
    console.error('Error fetching games:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    // Determine appropriate status code
    let statusCode = 500
    let errorMessage = 'Failed to fetch games'
    
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connection')) {
      statusCode = 503
      errorMessage = 'Database connection failed. Please check if MySQL is running.'
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      statusCode = 500
      errorMessage = 'Database tables not found. Please run migration scripts.'
    }
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        message: error.message || 'Database error occurred',
        ...(process.env.NODE_ENV === 'development' && { 
          code: error.code,
          details: error.message 
        })
      },
      { status: statusCode }
    )
    
    // Add CORS headers even for errors
    addCorsHeaders(response, request)
    
    return response
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
