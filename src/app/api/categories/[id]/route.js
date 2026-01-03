import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// GET single category
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const categories = await query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    )
    
    if (categories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      category: categories[0]
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT - Update category
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const { name, description } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }
    
    const result = await query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category updated successfully'
    })
  } catch (error) {
    console.error('Error updating category:', error)
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'Category name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE category
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    const result = await query(
      'DELETE FROM categories WHERE id = ?',
      [id]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
