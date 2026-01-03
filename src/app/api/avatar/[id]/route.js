import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Fetch user avatar
    const users = await query('SELECT avatar FROM users WHERE id = ?', [id])
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0]
    
    if (!user.avatar) {
      // Return default avatar URL if no avatar is stored
      return NextResponse.json({
        avatar: '/img/user.svg',
        isDefault: true
      })
    }

    // Convert buffer to base64
    const base64Avatar = user.avatar.toString('base64')
    
    return NextResponse.json({
      avatar: `data:image/png;base64,${base64Avatar}`,
      isDefault: false
    })
  } catch (error) {
    console.error('Get avatar error:', error)
    
    return NextResponse.json(
      { error: 'Failed to retrieve avatar' },
      { status: 500 }
    )
  }
}
