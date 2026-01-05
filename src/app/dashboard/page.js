'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('monthly')

  useEffect(() => {
    fetchStats()
    // Real-time update every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setError(null)
      
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login')
          return
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch stats`)
      }

      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
        setLoading(false)
      } else {
        setError(data.error || 'Failed to fetch stats')
        setLoading(false)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err.message || 'Failed to fetch dashboard statistics')
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}K`
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // Prepare chart data
  const monthlySalesData = stats.monthlySales?.map(item => ({
    name: item.monthName,
    sales: item.total / 1000, // Convert to thousands for better display
    orders: item.orderCount || 0
  })) || []

  const statisticsData = stats.monthlySales?.map((item, index) => ({
    name: item.monthName,
    target: stats.monthlyTarget.target / 1000 / 12, // Monthly target
    revenue: item.total / 1000,
    month: index + 1
  })) || []

  return (
    <div className="p-6">
      {/* Top Row - KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Customers Card */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex flex-col">
            {/* Icon in light grey rounded square */}
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-1.5">
              <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            {/* Label */}
            <p className="text-sm text-gray-600 mb-1">Customers</p>
            {/* Value and Badge */}
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-bold text-gray-800">{formatNumber(stats.customers.total)}</h3>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                stats.customers.isPositive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {stats.customers.isPositive ? (
                  <svg className="h-2.5 w-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                  </svg>
                ) : (
                  <svg className="h-2.5 w-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                )}
                {Math.abs(stats.customers.growth).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex flex-col">
            {/* Icon in light grey rounded square */}
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-1.5">
              <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            {/* Label */}
            <p className="text-sm text-gray-600 mb-1">Orders</p>
            {/* Value and Badge */}
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-bold text-gray-800">{formatNumber(stats.orders.total)}</h3>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                stats.orders.isPositive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {stats.orders.isPositive ? (
                  <svg className="h-2.5 w-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                  </svg>
                ) : (
                  <svg className="h-2.5 w-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                )}
                {Math.abs(stats.orders.growth).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Target Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <svg className="w-32 h-32 text-violet-600 mb-4" fill="none" viewBox="0 0 36 36" stroke="currentColor" strokeWidth="2" style={{transform: 'rotate(-90deg)'}}>
            <path strokeLinecap="round" strokeLinejoin="round" className="text-gray-200" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-violet-600" 
              strokeDasharray={`${Math.min(stats.monthlyTarget.percentage, 100)}, 100`} 
              d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" 
            />
            <text 
              x="50%" 
              y="50%" 
              textAnchor="middle" 
              alignmentBaseline="middle" 
              className="text-xl font-bold text-gray-800" 
              fill="currentColor" 
              style={{transform: 'rotate(90deg) translate(-50%, -50%)', transformOrigin: 'center'}}
            >
              {Math.min(stats.monthlyTarget.percentage, 100).toFixed(1)}%
            </text>
          </svg>
          <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-full ${
            stats.revenue.growth >= 0 
              ? 'text-green-600 bg-green-100' 
              : 'text-red-600 bg-red-100'
          }`}>
            {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth.toFixed(1)}%
          </span>
          
          <h2 className="text-md font-semibold text-gray-700 mb-2 mt-4">Monthly Target</h2>
          <p className="text-xs text-gray-500 mb-1">Target you've set for each month</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.revenue.today > 0 
              ? `You earn ${formatCurrency(stats.revenue.today)} today${stats.revenue.growth > 0 ? ', it\'s higher than last month.' : '.'}`
              : 'No revenue today yet.'}
          </p>
          <p className="text-sm text-gray-500">Keep up your good work!</p>
          
          <div className="flex justify-around w-full mt-6 text-sm border-t border-gray-200 pt-4">
            <div className="flex flex-col items-center">
              <p className="text-gray-500 text-xs">Target</p>
              <p className="font-bold text-gray-800 flex items-center text-sm">
                {formatCurrency(stats.monthlyTarget.target)}
                <svg className="h-4 w-4 text-red-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-500 text-xs">Revenue</p>
              <p className="font-bold text-gray-800 flex items-center text-sm">
                {formatCurrency(stats.monthlyTarget.current)}
                {stats.revenue.growth >= 0 ? (
                  <svg className="h-4 w-4 text-green-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-red-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                )}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-500 text-xs">Today</p>
              <p className="font-bold text-gray-800 flex items-center text-sm">
                {formatCurrency(stats.revenue.today)}
                {stats.revenue.today > 0 ? (
                  <svg className="h-4 w-4 text-green-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
                  </svg>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Monthly Sales</h2>
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
            </svg>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => `${value}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => formatCurrency(value * 1000)}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistics Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Statistics</h2>
              <p className="text-xs text-gray-500 mt-1">Target you've set for each month</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 text-sm rounded-md font-medium ${
                  timeRange === 'monthly' 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setTimeRange('quarterly')}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === 'quarterly' 
                    ? 'bg-gray-100 text-gray-700 font-medium hover:bg-gray-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Quarterly
              </button>
              <button 
                onClick={() => setTimeRange('annually')}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === 'annually' 
                    ? 'bg-gray-100 text-gray-700 font-medium hover:bg-gray-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Annually
              </button>
              <button className="px-3 py-1 text-sm rounded-md flex items-center text-gray-600 hover:bg-gray-100">
                <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M7 12h.01M7 15h.01M7 18h.01M11 12h.01M11 15h.01M11 18h.01M15 12h.01M15 15h.01M15 18h.01M17 12h.01M17 15h.01M17 18h.01M3 8v13a2 2 0 002 2h14a2 2 0 002-2V8M4 7h16a1 1 0 011 1v0a1 1 0 01-1 1H4a1 1 0 01-1-1v0a1 1 0 011-1z"/>
                </svg>
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statisticsData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => `${value}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => formatCurrency(value * 1000)}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorTarget)"
                  name="Target"
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row - Customer Demographics and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customers Demographic */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Customers Demographic</h2>
              <p className="text-xs text-gray-500 mt-1">Number of customer based on country</p>
            </div>
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
            </svg>
          </div>
          <div className="h-64 bg-gray-50 rounded-md p-4 flex items-center justify-center mb-6">
            <div className="text-center">
              <svg className="w-32 h-32 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 mt-2">World Map Placeholder</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="https://flagcdn.com/us.svg" alt="US Flag" className="h-5 w-8 rounded-sm" />
                <span className="text-gray-700 font-medium">USA</span>
                <span className="text-sm text-gray-500">{formatNumber(Math.floor(stats.customers.total * 0.79))} Customers</span>
              </div>
              <span className="text-gray-700 font-medium">79%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '79%'}}></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                <img src="https://flagcdn.com/fr.svg" alt="FR Flag" className="h-5 w-8 rounded-sm" />
                <span className="text-gray-700 font-medium">France</span>
                <span className="text-sm text-gray-500">{formatNumber(Math.floor(stats.customers.total * 0.23))} Customers</span>
              </div>
              <span className="text-gray-700 font-medium">23%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{width: '23%'}}></div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Recent Orders</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 flex items-center">
                <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM10 9l3 3m0 0l-3 3m3-3H5m11 4h2l2-2m0 0l-2-2h-2m-3-4V3m-9 8h.01M7 12h.01M7 15h.01M7 18h.01M11 12h.01M11 15h.01M11 18h.01M15 12h.01M15 15h.01M15 18h.01M17 12h.01M17 15h.01M17 18h.01M3 8v13a2 2 0 002 2h14a2 2 0 002-2V8M4 7h16a1 1 0 011 1v0a1 1 0 01-1 1H4a1 1 0 01-1-1v0a1 1 0 011-1z"/>
                </svg>
                Filter
              </button>
              <button 
                onClick={() => router.push('/dashboard/orders')}
                className="px-3 py-1 text-sm rounded-md bg-violet-600 text-white font-medium hover:bg-violet-700"
              >
                See all
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game / Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => {
                    const statusColors = {
                      completed: 'bg-green-100 text-green-800',
                      pending: 'bg-yellow-100 text-yellow-800',
                      processing: 'bg-blue-100 text-blue-800',
                      failed: 'bg-red-100 text-red-800',
                      cancelled: 'bg-gray-100 text-gray-800'
                    }
                    return (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {order.gameImage ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={order.gameImage} alt={order.gameName} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">{order.gameName?.charAt(0) || '?'}</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{order.gameName || 'Unknown Game'}</div>
                              <div className="text-sm text-gray-500">{order.userName || order.userEmail || 'Unknown User'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(order.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status] || statusColors.pending}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
