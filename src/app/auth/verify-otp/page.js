'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    const id = searchParams.get('user_id')
    if (!id) {
      router.push('/auth/register')
    } else {
      setUserId(id)
    }
  }, [searchParams, router])

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          otp_code: otp
        })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'OTP verification failed')
        
        // Increment attempt
        await fetch('/api/auth/verify-otp', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            otp_code: otp
          })
        })
        
        setLoading(false)
        return
      }

      router.push('/auth/login')
    } catch (error) {
      console.error('Verification error:', error)
      setError('An error occurred during verification')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to resend OTP')
        setResending(false)
        return
      }

      setResendCountdown(60)
      setOtp('')
      setResending(false)
    } catch (error) {
      console.error('Resend error:', error)
      setError('Failed to resend OTP')
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit code sent to your email and WhatsApp
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resending || resendCountdown > 0}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:bg-gray-50 disabled:text-gray-400"
          >
            {resending
              ? 'Sending...'
              : resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  )
}
