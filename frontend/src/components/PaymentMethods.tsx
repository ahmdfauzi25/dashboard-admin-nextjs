'use client'

import { useState, useEffect } from 'react'
import { PaymentMethod } from '@/types/payment'
import { getPaymentMethods } from '@/lib/api'

interface PaymentMethodsProps {
  selectedMethod?: PaymentMethod | null
  onSelect?: (method: PaymentMethod) => void
  amount?: number
}

export default function PaymentMethods({ selectedMethod, onSelect, amount = 0 }: PaymentMethodsProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [groupedMethods, setGroupedMethods] = useState<Record<string, PaymentMethod[]>>({})

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  useEffect(() => {
    // Group methods by type
    const grouped: Record<string, PaymentMethod[]> = {}
    methods.forEach(method => {
      if (!grouped[method.type]) {
        grouped[method.type] = []
      }
      grouped[method.type].push(method)
    })
    setGroupedMethods(grouped)
  }, [methods])

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const data = await getPaymentMethods()
      setMethods(data)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'EWALLET': 'E-Wallet',
      'BANK_TRANSFER': 'Bank Transfer',
      'VIRTUAL_ACCOUNT': 'Virtual Account',
      'QRIS': 'QRIS',
      'CREDIT_CARD': 'Credit Card',
      'OTHER': 'Other'
    }
    return labels[type] || type
  }

  const calculateTotalFee = (method: PaymentMethod) => {
    const percentageFee = (amount * method.feePercentage) / 100
    return percentageFee + method.feeFixed
  }

  const isMethodAvailable = (method: PaymentMethod) => {
    if (amount === 0) return true
    return amount >= method.minAmount && amount <= method.maxAmount
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (methods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Tidak ada metode pembayaran tersedia</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMethods).map(([type, typeMethods]) => (
        <div key={type}>
          <h3 className="text-lg font-semibold text-white mb-3">
            {getTypeLabel(type)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {typeMethods
              .filter(method => isMethodAvailable(method))
              .map((method) => {
                const isSelected = selectedMethod?.id === method.id
                const totalFee = calculateTotalFee(method)
                const isAvailable = isMethodAvailable(method)

                return (
                  <div
                    key={method.id}
                    onClick={() => onSelect && isAvailable && onSelect(method)}
                    className={`relative cursor-pointer bg-[#1a1f3a] rounded-xl p-4 border-2 transition-all hover:scale-105 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                        : isAvailable
                        ? 'border-[#2a2f4a] hover:border-orange-500/50'
                        : 'border-[#2a2f4a] opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {method.logoUrl ? (
                      <div className="w-full h-16 mb-3 flex items-center justify-center bg-white rounded-lg p-2">
                        <img
                          src={method.logoUrl}
                          alt={method.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            const parent = e.target.parentElement
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">${method.name}</div>`
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-16 mb-3 flex items-center justify-center bg-gradient-to-br from-[#2a2f4a] to-[#1a1f3a] rounded-lg">
                        <span className="text-white text-sm font-semibold">{method.name}</span>
                      </div>
                    )}

                    <h4 className="text-white font-semibold text-sm text-center mb-1">
                      {method.name}
                    </h4>

                    {amount > 0 && totalFee > 0 && (
                      <p className="text-orange-400 text-xs text-center">
                        Fee: Rp {totalFee.toLocaleString('id-ID')}
                      </p>
                    )}

                    {!isAvailable && amount > 0 && (
                      <p className="text-red-400 text-xs text-center mt-1">
                        Min: Rp {method.minAmount.toLocaleString('id-ID')}
                      </p>
                    )}

                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}

