export interface PaymentMethod {
  id: number
  name: string
  code: string
  type: 'EWALLET' | 'BANK_TRANSFER' | 'VIRTUAL_ACCOUNT' | 'QRIS' | 'CREDIT_CARD' | 'OTHER'
  logoUrl?: string
  description?: string
  feePercentage: number
  feeFixed: number
  isActive: boolean
  position: number
  minAmount: number
  maxAmount: number
  accountNumber?: string | null
  accountName?: string | null
  qrCodeUrl?: string | null
  instructions?: string | null
  createdAt?: string
  updatedAt?: string
}

