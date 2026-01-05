import axios from 'axios'
import { Game, TopUpRequest, TopUpResponse } from '@/types/game'
import { Product } from '@/types/product'
import { PromoBanner } from '@/types/banner'
import { PaymentMethod } from '@/types/payment'
import { VoucherValidation } from '@/types/voucher'
import { LoginRequest, RegisterRequest, RegisterResponse, AuthResponse, User, VerifyOTPRequest, VerifyOTPResponse, ResendOTPRequest, ResendOTPResponse } from '@/types/auth'

// Get API URL from environment or use default
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use window location or env
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  }
  // Server-side
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
}

const API_URL = getApiUrl()

console.log('API Client initialized with URL:', API_URL)

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Changed to false for CORS
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
    })
    return Promise.reject(error)
  }
)

// Test backend connection
export const testConnection = async (): Promise<boolean> => {
  try {
    // Use a separate axios instance for health check to avoid issues
    const baseUrl = API_URL.replace('/api', '')
    const healthCheckUrl = `${baseUrl}/api/health`
    console.log('Testing backend connection at:', healthCheckUrl)
    console.log('API_URL:', API_URL)
    console.log('Base URL:', baseUrl)
    
    const response = await axios.get(healthCheckUrl, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => status < 500, // Accept 4xx as valid response
    })
    
    console.log('Health check response status:', response.status)
    console.log('Health check response data:', response.data)
    
    // Consider it healthy if we get a response (even if database is disconnected)
    // The important thing is that the backend is running
    if (response.status === 200) {
      const isHealthy = response.data.status === 'ok' && response.data.database === 'connected'
      console.log('Backend health check result:', isHealthy, response.data)
      return isHealthy
    } else if (response.status === 503) {
      // Backend is running but database is disconnected
      console.warn('Backend is running but database is disconnected')
      return false
    }
    
    return false
  } catch (error: any) {
    console.error('Backend health check failed:', error)
    if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to backend. Is it running on http://localhost:3000?')
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error. Check if backend is accessible.')
    } else if (error.code === 'ECONNABORTED') {
      console.error('Health check timeout. Backend may be slow or unresponsive.')
    } else {
      console.error('Unknown error:', error.message)
    }
    return false
  }
}

export const getGames = async (): Promise<Game[]> => {
  try {
    const fullUrl = `${API_URL}/games`
    console.log('Fetching games from:', fullUrl)
    
    const response = await apiClient.get('/games', {
      timeout: 10000,
      validateStatus: (status) => status < 500, // Don't throw on 4xx
    })
    
    console.log('Games API response status:', response.status)
    console.log('Games API response data:', response.data)
    
    if (response.status === 200 && response.data.success && response.data.games) {
      console.log('Games fetched successfully:', response.data.games.length, 'games')
      // Log first game image URL for debugging
      if (response.data.games.length > 0 && response.data.games[0].imageUrl) {
        console.log('First game image URL:', response.data.games[0].imageUrl)
      }
      return response.data.games
    }
    
    if (response.status === 200 && response.data.success && !response.data.games) {
      console.warn('API returned success but no games array:', response.data)
      return []
    }
    
    // Handle error response
    const errorMsg = response.data?.error || response.data?.message || 'Unknown error'
    throw new Error(`Server error: ${response.status} - ${errorMsg}`)
    
  } catch (error: any) {
    console.error('Error fetching games:', error)
    
    // Log detailed error information
    if (error.response) {
      // Server responded with error status
      console.error('Error response status:', error.response.status)
      console.error('Error response data:', error.response.data)
      const errorMsg = error.response.data?.error || error.response.data?.message || 'Unknown error'
      throw new Error(`Server error: ${error.response.status} - ${errorMsg}`)
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received. Is backend running?')
      console.error('Request URL:', error.config?.url || `${API_URL}/games`)
      console.error('Error code:', error.code)
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Backend mungkin lambat atau tidak merespons.')
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:3000')
      }
      
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:3000')
    } else {
      // Something else happened
      console.error('Error setting up request:', error.message)
      throw new Error(`Error: ${error.message}`)
    }
  }
}

