import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { hashPassword } from '@/lib/auth'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, email, password, role } = body

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user exists
    const users = await query('SELECT id FROM users WHERE id = ?', [id])
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    const existingEmails = await query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email.toLowerCase(), id]
    )
    if (existingEmails.length > 0) {
      return NextResponse.json(
        { error: 'Email is already in use by another user' },
        { status: 409 }
      )
    }

    // Build update query
    let updateQuery = 'UPDATE users SET name = ?, email = ?, role = ?'
    let updateParams = [name, email.toLowerCase(), role || 'USER']

    // Add password if provided
    if (password) {
      const hashedPassword = await hashPassword(password)
      updateQuery += ', password = ?'
      updateParams.push(hashedPassword)
    }

    updateQuery += ' WHERE id = ?'
    updateParams.push(id)

    // Update user
    await query(updateQuery, updateParams)

    // Fetch updated user
    const updatedUsers = await query(
      'SELECT id, email, name, role, createdAt, updatedAt FROM users WHERE id = ?',
      [id]
    )
    const updatedUser = updatedUsers.length > 0 ? updatedUsers[0] : null

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated user data' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update user error:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)

    if (error && String(error.code || '').startsWith('ER_')) {
      const dbErrorMessage = error.message || 'Unknown database error.'
      return NextResponse.json(
        { error: `Database error: ${dbErrorMessage}` },
        { status: 500 }
      )
    }

    const errorMessage = process.env.NODE_ENV === 'development'
      ? (error?.message || 'Internal server error')
      : 'Internal server error. Please check server logs for details.'

    return NextResponse.json(
      {
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          code: error?.code,
          details: error?.stack
        })
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const users = await query('SELECT id FROM users WHERE id = ?', [id])
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user
    await query('DELETE FROM users WHERE id = ?', [id])

    return NextResponse.json(
      {
        message: 'User deleted successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete user error:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)

    if (error && String(error.code || '').startsWith('ER_')) {
      const dbErrorMessage = error.message || 'Unknown database error.'
      return NextResponse.json(
        { error: `Database error: ${dbErrorMessage}` },
        { status: 500 }
      )
    }

    const errorMessage = process.env.NODE_ENV === 'development'
      ? (error?.message || 'Internal server error')
      : 'Internal server error. Please check server logs for details.'

    return NextResponse.json(
      {
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          code: error?.code,
          details: error?.stack
        })
      },
      { status: 500 }
    )
  }
}
