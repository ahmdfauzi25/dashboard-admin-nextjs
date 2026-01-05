import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// GET game image by ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const games = await query('SELECT image_url FROM games WHERE id = ?', [id])
    
    if (games.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }
    
    const game = games[0]
    
    if (!game.image_url) {
      return NextResponse.json(
        { success: false, error: 'Game has no image' },
        { status: 404 }
      )
    }
    
    // If it's a base64 data URL, return it directly
    if (game.image_url.startsWith('data:image/')) {
      // Extract base64 data
      const base64Data = game.image_url.split(',')[1]
      const mimeType = game.image_url.match(/data:image\/([^;]+)/)?.[1] || 'png'
      
      return new NextResponse(Buffer.from(base64Data, 'base64'), {
        headers: {
          'Content-Type': `image/${mimeType}`,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }
    
    // If it's a URL, redirect to it
    if (game.image_url.startsWith('http://') || game.image_url.startsWith('https://')) {
      return NextResponse.redirect(game.image_url)
    }
    
    // If it's a relative path, try to serve from public folder
    return NextResponse.json(
      { success: false, error: 'Image URL format not supported' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching game image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game image' },
      { status: 500 }
    )
  }
}

