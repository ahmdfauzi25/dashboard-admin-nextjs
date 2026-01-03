import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// GET messages between current user and another user
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

    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('user_id')

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get messages between current user and other user
    const messages = await query(
      `SELECT m.*, 
        sender.name as sender_name, 
        sender.role as sender_role,
        receiver.name as receiver_name,
        receiver.role as receiver_role
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [currentUserId, otherUserId, otherUserId, currentUserId]
    )

    // Mark messages as read
    await query(
      `UPDATE messages SET is_read = TRUE 
       WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE`,
      [currentUserId, otherUserId]
    )

    return NextResponse.json({
      success: true,
      messages,
      currentUserId
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST - Send new message
export async function POST(request) {
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
    const senderId = decoded.id || decoded.userId  // Support both 'id' and 'userId' fields

    const { receiver_id, message, image_url } = await request.json()

    if (!receiver_id || !message) {
      return NextResponse.json(
        { success: false, error: 'Receiver ID and message are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO messages (sender_id, receiver_id, message, has_image, image_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [senderId, receiver_id, message, !!image_url, image_url || null]
    )

    // Get the newly created message with user details
    const newMessage = await query(
      `SELECT m.*, 
        sender.name as sender_name, 
        sender.role as sender_role,
        receiver.name as receiver_name,
        receiver.role as receiver_role
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.id = ?`,
      [result.insertId]
    )

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage[0]
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
