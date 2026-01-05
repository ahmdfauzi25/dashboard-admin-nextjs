import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'
import { addCorsHeaders, createOptionsResponse } from '@/lib/cors'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return createOptionsResponse(request)
}

// GET all promo banners (public - no auth required)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const adminView = searchParams.get('admin') === 'true'
    
    let querySql = 'SELECT * FROM promo_banners'
    
    if (!includeInactive && !adminView) {
      // Public view: only active banners within date range
      querySql += ` WHERE is_active = TRUE 
                    AND (start_date IS NULL OR start_date <= NOW())
                    AND (end_date IS NULL OR end_date >= NOW())`
    } else if (!includeInactive) {
      // Admin view: only active banners
      querySql += ' WHERE is_active = TRUE'
    }
    
    querySql += ' ORDER BY position ASC, created_at DESC'
    
    const banners = await query(querySql, [])
    
    // Format banners for frontend
    const formattedBanners = banners.map(banner => ({
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
    }))
    
    const response = NextResponse.json({
      success: true,
      banners: formattedBanners
    })
    
    // Add CORS headers
    addCorsHeaders(response, request)
    
    return response
  } catch (error) {
    console.error('Error fetching promo banners:', error)
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch promo banners' },
      { status: 500 }
    )
    addCorsHeaders(errorResponse, request)
    return errorResponse
  }
}

// POST - Create new promo banner (admin only)
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
    const { title, description, image_url, link_url, position, is_active, start_date, end_date } = body
    
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }
    
    const result = await query(
      `INSERT INTO promo_banners (title, description, image_url, link_url, position, is_active, start_date, end_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        image_url || null,
        link_url || null,
        position || 0,
        is_active !== false,
        start_date || null,
        end_date || null
      ]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Promo banner created successfully',
      bannerId: result.insertId
    })
  } catch (error) {
    console.error('Error creating promo banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create promo banner' },
      { status: 500 }
    )
  }
}

