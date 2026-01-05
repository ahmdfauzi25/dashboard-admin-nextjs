'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccess('Akun Anda berhasil diverifikasi! Silakan login.')
    }
    if (searchParams.get('error') === 'access_denied') {
      setError('Akses ditolak. Hanya customer yang dapat mengakses website top-up.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!formData.username.trim() || !formData.password) {
      setError('Username dan password harus diisi')
      setLoading(false)
      return
    }

    try {
      const response = await login({
        username: formData.username.trim(),
        password: formData.password,
      })

      if (response.success && response.user) {
        // Check if user role is CUSTOMER
        const userRole = (response.user.role || '').toUpperCase()
        if (userRole !== 'CUSTOMER') {
          setError('Akses ditolak. Hanya customer yang dapat login ke website top-up.')
          setLoading(false)
          return
        }

        setUser(response.user)
        router.push('/')
        router.refresh()
      } else {
        setError(response.error || 'Login gagal')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      // Handle API error response
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Terjadi kesalahan saat login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-[#1a1f3a] rounded-lg shadow-xl p-6 sm:p-8 border border-[#2a2f4a] overflow-hidden">
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
            <h2 className="text-3xl font-bold text-white">Masuk ke Akun</h2>
            <p className="mt-2 text-gray-400">Silakan login untuk melanjutkan</p>
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
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username atau Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full max-w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent box-border"
                placeholder="Masukkan username atau email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full max-w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent box-border"
                placeholder="Masukkan password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Belum punya akun?{' '}
              <Link href="/register" className="text-orange-500 hover:text-orange-400 font-medium">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

