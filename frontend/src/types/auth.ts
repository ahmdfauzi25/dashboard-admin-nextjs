export interface User {
  id: number
  email: string
  name: string
  role: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  phone: string
  password: string
  role?: string
}

export interface RegisterResponse {
  success: boolean
  message?: string
  user_id?: number
  email_sent?: boolean
  whatsapp_sent?: boolean
  error?: string
}

export interface VerifyOTPRequest {
  user_id: number
  otp_code: string
}

export interface VerifyOTPResponse {
  success: boolean
  message?: string
  user_id?: number
  error?: string
}

export interface ResendOTPRequest {
  user_id: number
}

export interface ResendOTPResponse {
  success: boolean
  message?: string
  email_sent?: boolean
  whatsapp_sent?: boolean
  error?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
  error?: string
}

