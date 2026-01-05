'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
      setError('Semua field harus diisi')
      return
    }

    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid')
      return
    }

    // Phone validation (basic - should start with + or 0)
    const phoneRegex = /^(\+62|0)[0-9]{9,12}$/
    const cleanPhone = formData.phone.replace(/\s|-/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      setError('Format nomor telepon tidak valid. Gunakan format: +628123456789 atau 08123456789')
      return
    }

    setLoading(true)

    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: cleanPhone,
        password: formData.password,
      })

      if (response.success && response.user_id) {
        // Redirect to OTP verification page
        router.push(`/verify-otp?user_id=${response.user_id}&email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(cleanPhone)}`)
      } else {
        setError(response.error || 'Registrasi gagal')
        setLoading(false)
      }
    } catch (err) {
      console.error('Register error:', err)
      setError('Terjadi kesalahan saat registrasi')
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
            <h2 className="text-3xl font-bold text-white">Buat Akun Baru</h2>
            <p className="mt-2 text-gray-400">Daftar sekarang dan nikmati promo menarik</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full max-w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent box-border"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full max-w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent box-border"
                placeholder="Masukkan email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Nomor Telepon
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full max-w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent box-border"
                placeholder="+628123456789 atau 08123456789"
              />
              <p className="mt-1 text-xs text-gray-400">OTP akan dikirim ke nomor ini via WhatsApp</p>
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
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full max-w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent box-border"
                placeholder="Ulangi password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

