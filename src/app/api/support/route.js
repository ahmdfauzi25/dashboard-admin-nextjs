import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// GET support tickets
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
    const userId = decoded.id || decoded.userId
    const userRole = decoded.role

    let tickets

    // Admin can see all tickets, users can only see their own
    if (userRole === 'ADMIN') {
      tickets = await query(
        `SELECT st.*, u.name as user_name, u.email as user_email 
         FROM support_tickets st
         JOIN users u ON st.user_id = u.id
         ORDER BY st.created_at DESC`
      )
    } else {
      tickets = await query(
        `SELECT st.*, u.name as user_name, u.email as user_email 
         FROM support_tickets st
         JOIN users u ON st.user_id = u.id
         WHERE st.user_id = ?
         ORDER BY st.created_at DESC`,
        [userId]
      )
    }

    return NextResponse.json({
      success: true,
      tickets
    })
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

// POST new support ticket
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
    const userId = decoded.id || decoded.userId

    const { name, email, subject, message, priority } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO support_tickets (user_id, name, email, subject, message, priority) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, email, subject, message, priority || 'medium']
    )

    const newTicket = await query(
      `SELECT st.*, u.name as user_name, u.email as user_email 
       FROM support_tickets st
       JOIN users u ON st.user_id = u.id
       WHERE st.id = ?`,
      [result.insertId]
    )

    return NextResponse.json({
      success: true,
      message: 'Support ticket submitted successfully',
      ticket: newTicket[0]
    })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}
