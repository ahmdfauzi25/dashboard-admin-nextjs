'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

interface Order {
  id: number
  orderId: string
  gameName: string
  gameImage: string
  playerId: string
  serverId?: string
  amount: number
  paymentMethod: string
  paymentMethodName?: string
  paymentMethodLogo?: string
  paymentMethodCode?: string
  status: string
  paymentProof?: string
  paymentExpiresAt?: string
  createdAt: string
  completedAt?: string
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [uploading, setUploading] = useState(false)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [countdowns, setCountdowns] = useState<Record<number, number>>({})
  const intervalRefs = useRef<Record<number, NodeJS.Timeout>>({})

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      // Check if user is CUSTOMER
      const userRole = (user.role || '').toUpperCase()
      if (userRole !== 'CUSTOMER') {
        // Clear user and redirect to login
        router.push('/login?error=access_denied')
        return
      }
      fetchOrders()
    }
  }, [user, authLoading, router])

  // Setup countdown timers for pending orders
  useEffect(() => {
    // Clear all existing intervals first
    Object.values(intervalRefs.current).forEach(interval => clearInterval(interval))
    intervalRefs.current = {}

    // Initialize countdowns for all pending orders
    const initialCountdowns: Record<number, number> = {}
    
    orders.forEach((order) => {
      if (order.status === 'pending' && order.paymentExpiresAt) {
        const expiresAt = new Date(order.paymentExpiresAt).getTime()
        const now = new Date().getTime()
        const diff = Math.max(0, Math.floor((expiresAt - now) / 1000))
        initialCountdowns[order.id] = diff

        // Auto-fail if already expired
        if (diff === 0) {
          handleExpiredOrder(order.id)
        } else {
          // Set up interval for countdown
          const updateCountdown = () => {
            setCountdowns((prev) => {
              const expiresAt = new Date(order.paymentExpiresAt!).getTime()
              const now = new Date().getTime()
              const diff = Math.max(0, Math.floor((expiresAt - now) / 1000))
              
              // Auto-fail if expired
              if (diff === 0) {
                handleExpiredOrder(order.id)
              }
              
              return {
                ...prev,
                [order.id]: diff
              }
            })
          }

          // Set interval
          intervalRefs.current[order.id] = setInterval(updateCountdown, 1000)
        }
      }
    })

    // Set initial countdowns
    setCountdowns(initialCountdowns)

    // Cleanup on unmount
    return () => {
      Object.values(intervalRefs.current).forEach(interval => clearInterval(interval))
      intervalRefs.current = {}
    }
  }, [orders])

  const handleExpiredOrder = async (orderId: number) => {
    try {
      const { updateOrder } = await import('@/lib/api')
      await updateOrder(orderId.toString(), { status: 'failed' })
      // Refresh orders after a short delay
      setTimeout(() => {
        fetchOrders()
      }, 1000)
    } catch (err) {
      console.error('Error updating expired order:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { getOrders } = await import('@/lib/api')
      const data = await getOrders(false)
      
      if (data.success) {
        setOrders(data.orders)
      } else {
        setError(data.error || 'Failed to fetch orders')
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      setPaymentProofFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPaymentProofPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadPaymentProof = async (orderId: string) => {
    if (!paymentProofFile || !paymentProofPreview) {
      alert('Please select a payment proof image')
      return
    }

    try {
      setUploading(true)
      
      const { updateOrder } = await import('@/lib/api')
      const data = await updateOrder(orderId, {
        paymentProof: paymentProofPreview // Send as base64
      })

      if (data.success) {
        alert('Payment proof uploaded successfully! Waiting for admin verification.')
        setSelectedOrder(null)
        setPaymentProofFile(null)
        setPaymentProofPreview(null)
        fetchOrders()
      } else {
        alert(data.error || 'Failed to upload payment proof')
      }
    } catch (err: any) {
      console.error('Error uploading payment proof:', err)
      alert(err.message || 'Failed to upload payment proof')
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
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

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
        <p className="text-gray-400">View and manage your top-up orders</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No orders found</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Create New Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-[#1a1f3a] rounded-lg border border-[#2a2f4a] p-6 relative overflow-hidden ${
                order.status === 'completed' ? 'pt-20' : ''
              }`}
            >
              {/* Completed Success Animation */}
              {order.status === 'completed' && (
                <div className="absolute top-0 left-0 right-0 flex justify-center pt-4 z-10">
                  <div className="relative">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg 
                        className="w-14 h-14 text-green-400 animate-scale-in"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={4} 
                          d="M5 13l4 4L19 7"
                          style={{
                            strokeDasharray: 100,
                            strokeDashoffset: 0,
                            animation: 'checkmark 0.8s ease-in-out',
                          }}
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    {order.gameImage && (
                      <img
                        src={order.gameImage}
                        alt={order.gameName}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white">{order.gameName}</h3>
                      <p className="text-gray-400 text-sm">Order ID: {order.orderId}</p>
                    </div>
                  </div>

                  {/* Payment Method Info */}
                  {(order.paymentMethodName || order.paymentMethodCode || order.paymentMethodLogo) && (
                    <div className="mb-4 p-3 bg-[#0a0e27] rounded-lg border border-[#2a2f4a]">
                      <p className="text-sm text-gray-400 mb-2">Metode Pembayaran</p>
                      <div className="flex items-center gap-3">
                        {order.paymentMethodLogo ? (
                          <Image
                            src={order.paymentMethodLogo}
                            alt={order.paymentMethodName || order.paymentMethodCode || 'Payment Method'}
                            width={40}
                            height={40}
                            className="object-contain rounded bg-white/10 p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-orange-500/20 rounded flex items-center justify-center">
                            <span className="text-orange-400 text-xs font-bold">
                              {order.paymentMethodCode?.substring(0, 2) || 'PM'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-semibold">
                            {order.paymentMethodName || order.paymentMethodCode || order.paymentMethod || 'N/A'}
                          </p>
                          {order.paymentMethodCode && order.paymentMethodCode !== order.paymentMethodName && (
                            <p className="text-gray-400 text-xs font-mono">{order.paymentMethodCode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Countdown Timer for Pending Orders */}
                  {order.status === 'pending' && order.paymentExpiresAt && (
                    <div className={`mb-4 p-3 rounded-lg border-2 ${
                      countdowns[order.id] === 0 
                        ? 'bg-red-500/20 border-red-500' 
                        : countdowns[order.id] !== undefined && countdowns[order.id] < 300 
                        ? 'bg-orange-500/20 border-orange-500' 
                        : 'bg-blue-500/20 border-blue-500'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {countdowns[order.id] === 0 ? 'Waktu Pembayaran Habis' : 'Waktu Tersisa untuk Pembayaran'}
                          </p>
                          <p className="text-gray-300 text-xs mt-1">
                            {countdowns[order.id] === 0 
                              ? 'Order akan dibatalkan otomatis' 
                              : 'Upload bukti pembayaran sebelum waktu habis'}
                          </p>
                        </div>
                        <div className={`text-2xl font-bold font-mono ${
                          countdowns[order.id] === 0 
                            ? 'text-red-400' 
                            : countdowns[order.id] !== undefined && countdowns[order.id] < 300 
                            ? 'text-orange-400' 
                            : 'text-blue-400'
                        }`}>
                          {countdowns[order.id] !== undefined ? formatTime(countdowns[order.id]) : '--:--'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Player ID</p>
                      <p className="text-white font-semibold">{order.playerId}</p>
                    </div>
                    {order.serverId && (
                      <div>
                        <p className="text-sm text-gray-400">Server ID</p>
                        <p className="text-white font-semibold">{order.serverId}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400">Amount</p>
                      <p className="text-orange-400 font-bold">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(order.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400">
                    <p>Created: {formatDate(order.createdAt)}</p>
                    {order.completedAt && (
                      <p>Completed: {formatDate(order.completedAt)}</p>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  {order.status === 'pending' && !order.paymentProof && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Upload Proof
                    </button>
                  )}
                  {order.paymentProof && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      View Proof
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Payment Proof Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f3a] rounded-lg border border-[#2a2f4a] max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Upload Payment Proof</h2>
                <button
                  onClick={() => {
                    setSelectedOrder(null)
                    setPaymentProofFile(null)
                    setPaymentProofPreview(null)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Order ID: {selectedOrder.orderId}</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Amount: {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(selectedOrder.amount)}
                  </p>
                </div>

                {selectedOrder.paymentProof ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Current Payment Proof</label>
                    <div className="relative">
                      {(() => {
                        const proof = selectedOrder.paymentProof
                        const isBase64 = proof.startsWith('data:image/')
                        const isUrl = proof.startsWith('http://') || proof.startsWith('https://') || proof.startsWith('/')
                        
                        // Check if base64 is complete (should end with valid base64 characters or be very long)
                        const isBase64Complete = isBase64 && proof.length > 100
                        
                        if (isBase64Complete || isUrl) {
                          return (
                            <img
                              src={proof}
                              alt="Payment proof"
                              className="max-w-full h-auto rounded-lg border border-[#2a2f4a] cursor-pointer hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                console.error('Error loading payment proof image. Length:', proof.length, 'Starts with:', proof.substring(0, 50))
                                e.currentTarget.style.display = 'none'
                                const parent = e.currentTarget.parentElement
                                if (parent && !parent.querySelector('.error-message')) {
                                  const errorDiv = document.createElement('div')
                                  errorDiv.className = 'error-message p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm'
                                  errorDiv.innerHTML = `
                                    <p class="font-semibold mb-1">⚠️ Gagal memuat gambar</p>
                                    <p class="text-xs mb-2">Panjang data: ${proof.length} karakter</p>
                                    <p class="text-xs">Data mungkin terpotong. Silakan hubungi admin atau upload ulang.</p>
                                  `
                                  parent.appendChild(errorDiv)
                                }
                              }}
                              onLoad={() => {
                                console.log('Payment proof image loaded successfully. Length:', proof.length)
                              }}
                              onClick={() => {
                                if (isBase64) {
                                  // For base64, create a new window with the image
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
                            <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-300 text-sm">
                              <p className="font-semibold mb-1">⚠️ Data gambar tidak lengkap</p>
                              <p className="text-xs mb-2">Panjang data: {proof.length} karakter (terlalu pendek untuk gambar)</p>
                              <p className="text-xs">Data mungkin terpotong saat disimpan. Silakan upload ulang bukti pembayaran.</p>
                            </div>
                          )
                        }
                      })()}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Select Payment Proof Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full px-4 py-2 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Max size: 5MB, Image files only</p>
                    </div>

                    {paymentProofPreview && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Preview</label>
                        <img
                          src={paymentProofPreview}
                          alt="Preview"
                          className="max-w-full h-auto rounded-lg border border-[#2a2f4a]"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleUploadPaymentProof(selectedOrder.id.toString())}
                      disabled={!paymentProofFile || uploading}
                      className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Uploading...' : 'Upload Payment Proof'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

