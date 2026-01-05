import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { apiAuthMiddleware } from '@/lib/auth-middleware'

// GET all OTP templates
export async function GET(request) {
  try {
    const auth = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode }
      )
    }

    const templates = await query(
      `SELECT id, channel, template_text, created_at, updated_at FROM otp_templates ORDER BY channel`
    )

    return NextResponse.json({
      success: true,
      templates: templates
    })
  } catch (error) {
    console.error('Fetch templates error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// UPDATE OTP template
export async function PUT(request) {
  try {
    const auth = await apiAuthMiddleware(request, ['ADMIN', 'admin'])
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode }
      )
    }

    const { id, template_text } = await request.json()

    if (!id || !template_text) {
      return NextResponse.json(
        { success: false, error: 'ID and template text required' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE otp_templates SET template_text = ?, updated_at = NOW() WHERE id = ?`,
      [template_text, id]
    )

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully'
    })
  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    )
  }
}
