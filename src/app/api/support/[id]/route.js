import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// GET single ticket with replies
export async function GET(request, { params }) {
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
    const ticketId = params.id

    // Get ticket with user details
    const tickets = await query(
      `SELECT st.*, u.name as user_name, u.email as user_email, u.role as user_role
       FROM support_tickets st
       JOIN users u ON st.user_id = u.id
       WHERE st.id = ?`,
      [ticketId]
    )

    if (tickets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const ticket = tickets[0]

    // Check permission: admin can view all, users only their own
    if (userRole !== 'ADMIN' && ticket.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get replies
    const replies = await query(
      `SELECT sr.*, u.name as admin_name, u.role as admin_role
       FROM support_replies sr
       JOIN users u ON sr.admin_id = u.id
       WHERE sr.ticket_id = ?
       ORDER BY sr.created_at ASC`,
      [ticketId]
    )

    return NextResponse.json({
      success: true,
      ticket,
      replies
    })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}

// PUT - Update ticket status or add reply
export async function PUT(request, { params }) {
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
    const ticketId = params.id

    const { status, admin_response, reply_message } = await request.json()

    // Only admin can update status or reply
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only admins can update tickets' },
        { status: 403 }
      )
    }

    // Update ticket status if provided
    if (status) {
      await query(
        `UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?`,
        [status, ticketId]
      )
    }

    // Add admin response to ticket
    if (admin_response) {
      await query(
        `UPDATE support_tickets SET admin_response = ?, updated_at = NOW() WHERE id = ?`,
        [admin_response, ticketId]
      )
    }

    // Add reply message to replies table
    if (reply_message) {
      await query(
        `INSERT INTO support_replies (ticket_id, admin_id, message) VALUES (?, ?, ?)`,
        [ticketId, userId, reply_message]
      )

      // Update ticket status to in_progress if it's still open
      await query(
        `UPDATE support_tickets 
         SET status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END,
             updated_at = NOW()
         WHERE id = ?`,
        [ticketId]
      )
    }

    // Get updated ticket
    const updatedTicket = await query(
      `SELECT st.*, u.name as user_name, u.email as user_email 
       FROM support_tickets st
       JOIN users u ON st.user_id = u.id
       WHERE st.id = ?`,
      [ticketId]
    )

    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket: updatedTicket[0]
    })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}
