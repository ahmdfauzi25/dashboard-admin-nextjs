'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Game, TopUpRequest } from '@/types/game'
import { Product } from '@/types/product'
import { PaymentMethod } from '@/types/payment'
import { VoucherValidation } from '@/types/voucher'
import { submitTopUp, getPaymentMethods, validateVoucher, getOrderById } from '@/lib/api'
import PaymentMethods from './PaymentMethods'
import Image from 'next/image'

interface TopUpFormProps {
  game: Game
  onBack: () => void
  topUpData?: {
    playerId: string
    serverId: string
    nickname: string
    productId: number
    product: Product
  }
}

export default function TopUpForm({ game, onBack, topUpData }: TopUpFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    playerId: topUpData?.playerId || '',
    amount: topUpData?.product ? topUpData.product.price.toString() : '',
    paymentMethod: '',
    voucherCode: '',
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [voucher, setVoucher] = useState<VoucherValidation | null>(null)
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [countdown, setCountdown] = useState<number>(600) // 10 minutes in seconds
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.playerId.trim()) {
      setError('Player ID tidak boleh kosong')
      return
    }

    let amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Jumlah top up harus lebih dari 0')
      return
    }

    if (!selectedPaymentMethod) {
      setError('Pilih metode pembayaran terlebih dahulu')
      return
    }

    // Calculate final amount including voucher discount and payment fees
    const finalAmount = calculateFinalAmount()
    
    // Get base amount (before fees) for validation
    let baseAmount = parseFloat(formData.amount) || 0
    if (voucher?.success && voucher.voucher) {
      baseAmount = voucher.voucher.finalAmount
    }

    // Check if base amount (before fees) is within payment method limits
    if (baseAmount < selectedPaymentMethod.minAmount || baseAmount > selectedPaymentMethod.maxAmount) {
      setError(`Jumlah harus antara Rp ${selectedPaymentMethod.minAmount.toLocaleString('id-ID')} - Rp ${selectedPaymentMethod.maxAmount.toLocaleString('id-ID')}`)
      return
    }

    try {
      setLoading(true)
      
      const request: TopUpRequest = {
        gameId: game.id,
        userId: '', // Will be set by backend based on auth
        playerId: formData.playerId.trim(),
        serverId: topUpData?.serverId || '',
        amount: finalAmount, // Use final amount with fees included
        productId: topUpData?.productId,
        paymentMethod: selectedPaymentMethod.code,
        paymentMethodId: selectedPaymentMethod.id,
      }

      const response = await submitTopUp(request)

      if (response.success && response.data?.orderIdForUrl) {
        setSuccess(response.message || 'Top up order created successfully!')
        
        // Fetch order details for modal
        try {
          const orderResponse = await getOrderById(response.data.orderIdForUrl)
          if (orderResponse.success && orderResponse.order) {
            setOrderData(orderResponse.order)
            
            // Calculate countdown from paymentExpiresAt
            if (orderResponse.order.paymentExpiresAt) {
              const expiresAt = new Date(orderResponse.order.paymentExpiresAt).getTime()
              const now = new Date().getTime()
              const diff = Math.max(0, Math.floor((expiresAt - now) / 1000))
              setCountdown(diff)
            }
            
            setShowOrderModal(true)
          }
        } catch (err) {
          console.error('Error fetching order details:', err)
          // Still show modal with basic data
          setOrderData({
            orderId: response.data.orderId,
            gameName: game.name,
            gameImage: game.imageUrl,
            playerId: formData.playerId.trim(),
            serverId: topUpData?.serverId,
            amount: finalAmount,
            paymentMethodName: selectedPaymentMethod.name,
            paymentMethodLogo: selectedPaymentMethod.logoUrl,
            paymentMethodCode: selectedPaymentMethod.code,
            paymentExpiresAt: response.data.paymentExpiresAt,
          })
          setShowOrderModal(true)
        }
      } else {
        setError(response.error || response.message || 'Gagal melakukan top up')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat melakukan top up')
      console.error('Top up error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    
    // If amount changes, re-validate voucher if exists
    if (e.target.name === 'amount' && voucher?.success && formData.voucherCode) {
      const newAmount = parseFloat(e.target.value)
      if (!isNaN(newAmount) && newAmount > 0) {
        handleVoucherValidate(formData.voucherCode, newAmount)
      }
    }
  }

  const handleVoucherValidate = async (code: string, amount: number) => {
    if (!code.trim() || !amount || amount <= 0) {
      setVoucher(null)
      return
    }

    setVoucherLoading(true)
    try {
      const result = await validateVoucher(code, amount)
      setVoucher(result)
      if (!result.success) {
        setError(result.error || 'Voucher tidak valid')
      } else {
        setError(null)
      }
    } catch (err) {
      console.error('Voucher validation error:', err)
      setVoucher({ success: false, error: 'Terjadi kesalahan saat memvalidasi voucher' })
    } finally {
      setVoucherLoading(false)
    }
  }

  const handleVoucherCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase()
    setFormData({ ...formData, voucherCode: code })
    setVoucher(null)
    setError(null)

    const amount = parseFloat(formData.amount) || 0
    if (code.trim() && amount > 0) {
      await handleVoucherValidate(code, amount)
    }
  }

  const removeVoucher = () => {
    setFormData({ ...formData, voucherCode: '' })
    setVoucher(null)
    setError(null)
  }

  // Calculate final amount with voucher and payment fees
  const calculateFinalAmount = () => {
    let amount = parseFloat(formData.amount) || 0
    
    // Apply voucher discount
    if (voucher?.success && voucher.voucher) {
      amount = voucher.voucher.finalAmount
    }
    
    // Apply payment method fees
    if (selectedPaymentMethod) {
      const feePercentage = (amount * selectedPaymentMethod.feePercentage) / 100
      const feeFixed = selectedPaymentMethod.feeFixed
      return amount + feePercentage + feeFixed
    }
    
    return amount
  }

  // Countdown timer effect
  useEffect(() => {
    if (showOrderModal && countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      // Clear interval if modal is closed or countdown is 0
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [showOrderModal])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleGoToPayment = () => {
    if (orderData?.orderId) {
      router.push(`/payment/${orderData.orderId}`)
    }
  }

  const handleCloseModal = () => {
    setShowOrderModal(false)
    setOrderData(null)
    // Redirect to home or orders page
    router.push('/orders')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 overflow-x-hidden">
      <div className="bg-[#1a1f3a] rounded-lg shadow-xl overflow-hidden border border-[#2a2f4a]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
          <button
            onClick={onBack}
            className="text-white hover:text-primary-100 mb-4 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </button>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
              {game.imageUrl || game.image ? (
                <img
                  src={game.imageUrl || game.image || ''}
                  alt={game.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                          <span class="text-white text-2xl font-bold">${game.name.charAt(0)}</span>
                        </div>
                      `
                    }
                  }}
                  onLoad={() => {
                    console.log('Game image loaded in TopUpForm:', game.name)
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                  <span className="text-white text-2xl font-bold">
                    {game.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{game.name}</h2>
              {game.description && (
                <p className="text-primary-100 text-sm mt-1">
                  {game.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="playerId"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Player ID / Username
              </label>
              <input
                type="text"
                id="playerId"
                name="playerId"
                value={formData.playerId}
                onChange={handleChange}
                required
                disabled={!!topUpData}
                className="w-full max-w-full px-4 py-2 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed box-border"
                placeholder="Masukkan Player ID atau Username"
              />
            </div>

            {topUpData?.serverId && (
              <div>
                <label
                  htmlFor="serverId"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Server ID
                </label>
                <input
                  type="text"
                  id="serverId"
                  name="serverId"
                  value={topUpData.serverId}
                  disabled
                  className="w-full max-w-full px-4 py-2 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 opacity-50 cursor-not-allowed box-border"
                />
              </div>
            )}

            {topUpData?.product && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Paket yang Dipilih
                </label>
                <div className="px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg">
                  <p className="text-white font-semibold">{topUpData.product.name}</p>
                  <p className="text-orange-400 font-bold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(topUpData.product.price)}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Jumlah Top Up
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  step="1"
                  className="w-full pl-12 pr-4 py-2 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {selectedPaymentMethod && parseFloat(formData.amount) > 0 && (
                <div className="mt-2 p-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Harga Dasar:</span>
                    <span className="text-white">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(parseFloat(formData.amount))}
                    </span>
                  </div>
                  {(() => {
                    const baseAmount = voucher?.success && voucher.voucher 
                      ? voucher.voucher.finalAmount 
                      : parseFloat(formData.amount)
                    const feePercentage = (baseAmount * selectedPaymentMethod.feePercentage) / 100
                    const feeFixed = selectedPaymentMethod.feeFixed
                    const totalFee = feePercentage + feeFixed
                    const finalAmount = calculateFinalAmount()
                    
                    return (
                      <>
                        {totalFee > 0 && (
                          <div className="flex justify-between items-center text-sm mt-1">
                            <span className="text-gray-400">Biaya Admin:</span>
                            <span className="text-orange-400">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(totalFee)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-[#2a2f4a]">
                          <span className="text-white font-semibold">Total Pembayaran:</span>
                          <span className="text-orange-400 font-bold text-lg">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(finalAmount)}
                          </span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Voucher Code Input */}
            <div>
              <label
                htmlFor="voucherCode"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Kode Voucher (Opsional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="voucherCode"
                  name="voucherCode"
                  value={formData.voucherCode}
                  onChange={handleVoucherCodeChange}
                  disabled={voucherLoading}
                  className="flex-1 px-4 py-2 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                  placeholder="Masukkan kode voucher"
                />
                {voucher?.success && (
                  <button
                    type="button"
                    onClick={removeVoucher}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </div>
              {voucherLoading && (
                <p className="mt-2 text-sm text-gray-400">Memvalidasi voucher...</p>
              )}
              {voucher?.success && voucher.voucher && (
                <div className="mt-3 p-3 bg-green-500/20 border border-green-500 rounded-lg">
                  <p className="text-green-300 font-semibold">✓ Voucher berhasil diterapkan!</p>
                  <p className="text-green-200 text-sm mt-1">{voucher.voucher.name}</p>
                  <p className="text-green-200 text-sm">
                    Diskon: {voucher.voucher.discountType === 'PERCENTAGE' 
                      ? `${voucher.voucher.discountValue}%` 
                      : `Rp ${voucher.voucher.discountValue.toLocaleString('id-ID')}`}
                  </p>
                  <p className="text-green-200 text-sm">
                    Potongan: Rp {voucher.voucher.discount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-white font-bold mt-2">
                    Total setelah diskon: Rp {voucher.voucher.finalAmount.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              {voucher && !voucher.success && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500 rounded-lg">
                  <p className="text-red-300 text-sm">{voucher.error}</p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Metode Pembayaran *
              </label>
              {selectedPaymentMethod && (
                <div className="mb-3 p-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedPaymentMethod.logoUrl && (
                      <img
                        src={selectedPaymentMethod.logoUrl}
                        alt={selectedPaymentMethod.name}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold">{selectedPaymentMethod.name}</p>
                      {selectedPaymentMethod.description && (
                        <p className="text-gray-400 text-xs mt-1">{selectedPaymentMethod.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              {!selectedPaymentMethod && (
                <PaymentMethods
                  selectedMethod={selectedPaymentMethod}
                  onSelect={setSelectedPaymentMethod}
                  amount={parseFloat(formData.amount) || 0}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Lakukan Top Up'}
            </button>
          </form>
        </div>
      </div>

      {/* Order Card Modal */}
      {showOrderModal && orderData && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f3a] rounded-lg shadow-xl border border-[#2a2f4a] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Order Berhasil Dibuat!</h2>
                  <p className="text-gray-400 text-sm">Order ID: <span className="text-orange-400 font-mono">{orderData.orderId}</span></p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Countdown Timer */}
              {countdown > 0 && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${
                  countdown < 300 
                    ? 'bg-orange-500/20 border-orange-500' 
                    : 'bg-blue-500/20 border-blue-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">Waktu Tersisa untuk Pembayaran</p>
                      <p className="text-gray-300 text-xs mt-1">Upload bukti pembayaran sebelum waktu habis</p>
                    </div>
                    <div className={`text-3xl font-bold font-mono ${
                      countdown < 300 ? 'text-orange-400' : 'text-blue-400'
                    }`}>
                      {formatTime(countdown)}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                {/* Game Info */}
                <div className="bg-[#0a0e27] rounded-lg p-4 border border-[#2a2f4a]">
                  <div className="flex items-center gap-4">
                    {orderData.gameImage && (
                      <Image
                        src={orderData.gameImage}
                        alt={orderData.gameName || game.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{orderData.gameName || game.name}</h3>
                      <p className="text-gray-400 text-sm">Game Top Up</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {orderData.paymentMethodName && (
                  <div className="bg-[#0a0e27] rounded-lg p-4 border border-[#2a2f4a]">
                    <p className="text-sm text-gray-400 mb-2">Metode Pembayaran</p>
                    <div className="flex items-center gap-3">
                      {orderData.paymentMethodLogo && (
                        <Image
                          src={orderData.paymentMethodLogo}
                          alt={orderData.paymentMethodName}
                          width={40}
                          height={40}
                          className="object-contain rounded bg-white/10 p-1"
                        />
                      )}
                      <div>
                        <p className="text-white font-semibold">{orderData.paymentMethodName}</p>
                        {orderData.paymentMethodCode && (
                          <p className="text-gray-400 text-xs font-mono">{orderData.paymentMethodCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Info */}
                <div className="bg-[#0a0e27] rounded-lg p-4 border border-[#2a2f4a]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Player ID</p>
                      <p className="text-white font-semibold">{orderData.playerId}</p>
                    </div>
                    {orderData.serverId && (
                      <div>
                        <p className="text-sm text-gray-400">Server ID</p>
                        <p className="text-white font-semibold">{orderData.serverId}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400">Total Pembayaran</p>
                      <p className="text-orange-400 font-bold text-xl">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(orderData.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleGoToPayment}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Lihat Instruksi Pembayaran
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-[#2a2f4a] text-white rounded-lg font-semibold hover:bg-[#3a3f5a] transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

