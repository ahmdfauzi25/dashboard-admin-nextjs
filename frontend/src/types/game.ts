export interface Game {
  id: number
  name: string
  description?: string
  image?: string
  imageUrl?: string
  category?: string
  categoryId?: number
  developer?: string
  region?: string
  inputType?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TopUpRequest {
  gameId: number
  userId: string
  playerId: string
  serverId?: string
  amount: number
  productId?: number
  paymentMethod?: string
  paymentMethodId?: number
}

export interface TopUpResponse {
  success: boolean
  message: string
  data?: {
    orderId: string
    amount: number
    status: string
  }
  error?: string
}

