'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getOrderById, updateOrder } from '@/lib/api'
import Image from 'next/image'


interface Order {
  id: number
  orderId: string
  gameName: string
  gameImage?: string
  playerId: string
  amount: number
  paymentMethodName?: string
  paymentMethodLogo?: string
  paymentMethodAccountNumber?: string
  paymentMethodAccountName?: string
  paymentMethodQrCodeUrl?: string
  paymentMethodInstructions?: string
  paymentExpiresAt?: string
  status: string
  paymentProof?: string
}

export default function PaymentInstructionPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const orderId = params?.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
          
          if (orderId) {
            fetchOrder()
          }
        }
      }, [orderId, user, authLoading, router])

  useEffect(() => {
    if (order?.paymentExpiresAt) {
      updateCountdown()
      intervalRef.current = setInterval(updateCountdown, 1000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [order?.paymentExpiresAt])

  const updateCountdown = () => {
    if (!order?.paymentExpiresAt) return

    const expiresAt = new Date(order.paymentExpiresAt).getTime()
    const now = new Date().getTime()
    const diff = Math.max(0, Math.floor((expiresAt - now) / 1000))

    setTimeLeft(diff)

    if (diff === 0 && order.status === 'pending') {
      // Auto-fail order if expired
      handleTimeout()
    }
  }

  const handleTimeout = async () => {
    try {
      await updateOrder(order!.id, { status: 'failed' })
      setError('Waktu pembayaran telah habis. Order dibatalkan.')
      setTimeout(() => {
        router.push('/orders')
      }, 3000)
    } catch (err) {
      console.error('Error updating order status:', err)
    }
  }

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getOrderById(orderId)
      
      if (!response.success || !response.order) {
        setError(response.error || 'Order tidak ditemukan')
        return
      }

      const orderData = response.order
      
      // Check if order is expired
      if (orderData.paymentExpiresAt) {
        const expiresAt = new Date(orderData.paymentExpiresAt).getTime()
        const now = new Date().getTime()
        if (expiresAt < now && orderData.status === 'pending') {
          // Auto-fail expired orders
          await updateOrder(orderData.id, { status: 'failed' })
          setError('Waktu pembayaran telah habis. Order dibatalkan.')
          setTimeout(() => {
            router.push('/orders')
          }, 3000)
          return
        }
      }

      setOrder(orderData)
      updateCountdown()
    } catch (err: any) {
      console.error('Error fetching order:', err)
      setError(err.message || 'Gagal memuat data order')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB')
        return
      }
      setPaymentProofFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadProof = async () => {
    if (!order || !paymentProofFile) {
      setError('Silakan pilih file bukti pembayaran terlebih dahulu')
      return
    }

    try {
      setUploading(true)
      setError(null)

      const reader = new FileReader()
      reader.readAsDataURL(paymentProofFile)
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string
          const response = await updateOrder(order.id.toString(), { paymentProof: base64Image })

          if (response.success) {
            setUploadSuccess(true)
            setOrder({ ...order, status: 'processing', paymentProof: base64Image })
            setPaymentProofPreview(null)
            setPaymentProofFile(null)
            // Show success message
            setTimeout(() => {
              router.push('/orders')
            }, 2000)
          } else {
            setError(response.error || 'Gagal upload bukti pembayaran')
          }
        } catch (uploadErr: any) {
          console.error('Error uploading payment proof:', uploadErr)
          setError(uploadErr.response?.data?.error || uploadErr.message || 'Gagal upload bukti pembayaran')
        }
      }
      reader.onerror = () => {
        setError('Gagal membaca file. Silakan coba lagi.')
        setUploading(false)
      }
    } catch (err: any) {
      console.error('Error uploading payment proof:', err)
      setError(err.message || 'Gagal upload bukti pembayaran')
      setUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => router.push('/orders')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Kembali ke Daftar Order
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const isExpired = timeLeft === 0 && order.status === 'pending'
  const isPending = order.status === 'pending'
  const isCompleted = order.status === 'completed'
  const hasPaymentProof = order.paymentProof || paymentProofPreview

  return (
    <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-[#1a1f3a] rounded-lg shadow-xl border border-[#2a2f4a] p-6 md:p-8">
          {/* Completed Success Animation */}
          {isCompleted && (
            <div className="mb-6 flex flex-col items-center justify-center py-4">
              <div className="relative">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-16 h-16 text-green-400 animate-scale-in"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{
                      strokeDasharray: 100,
                      strokeDashoffset: 0,
                    }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={4} 
                      d="M5 13l4 4L19 7"
                      style={{
                        animation: 'checkmark 0.8s ease-in-out',
                      }}
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
              </div>
              <h2 className="text-2xl font-bold text-green-400 mt-4 animate-fade-in">Order Berhasil Diselesaikan!</h2>
              <p className="text-gray-400 text-sm mt-2 animate-fade-in">Pembayaran Anda telah diverifikasi dan diproses</p>
            </div>
          )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Instruksi Pembayaran</h1>
          <p className="text-gray-400">Order ID: <span className="text-orange-400 font-mono">{order.orderId}</span></p>
        </div>

        {/* Countdown Timer */}
        {isPending && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${isExpired ? 'bg-red-500/20 border-red-500' : 'bg-orange-500/20 border-orange-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">
                  {isExpired ? 'Waktu Pembayaran Habis' : 'Waktu Tersisa untuk Pembayaran'}
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  {isExpired ? 'Order akan dibatalkan otomatis' : 'Upload bukti pembayaran sebelum waktu habis'}
                </p>
              </div>
              <div className={`text-4xl font-bold font-mono ${isExpired ? 'text-red-400' : 'text-orange-400'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-[#0a0e27] rounded-lg p-6 mb-6 border border-[#2a2f4a]">
          <h2 className="text-xl font-bold text-white mb-4">Detail Order</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p className="text-gray-400 text-sm">Game</p>
              <p className="text-white font-semibold">{order.gameName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Player ID</p>
              <p className="text-white font-mono">{order.playerId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Pembayaran</p>
              <p className="text-orange-400 font-bold text-xl">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.amount)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                order.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Info */}
        {order.paymentMethodName && (
          <div className="bg-[#0a0e27] rounded-lg p-6 mb-6 border border-[#2a2f4a]">
            <h2 className="text-xl font-bold text-white mb-4">Informasi Pembayaran</h2>
            
            {order.paymentMethodLogo && (
              <div className="mb-4">
                <Image
                  src={order.paymentMethodLogo}
                  alt={order.paymentMethodName}
                  width={100}
                  height={50}
                  className="object-contain"
                />
              </div>
            )}

            <div className="space-y-4">
              {order.paymentMethodAccountNumber && (
                <div className="bg-[#1a1f3a] p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Nomor Rekening / E-Wallet</p>
                  <p className="text-white font-mono text-xl font-bold">{order.paymentMethodAccountNumber}</p>
                </div>
              )}

              {order.paymentMethodAccountName && (
                <div className="bg-[#1a1f3a] p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Nama Pemilik</p>
                  <p className="text-white font-semibold text-lg">{order.paymentMethodAccountName}</p>
                </div>
              )}

              {order.paymentMethodQrCodeUrl && (
                <div className="bg-[#1a1f3a] p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm mb-2">QR Code</p>
                  <Image
                    src={order.paymentMethodQrCodeUrl}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="mx-auto rounded-lg"
                  />
                </div>
              )}

              {order.paymentMethodInstructions && (
                <div className="bg-[#1a1f3a] p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-2">Instruksi Pembayaran</p>
                  <p className="text-white whitespace-pre-line">{order.paymentMethodInstructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Payment Proof */}
        {isPending && !isExpired && (
          <div className="bg-[#0a0e27] rounded-lg p-6 border border-[#2a2f4a]">
            <h2 className="text-xl font-bold text-white mb-4">Upload Bukti Pembayaran</h2>
            
            {!order.paymentProof && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pilih File Bukti Pembayaran (Max 5MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-white bg-[#1a1f3a] border border-[#2a2f4a] rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Format yang didukung: JPG, PNG, GIF. Maksimal ukuran file 5MB.
                </p>
              </div>
            )}

            {paymentProofPreview && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Preview Bukti Pembayaran:</p>
                <div className="relative">
                  {paymentProofPreview.startsWith('data:image/') ? (
                    <img
                      src={paymentProofPreview}
                      alt="Payment Proof Preview"
                      className="max-w-full h-auto rounded-lg border border-[#2a2f4a] cursor-pointer hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        console.error('Error loading preview image')
                        e.currentTarget.style.display = 'none'
                        const errorDiv = document.createElement('div')
                        errorDiv.className = 'p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm'
                        errorDiv.textContent = 'Gagal memuat preview gambar. Silakan pilih file lain.'
                        e.currentTarget.parentElement?.appendChild(errorDiv)
                      }}
                      onClick={() => {
                        window.open(paymentProofPreview, '_blank')
                      }}
                    />
                  ) : (
                    <Image
                      src={paymentProofPreview}
                      alt="Payment Proof Preview"
                      width={400}
                      height={300}
                      className="max-w-full h-auto rounded-lg border border-[#2a2f4a]"
                      onError={() => {
                        console.error('Error loading preview image')
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">Klik gambar untuk melihat ukuran penuh</p>
              </div>
            )}

            {order.paymentProof && !paymentProofPreview && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Bukti Pembayaran yang Sudah Diupload:</p>
                <div className="relative">
                  {order.paymentProof.startsWith('data:image/') ? (
                    <img
                      src={order.paymentProof}
                      alt="Payment Proof"
                      className="max-w-full h-auto rounded-lg border border-[#2a2f4a] cursor-pointer hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        console.error('Error loading payment proof image')
                        e.currentTarget.style.display = 'none'
                        const errorDiv = document.createElement('div')
                        errorDiv.className = 'p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm'
                        errorDiv.textContent = 'Gagal memuat gambar. Silakan hubungi admin.'
                        e.currentTarget.parentElement?.appendChild(errorDiv)
                      }}
                      onClick={() => {
                        window.open(order.paymentProof, '_blank')
                      }}
                    />
                  ) : (
                    <Image
                      src={order.paymentProof}
                      alt="Payment Proof"
                      width={400}
                      height={300}
                      className="max-w-full h-auto rounded-lg border border-[#2a2f4a]"
                      onError={() => {
                        console.error('Error loading payment proof image')
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">Klik gambar untuk melihat ukuran penuh</p>
              </div>
            )}

            {error && !uploadSuccess && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                <p className="font-semibold mb-1">⚠️ Error</p>
                <p>{error}</p>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">
                <p className="font-semibold mb-1">✓ Bukti pembayaran berhasil diupload!</p>
                <p className="text-xs">Status order berubah menjadi processing. Admin akan memverifikasi pembayaran Anda.</p>
              </div>
            )}

            <button
              onClick={handleUploadProof}
              disabled={uploading || !paymentProofFile || isExpired || uploadSuccess || !!order.paymentProof}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Mengupload...' : uploadSuccess || order.paymentProof ? '✓ Bukti Pembayaran Terupload' : paymentProofPreview ? 'Sudah Melakukan Pembayaran' : 'Upload Bukti Pembayaran'}
            </button>
            
            {!paymentProofFile && !uploadSuccess && !order.paymentProof && (
              <p className="mt-2 text-xs text-gray-400 text-center">
                Pilih file bukti pembayaran terlebih dahulu sebelum klik tombol upload
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push('/orders')}
            className="flex-1 bg-[#2a2f4a] text-white py-3 rounded-lg font-semibold hover:bg-[#3a3f5a] transition-colors"
          >
            Kembali ke Daftar Order
          </button>
        </div>
      </div>
    </div>
  )
}

