import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// GET all categories
export async function GET() {
  try {
    const categories = await query(
      'SELECT * FROM categories ORDER BY name ASC',
      []
    )
    
    return NextResponse.json({
      success: true,
      categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create new category
export async function POST(request) {
  try {
    const { name, description } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }
    
    const result = await query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      categoryId: result.insertId
    })
  } catch (error) {
    console.error('Error creating category:', error)
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'Category name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
