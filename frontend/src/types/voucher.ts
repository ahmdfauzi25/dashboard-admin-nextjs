export interface VoucherPromo {
  id: number
  code: string
  name: string
  description?: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minPurchase: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  startDate?: string
  endDate?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface VoucherValidation {
  success: boolean
  voucher?: {
    id: number
    code: string
    name: string
    description?: string
    discountType: 'PERCENTAGE' | 'FIXED'
    discountValue: number
    discount: number
    finalAmount: number
    minPurchase: number
  }
  error?: string
}

