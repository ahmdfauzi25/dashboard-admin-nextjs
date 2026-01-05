import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(request) {
  try {
    // Fetch all users from database
    const users = await query(
      'SELECT id, name, email, role, avatar FROM users WHERE role = "ADMIN" OR role = "RESELLER" ORDER BY id DESC',
      []
    )

    // Format the data to match frontend expectations
    const formattedUsers = users.map((user, index) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'User',
      avatar: user.avatar ? `data:image/png;base64,${user.avatar.toString('base64')}` : null,
      position: user.role || 'User',
      office: 'HQ',
      age: Math.floor(Math.random() * 40) + 20, // Random age for demo
      startDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      salary: '$' + (Math.floor(Math.random() * 100) + 50) + ',000'
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch users',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
