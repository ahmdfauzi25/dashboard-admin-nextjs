import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// GET list of users with last message and unread count
export async function GET(request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET)
    const currentUserId = decoded.id || decoded.userId  // Support both 'id' and 'userId' fields
    const currentUserRole = decoded.role

    console.log('Current User ID:', currentUserId)
    console.log('Current User Role:', currentUserRole)

    // Get users to chat with
    // If admin: get all resellers
    // If reseller: get all admins
    let whereClause = ''
    const roleUpper = (currentUserRole || '').toUpperCase()
    
    if (roleUpper === 'ADMIN') {
      whereClause = "WHERE UPPER(u.role) = 'RESELLER'"
    } else if (roleUpper === 'RESELLER') {
      whereClause = "WHERE UPPER(u.role) = 'ADMIN'"
    } else {
      // Fallback untuk role lain
      whereClause = "WHERE UPPER(u.role) IN ('ADMIN', 'RESELLER')"
    }

    console.log('SQL WHERE Clause:', whereClause)

    const users = await query(
      `SELECT 
        u.id,
        u.name,
        u.role,
        u.avatar,
        (SELECT COUNT(*) 
         FROM messages 
         WHERE sender_id = u.id 
           AND receiver_id = ? 
           AND is_read = FALSE) as unread_count,
        (SELECT message 
         FROM messages 
         WHERE (sender_id = u.id AND receiver_id = ?) 
            OR (sender_id = ? AND receiver_id = u.id)
         ORDER BY created_at DESC 
         LIMIT 1) as last_message,
        (SELECT created_at 
         FROM messages 
         WHERE (sender_id = u.id AND receiver_id = ?) 
            OR (sender_id = ? AND receiver_id = u.id)
         ORDER BY created_at DESC 
         LIMIT 1) as last_message_time
       FROM users u
       ${whereClause}
       ORDER BY last_message_time DESC, u.name ASC`,
      [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId]
    )

    // Convert avatar buffers to base64
    const usersWithAvatars = users.map(u => ({
      ...u,
      avatarBase64: u.avatar && Buffer.isBuffer(u.avatar) ? u.avatar.toString('base64') : null,
      avatar: undefined // Remove buffer from response
    }))

    console.log('Found users:', usersWithAvatars.length)
    console.log('Users data:', usersWithAvatars)

    return NextResponse.json({
      success: true,
      users: usersWithAvatars,
      currentUserId,
      currentUserRole
    })
  } catch (error) {
    console.error('Error fetching chat users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