export const getGameById = async (id: number): Promise<Game | null> => {
  try {
    const response = await apiClient.get(`/games/${id}`)
    if (response.data.success && response.data.game) {
      return response.data.game
    }
    return null
  } catch (error) {
    console.error('Error fetching game:', error)
    throw error
  }
}

export const submitTopUp = async (
  request: TopUpRequest
): Promise<TopUpResponse> => {
  try {
    const response = await axios.post(
      `${API_URL.replace('/api', '')}/api/topup`,
      request,
      {
        withCredentials: true, // Important for cookies/auth
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 seconds timeout
      }
    )
    return response.data
  } catch (error: any) {
    console.error('Error submitting top up:', error)
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.error || 'Gagal melakukan top up',
        error: error.response.data?.error,
      }
    }
    return {
      success: false,
      message: 'Terjadi kesalahan saat melakukan top up',
      error: 'Network error',
    }
  }
}

// Get products by game ID
export const getProductsByGameId = async (gameId: number): Promise<Product[]> => {
  try {
    const response = await apiClient.get(`/products?game_id=${gameId}`)
    console.log('Products API response:', response.data)
    if (response.data.success && response.data.products) {
      console.log('Products fetched:', response.data.products.length, 'products')
      return response.data.products.filter((p: Product) => p.is_active !== false)
    }
    return []
  } catch (error: any) {
    console.error('Error fetching products:', error)
    if (error.response) {
      console.error('Error response status:', error.response.status)
      console.error('Error response data:', error.response.data)
    }
    return []
  }
}

// Get promo banners
export const getPromoBanners = async (): Promise<PromoBanner[]> => {
  try {
    const response = await apiClient.get('/promo-banners')
    if (response.data.success && response.data.banners) {
      return response.data.banners
    }
    return []
  } catch (error: any) {
    console.error('Error fetching promo banners:', error)
    return []
  }
}

// Get payment methods
export const getPaymentMethods = async (type?: string): Promise<PaymentMethod[]> => {
  try {
    const url = type ? `/payment-methods?type=${type}` : '/payment-methods'
    const response = await apiClient.get(url)
    if (response.data.success && response.data.paymentMethods) {
      return response.data.paymentMethods.filter((pm: PaymentMethod) => pm.isActive)
    }
    return []
  } catch (error: any) {
    console.error('Error fetching payment methods:', error)
    return []
  }
}

// Validate voucher code
export const validateVoucher = async (code: string, amount: number): Promise<VoucherValidation> => {
  try {
    const response = await apiClient.post('/voucher-promos/validate', {
      code: code.toUpperCase(),
      amount: amount
    })
    return response.data
  } catch (error: any) {
    console.error('Error validating voucher:', error)
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || 'Voucher tidak valid'
      }
    }
    return {
      success: false,
      error: 'Terjadi kesalahan saat memvalidasi voucher'
    }
  }
}

// Login user
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post(
      `${API_URL.replace('/api', '')}/api/login`,
      credentials,
      {
        withCredentials: true, // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      }
    )
    return {
      success: true,
      message: response.data.message,
      user: response.data.user,
      token: response.data.token,
    }
  } catch (error: any) {
    console.error('Login error:', error)
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.error || 'Login gagal'
      }
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Request timeout. Backend mungkin lambat atau tidak merespons.'
        }
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:3000'
        }
      }
      return {
        success: false,
        error: 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:3000'
      }
    } else {
      // Something else happened
      return {
        success: false,
        error: `Error: ${error.message || 'Terjadi kesalahan saat login'}`
      }
    }
  }
}

