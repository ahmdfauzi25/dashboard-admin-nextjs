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

// GET single promo banner
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const banners = await query('SELECT * FROM promo_banners WHERE id = ?', [id])
    
    if (banners.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Promo banner not found' },
        { status: 404 }
      )
    }
    
    const banner = banners[0]
    const formattedBanner = {
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.image_url,
      linkUrl: banner.link_url,
      position: banner.position,
      isActive: banner.is_active,
      startDate: banner.start_date,
      endDate: banner.end_date,
      createdAt: banner.created_at,
      updatedAt: banner.updated_at
    }
    
    const response = NextResponse.json({
      success: true,
      banner: formattedBanner
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching promo banner:', error)
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch promo banner' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    return errorResponse
  }
}

// PUT - Update promo banner (admin only)
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
    const { title, description, image_url, link_url, position, is_active, start_date, end_date } = body
    
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }
    
    const result = await query(
      `UPDATE promo_banners 
       SET title = ?, description = ?, image_url = ?, link_url = ?, position = ?, is_active = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [
        title,
        description || null,
        image_url || null,
        link_url || null,
        position || 0,
        is_active !== false,
        start_date || null,
        end_date || null,
        id
      ]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Promo banner not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Promo banner updated successfully'
    })
  } catch (error) {
    console.error('Error updating promo banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update promo banner' },
      { status: 500 }
    )
  }
}

// DELETE promo banner (admin only)
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
    
    const result = await query('DELETE FROM promo_banners WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Promo banner not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Promo banner deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting promo banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete promo banner' },
      { status: 500 }
    )
  }
}

