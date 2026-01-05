'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

export default function OrdersPage() {
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, page])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const statusParam = statusFilter !== 'all' ? statusFilter : undefined
      const url = `/api/orders?admin=true&page=${page}&limit=20${statusParam ? `&status=${statusParam}` : ''}`
      console.log('Fetching orders from:', url)
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('Orders API response status:', response.status)
      
      const data = await response.json()
      console.log('Orders API response data:', data)
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to fetch orders`)
      }
      
      if (data.success) {
        setOrders(data.orders || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setError(data.error || 'Failed to fetch orders')
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message || 'Failed to fetch orders. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          notes: notes || undefined
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to update order`)
      }

      if (data.success) {
        alert('Order status updated successfully')
        setSelectedOrder(null)
        setNotes('')
        fetchOrders()
      } else {
        alert(data.error || 'Failed to update order')
      }
    } catch (err) {
      console.error('Error updating order:', err)
      alert(err.message || 'Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500'
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500'
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500'
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500'
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-300 border-gray-500'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border mb-6`}>
          <div className={`p-6 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Orders Management
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Manage and verify customer top-up orders
            </p>
          </div>

          {/* Filters */}
          <div className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex gap-4 items-center">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filter by Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-violet-500`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className={`mb-4 p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-red-900/30 border-red-700 text-red-200' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-12`}>
            <div className="flex justify-center items-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-violet-500' : 'border-violet-600'}`}></div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-12`}>
            <div className="text-center">
              <p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>No orders found</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Order ID</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Customer</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Game</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Player ID</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment Proof</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Created</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                    {orders.map((order) => (
                      <tr key={order.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.orderId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.userName}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{order.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {order.gameImage && (
                              <img
                                src={order.gameImage}
                                alt={order.gameName}
                                className="w-8 h-8 rounded object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            )}
                            <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.gameName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.playerId}</div>
                          {order.serverId && (
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Server: {order.serverId}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(order.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.paymentProof ? (
                            <button
                              onClick={() => {
                                setSelectedOrder(order)
                              }}
                              className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                              View Proof
                            </button>
                          ) : (
                            <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No proof</span>
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className={`text-sm ${isDarkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'}`}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`mt-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-4`}>
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    Previous
                  </button>
                  <span className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Details</h2>
                <button
                  onClick={() => {
                    setSelectedOrder(null)
                    setNotes('')
                  }}
                  className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Order ID</label>
                  <p className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedOrder.orderId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Customer</label>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.userName}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedOrder.userEmail}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Game</label>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.gameName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Player ID</label>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.playerId}</p>
                  </div>
                  {selectedOrder.serverId && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Server ID</label>
                      <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.serverId}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Amount</label>
                  <p className={`font-bold text-xl ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(selectedOrder.amount)}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Payment Method</label>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.paymentMethodName || selectedOrder.paymentMethod}</p>
                </div>

                {selectedOrder.paymentProof && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Payment Proof</label>
                    <div className="relative">
                      {(() => {
                        const proof = selectedOrder.paymentProof
                        const isBase64 = proof.startsWith('data:image/')
                        const isUrl = proof.startsWith('http://') || proof.startsWith('https://') || proof.startsWith('/')
                        const isBase64Complete = isBase64 && proof.length > 100
                        
                        if (isBase64Complete || isUrl) {
                          return (
                            <img
                              src={proof}
                              alt="Payment proof"
                              className={`max-w-full h-auto rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} cursor-pointer hover:opacity-90 transition-opacity`}
                              onError={(e) => {
                                console.error('Error loading payment proof image. Length:', proof.length)
                                e.currentTarget.style.display = 'none'
                                const parent = e.currentTarget.parentElement
                                if (parent && !parent.querySelector('.error-message')) {
                                  const errorDiv = document.createElement('div')
                                  errorDiv.className = `error-message p-4 rounded-lg border text-sm ${
                                    isDarkMode 
                                      ? 'bg-red-900/30 border-red-700 text-red-200' 
                                      : 'bg-red-50 border-red-200 text-red-700'
                                  }`
                                  errorDiv.innerHTML = `
                                    <p class="font-semibold mb-1">⚠️ Gagal memuat gambar</p>
                                    <p class="text-xs mb-2">Panjang data: ${proof.length} karakter</p>
                                    <p class="text-xs">Data mungkin terpotong. Silakan cek database atau minta customer upload ulang.</p>
                                  `
                                  parent.appendChild(errorDiv)
                                }
                              }}
                              onLoad={() => {
                                console.log('Payment proof image loaded successfully. Length:', proof.length)
                              }}
                              onClick={() => {
                                if (isBase64) {
                                  const newWindow = window.open()
                                  if (newWindow) {
                                    newWindow.document.write(`<img src="${proof}" style="max-width: 100%; height: auto;" />`)
                                  }
                                } else {
                                  window.open(proof, '_blank')
                                }
                              }}
                            />
                          )
                        } else {
                          return (
                            <div className={`p-4 rounded-lg border text-sm ${
                              isDarkMode 
                                ? 'bg-yellow-900/30 border-yellow-700 text-yellow-200' 
                                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                            }`}>
                              <p className="font-semibold mb-1">⚠️ Data gambar tidak lengkap</p>
                              <p className="text-xs mb-2">Panjang data: {proof.length} karakter (terlalu pendek)</p>
                              <p className="text-xs">Column payment_proof mungkin perlu diubah ke LONGTEXT. Jalankan: fix_payment_proof_column.sql</p>
                            </div>
                          )
                        }
                      })()}
                    </div>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Klik gambar untuk membuka di tab baru
                    </p>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Status</label>
                  <span className={`px-3 py-1 text-sm font-semibold rounded border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Notes</label>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedOrder.notes}</p>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Admin Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                    placeholder="Add notes for this order..."
                    rows={3}
                  />
                </div>

                <div className={`flex gap-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {selectedOrder.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Mark as Completed'}
                    </button>
                  )}
                  {selectedOrder.status !== 'processing' && selectedOrder.paymentProof && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Mark as Processing'}
                    </button>
                  )}
                  {selectedOrder.status !== 'failed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'failed')}
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Mark as Failed'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

