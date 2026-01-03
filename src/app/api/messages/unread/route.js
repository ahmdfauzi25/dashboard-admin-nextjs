import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/mysql'

export async function GET(request) {
  try {
    // Verify token from cookie
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    const currentUserId = decoded.id || decoded.userId
    const currentUserRole = decoded.role

    // Get unread message count and latest message from each sender
    let unreadMessagesQuery

    if (currentUserRole === 'ADMIN') {
      // Admin sees messages from resellers
      unreadMessagesQuery = `
        SELECT 
          m.sender_id,
          u.name as sender_name,
          u.avatar,
          COUNT(*) as unread_count,
          MAX(m.created_at) as last_message_time,
          (
            SELECT message 
            FROM messages 
            WHERE sender_id = m.sender_id AND receiver_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_message
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = ? 
          AND m.is_read = 0
          AND u.role = 'RESELLER'
        GROUP BY m.sender_id, u.name, u.avatar
        ORDER BY last_message_time DESC
      `
    } else {
      // Reseller sees messages from admin
      unreadMessagesQuery = `
        SELECT 
          m.sender_id,
          u.name as sender_name,
          u.avatar,
          COUNT(*) as unread_count,
          MAX(m.created_at) as last_message_time,
          (
            SELECT message 
            FROM messages 
            WHERE sender_id = m.sender_id AND receiver_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_message
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = ? 
          AND m.is_read = 0
          AND u.role = 'ADMIN'
        GROUP BY m.sender_id, u.name, u.avatar
        ORDER BY last_message_time DESC
      `
    }

    const unreadMessages = await query(unreadMessagesQuery, [currentUserId, currentUserId])

    // Convert avatar buffer to base64
    const messagesWithAvatar = unreadMessages.map(msg => ({
      ...msg,
      avatarBase64: msg.avatar && Buffer.isBuffer(msg.avatar) 
        ? msg.avatar.toString('base64') 
        : null
    }))

    // Calculate total unread count
    const totalUnread = messagesWithAvatar.reduce((sum, msg) => sum + msg.unread_count, 0)

    return NextResponse.json({
      success: true,
      totalUnread,
      messages: messagesWithAvatar
    })

  } catch (error) {
    console.error('Error fetching unread messages:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}
