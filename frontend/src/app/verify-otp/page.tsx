'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { verifyOTP, resendOTP, login } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  
  const userId = searchParams.get('user_id')
  const email = searchParams.get('email')
  const phone = searchParams.get('phone')
  
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (!userId) {
      router.push('/register')
      return
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [userId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!otpCode || otpCode.length !== 6) {
      setError('Masukkan kode OTP 6 digit')
      return
    }

    if (!userId) {
      setError('User ID tidak valid')
      return
    }

    setLoading(true)

    try {
      const response = await verifyOTP({
        user_id: parseInt(userId),
        otp_code: otpCode,
      })

      if (response.success) {
        setSuccess('Verifikasi berhasil! Mengarahkan ke halaman login...')
        
        // After OTP verification, user needs to login
        // We'll redirect to login page with success message
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 1500)
      } else {
        setError(response.error || 'Kode OTP tidak valid atau sudah kadaluarsa')
      }
    } catch (err) {
      console.error('Verify OTP error:', err)
      setError('Terjadi kesalahan saat verifikasi OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!userId || !canResend) return

    setResendLoading(true)
    setError(null)

    try {
      const response = await resendOTP({
        user_id: parseInt(userId),
      })

      if (response.success) {
        setSuccess('OTP berhasil dikirim ulang ke email dan WhatsApp Anda')
        setCountdown(60)
        setCanResend(false)
      } else {
        setError(response.error || 'Gagal mengirim ulang OTP')
      }
    } catch (err) {
      console.error('Resend OTP error:', err)
      setError('Terjadi kesalahan saat mengirim ulang OTP')
    } finally {
      setResendLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtpCode(value)
    setError(null)
  }

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-[#1a1f3a] rounded-lg shadow-xl p-8 border border-[#2a2f4a]">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 12c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-3-4c0 .83-.67 1.5-1.5 1.5S9 8.83 9 8s.67-1.5 1.5-1.5S12 7.17 12 8zm-5 4c0 .83-.67 1.5-1.5 1.5S4 12.83 4 12s.67-1.5 1.5-1.5S7 11.17 7 12zm11.5-1.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S20 12.83 20 12s-.67-1.5-1.5-1.5zM17.5 9.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S19 11.83 19 11s-.67-1.5-1.5-1.5zm-11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S7 11.83 7 11s-.67-1.5-1.5-1.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <span className="text-white text-2xl font-bold">Topupku</span>
            </Link>
            <h2 className="text-3xl font-bold text-white">Verifikasi OTP</h2>
            <p className="mt-2 text-gray-400">
              Masukkan kode OTP yang dikirim ke
            </p>
            {phone && (
              <p className="mt-1 text-orange-400 font-semibold">{phone}</p>
            )}
            {email && (
              <p className="mt-1 text-gray-300 text-sm">{email}</p>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                Kode OTP (6 digit)
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otpCode}
                onChange={handleOtpChange}
                maxLength={6}
                className="w-full max-w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-orange-500 focus:border-transparent box-border"
                placeholder="000000"
                autoComplete="off"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </div>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-orange-500 hover:text-orange-400 font-medium disabled:opacity-50"
              >
                {resendLoading ? 'Mengirim...' : 'Kirim Ulang OTP'}
              </button>
            ) : (
              <p className="text-gray-400 text-sm">
                Kirim ulang OTP dalam{' '}
                <span className="text-orange-400 font-semibold">{countdown}</span> detik
              </p>
            )}
          </div>

          {/* Back to Register */}
          <div className="mt-4 text-center">
            <Link
              href="/register"
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              Kembali ke halaman registrasi
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

