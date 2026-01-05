import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { verifyToken } from '@/lib/auth'

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function GET(request) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value || request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if user is admin, moderator, or reseller
    const userRole = (decoded.role || '').toUpperCase()
    if (!['ADMIN', 'MODERATOR', 'RESELLER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get current date info
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    // 1. Total Customers (role = 'CUSTOMER')
    const customersResult = await query(
      `SELECT COUNT(*) as total FROM users WHERE role = 'CUSTOMER'`
    )
    const totalCustomers = customersResult[0]?.total || 0

    // 2. Total Customers last month (for percentage calculation)
    const customersLastMonthResult = await query(
      `SELECT COUNT(*) as total FROM users 
       WHERE role = 'CUSTOMER' 
       AND MONTH(created_at) = ? AND YEAR(created_at) = ?`,
      [lastMonth, lastMonthYear]
    )
    const customersLastMonth = customersLastMonthResult[0]?.total || 0
    const customersGrowth = customersLastMonth > 0 
      ? ((totalCustomers - customersLastMonth) / customersLastMonth * 100).toFixed(2)
      : totalCustomers > 0 ? '100.00' : '0.00'

    // 3. Total Orders
    const ordersResult = await query(
      `SELECT COUNT(*) as total FROM topup_orders`
    )
    const totalOrders = ordersResult[0]?.total || 0

    // 4. Total Orders last month
    const ordersLastMonthResult = await query(
      `SELECT COUNT(*) as total FROM topup_orders 
       WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?`,
      [lastMonth, lastMonthYear]
    )
    const ordersLastMonth = ordersLastMonthResult[0]?.total || 0
    const ordersGrowth = ordersLastMonth > 0
      ? ((totalOrders - ordersLastMonth) / ordersLastMonth * 100).toFixed(2)
      : totalOrders > 0 ? '100.00' : '0.00'

    // 5. Revenue (sum of completed orders)
    const revenueResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM topup_orders WHERE status = 'completed'`
    )
    const totalRevenue = parseFloat(revenueResult[0]?.total || 0)

    // 6. Revenue this month
    const revenueThisMonthResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM topup_orders 
       WHERE status = 'completed' 
       AND MONTH(created_at) = ? AND YEAR(created_at) = ?`,
      [currentMonth, currentYear]
    )
    const revenueThisMonth = parseFloat(revenueThisMonthResult[0]?.total || 0)

    // 7. Revenue last month
    const revenueLastMonthResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM topup_orders 
       WHERE status = 'completed' 
       AND MONTH(created_at) = ? AND YEAR(created_at) = ?`,
      [lastMonth, lastMonthYear]
    )
    const revenueLastMonth = parseFloat(revenueLastMonthResult[0]?.total || 0)
    const revenueGrowth = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(2)
      : revenueThisMonth > 0 ? '100.00' : '0.00'

    // 8. Revenue today
    const revenueTodayResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM topup_orders 
       WHERE status = 'completed' 
       AND DATE(created_at) = ?`,
      [today]
    )
    const revenueToday = parseFloat(revenueTodayResult[0]?.total || 0)

    // 9. Monthly Target (default: 20,000,000 IDR or calculate from average)
    const monthlyTarget = 20000000 // 20M IDR default
    const targetPercentage = monthlyTarget > 0 
      ? ((revenueThisMonth / monthlyTarget) * 100).toFixed(2)
      : '0.00'

    // 10. Monthly Sales (last 12 months for better chart)
    const monthlySalesResult = await query(
      `SELECT 
        MONTH(created_at) as month,
        YEAR(created_at) as year,
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as order_count
       FROM topup_orders 
       WHERE status = 'completed'
       AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY YEAR(created_at), MONTH(created_at)
       ORDER BY year ASC, month ASC`
    )
    
    // Generate all months for the last 12 months
    const allMonths = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      const existingData = monthlySalesResult.find(r => r.month === month && r.year === year)
      allMonths.push({
        month,
        year,
        monthName,
        total: existingData ? parseFloat(existingData.total || 0) : 0,
        orderCount: existingData ? parseInt(existingData.order_count || 0) : 0
      })
    }
    
    const monthlySales = allMonths

    // 11. Recent Orders (last 5)
    const recentOrdersResult = await query(
      `SELECT 
        o.id,
        o.order_id,
        o.amount,
        o.status,
        o.created_at,
        g.name as game_name,
        g.image_url as game_image,
        u.name as user_name,
        u.email as user_email
       FROM topup_orders o
       LEFT JOIN games g ON o.game_id = g.id
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    )
    const recentOrders = recentOrdersResult.map(order => ({
      id: order.id,
      orderId: order.order_id,
      amount: parseFloat(order.amount || 0),
      status: order.status,
      createdAt: order.created_at,
      gameName: order.game_name,
      gameImage: order.game_image,
      userName: order.user_name,
      userEmail: order.user_email
    }))

    // 12. Orders by Status
    const ordersByStatusResult = await query(
      `SELECT status, COUNT(*) as count FROM topup_orders GROUP BY status`
    )
    const ordersByStatus = ordersByStatusResult.reduce((acc, row) => {
      acc[row.status] = row.count
      return acc
    }, {})

    const response = NextResponse.json({
      success: true,
      data: {
        customers: {
          total: totalCustomers,
          growth: parseFloat(customersGrowth),
          isPositive: parseFloat(customersGrowth) >= 0
        },
        orders: {
          total: totalOrders,
          growth: parseFloat(ordersGrowth),
          isPositive: parseFloat(ordersGrowth) >= 0
        },
        revenue: {
          total: totalRevenue,
          thisMonth: revenueThisMonth,
          today: revenueToday,
          growth: parseFloat(revenueGrowth),
          isPositive: parseFloat(revenueGrowth) >= 0
        },
        monthlyTarget: {
          target: monthlyTarget,
          current: revenueThisMonth,
          percentage: parseFloat(targetPercentage),
          growth: parseFloat(revenueGrowth)
        },
        monthlySales,
        recentOrders,
        ordersByStatus
      }
    })

    const origin = request.headers.get('origin')
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response

  } catch (error) {
    console.error('Dashboard stats error:', error)
    const origin = request.headers.get('origin')
    const response = NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
  }
}