// Register user (with OTP)
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await axios.post(
      `${API_URL.replace('/api', '')}/api/auth/register`,
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return {
      success: response.data.success,
      message: response.data.message,
      user_id: response.data.user_id,
      email_sent: response.data.email_sent,
      whatsapp_sent: response.data.whatsapp_sent,
    }
  } catch (error: any) {
    console.error('Register error:', error)
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || 'Registrasi gagal'
      }
    }
    return {
      success: false,
      error: 'Tidak dapat terhubung ke server'
    }
  }
}

// Verify OTP
export const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  try {
    const response = await axios.post(
      `${API_URL.replace('/api', '')}/api/auth/verify-otp`,
      {
        user_id: data.user_id,
        otp_code: data.otp_code,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return {
      success: response.data.success,
      message: response.data.message,
      user_id: response.data.user_id,
    }
  } catch (error: any) {
    console.error('Verify OTP error:', error)
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || 'Verifikasi OTP gagal'
      }
    }
    return {
      success: false,
      error: 'Tidak dapat terhubung ke server'
    }
  }
}

// Resend OTP
export const resendOTP = async (data: ResendOTPRequest): Promise<ResendOTPResponse> => {
  try {
    const response = await axios.post(
      `${API_URL.replace('/api', '')}/api/auth/resend-otp`,
      {
        user_id: data.user_id,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return {
      success: response.data.success,
      message: response.data.message,
      email_sent: response.data.email_sent,
      whatsapp_sent: response.data.whatsapp_sent,
    }
  } catch (error: any) {
    console.error('Resend OTP error:', error)
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || 'Gagal mengirim ulang OTP'
      }
    }
    return {
      success: false,
      error: 'Tidak dapat terhubung ke server'
    }
  }
}

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get(
      `${API_URL.replace('/api', '')}/api/me`,
      {
        withCredentials: true,
      }
    )
    if (response.data.user) {
      return response.data.user
    }
    return null
  } catch (error: any) {
    console.error('Get current user error:', error)
    return null
  }
}

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await axios.post(
      `${API_URL.replace('/api', '')}/api/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Logout error:', error)
    // Still proceed with logout even if API call fails
  }
}

// Get orders (customer's own orders or admin all orders)
export const getOrders = async (isAdmin: boolean = false, status?: string, page: number = 1): Promise<any> => {
  try {
    const statusParam = status ? `&status=${status}` : ''
    const adminParam = isAdmin ? '&admin=true' : ''
    const response = await axios.get(
      `${API_URL.replace('/api', '')}/api/orders?page=${page}&limit=20${adminParam}${statusParam}`,
      {
        withCredentials: true,
      }
    )
    return response.data
  } catch (error: any) {
    console.error('Get orders error:', error)
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || 'Failed to fetch orders'
      }
    }
    return {
      success: false,
      error: 'Network error'
    }
  }
}

// Get single order by ID (can use order_id or numeric id)
export const getOrderById = async (orderId: string | number): Promise<any> => {
  try {
    const response = await axios.get(
      `${API_URL.replace('/api', '')}/api/orders/${orderId}`,
      {
        withCredentials: true,
      }
    )
    return response.data
  } catch (error: any) {
    console.error('Get order error:', error)
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || 'Failed to fetch order'
      }
    }
    return {
      success: false,
      error: 'Network error'
    }
  }
}

// Update order (upload payment proof or admin update status)
export const updateOrder = async (orderId: string | number, data: { paymentProof?: string; payment_proof?: string; status?: string; notes?: string }): Promise<any> => {
  try {
    // Normalize payment proof field name - backend expects payment_proof
    const requestData: any = { ...data }
    if (requestData.paymentProof) {
      requestData.payment_proof = requestData.paymentProof
      delete requestData.paymentProof
    }
    
    const response = await axios.put(
      `${API_URL.replace('/api', '')}/api/orders/${orderId}`,
      requestData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (error: any) {
    console.error('Update order error:', error)
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || error.response.data?.message || 'Failed to update order'
      }
    }
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}

export default apiClient

