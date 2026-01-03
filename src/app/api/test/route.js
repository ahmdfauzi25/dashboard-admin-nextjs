import { NextResponse } from 'next/server'
import { testConnection, query } from '@/lib/mysql'

export async function GET(request) {
  try {
    // Test database connection
    await testConnection()
    
    // Test query
    const [users] = await query('SELECT COUNT(*) as count FROM users')
    const userCount = users[0].count
    
    return NextResponse.json({
      status: 'ok',
      message: 'Backend is working',
      database: 'connected',
      userCount: userCount
    })
  } catch (error) {
    console.error('Test error:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    
    // Generic error handling
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error?.message || 'Internal server error')
      : 'Internal server error. Please check server logs for details.'

    return NextResponse.json(
      { 
        status: 'error',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          code: error?.code,
          details: error?.stack 
        })
      },
      { status: 500 }
    )
  }
}

