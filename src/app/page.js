'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Check if already logged in (ADMIN/RESELLER only)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          const role = data.user?.role?.toUpperCase()
          if (role === 'ADMIN' || role === 'RESELLER' || role === 'MODERATOR') {
            router.push('/dashboard')
          } else if (role === 'CUSTOMER' || role === 'USER') {
            // Customer should use customer login
            router.push('/customer')
          }
        }
      } catch (error) {
        // Not logged in, continue
      }
    }

    checkAuth()
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    try {
      // Use /api/login for admin login
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email, // Support both email and username
          password: formData.password
        }),
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Check role - This page is for ADMIN/RESELLER only
      const role = data.user?.role?.toUpperCase()
      if (role === 'CUSTOMER' || role === 'USER') {
        // Customer should use customer login page
        setError('Customer harus login melalui halaman customer')
        setLoading(false)
        setTimeout(() => {
          router.push('/customer')
        }, 2000)
      } else if (role === 'ADMIN' || role === 'RESELLER' || role === 'MODERATOR') {
        // Admin/Reseller/Moderator - redirect to admin dashboard
        router.push('/dashboard')
      } else {
        setError('Invalid user role')
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-moving-bg"
        style={{
          backgroundImage: 'url(/img/bg_login.jpg)',
          zIndex: 0
        }}
      />
      
      {/* Overlay untuk kontras */}
      <div className="absolute inset-0 bg-gray-900/40 z-10" />
      
      <div className="w-full max-w-md relative z-20">
        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg relative">
          {/* Window Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>

          {/* Header with Title and Icon */}
          <div className="pt-8 pb-6 px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img src="/img/ico_dash.png" alt="Logo" className="h-8 w-auto" />
                <h1 className="text-2xl font-bold text-gray-900">LOG IN</h1>
              </div>
              {/* Shield Icon with Gradient */}
              <div className="relative">
                <svg 
                  className="w-8 h-8" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2ZM12 4.18L18 6.3V11C18 15.24 15.68 19.23 12 20.46C8.32 19.23 6 15.24 6 11V6.3L12 4.18Z" 
                    fill="url(#shieldGradient)"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500">Login untuk Admin/Reseller</p>
          </div>

          {/* Form */}
          <form className="px-8 pb-8 space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Email Address"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Password"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-md text-white font-medium bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            {/* Link to Register */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Customer Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Customer?{' '}
                <Link
                  href="/customer"
                  className="text-purple-600 font-medium hover:underline"
                >
                  Login Customer
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
