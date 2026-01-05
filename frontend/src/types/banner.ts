export interface PromoBanner {
  id: number
  title: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  position: number
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt?: string
  updatedAt?: string
}

