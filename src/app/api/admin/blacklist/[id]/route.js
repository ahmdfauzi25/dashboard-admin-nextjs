import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'

// DELETE from blacklist
export async function DELETE(request, { params }) {
  try {
    const auth = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID required' },
        { status: 400 }
      )
    }

    await query(
      `DELETE FROM blacklist WHERE id = ?`,
      [id]
    )

    return NextResponse.json({
      success: true,
      message: 'Removed from blacklist'
    })
  } catch (error) {
    console.error('Delete blacklist error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete from blacklist' },
      { status: 500 }
    )
  }
}
